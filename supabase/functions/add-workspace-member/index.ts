import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddMemberRequest {
  email: string;
  workspace_id: string;
  role: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { email, workspace_id, role }: AddMemberRequest = await req.json();

    console.log('Add member request received');

    // Validate input
    if (!email || !workspace_id || !role) {
      throw new Error('Email, workspace_id, and role are required');
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be one of: owner, admin, member, viewer');
    }

    // Check if the requesting user is owner or admin of the workspace
    const { data: requesterMembership, error: membershipError } = await supabaseClient
      .from('membros_workspace')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !requesterMembership) {
      throw new Error('You are not a member of this workspace');
    }

    if (!['owner', 'admin'].includes(requesterMembership.role)) {
      throw new Error('Only owners and admins can add members');
    }

    // Enforce role hierarchy - prevent privilege escalation
    if (role === 'owner' && requesterMembership.role !== 'owner') {
      throw new Error('Only workspace owners can add other owners');
    }

    if (role === 'admin' && requesterMembership.role !== 'owner') {
      throw new Error('Only workspace owners can add admins');
    }

    // Find user by email using service role
    const { data: targetUser, error: userError } = await supabaseClient.auth.admin.listUsers();

    if (userError) {
      console.error('Error listing users:', userError);
      throw new Error('Failed to search for user');
    }

    const foundUser = targetUser.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      throw new Error('User not found. The user must have an account before being added to a workspace.');
    }

    console.log('User found and validated');

    // Check if user is already a member
    const { data: existingMember } = await supabaseClient
      .from('membros_workspace')
      .select('user_id')
      .eq('workspace_id', workspace_id)
      .eq('user_id', foundUser.id)
      .maybeSingle();

    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }

    // Add user to workspace
    const { error: insertError } = await supabaseClient
      .from('membros_workspace')
      .insert({
        workspace_id,
        user_id: foundUser.id,
        role
      });

    if (insertError) {
      console.error('Error inserting member');
      throw new Error('Failed to add member to workspace');
    }

    console.log('Member added successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Member added successfully',
        user_id: foundUser.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in add-workspace-member:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while adding the member';
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
