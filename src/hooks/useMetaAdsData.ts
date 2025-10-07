import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

export function useMetaAdsData(workspaceId: string, days: number = 30) {
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

      console.log("Fetching Meta Ads data for workspace:", workspaceId, "days:", days);

      const { data, error: functionError } = await supabase.functions.invoke(
        'fetch-meta-ads-data',
        {
          body: { days },
        }
      );

      if (functionError) {
        console.error("Function error:", functionError);
        throw functionError;
      }

      if (data?.error) {
        console.error("API error:", data.error, data.message);
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

      console.log("Meta Ads data received:", data);

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
      console.error('Error fetching Meta Ads data:', err);
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
  }, [workspaceId, days]);

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
