import { useEffect, useState } from 'react';
import { supabase, WORKSPACE_ID } from '../lib/supabaseClient';

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

export function useAnalyticsData() {
  const [totals, setTotals] = useState<TotalsData | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  async function fetchData() {
    try {
      setLoading(true);

      // Calcular datas (últimos 30 dias)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Buscar totais via RPC
      const { data: totalsData, error: totalsError } = await supabase.rpc('kpi_totais_periodo', {
        workspace_id: WORKSPACE_ID,
        start_date: startDateStr,
        end_date: endDateStr,
      });

      if (totalsError) {
        console.error('Erro ao carregar totais:', totalsError.message);
        throw totalsError;
      }

      // Buscar dados diários
      const { data: dailyData, error: dailyError } = await supabase
        .from('kpi_overview_daily')
        .select('day, leads_recebidos, leads_qualificados, leads_followup, leads_descartados, investimento, cpl')
        .eq('workspace_id', WORKSPACE_ID)
        .gte('day', startDate.toISOString())
        .order('day', { ascending: true });

      if (dailyError) {
        console.error('Erro ao carregar dados diários:', dailyError.message);
        throw dailyError;
      }

      setTotals(totalsData?.[0] || null);
      setDaily(dailyData || []);
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error.message);
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
  }, []);

  return { totals, daily, loading, lastUpdate, refetch: fetchData };
}
