import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Helper function to classify campaign by funnel stage
function classifyFunnelStage(campaignName: string): 'topo' | 'meio' | 'fundo' {
  const nameLower = campaignName.toLowerCase();
  
  // Topo de Funil - Reconhecimento/Awareness
  if (nameLower.includes('topo') || nameLower.includes('reconhecimento')) {
    return 'topo';
  }
  
  // Meio de Funil - Consideração
  if (nameLower.includes('meio')) {
    return 'meio';
  }
  
  // Fundo de Funil - Conversão (padrão)
  return 'fundo';
}

// Helper function to mask account IDs for secure logging
function maskAccountId(accountId: string): string {
  if (accountId.length <= 8) return '***';
  return accountId.slice(0, 4) + '***' + accountId.slice(-4);
}

// Helper function to fetch data from a specific Meta Ad Account
async function fetchAccountData(
  accountId: string,
  token: string,
  since: string,
  until: string
) {
  const endpoint = `https://graph.facebook.com/v21.0/${accountId}/insights`;
  
  // Daily data
  const dailyParams = new URLSearchParams({
    fields: 'date_start,date_stop,impressions,clicks,spend,cpc,ctr,actions,campaign_name,account_name',
    time_range: JSON.stringify({ since, until }),
    time_increment: '1',
    level: 'account',
    access_token: token,
  });
  
  console.log(`📊 Fetching daily data for account: ${maskAccountId(accountId)}`);
  const dailyResponse = await fetch(`${endpoint}?${dailyParams}`);
  const dailyData = await dailyResponse.json();
  
  // Campaign data
  const campaignParams = new URLSearchParams({
    fields: 'campaign_name,impressions,clicks,spend',
    time_range: JSON.stringify({ since, until }),
    level: 'campaign',
    access_token: token,
  });
  
  console.log(`📈 Fetching campaign data for account: ${maskAccountId(accountId)}`);
  const campaignResponse = await fetch(`${endpoint}?${campaignParams}`);
  const campaignData = await campaignResponse.json();
  
  return {
    accountId,
    dailyData,
    campaignData,
    dailyStatus: dailyResponse.status,
    campaignStatus: campaignResponse.status,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    const { workspace_id, days, startDate: reqStartDate, endDate: reqEndDate } = requestBody;

    // Validate workspace_id
    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_INPUT', message: 'workspace_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has access to this workspace AND workspace uses ASF database
    const { data: membership, error: membershipError } = await supabaseClient
      .from('membros_workspace')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Workspace access denied:', { userId: user.id, workspaceId: workspace_id });
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Access denied to workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify workspace uses ASF database (only ASF workspaces have Meta Ads integration)
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('workspaces')
      .select('database')
      .eq('id', workspace_id)
      .single();

    if (workspaceError || !workspace || workspace.database !== 'asf') {
      console.error('Workspace not ASF:', { workspaceId: workspace_id, database: workspace?.database });
      return new Response(
        JSON.stringify({ error: 'CREDENTIALS_MISSING', message: 'Meta Ads integration not available for this workspace' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Workspace access verified:', { userId: user.id, workspaceId: workspace_id, role: membership.role, database: workspace.database });

    const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    const META_AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID");
    const META_AD_ACCOUNT_ID_2 = Deno.env.get("META_AD_ACCOUNT_ID_2");

    console.log("Meta Ads request:", { 
      days, 
      startDate: reqStartDate, 
      endDate: reqEndDate, 
      hasToken: !!META_ACCESS_TOKEN, 
      hasAccountId: !!META_AD_ACCOUNT_ID 
    });

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

    // Calculate date range with validation
    let since: string;
    let until: string;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (reqStartDate && reqEndDate) {
      // Validate date format
      if (!dateRegex.test(reqStartDate) || !dateRegex.test(reqEndDate)) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_INPUT',
            message: 'Invalid date format. Use YYYY-MM-DD' 
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Validate dates are valid
      const startDate = new Date(reqStartDate);
      const endDate = new Date(reqEndDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_INPUT',
            message: 'Invalid date values' 
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Validate end >= start
      if (endDate < startDate) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_INPUT',
            message: 'End date must be after start date' 
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Limit to 90 days max to prevent API quota exhaustion
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 90) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_INPUT',
            message: 'Date range cannot exceed 90 days' 
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      since = reqStartDate;
      until = reqEndDate;
    } else {
      // Validate days parameter
      const daysToUse = days || 30;
      const parsedDays = Number(daysToUse);
      
      if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 90) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_INPUT',
            message: 'Days parameter must be between 1 and 90' 
          }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parsedDays);
      since = startDate.toISOString().slice(0, 10);
      until = endDate.toISOString().slice(0, 10);
    }
    
    // Aplicar data mínima do sistema (nunca buscar antes de 01/10/2025)
    const MIN_DATA_DATE = '2025-10-01';
    if (since < MIN_DATA_DATE) {
      console.log(`⚠️ Adjusted since from ${since} to ${MIN_DATA_DATE} (system minimum date)`);
      since = MIN_DATA_DATE;
    }

    console.log("Date range:", { since, until });

    // Prepare accounts to fetch
    const accountsToFetch = [META_AD_ACCOUNT_ID];
    if (META_AD_ACCOUNT_ID_2) {
      accountsToFetch.push(META_AD_ACCOUNT_ID_2);
    }

    console.log(`📥 Fetching data from ${accountsToFetch.length} account(s)`);

    // Fetch data from all accounts in parallel
    const accountResults = await Promise.all(
      accountsToFetch.map(accountId => 
        fetchAccountData(accountId, META_ACCESS_TOKEN, since, until)
      )
    );

    // Combine all insights from both accounts
    let allDailyInsights: MetaInsight[] = [];
    let allCampaignInsights: MetaInsight[] = [];

    accountResults.forEach((result, index) => {
      console.log(`✅ Account ${index + 1}:`, {
        dailyStatus: result.dailyStatus,
        campaignStatus: result.campaignStatus,
        dailyRecords: result.dailyData.data?.length || 0,
        campaignRecords: result.campaignData.data?.length || 0,
      });

      // Check for errors in daily data
      if (result.dailyData.error) {
        console.error(`❌ Account ${index + 1} daily error:`, result.dailyData.error);
        
        if (result.dailyData.error.code === 190) {
          throw new Error("TOKEN_EXPIRED");
        }
        throw new Error(`API_ERROR: ${result.dailyData.error.message}`);
      }

      // Aggregate daily insights
      if (result.dailyData.data) {
        allDailyInsights = allDailyInsights.concat(result.dailyData.data);
      }

      // Aggregate campaign insights
      if (result.campaignData.data) {
        allCampaignInsights = allCampaignInsights.concat(result.campaignData.data);
      } else if (result.campaignData.error) {
        console.error(`⚠️ Account ${index + 1} campaign error (continuing):`, result.campaignData.error);
      }
    });

    console.log(`📊 Total insights aggregated:`, {
      dailyInsights: allDailyInsights.length,
      campaignInsights: allCampaignInsights.length,
    });

    // Process the aggregated data
    const insights: MetaInsight[] = allDailyInsights;
    console.log(`Processing ${insights.length} daily insights from all accounts`);

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

    // Process campaign data from all accounts
    const campaignInsights: MetaInsight[] = allCampaignInsights;
    console.log(`Processing ${campaignInsights.length} campaign insights from all accounts`);

    // Aggregate campaigns by name
    const campaignMap = new Map<string, { impressions: number; clicks: number; spend: number }>();
    
    campaignInsights.forEach((campaign) => {
      const name = campaign.campaign_name || 'Sem Nome';
      
      if (!campaignMap.has(name)) {
        campaignMap.set(name, {
          impressions: 0,
          clicks: 0,
          spend: 0,
        });
      }
      
      const campaignData = campaignMap.get(name)!;
      campaignData.impressions += Number(campaign.impressions || 0);
      campaignData.clicks += Number(campaign.clicks || 0);
      campaignData.spend += Number(campaign.spend || 0);
    });

    const campaigns = Array.from(campaignMap.entries()).map(([name, data]) => ({
      name,
      impressions: data.impressions,
      clicks: data.clicks,
      spend: data.spend,
      funnelStage: classifyFunnelStage(name),
    }));

    const result = {
      totals,
      daily,
      campaigns,
    };

    console.log("Returning processed data:", {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalConversasIniciadas: totals.conversas_iniciadas,
      dailyCount: daily.length,
      campaignsCount: campaigns.length,
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