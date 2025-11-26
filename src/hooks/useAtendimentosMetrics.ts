import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { MIN_DATA_DATE_OBJ } from '@/lib/constants';
import { toStartOfDayIso, buildEndExclusiveIso } from '@/hooks/useLeadsShared';
import { logger } from '@/utils/logger';

interface AtendimentosMetrics {
  atendimentosHoje: number;
  atendimentosIA: number;
  percentualIA: number;
  atendimentosTransferidos: number;
  csatPorAnalista: {
    analista: string;
    csatMedio: number;
    totalAtendimentos: number;
  }[];
  isLoading: boolean;
}

export function useAtendimentosMetrics(_workspaceId: string | null, startDate?: Date, endDate?: Date) {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [metrics, setMetrics] = useState<AtendimentosMetrics>({
    atendimentosHoje: 0,
    atendimentosIA: 0,
    percentualIA: 0,
    atendimentosTransferidos: 0,
    csatPorAnalista: [],
    isLoading: true,
  });

  useEffect(() => {
    if (tenantLoading) return;

    if (!tenant) {
      setMetrics({
        atendimentosHoje: 0,
        atendimentosIA: 0,
        percentualIA: 0,
        atendimentosTransferidos: 0,
        csatPorAnalista: [],
        isLoading: false,
      });
      return;
    }

    fetchMetrics();
  }, [tenantLoading, tenant?.id, tenant?.slug, startDate, endDate]);

  async function fetchMetrics() {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true }));

      const slug = tenant.slug;
      const isSieg = slug === 'sieg' || slug === 'sieg-financeiro' || slug?.includes('financeiro');

      // Apenas Sieg possui dados de atendimento completos
      if (!isSieg) {
        logger.info('[Atendimentos] Métricas disponíveis apenas para Sieg', { tenantId: tenant.id, slug });
        setMetrics({
          atendimentosHoje: 0,
          atendimentosIA: 0,
          percentualIA: 0,
          atendimentosTransferidos: 0,
          csatPorAnalista: [],
          isLoading: false,
        });
        return;
      }
      const effectiveStart = startDate && startDate > MIN_DATA_DATE_OBJ ? startDate : MIN_DATA_DATE_OBJ;
      const effectiveEnd = endDate ?? new Date();
      const startISO = toStartOfDayIso(effectiveStart);
      const endISO = buildEndExclusiveIso(effectiveEnd);

      logger.info('[Atendimentos] Buscando métricas em conversas_leads', {
        tenantId: tenant.id,
        startISO,
        endISO,
      });

      // Usar data_resposta_csat como filtro de data (coluna que existe na tabela)
      const { data: conversationsData, error: conversationsError } = await (centralSupabase.from as any)('conversas_leads')
        .select('id, tag, data_transferencia, analista, csat, data_resposta_csat')
        .eq('empresa_id', tenant.id)
        .gte('data_resposta_csat', startISO)
        .lt('data_resposta_csat', endISO)
        .order('data_resposta_csat', { ascending: false })
        .limit(50000);

      if (conversationsError) throw conversationsError;

      const conversations = conversationsData || [];
      const totalAtendimentos = conversations.length;

      const isTransferTag = (tag: string | null) => {
        if (!tag) return false;
        const normalized = tag.toLowerCase();
        return normalized.includes('t4') || normalized.includes('transfer');
      };

      const atendimentosTransferidos = conversations.filter((conv: any) => isTransferTag(conv.tag)).length;
      const atendimentosIA = conversations.filter((conv: any) => !isTransferTag(conv.tag)).length;
      const percentualIA = totalAtendimentos > 0 ? (atendimentosIA / totalAtendimentos) * 100 : 0;

      const csatPorAnalista = processarCSAT(conversations);

      setMetrics({
        atendimentosHoje: totalAtendimentos,
        atendimentosIA,
        percentualIA,
        atendimentosTransferidos,
        csatPorAnalista,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Erro ao buscar métricas de atendimento', { error });
      setMetrics({
        atendimentosHoje: 0,
        atendimentosIA: 0,
        percentualIA: 0,
        atendimentosTransferidos: 0,
        csatPorAnalista: [],
        isLoading: false,
      });
    }
  }

  function processarCSAT(conversas: any[]) {
    const analistaMap = new Map<string, { soma: number; count: number }>();

    conversas.forEach((conversa: any) => {
      const analista = (conversa.analista || '').trim();
      const csatRaw = conversa.csat;

      if (!analista || csatRaw === null || csatRaw === undefined) return;

      const csatValue = typeof csatRaw === 'number'
        ? csatRaw
        : parseFloat(String(csatRaw).replace(',', '.'));

      if (Number.isNaN(csatValue)) return;

      if (!analistaMap.has(analista)) {
        analistaMap.set(analista, { soma: 0, count: 0 });
      }

      const current = analistaMap.get(analista)!;
      current.soma += csatValue;
      current.count += 1;
    });

    return Array.from(analistaMap.entries())
      .map(([analista, stats]) => ({
        analista,
        csatMedio: stats.count > 0 ? stats.soma / stats.count : 0,
        totalAtendimentos: stats.count,
      }))
      .sort((a, b) => b.csatMedio - a.csatMedio);
  }

  return metrics;
}
