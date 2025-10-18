import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { logger } from '@/utils/logger';

/**
 * SECURITY NOTE: Client-side role checks are for UX purposes only.
 * All security enforcement happens server-side through RLS policies.
 * These checks determine UI visibility but cannot be relied upon for authorization.
 */
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
  const { supabase } = useDatabase();

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
          logger.error('Error fetching user role', error);
          setRole(null);
        } else {
          setRole(data?.role as UserRole || null);
        }
      } catch (error) {
        logger.error('Error in fetchUserRole', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [currentWorkspaceId, supabase]);

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
