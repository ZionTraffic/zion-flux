-- ============================================
-- FIX: Infinite recursion in workspace_members RLS policies
-- ============================================

-- Step 1: Create security definer function to get user workspaces
CREATE OR REPLACE FUNCTION public.get_user_workspaces(_user_id uuid)
RETURNS TABLE(workspace_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = _user_id;
$$;

-- ============================================
-- Step 2: Fix workspace_members policies
-- ============================================

DROP POLICY IF EXISTS "Usuário pode ver apenas membros da sua workspace" ON workspace_members;
DROP POLICY IF EXISTS "Owner/Admin podem adicionar membros" ON workspace_members;
DROP POLICY IF EXISTS "select_workspace_members" ON workspace_members;
DROP POLICY IF EXISTS "insert_workspace_members" ON workspace_members;

CREATE POLICY "select_workspace_members" ON workspace_members
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_workspace_members" ON workspace_members
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid() 
    AND wm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- Step 3: Fix leads table policies
-- ============================================

DROP POLICY IF EXISTS "leitura por membro da workspace" ON leads;
DROP POLICY IF EXISTS "inserir na própria workspace" ON leads;
DROP POLICY IF EXISTS "editar da própria workspace" ON leads;
DROP POLICY IF EXISTS "ws select leads" ON leads;
DROP POLICY IF EXISTS "ws update leads" ON leads;
DROP POLICY IF EXISTS "select_leads" ON leads;
DROP POLICY IF EXISTS "insert_leads" ON leads;
DROP POLICY IF EXISTS "update_leads" ON leads;

CREATE POLICY "select_leads" ON leads
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_leads" ON leads
FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "update_leads" ON leads
FOR UPDATE USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

-- ============================================
-- Step 4: Fix workspaces table policies
-- ============================================

DROP POLICY IF EXISTS "Usuário pode ver apenas sua workspace" ON workspaces;
DROP POLICY IF EXISTS "Owner/Admin podem criar workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owner/Admin podem atualizar a workspace" ON workspaces;
DROP POLICY IF EXISTS "select_workspaces" ON workspaces;
DROP POLICY IF EXISTS "insert_workspaces" ON workspaces;
DROP POLICY IF EXISTS "update_workspaces" ON workspaces;

CREATE POLICY "select_workspaces" ON workspaces
FOR SELECT USING (
  id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_workspaces" ON workspaces
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "update_workspaces" ON workspaces
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM workspace_members wm
    WHERE wm.workspace_id = workspaces.id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- Step 5: Fix ad_accounts table policies
-- ============================================

DROP POLICY IF EXISTS "ws select ad_accounts" ON ad_accounts;
DROP POLICY IF EXISTS "ws write ad_accounts" ON ad_accounts;
DROP POLICY IF EXISTS "select_ad_accounts" ON ad_accounts;
DROP POLICY IF EXISTS "insert_ad_accounts" ON ad_accounts;

CREATE POLICY "select_ad_accounts" ON ad_accounts
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_ad_accounts" ON ad_accounts
FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

-- ============================================
-- Step 6: Fix conversation_summaries table policies
-- ============================================

DROP POLICY IF EXISTS "ver da própria workspace" ON conversation_summaries;
DROP POLICY IF EXISTS "inserir na própria workspace" ON conversation_summaries;
DROP POLICY IF EXISTS "select_conversation_summaries" ON conversation_summaries;
DROP POLICY IF EXISTS "insert_conversation_summaries" ON conversation_summaries;

CREATE POLICY "select_conversation_summaries" ON conversation_summaries
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_conversation_summaries" ON conversation_summaries
FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

-- ============================================
-- Step 7: Fix lead_status_history table policies
-- ============================================

DROP POLICY IF EXISTS "leitura por membro da workspace" ON lead_status_history;
DROP POLICY IF EXISTS "escrever histórico da própria workspace" ON lead_status_history;
DROP POLICY IF EXISTS "select_lead_status_history" ON lead_status_history;
DROP POLICY IF EXISTS "insert_lead_status_history" ON lead_status_history;

CREATE POLICY "select_lead_status_history" ON lead_status_history
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_lead_status_history" ON lead_status_history
FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

-- ============================================
-- Step 8: Fix spend_by_day table policies
-- ============================================

DROP POLICY IF EXISTS "ws select spend" ON spend_by_day;
DROP POLICY IF EXISTS "ws write spend" ON spend_by_day;
DROP POLICY IF EXISTS "select_spend_by_day" ON spend_by_day;
DROP POLICY IF EXISTS "insert_spend_by_day" ON spend_by_day;

CREATE POLICY "select_spend_by_day" ON spend_by_day
FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);

CREATE POLICY "insert_spend_by_day" ON spend_by_day
FOR INSERT WITH CHECK (
  workspace_id IN (SELECT get_user_workspaces(auth.uid()))
);