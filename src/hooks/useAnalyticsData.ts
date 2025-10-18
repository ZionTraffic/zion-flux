import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { MIN_DATA_DATE_OBJ } from '@/lib/constants';

export interface TotalsData {
  leads_recebidos: number;
  leads_qualificados: number;
  leads_followup: number;
  leads_descartados: number;
  investimento: number;
  cpl: number;
}

export interface DailyData {
  day: string;
  leads_recebidos: number;
  leads_qualificados: number;
  leads_followup: number;
  leads_descartados: number;
  investimento: number;
  cpl: number;
}

export function useAnalyticsData(workspaceId: string) {
  const [totals, setTotals] = useState<TotalsData | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  async function fetchData() {
    try {
      setLoading(true);

      // Calcular datas (últimos 30 dias, mas nunca antes de MIN_DATA_DATE)
      const endDate = new Date();
      const calculatedStartDate = new Date();
      calculatedStartDate.setDate(calculatedStartDate.getDate() - 30);
      
      // Aplicar data mínima
      const startDate = calculatedStartDate < MIN_DATA_DATE_OBJ ? MIN_DATA_DATE_OBJ : calculatedStartDate;

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Buscar totais via RPC
      const { data: totalsData, error: totalsError } = await supabase.rpc('kpi_totais_periodo', {
        p_workspace_id: workspaceId,
        p_from: startDateStr,
        p_to: endDateStr,
      });

      if (totalsError) {
        logger.error('Erro ao carregar totais:', totalsError.message);
        throw totalsError;
      }

      // Buscar dados diários
      const { data: dailyData, error: dailyError } = await supabase
        .from('kpi_overview_daily')
        .select('day, leads_recebidos, leads_qualificados, leads_followup, leads_descartados, investimento, cpl')
        .eq('workspace_id', workspaceId)
        .gte('day', startDate.toISOString())
        .order('day', { ascending: true });

      if (dailyError) {
        logger.error('Erro ao carregar dados diários:', dailyError.message);
        throw dailyError;
      }

      // A RPC retorna campos com nomes diferentes, então mapeamos
      const mappedTotals = totalsData?.[0] ? {
        leads_recebidos: totalsData[0].recebidos,
        leads_qualificados: totalsData[0].qualificados,
        leads_followup: totalsData[0].followup,
        leads_descartados: totalsData[0].descartados,
        investimento: totalsData[0].investimento,
        cpl: totalsData[0].cpl,
      } : null;
      
      setTotals(mappedTotals);
      setDaily(dailyData || []);
      setLastUpdate(new Date());
    } catch (error: any) {
      logger.error('Erro ao carregar dados:', error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [workspaceId]);

  return { totals, daily, loading, lastUpdate, refetch: fetchData };
}
