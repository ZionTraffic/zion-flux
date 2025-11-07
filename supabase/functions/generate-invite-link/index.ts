import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateInviteRequest {
  email: string;
  role: string;
  workspace_id: string;
  tenant_id?: string;
  permissions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Request received:', req.method);
    
    // Verificar se o header de autorização existe
    const authHeader = req.headers.get('Authorization');
    console.log('🔑 Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ Missing Authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Não autenticado',
          details: 'Token de autenticação não encontrado. Tente fazer logout e login novamente.'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extrair o token JWT do header
    const jwtToken = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted');
    
    // Criar cliente admin com Service Role Key para validar o token
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔐 Validating JWT token...');
    
    // Validar o JWT e obter o usuário
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwtToken);
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Erro de autenticação', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('❌ No user found');
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated');

    const body = await req.json();
    console.log('📨 Request body:', body);
    
    const { email, role, tenant_id, workspace_id, permissions } = body as GenerateInviteRequest;
    const tenantId = tenant_id ?? workspace_id;
    console.log('📝 Request data:', { email, role, tenant_id: tenantId, permissions: permissions?.length || 0 });

    // Validações
    if (!email || !role || !tenantId) {
      console.error('❌ Missing required fields:', { email: !!email, role: !!role, tenantId: !!tenantId });
      return new Response(
        JSON.stringify({ error: 'Email, role e tenant_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      console.error('❌ Invalid role:', role);
      return new Response(
        JSON.stringify({ error: 'Role inválida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Checking user permissions...');

    // Verificar se o usuário tem permissão (owner ou admin)
    const { data: requesterMembership, error: membershipError } = await supabaseAdmin
      .from('tenant_users')
      .select('role, active')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('❌ Error checking membership:', membershipError);
    }
    
    console.log('👤 User membership verified');

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
      console.error('❌ Insufficient permissions');
      return new Response(
        JSON.stringify({ error: 'Sem permissão para convidar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados do tenant para exibir na interface
    const { data: tenantRecord, error: tenantError } = await supabaseAdmin
      .from('tenants_new')
      .select('id, name, slug')
      .eq('id', tenantId)
      .maybeSingle();

    if (tenantError) {
      console.warn('⚠️ Não foi possível obter dados do tenant:', tenantError.message);
    }

    const tenantName = tenantRecord?.name ?? null;
    const tenantSlug = tenantRecord?.slug ?? null;
    const isMemberActive = requesterMembership?.active === true;

    console.log('🎲 Generating secure token...');

    // Gerar token único e seguro
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const inviteToken = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('💾 Creating invite record...');

    // Criar convite pendente
    const { data: invite, error: insertError } = await supabaseAdmin
      .from('pending_invites')
      .insert({
        workspace_id: tenantId,
        email: email.toLowerCase().trim(),
        role,
        token: inviteToken,
        invited_by: user.id,
        permissions: permissions ? JSON.stringify(permissions) : null,
        custom_data: JSON.stringify({
          tenant_id: tenantId,
          tenant_name: tenantName,
          tenant_slug: tenantSlug,
          requester_role: requesterMembership.role,
          requester_active: requesterMembership.active,
          is_existing_member: isMemberActive
        })
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar convite:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar convite' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar URL de convite - usar variável de ambiente ou localhost
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const inviteUrl = `${appUrl}/accept-invite?token=${inviteToken}`;

    console.log('✅ Invite created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        invite_url: inviteUrl,
        token: inviteToken,
        expires_at: invite.expires_at,
        email: invite.email,
        role: invite.role,
        tenant_id: tenantId,
        tenant_name: tenantName,
        tenant_slug: tenantSlug,
        already_member: isMemberActive
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
