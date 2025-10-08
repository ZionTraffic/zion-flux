import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

interface UseUserRoleReturn {
  role: UserRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isViewer: boolean;
  canAccessSettings: boolean;
  canAccessAnalysis: boolean;
  loading: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentWorkspaceId } = useWorkspace();

  useEffect(() => {
    async function fetchUserRole() {
      if (!currentWorkspaceId) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('membros_workspace')
          .select('role')
          .eq('workspace_id', currentWorkspaceId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data?.role as UserRole || null);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [currentWorkspaceId]);

  const isOwner = role === 'owner';
  const isAdmin = role === 'admin';
  const isMember = role === 'member';
  const isViewer = role === 'viewer';
  const canAccessSettings = isOwner || isAdmin;
  const canAccessAnalysis = isOwner || isAdmin;

  return {
    role,
    isOwner,
    isAdmin,
    isMember,
    isViewer,
    canAccessSettings,
    canAccessAnalysis,
    loading,
  };
}
