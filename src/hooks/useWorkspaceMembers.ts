import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface WorkspaceMember {
  user_id: string;
  role: string;
  user_email: string;
  user_name: string;
}

export function useWorkspaceMembers() {
  const { supabase } = useDatabase();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();

  const fetchMembers = async () => {
    if (tenantLoading) return;
    if (!tenant?.id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('tenant_users')
        .select(`
          user_id,
          role,
          user:auth.users(email, raw_user_meta_data)
        `)
        .eq('tenant_id', tenant.id)
        .eq('active', true);

      if (error) throw error;

      const mappedMembers = (data || []).map((member: any) => ({
        user_id: member.user_id,
        role: member.role,
        user_email: member.user?.email ?? 'sem-email@zion.app',
        user_name: member.user?.raw_user_meta_data?.full_name ?? member.user?.email ?? 'Usuário'
      }));

      setMembers(mappedMembers);
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
  }, [tenant?.id, tenantLoading]);

  const updateMemberRole = async (userId: string, newRole: string) => {
    if (!tenant?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('tenant_users')
        .update({ role: newRole })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Role atualizado',
        description: 'O role do usuário foi atualizado com sucesso.',
      });

      await fetchMembers();
    } catch (error) {
      logger.error('Error updating member role', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível atualizar o role do usuário.';
      toast({
        title: 'Erro ao atualizar role',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const addMember = async (email: string, role: string, tenantId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('add-workspace-member', {
        body: {
          email: email.toLowerCase().trim(),
          tenant_id: tenantId,
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
    if (!tenant?.id) return;

    try {
      const { error } = await (supabase as any)
        .from('tenant_users')
        .update({ active: false })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Membro removido',
        description: 'O membro foi removido do workspace com sucesso.',
      });

      await fetchMembers();
    } catch (error) {
      logger.error('Error removing member', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível remover o membro.';
      toast({
        title: 'Erro ao remover membro',
        description: errorMessage,
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
