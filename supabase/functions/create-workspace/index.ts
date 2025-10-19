import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    console.log('🔐 Creating workspace - validating authentication');

    // Cliente do banco ASF (principal) para buscar configs
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Pegar dados do usuário autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      throw new Error('User not authenticated');
    }

    console.log(`✅ User authenticated: ${user.id}`);

    // Receber dados da requisição
    const { name, slug, database, segment, logo_url, primary_color } = await req.json();

    console.log(`📝 Creating workspace: ${name} (${slug}) in database: ${database}`);

    // Buscar configuração do banco alvo
    const { data: dbConfig, error: dbConfigError } = await supabaseClient
      .from('database_configs')
      .select('url, service_role_secret_name')
      .eq('database_key', database)
      .single();

    if (dbConfigError || !dbConfig) {
      console.error('❌ Database config not found:', dbConfigError);
      throw new Error(`Database config not found for: ${database}`);
    }

    console.log(`🔑 Using service role key: ${dbConfig.service_role_secret_name}`);

    // Buscar Service Role Key do secret correto
    const serviceRoleKey = Deno.env.get(dbConfig.service_role_secret_name);
    if (!serviceRoleKey) {
      console.error(`❌ Service role key not found: ${dbConfig.service_role_secret_name}`);
      throw new Error(`Service role key not found: ${dbConfig.service_role_secret_name}`);
    }

    console.log(`🌐 Connecting to target database: ${dbConfig.url}`);

    // Criar cliente admin para o banco alvo
    const targetClient = createClient(dbConfig.url, serviceRoleKey);

    // Criar workspace no banco alvo
    const { data: workspace, error: workspaceError } = await targetClient
      .from('workspaces')
      .insert([{
        name,
        slug,
        database,
        segment,
        logo_url,
        primary_color
      }])
      .select()
      .single();

    if (workspaceError) {
      console.error('❌ Error creating workspace:', workspaceError);
      throw workspaceError;
    }

    console.log(`✅ Workspace created: ${workspace.id}`);

    // Adicionar usuário como owner
    const { error: memberError } = await targetClient
      .from('membros_workspace')
      .insert([{
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      }]);

    if (memberError) {
      console.error('❌ Error adding member:', memberError);
      throw memberError;
    }

    console.log(`✅ User ${user.id} added as owner to workspace ${workspace.id}`);

    return new Response(
      JSON.stringify({ data: workspace }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error creating workspace:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
