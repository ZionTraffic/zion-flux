import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetaInsight {
  date_start: string;
  date_stop: string;
  impressions?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
  campaign_name?: string;
  account_name?: string;
}

interface ProcessedData {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpc: number;
  ctr: number;
  conversions: number;
  conversas_iniciadas: number;
  campaign?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30");

    const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const META_AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID");

    console.log("Meta Ads request:", { days, hasToken: !!META_ACCESS_TOKEN, hasAccountId: !!META_AD_ACCOUNT_ID });

    if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
      console.error("Missing Meta credentials");
      return new Response(
        JSON.stringify({ 
          error: "CREDENTIALS_MISSING",
          message: "Credenciais Meta não configuradas." 
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const since = startDate.toISOString().slice(0, 10);
    const until = endDate.toISOString().slice(0, 10);

    // Meta Marketing API endpoint (v21.0)
    const endpoint = `https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/insights`;
    const params = new URLSearchParams({
      fields: 'date_start,date_stop,impressions,clicks,spend,cpc,ctr,actions,campaign_name,account_name',
      time_range: JSON.stringify({ since, until }),
      time_increment: '1',
      level: 'account',
      access_token: META_ACCESS_TOKEN,
    });

    console.log("Calling Meta API:", endpoint);

    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();

    console.log("Meta API response status:", response.status);

    if (data.error) {
      console.error("Meta API error:", data.error);
      
      // Handle specific error cases
      if (data.error.code === 190) {
        return new Response(
          JSON.stringify({ 
            error: "TOKEN_EXPIRED",
            message: "Token de acesso expirado. Renove a conexão." 
          }), 
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "API_ERROR",
          message: data.error.message 
        }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Process the data
    const insights: MetaInsight[] = data.data || [];
    console.log(`Processing ${insights.length} insights`);

    // Group data by date
    const dailyMap = new Map<string, ProcessedData>();

    insights.forEach((item) => {
      const date = item.date_start || '';
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          impressions: 0,
          clicks: 0,
          spend: 0,
          cpc: 0,
          ctr: 0,
          conversions: 0,
          conversas_iniciadas: 0,
        });
      }

      const dayData = dailyMap.get(date)!;
      dayData.impressions += Number(item.impressions || 0);
      dayData.clicks += Number(item.clicks || 0);
      dayData.spend += Number(item.spend || 0);
      
      // Find conversions in actions array
      const conversionAction = item.actions?.find(
        a => a.action_type === 'offsite_conversion.fb_pixel_purchase' || 
             a.action_type === 'offsite_conversion'
      );
      dayData.conversions += Number(conversionAction?.value || 0);
      
      // Find messaging/conversation started actions
      const messagingAction = item.actions?.find(
        a => a.action_type.includes('messaging_conversation_started') || 
             a.action_type.includes('messaging_first_reply') ||
             a.action_type === 'onsite_conversion.messaging_conversation_started_7d'
      );
      dayData.conversas_iniciadas += Number(messagingAction?.value || 0);
    });

    // Calculate aggregates
    const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const totals = daily.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      spend: acc.spend + day.spend,
      conversions: acc.conversions + day.conversions,
      conversas_iniciadas: acc.conversas_iniciadas + day.conversas_iniciadas,
      cpc: 0,
      ctr: 0,
    }), { impressions: 0, clicks: 0, spend: 0, conversions: 0, conversas_iniciadas: 0, cpc: 0, ctr: 0 });

    // Calculate averages
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;

    // Calculate CPC and CTR for each day
    daily.forEach(day => {
      day.cpc = day.clicks > 0 ? day.spend / day.clicks : 0;
      day.ctr = day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0;
    });

    const result = {
      totals,
      daily,
      campaigns: insights.map(i => ({
        name: i.campaign_name || 'Indefinida',
        impressions: Number(i.impressions || 0),
        clicks: Number(i.clicks || 0),
        spend: Number(i.spend || 0),
      })),
    };

    console.log("Returning processed data:", {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalConversasIniciadas: totals.conversas_iniciadas,
      dailyCount: daily.length,
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-meta-ads-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Erro desconhecido" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
