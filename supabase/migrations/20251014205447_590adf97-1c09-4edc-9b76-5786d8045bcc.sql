-- Create secure server-side function for updating workspace member roles
-- This function enforces role hierarchy and prevents privilege escalation

CREATE OR REPLACE FUNCTION public.update_workspace_member_role(
  p_workspace_id uuid,
  p_user_id uuid,
  p_new_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_role text;
  v_target_current_role text;
BEGIN
  -- Validate new role is legitimate
  IF p_new_role NOT IN ('owner', 'admin', 'member', 'viewer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role. Must be owner, admin, member, or viewer.');
  END IF;

  -- Get requester's role in this workspace
  SELECT role INTO v_requester_role
  FROM public.membros_workspace
  WHERE workspace_id = p_workspace_id AND user_id = auth.uid();
  
  -- Check if requester has permission (must be owner or admin)
  IF v_requester_role IS NULL OR v_requester_role NOT IN ('owner', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied. You must be an owner or admin.');
  END IF;

  -- Get target user's current role
  SELECT role INTO v_target_current_role
  FROM public.membros_workspace
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;
  
  IF v_target_current_role IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is not a member of this workspace.');
  END IF;

  -- Prevent users from modifying their own role
  IF p_user_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot modify your own role.');
  END IF;

  -- Enforce role hierarchy: admins cannot create or modify owners
  IF v_requester_role = 'admin' THEN
    -- Admins cannot promote anyone to owner
    IF p_new_role = 'owner' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Admins cannot promote users to owner.');
    END IF;
    
    -- Admins cannot modify existing owners
    IF v_target_current_role = 'owner' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Admins cannot modify owner roles.');
    END IF;
  END IF;

  -- Prevent demoting the last owner
  IF v_target_current_role = 'owner' AND p_new_role != 'owner' THEN
    DECLARE
      v_owner_count int;
    BEGIN
      SELECT COUNT(*) INTO v_owner_count
      FROM public.membros_workspace
      WHERE workspace_id = p_workspace_id AND role = 'owner';
      
      IF v_owner_count <= 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot demote the last owner. Workspace must have at least one owner.');
      END IF;
    END;
  END IF;

  -- All validations passed, update the role
  UPDATE public.membros_workspace
  SET role = p_new_role
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Role updated successfully.');
END;
$$;