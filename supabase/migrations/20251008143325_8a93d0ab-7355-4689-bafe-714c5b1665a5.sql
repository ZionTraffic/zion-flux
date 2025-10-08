-- Create a function to get workspace members with their email and name
-- This function uses SECURITY DEFINER to access auth.users table
CREATE OR REPLACE FUNCTION public.get_workspace_members_with_details(p_workspace_id uuid)
RETURNS TABLE (
  user_id uuid,
  role text,
  user_email text,
  user_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mw.user_id,
    mw.role,
    au.email as user_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as user_name
  FROM public.membros_workspace mw
  JOIN auth.users au ON au.id = mw.user_id
  WHERE mw.workspace_id = p_workspace_id
  ORDER BY 
    CASE 
      WHEN mw.role = 'owner' THEN 1
      WHEN mw.role = 'admin' THEN 2
      WHEN mw.role = 'member' THEN 3
      WHEN mw.role = 'viewer' THEN 4
      ELSE 5
    END,
    au.email;
$$;