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

    const tenantId = invite.workspace_id;
    let customData: { tenant_id?: string; is_existing_member?: boolean } | null = null;
    if (invite.custom_data) {
      try {
        customData = JSON.parse(invite.custom_data);
      } catch (parseError) {
        console.warn('⚠️ accept-workspace-invite: Could not parse custom_data', parseError);
      }
    }

    const effectiveTenantId = customData?.tenant_id ?? tenantId;

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

    // Add user to tenant_users (reativa se já existir)
    console.log('🔧 accept-workspace-invite: Upserting tenant membership', {
      tenant_id: effectiveTenantId,
      user_id,
      role: invite.role,
    });

    const { data: existingMembership, error: membershipFetchError } = await supabaseAdmin
      .from('tenant_users')
      .select('user_id, active')
      .eq('tenant_id', effectiveTenantId)
      .eq('user_id', user_id)
      .maybeSingle();

    if (membershipFetchError) {
      console.error('❌ accept-workspace-invite: Error fetching tenant membership', membershipFetchError);
      throw membershipFetchError;
    }

    if (existingMembership) {
      const { error: updateMembershipError } = await supabaseAdmin
        .from('tenant_users')
        .update({
          role: invite.role,
          active: true,
          updated_at: new Date().toISOString(),
          joined_at: new Date().toISOString(),
        })
        .eq('tenant_id', effectiveTenantId)
        .eq('user_id', user_id);

      if (updateMembershipError) {
        console.error('❌ accept-workspace-invite: Error updating tenant membership', updateMembershipError);
        throw updateMembershipError;
      }
    } else {
      const { error: insertMembershipError } = await supabaseAdmin
        .from('tenant_users')
        .insert({
          tenant_id: effectiveTenantId,
          user_id,
          role: invite.role,
          active: true,
          joined_at: new Date().toISOString(),
          invited_by: invite.invited_by,
          invited_at: invite.created_at,
          custom_permissions: invite.permissions ?? null,
        });

      if (insertMembershipError) {
        console.error('❌ accept-workspace-invite: Error inserting tenant membership', insertMembershipError);
        throw insertMembershipError;
      }
    }

    // Process custom permissions if they exist
    if (invite.permissions) {
      try {
        console.log('🔐 accept-workspace-invite: Processing custom permissions');
        const customPermissions = JSON.parse(invite.permissions);

        if (Array.isArray(customPermissions) && customPermissions.length > 0) {
          // Insert custom permissions
          const permissionInserts = customPermissions.map(permission => ({
            workspace_id: effectiveTenantId,
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
        tenant_id: effectiveTenantId,
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
