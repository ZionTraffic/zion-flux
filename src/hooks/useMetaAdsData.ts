import { useState, useEffect } from "react";
import { useDatabase } from '@/contexts/DatabaseContext';
import { logger } from "@/utils/logger";
import { MIN_DATA_DATE, MIN_DATA_DATE_OBJ } from "@/lib/constants";

export interface MetaAdsTotals {
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  conversions: number;
  conversas_iniciadas: number;
}

export interface MetaAdsDaily {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  conversions: number;
  conversas_iniciadas: number;
}

export interface MetaCampaign {
  name: string;
  impressions: number;
  clicks: number;
  spend: number;
  funnelStage: 'topo' | 'meio' | 'fundo';
}

export function useMetaAdsData(
  workspaceId: string,
  startDate?: Date,
  endDate?: Date,
  days: number = 30
) {
  const { supabase } = useDatabase();
  const [totals, setTotals] = useState<MetaAdsTotals | null>(null);
  const [daily, setDaily] = useState<MetaAdsDaily[]>([]);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  async function fetchData() {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching Meta Ads data');

      // Prepare request body - enforce MIN_DATA_DATE
      let requestBody: any;
      
      if (startDate && endDate) {
        // Aplicar data mínima ao startDate fornecido
        const effectiveStartDate = startDate < MIN_DATA_DATE_OBJ ? MIN_DATA_DATE_OBJ : startDate;
        requestBody = {
          workspace_id: workspaceId,
          startDate: effectiveStartDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        };
      } else {
        // Quando usar 'days', garantir que não busque antes de MIN_DATA_DATE
        const calculatedStart = new Date();
        calculatedStart.setDate(calculatedStart.getDate() - days);
        const effectiveStartDate = calculatedStart < MIN_DATA_DATE_OBJ ? MIN_DATA_DATE_OBJ : calculatedStart;
        
        requestBody = {
          workspace_id: workspaceId,
          startDate: effectiveStartDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        };
      }

      const { data, error: functionError } = await supabase.functions.invoke(
        'fetch-meta-ads-data',
        {
          body: requestBody,
        }
      );

      if (functionError) {
        logger.error('Meta Ads function error', functionError);
        throw functionError;
      }

      if (data?.error) {
        logger.error('Meta Ads API error', data.error);
        setError(data.error);
        
        // Set empty data on error
        setTotals({
          impressions: 0,
          clicks: 0,
          spend: 0,
          cpc: 0,
          ctr: 0,
          conversions: 0,
          conversas_iniciadas: 0,
        });
        setDaily([]);
        setCampaigns([]);
        setLoading(false);
        return;
      }

      setTotals(data.totals || {
        impressions: 0,
        clicks: 0,
        spend: 0,
        cpc: 0,
        ctr: 0,
        conversions: 0,
        conversas_iniciadas: 0,
      });
      setDaily(data.daily || []);
      setCampaigns(data.campaigns || []);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      logger.error('Error fetching Meta Ads data', err);
      setError('FETCH_ERROR');
      setTotals({
        impressions: 0,
        clicks: 0,
        spend: 0,
        cpc: 0,
        ctr: 0,
        conversions: 0,
        conversas_iniciadas: 0,
      });
      setDaily([]);
      setCampaigns([]);
      setLoading(false);
    }
  }

  // Auto-refresh every 3 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 180000);
    return () => clearInterval(interval);
  }, [workspaceId, days, startDate, endDate]);

  return { 
    totals, 
    daily, 
    campaigns, 
    loading, 
    error, 
    lastUpdate, 
    refetch: fetchData 
  };
}
