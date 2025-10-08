-- Add UPDATE policy for historico_conversas to allow members to update conversation tags
CREATE POLICY "Members can update conversations"
ON public.historico_conversas
FOR UPDATE
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM public.membros_workspace
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id
    FROM public.membros_workspace
    WHERE user_id = auth.uid()
  )
);