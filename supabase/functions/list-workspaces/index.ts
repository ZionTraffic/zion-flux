import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DatabaseConfig {
  id: string;
  supabase_url: string;
  supabase_anon_key: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create main Supabase client to verify user and get database configs
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mainClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT and get user
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await mainClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    // Get all database configurations
    const { data: dbConfigs, error: configError } = await mainClient
      .from('database_configs')
      .select('*');

    if (configError) {
      console.error('Error fetching database configs:', configError);
      throw configError;
    }

    if (!dbConfigs || dbConfigs.length === 0) {
      console.log('No database configs found');
      return new Response(
        JSON.stringify({ workspaces: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${dbConfigs.length} database configs`);

    // Fetch workspaces from all databases
    const allWorkspacesPromises = dbConfigs.map(async (config: DatabaseConfig) => {
      try {
        // Get service role key for this database
        const serviceRoleKey = config.id === 'asf' 
          ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          : Deno.env.get('SIEG_SERVICE_ROLE_KEY')!;

        const dbClient = createClient(config.supabase_url, serviceRoleKey);

        // Fetch workspaces
        const { data: workspaces, error: wsError } = await dbClient
          .from('workspaces')
          .select('*')
          .order('created_at', { ascending: false });

        if (wsError) {
          console.error(`Error fetching workspaces from ${config.id}:`, wsError);
          return [];
        }

        console.log(`Found ${workspaces?.length || 0} workspaces in ${config.id}`);

        if (!workspaces) return [];

        // Filter by user membership
        const workspacesWithAccess = await Promise.all(
          workspaces.map(async (workspace) => {
            const { data: memberData } = await dbClient
              .from('membros_workspace')
              .select('role')
              .eq('workspace_id', workspace.id)
              .eq('user_id', user.id)
              .maybeSingle();

            if (!memberData) return null;

            return {
              ...workspace,
              database: config.id,
              userRole: memberData.role,
            };
          })
        );

        return workspacesWithAccess.filter(ws => ws !== null);
      } catch (error) {
        console.error(`Error processing database ${config.id}:`, error);
        return [];
      }
    });

    const allWorkspaces = (await Promise.all(allWorkspacesPromises)).flat();
    console.log(`Total workspaces with access: ${allWorkspaces.length}`);

    // Fetch KPIs for each workspace
    const workspacesWithKpis = await Promise.all(
      allWorkspaces.map(async (workspace) => {
        try {
          const dbConfig = dbConfigs.find((c: DatabaseConfig) => c.id === workspace.database);
          if (!dbConfig) return workspace;

          const serviceRoleKey = workspace.database === 'asf'
            ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            : Deno.env.get('SIEG_SERVICE_ROLE_KEY')!;

          const dbClient = createClient(dbConfig.supabase_url, serviceRoleKey);

          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
          const toDate = now.toISOString().split('T')[0];

          const { data: kpiData } = await dbClient.rpc('kpi_totais_periodo', {
            p_workspace_id: workspace.id,
            p_from: fromDate,
            p_to: toDate,
          });

          if (kpiData && kpiData.length > 0) {
            const kpi = kpiData[0];
            return {
              ...workspace,
              kpis: {
                recebidos: kpi.recebidos || 0,
                qualificados: kpi.qualificados || 0,
                followup: kpi.followup || 0,
                descartados: kpi.descartados || 0,
                investimento: parseFloat(kpi.investimento || '0'),
                cpl: parseFloat(kpi.cpl || '0'),
              },
            };
          }

          return workspace;
        } catch (error) {
          console.error(`Error fetching KPIs for workspace ${workspace.id}:`, error);
          return workspace;
        }
      })
    );

    return new Response(
      JSON.stringify({ workspaces: workspacesWithKpis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
