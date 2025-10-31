import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useDatabase } from '@/contexts/DatabaseContext';
import { getCurrentBrasiliaDate } from '@/lib/dateUtils';

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

export function useAtendimentosMetrics(workspaceId: string | null, startDate?: Date, endDate?: Date) {
  const { supabase: dataSupabase } = useDatabase();
  const [metrics, setMetrics] = useState<AtendimentosMetrics>({
    atendimentosHoje: 0,
    atendimentosIA: 0,
    percentualIA: 0,
    atendimentosTransferidos: 0,
    csatPorAnalista: [],
    isLoading: true,
  });

  useEffect(() => {
    if (!workspaceId) {
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
  }, [workspaceId, startDate, endDate]);

  async function fetchMetrics() {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true }));

      // Buscar slug do workspace
      const { data: ws, error: wsError } = await centralSupabase
        .from('workspaces')
        .select('slug')
        .eq('id', workspaceId)
        .maybeSingle();

      if (wsError) {
        console.error('[Atendimentos] Erro ao buscar workspace:', wsError);
        throw wsError;
      }

      const tableName = ws?.slug === 'asf' 
        ? 'conversas_asf' 
        : ws?.slug === 'sieg' 
          ? 'conversas_sieg_financeiro'
          : 'historico_conversas';
      
      const isSieg = ws?.slug === 'sieg';
      
      // ASF não tem métricas de atendimento (colunas analista, data_transferencia)
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
        workspaceId, 
        slug: ws?.slug, 
        tableName 
      });

      // Se não houver filtro de data, buscar dados gerais (todo o período)
      // Se houver filtro, buscar apenas do período selecionado
      const dataInicio = startDate ? startDate.toISOString().split('T')[0] : '2025-10-01';
      const dataFim = endDate ? endDate.toISOString().split('T')[0] : getCurrentBrasiliaDate();
      
      console.log('[Atendimentos] Período de busca:', { dataInicio, dataFim, temFiltro: !!startDate });

      // Usar função RPC para bypass RLS
      const { data: rpcResult, error: rpcError } = await (dataSupabase.rpc as any)('get_atendimentos_metrics', {
        p_workspace_id: workspaceId,
        p_table_name: tableName,
        p_data_hoje: dataFim,
        p_primeiro_dia_mes: dataInicio,
        p_ultimo_dia_mes: dataFim
      });

      if (rpcError) {
        console.warn('[Atendimentos] Erro ao buscar métricas via RPC. Usando fallback por queries.', rpcError);
        const fallback = await computeMetricsByQueries({
          tableName,
          workspaceId,
          dataHoje: dataFim,
          primeiroDiaMes: dataInicio,
          ultimoDiaMes: dataFim,
          periodoInicio: dataInicio,
          periodoFim: dataFim,
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
    tableName: string;
    workspaceId: string;
    dataHoje: string; // YYYY-MM-DD
    primeiroDiaMes: string; // YYYY-MM-DD
    ultimoDiaMes: string; // YYYY-MM-DD
    periodoInicio: string; // YYYY-MM-DD
    periodoFim: string; // YYYY-MM-DD
  }): Promise<Omit<AtendimentosMetrics, 'isLoading'>> {
    const { tableName, workspaceId, dataHoje, primeiroDiaMes, ultimoDiaMes, periodoInicio, periodoFim } = params;

    const hojeStart = `${dataHoje}T00:00:00`;
    const hojeEndExclusive = `${getNextDayStr(dataHoje)}T00:00:00`;
    const periodoStart = `${periodoInicio}T00:00:00`;
    const periodoEndExclusive = `${getNextDayStr(periodoFim)}T00:00:00`;
    const mesStart = `${primeiroDiaMes}T00:00:00`;
    const mesEndExclusive = `${getNextDayStr(ultimoDiaMes)}T00:00:00`;
    const isSieg = tableName === 'conversas_sieg_financeiro';
    console.log('[SIEG Metrics][Params]', { tableName, workspaceId, periodoInicio, periodoFim, dataHoje, primeiroDiaMes, ultimoDiaMes, isSieg });

    async function countRange(extra: (q: any) => any) {
      const base = (dataSupabase as any)
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', periodoStart)
        .lt('created_at', periodoEndExclusive);
      let q1 = extra(base.eq('id_workspace', workspaceId));
      let { count, error } = await q1;
      if (error) console.warn('[SIEG Metrics][countRange] id_workspace error:', error);
      if (!count) {
        let q2 = extra(base.eq('workspace_id', workspaceId));
        ({ count, error } = await q2);
        if (error) console.warn('[SIEG Metrics][countRange] workspace_id error:', error);
        if (!count) {
          let q3 = extra(base);
          ({ count, error } = await q3);
          if (error) console.warn('[SIEG Metrics][countRange] no workspace filter error:', error);
        }
      }
      return count || 0;
    }

    async function selectRange(extra: (q: any) => any) {
      const base = (dataSupabase as any)
        .from(tableName)
        .select('analista, csat, created_at')
        .gte('created_at', mesStart)
        .lt('created_at', mesEndExclusive);
      let q1 = extra(base.eq('id_workspace', workspaceId));
      let { data, error } = await q1;
      if (error) console.warn('[SIEG Metrics][selectRange] id_workspace error:', error);
      if (!data || data.length === 0) {
        let q2 = extra(base.eq('workspace_id', workspaceId));
        ({ data, error } = await q2);
        if (error) console.warn('[SIEG Metrics][selectRange] workspace_id error:', error);
        if (!data || data.length === 0) {
          let q3 = extra(base);
          ({ data, error } = await q3);
          if (error) console.warn('[SIEG Metrics][selectRange] no workspace filter error:', error);
        }
      }
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
