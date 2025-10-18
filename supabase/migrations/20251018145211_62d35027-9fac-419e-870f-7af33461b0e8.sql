-- Fix CLIENT_SIDE_AUTH: Add server-side validation and enforce RPC usage for role updates

-- 1. First, update any invalid tags in historico_conversas to 'whatsapp' 
UPDATE historico_conversas 
SET tag = 'whatsapp' 
WHERE tag NOT IN (
  'T1 - NOVO LEAD',
  'T2 - QUALIFICANDO', 
  'T3 - QUALIFICADO',
  'T4 - FOLLOW-UP',
  'T5 - DESQUALIFICADO',
  'whatsapp'
);

-- 2. Add CHECK constraint for conversation tags to prevent client-side bypass
ALTER TABLE historico_conversas
ADD CONSTRAINT valid_conversation_tags
CHECK (tag IN (
  'T1 - NOVO LEAD',
  'T2 - QUALIFICANDO', 
  'T3 - QUALIFICADO',
  'T4 - FOLLOW-UP',
  'T5 - DESQUALIFICADO',
  'whatsapp'
));

-- 3. Prevent direct role updates to membros_workspace - force use of RPC function
-- First, drop the existing update policy
DROP POLICY IF EXISTS "update_workspace_members" ON membros_workspace;

-- Create a new restrictive UPDATE policy that prevents all direct updates
-- This forces all role changes to go through the update_workspace_member_role RPC function
-- which has proper validation and authorization checks
CREATE POLICY "Prevent direct updates to workspace members"
  ON membros_workspace
  FOR UPDATE
  USING (false);

-- Note: The RPC function update_workspace_member_role will still work because
-- it uses SECURITY DEFINER which bypasses RLS policies