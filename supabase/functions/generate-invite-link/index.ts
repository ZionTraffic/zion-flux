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

    console.log('✅ User authenticated:', user.id);

    const body = await req.json();
    console.log('📨 Request body:', body);
    
    const { email, role, workspace_id }: GenerateInviteRequest = body;

    // Validações
    if (!email || !role || !workspace_id) {
      console.error('❌ Missing required fields:', { email: !!email, role: !!role, workspace_id: !!workspace_id });
      return new Response(
        JSON.stringify({ error: 'Email, role e workspace_id são obrigatórios' }),
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
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('membros_workspace')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError) {
      console.error('❌ Error checking membership:', membershipError);
    }
    
    console.log('👤 User membership:', membership);

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      console.error('❌ Insufficient permissions');
      return new Response(
        JSON.stringify({ error: 'Sem permissão para convidar usuários' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        workspace_id,
        email: email.toLowerCase().trim(),
        role,
        token: inviteToken,
        invited_by: user.id,
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

    // Gerar URL de convite
    const inviteUrl = `https://app.ziontraffic.com.br/accept-invite?token=${inviteToken}`;

    console.log(`✅ Convite criado para ${email} - Token: ${inviteToken}`);

    return new Response(
      JSON.stringify({
        success: true,
        invite_url: inviteUrl,
        token: inviteToken,
        expires_at: invite.expires_at,
        email: invite.email,
        role: invite.role
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
