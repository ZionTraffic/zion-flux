import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface WorkspaceMember {
  user_id: string;
  role: string;
  user_email: string;
  user_name: string;
}

export function useWorkspaceMembers() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspaceId } = useWorkspace();

  const fetchMembers = async () => {
    if (!currentWorkspaceId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('get_workspace_members_with_details', {
          p_workspace_id: currentWorkspaceId
        });

      if (error) throw error;

      setMembers(data || []);
    } catch (error) {
      logger.error('Error fetching workspace members', error);
      toast({
        title: 'Erro ao carregar membros',
        description: 'Não foi possível carregar a lista de membros.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [currentWorkspaceId]);

  const updateMemberRole = async (userId: string, newRole: string) => {
    if (!currentWorkspaceId) return;

    try {
      const { error } = await supabase
        .from('membros_workspace')
        .update({ role: newRole })
        .eq('workspace_id', currentWorkspaceId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role atualizado',
        description: 'O role do usuário foi atualizado com sucesso.',
      });

      await fetchMembers();
    } catch (error) {
      logger.error('Error updating member role', error);
      toast({
        title: 'Erro ao atualizar role',
        description: 'Não foi possível atualizar o role do usuário.',
        variant: 'destructive',
      });
    }
  };

  const addMember = async (email: string, role: string) => {
    if (!currentWorkspaceId) return;

    try {
      const { data, error } = await supabase.functions.invoke('add-workspace-member', {
        body: {
          email,
          workspace_id: currentWorkspaceId,
          role
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Membro adicionado',
        description: 'O membro foi adicionado ao workspace com sucesso.',
      });

      await fetchMembers();
    } catch (error) {
      logger.error('Error adding member', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível adicionar o membro.';
      toast({
        title: 'Erro ao adicionar membro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeMember = async (userId: string) => {
    if (!currentWorkspaceId) return;

    try {
      const { error } = await supabase
        .from('membros_workspace')
        .delete()
        .eq('workspace_id', currentWorkspaceId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Membro removido',
        description: 'O membro foi removido do workspace com sucesso.',
      });

      await fetchMembers();
    } catch (error) {
      logger.error('Error removing member', error);
      toast({
        title: 'Erro ao remover membro',
        description: 'Não foi possível remover o membro.',
        variant: 'destructive',
      });
    }
  };

  return {
    members,
    loading,
    refetch: fetchMembers,
    updateMemberRole,
    addMember,
    removeMember,
  };
}
