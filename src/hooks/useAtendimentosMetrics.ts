import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { getCurrentBrasiliaDate } from '@/lib/dateUtils';
import { useCurrentTenant } from '@/contexts/TenantContext';

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

// Helper para obter o próximo dia (YYYY-MM-DD)
function getNextDayStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
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
      const isSieg = slug === 'sieg';

      // Apenas Sieg possui dados de atendimento completos
      if (!isSieg) {
        console.log('[Atendimentos] Workspace ASF - Métricas de atendimento não disponíveis');
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

      console.log('[Atendimentos] Buscando métricas SIEG:', { 
        tenantId: tenant.id,
        slug
      });

      // Se não houver filtro de data, buscar dados gerais (todo o período)
      // Se houver filtro, buscar apenas do período selecionado
      const dataInicio = startDate ? startDate.toISOString().split('T')[0] : '2025-10-01';
      const dataFim = endDate ? endDate.toISOString().split('T')[0] : getCurrentBrasiliaDate();
      
      console.log('[Atendimentos] Período de busca:', { dataInicio, dataFim, temFiltro: !!startDate });

      // Usar função RPC adaptada para tenants, se existir
      const { data: rpcResult, error: rpcError } = await (centralSupabase.rpc as any)('get_atendimentos_metrics', {
        p_workspace_id: tenant.id,
        p_table_name: 'tenant_conversations_legacy',
        p_data_hoje: dataFim,
        p_primeiro_dia_mes: dataInicio,
        p_ultimo_dia_mes: dataFim
      });

      if (rpcError) {
        console.warn('[Atendimentos] Erro ao buscar métricas via RPC. Usando fallback por queries.', rpcError);
        const fallback = await computeMetricsByQueries({
          tenantId: tenant.id,
          dataHoje: dataFim,
          primeiroDiaMes: dataInicio,
          ultimoDiaMes: dataFim,
          periodoInicio: dataInicio,
          periodoFim: dataFim,
          isSieg,
        });
        setMetrics({ ...fallback, isLoading: false });
        return;
      }

      console.log('[Atendimentos] Resultado RPC:', rpcResult);

      const result = rpcResult as any;
      const totalHoje = result?.atendimentosHoje || 0;
      const totalIA = result?.atendimentosIA || 0;
      const percentualIA = totalHoje > 0 ? (totalIA / totalHoje) * 100 : 0;

      // Processar CSAT por analista
      const csatPorAnalista = processarCSAT(result?.csatData || []);

      console.log('[Atendimentos] Métricas calculadas:', {
        totalHoje,
        totalIA,
        percentualIA,
        csatPorAnalista: csatPorAnalista.length
      });

      const totalTransferidos = result?.atendimentosTransferidos || 0;

      setMetrics({
        atendimentosHoje: totalHoje,
        atendimentosIA: totalIA,
        percentualIA,
        atendimentosTransferidos: totalTransferidos,
        csatPorAnalista,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao buscar métricas de atendimento:', error);
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

  async function computeMetricsByQueries(params: {
    tenantId: string;
    dataHoje: string; // YYYY-MM-DD
    primeiroDiaMes: string; // YYYY-MM-DD
    ultimoDiaMes: string; // YYYY-MM-DD
    periodoInicio: string; // YYYY-MM-DD
    periodoFim: string; // YYYY-MM-DD
    isSieg: boolean;
  }): Promise<Omit<AtendimentosMetrics, 'isLoading'>> {
    const { tenantId, dataHoje, primeiroDiaMes, ultimoDiaMes, periodoInicio, periodoFim, isSieg } = params;

    const hojeStart = `${dataHoje}T00:00:00`;
    const hojeEndExclusive = `${getNextDayStr(dataHoje)}T00:00:00`;
    const periodoStart = `${periodoInicio}T00:00:00`;
    const periodoEndExclusive = `${getNextDayStr(periodoFim)}T00:00:00`;
    const mesStart = `${primeiroDiaMes}T00:00:00`;
    const mesEndExclusive = `${getNextDayStr(ultimoDiaMes)}T00:00:00`;
    console.log('[SIEG Metrics][Params]', { tenantId, periodoInicio, periodoFim, dataHoje, primeiroDiaMes, ultimoDiaMes, isSieg });

    async function countRange(extra: (q: any) => any) {
      const base = (centralSupabase as any)
        .from('tenant_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', periodoStart)
        .lt('created_at', periodoEndExclusive);
      let q1 = extra(base);
      let { count, error } = await q1;
      if (error) console.warn('[SIEG Metrics][countRange] error:', error);
      return count || 0;
    }

    async function selectRange(extra: (q: any) => any) {
      const base = (centralSupabase as any)
        .from('tenant_conversations')
        .select('analista, csat, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', mesStart)
        .lt('created_at', mesEndExclusive);
      let q1 = extra(base);
      let { data, error } = await q1;
      if (error) console.warn('[SIEG Metrics][selectRange] error:', error);
      return data || [];
    }

    // Contagem no período selecionado
    const countHoje = await countRange(q => q);
    console.log('[SIEG Metrics] Total no período:', countHoje);

    // IA hoje (sem transferência)
    let countIA: number | null = 0;
    if (isSieg) {
      const siegIa = await countRange(q => q
        .not('tag', 'ilike', '%T4%')
        .not('tag', 'ilike', '%transferido%'));
      countIA = siegIa;
      console.log('[SIEG Metrics] IA (excluindo T4/Transferido):', countIA);
    } else {
      const defaultIa = await countRange(q => q.is('data_transferencia', null));
      countIA = defaultIa;
    }

    // Transferidos hoje
    let countTransfer: number | null = 0;
    if (isSieg) {
      const siegTransfer = await countRange(q => q.or('tag.ilike.%T4%,tag.ilike.%transferido%'));
      countTransfer = siegTransfer;
      console.log('[SIEG Metrics] Transferidos (T4/Transferido):', countTransfer);
    } else {
      const defaultTransfer = await countRange(q => q.not('data_transferencia', 'is', null));
      countTransfer = defaultTransfer;
    }

    // CSAT por analista no mês
    const csatRows = await selectRange(q => q
      .not('analista', 'is', null)
      .neq('analista', '')
      .not('csat', 'is', null)
      .neq('csat', '-')
      .neq('csat', ''));

    const totalHoje = countHoje || 0;
    const totalIA = countIA || 0;
    const percentualIA = totalHoje > 0 ? (totalIA / totalHoje) * 100 : 0;
    const csatPorAnalista = processarCSAT(csatRows || []);
    console.log('[SIEG Metrics] Resultado final:', {
      total: countHoje || 0,
      ia: countIA || 0,
      transferidos: countTransfer || 0,
      csatRegistros: (csatRows || []).length
    });

    return {
      atendimentosHoje: totalHoje,
      atendimentosIA: totalIA,
      percentualIA,
      atendimentosTransferidos: countTransfer || 0,
      csatPorAnalista,
    };
  }

  function processarCSAT(data: any[]) {
    console.log('[CSAT] Processando dados:', { totalRegistros: data.length });
    
    const analistaMap = new Map<string, { total: number; soma: number; count: number }>();

    data.forEach((item, index) => {
      const analista = item.analista;
      const csat = parseFloat(item.csat);

      console.log(`[CSAT] [${index}] Analista: ${analista}, CSAT: ${item.csat} (parsed: ${csat})`);

      if (!isNaN(csat)) {
        if (!analistaMap.has(analista)) {
          analistaMap.set(analista, { total: 0, soma: 0, count: 0 });
        }
        const stats = analistaMap.get(analista)!;
        stats.soma += csat;
        stats.count += 1;
        stats.total += 1;
      } else {
        console.warn(`[CSAT] CSAT inválido para analista ${analista}: ${item.csat}`);
      }
    });

    const resultado = Array.from(analistaMap.entries())
      .map(([analista, stats]) => ({
        analista,
        csatMedio: stats.soma / stats.count,
        totalAtendimentos: stats.total,
      }))
      .sort((a, b) => b.csatMedio - a.csatMedio);

    console.log('[CSAT] Processamento concluído:', resultado);
    
    return resultado;
  }

  return metrics;
}
