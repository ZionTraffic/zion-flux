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
    console.log('📊 accept-workspace-invite: Processing request');

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
    if (authError) {
      console.error('[accept-workspace-invite] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro de autenticação: ' + authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('[accept-workspace-invite] No user found in session');
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado na sessão. Por favor, faça login novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (user.id !== user_id) {
      console.error('[accept-workspace-invite] User ID mismatch', { session_user: user.id, provided_user: user_id });
      return new Response(
        JSON.stringify({ error: 'ID de usuário não corresponde à sessão' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ accept-workspace-invite: User authenticated successfully');

    // Create anon client for public invite verification (doesn't require user authentication)
    const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

    // Verify invite exists and is valid (using anon client - RLS policy "Anyone can view invite by token" allows this)
    const { data: invite, error: inviteError } = await supabasePublic
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
    
    console.log('✅ accept-workspace-invite: Service role key configured:', !!supabaseServiceRoleKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Add user to workspace using admin client + RPC (garante roles/settings)
    console.log('🔧 accept-workspace-invite: About to call add_workspace_member RPC');
    console.log('📝 accept-workspace-invite: RPC payload:', {
      workspace_id: invite.workspace_id,
      user_id,
      role: invite.role,
    });

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc('add_workspace_member', {
      p_workspace_id: invite.workspace_id.toString(),
      p_user_id: user_id.toString(),
      p_role: invite.role,
      p_set_default_workspace: true,
    });

    if (rpcError) {
      console.error('❌ accept-workspace-invite: Error calling add_workspace_member RPC:', rpcError);
      throw rpcError;
    }

    console.log('✅ accept-workspace-invite: add_workspace_member RPC response:', rpcResult);

    // Process custom permissions if they exist
    if (invite.permissions) {
      try {
        console.log('🔐 accept-workspace-invite: Processing custom permissions');
        const customPermissions = JSON.parse(invite.permissions);
        
        if (Array.isArray(customPermissions) && customPermissions.length > 0) {
          // Insert custom permissions
          const permissionInserts = customPermissions.map(permission => ({
            workspace_id: invite.workspace_id,
            user_id: user_id,
            permission_key: permission,
            granted: true
          }));

          const { error: permissionsError } = await supabaseAdmin
            .from('user_permissions')
            .insert(permissionInserts, { onConflict: 'workspace_id,user_id,permission_key' })
            .select();

          if (permissionsError) {
            console.error('❌ accept-workspace-invite: Error inserting permissions:', permissionsError);
            // Don't fail the entire process, just log the error
          } else {
            console.log('✅ accept-workspace-invite: Custom permissions added successfully');
          }
        }
      } catch (permError) {
        console.error('❌ accept-workspace-invite: Error parsing permissions:', permError);
        // Don't fail the entire process
      }
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
