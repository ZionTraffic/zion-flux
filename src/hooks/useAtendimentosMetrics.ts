import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export function useAtendimentosMetrics(workspaceId: string | null) {
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
  }, [workspaceId]);

  async function fetchMetrics() {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true }));

      // Buscar slug do workspace
      const { data: ws, error: wsError } = await supabase
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

      console.log('[Atendimentos] Buscando métricas:', { 
        workspaceId, 
        slug: ws?.slug, 
        tableName 
      });

      const hoje = getCurrentBrasiliaDate();
      console.log('[Atendimentos] Data de hoje (Brasília):', hoje);

      // Calcular período do mês
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();
      const primeiroDiaMes = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
      const ultimoDiaMes = new Date(anoAtual, mesAtual, 0).getDate();
      const ultimoDiaMesStr = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${ultimoDiaMes}`;

      console.log('[Atendimentos] Período CSAT:', { primeiroDiaMes, ultimoDiaMesStr });

      // Usar função RPC para bypass RLS
      const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)('get_atendimentos_metrics', {
        p_workspace_id: workspaceId,
        p_table_name: tableName,
        p_data_hoje: hoje,
        p_primeiro_dia_mes: primeiroDiaMes,
        p_ultimo_dia_mes: ultimoDiaMesStr
      });

      if (rpcError) {
        console.error('[Atendimentos] Erro ao buscar métricas via RPC:', rpcError);
        throw rpcError;
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
