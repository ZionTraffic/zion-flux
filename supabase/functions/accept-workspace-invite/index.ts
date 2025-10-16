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
    console.log('🔍 accept-workspace-invite: Starting invite acceptance process');

    // Get request body
    const { token, user_id } = await req.json();
    console.log('📊 accept-workspace-invite: Received data', { token: token?.substring(0, 10) + '...', user_id });

    // Validate inputs
    if (!token || !user_id) {
      console.error('❌ accept-workspace-invite: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Token and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ accept-workspace-invite: Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the authenticated user matches the user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== user_id) {
      console.error('❌ accept-workspace-invite: Auth verification failed', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ accept-workspace-invite: User authenticated successfully');

    // Verify invite exists and is valid (using regular client - RLS allows public read of valid invites)
    const { data: invite, error: inviteError } = await supabase
      .from('pending_invites')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      console.error('❌ accept-workspace-invite: Invalid or expired invite', inviteError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invite' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ accept-workspace-invite: Invite validated', { workspace_id: invite.workspace_id, role: invite.role });

    // Initialize admin client for privileged operations
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // CRITICAL: Validate service role key is available
    if (!supabaseServiceRoleKey) {
      console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY not available in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing service role key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ accept-workspace-invite: Service role key available:', supabaseServiceRoleKey.substring(0, 15) + '...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Add user to workspace using admin client (bypasses RLS)
    console.log('🔧 accept-workspace-invite: About to insert into membros_workspace using admin client');
    console.log('📝 accept-workspace-invite: Insert data:', { 
      workspace_id: invite.workspace_id, 
      user_id: user_id, 
      role: invite.role 
    });
    
    const { error: memberError } = await supabaseAdmin
      .from('membros_workspace')
      .insert({
        workspace_id: invite.workspace_id,
        user_id: user_id,
        role: invite.role,
      });

    if (memberError) {
      // Check if user is already a member
      if (memberError.code === '23505') { // Unique violation
        console.log('⚠️ accept-workspace-invite: User already member of workspace');
      } else {
        console.error('❌ accept-workspace-invite: Error adding member - Full error details:', JSON.stringify(memberError, null, 2));
        console.error('❌ accept-workspace-invite: Error code:', memberError.code);
        console.error('❌ accept-workspace-invite: Error message:', memberError.message);
        console.error('❌ accept-workspace-invite: Error hint:', memberError.hint);
        throw memberError;
      }
    } else {
      console.log('✅ accept-workspace-invite: User added to workspace successfully');
    }

    // Mark invite as used
    const { error: updateError } = await supabaseAdmin
      .from('pending_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('❌ accept-workspace-invite: Error marking invite as used', updateError);
      // Non-critical error, continue
    } else {
      console.log('✅ accept-workspace-invite: Invite marked as used');
    }

    console.log('✅ accept-workspace-invite: Process completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        workspace_id: invite.workspace_id,
        role: invite.role 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ accept-workspace-invite: Unexpected error', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
