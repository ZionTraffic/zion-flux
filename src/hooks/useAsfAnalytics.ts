import { useState, useEffect } from 'react';

export interface KpiData {
  leads: number;
  qualified: number;
  followup: number;
  discarded: number;
  investment: number;
  cpl: number;
}

export interface DailyData {
  date: string;
  leads: number;
  investment: number;
  cpl: number;
}

export const useAsfAnalytics = () => {
  const [totals, setTotals] = useState<KpiData>({
    leads: 1247,
    qualified: 892,
    followup: 234,
    discarded: 121,
    investment: 45280,
    cpl: 36.32,
  });

  const [daily, setDaily] = useState<DailyData[]>([
    { date: '01/01', leads: 42, investment: 1520, cpl: 36.19 },
    { date: '02/01', leads: 38, investment: 1380, cpl: 36.32 },
    { date: '03/01', leads: 51, investment: 1850, cpl: 36.27 },
    { date: '04/01', leads: 45, investment: 1630, cpl: 36.22 },
    { date: '05/01', leads: 48, investment: 1740, cpl: 36.25 },
    { date: '06/01', leads: 53, investment: 1920, cpl: 36.23 },
    { date: '07/01', leads: 47, investment: 1700, cpl: 36.17 },
  ]);

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refetch = () => {
    setLoading(true);
    
    // Simular atualização dos dados
    setTimeout(() => {
      setTotals(prev => ({
        ...prev,
        leads: prev.leads + Math.floor(Math.random() * 10),
        qualified: prev.qualified + Math.floor(Math.random() * 5),
      }));
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    totals,
    daily,
    loading,
    lastUpdate,
    refetch,
  };
};
