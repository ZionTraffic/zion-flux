import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUserRole } from '@/hooks/useUserRole';
import { PERMISSIONS, PermissionKey, DEFAULT_PERMISSIONS_BY_ROLE } from '@/types/permissions';
import { logger } from '@/utils/logger';

export interface UserPermission {
  permission_key: string;
  granted: boolean;
}

export function usePermissions() {
  const { supabase } = useDatabase();
  const { currentWorkspaceId } = useWorkspace();
  const { role } = useUserRole();
  const [permissions, setPermissions] = useState<Set<PermissionKey>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!currentWorkspaceId) {
      setPermissions(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar permissões específicas do usuário
      const { data: userPermissions, error } = await supabase
        .from('user_permissions')
        .select('permission_key, granted')
        .eq('workspace_id', currentWorkspaceId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        logger.error('Error fetching user permissions', error);
        // Fallback para permissões padrão do role
        if (role && DEFAULT_PERMISSIONS_BY_ROLE[role]) {
          setPermissions(new Set(DEFAULT_PERMISSIONS_BY_ROLE[role]));
        }
        return;
      }

      // Se não há permissões específicas, usar padrões do role
      if (!userPermissions || userPermissions.length === 0) {
        if (role && DEFAULT_PERMISSIONS_BY_ROLE[role]) {
          setPermissions(new Set(DEFAULT_PERMISSIONS_BY_ROLE[role]));
        }
        return;
      }

      // Aplicar permissões específicas
      const grantedPermissions = userPermissions
        .filter(p => p.granted)
        .map(p => p.permission_key as PermissionKey);
      
      setPermissions(new Set(grantedPermissions));
    } catch (error) {
      logger.error('Error in fetchPermissions', error);
      // Fallback para permissões padrão do role
      if (role && DEFAULT_PERMISSIONS_BY_ROLE[role]) {
        setPermissions(new Set(DEFAULT_PERMISSIONS_BY_ROLE[role]));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [currentWorkspaceId, role]);

  const hasPermission = (permission: PermissionKey): boolean => {
    return permissions.has(permission);
  };

  const hasAnyPermission = (permissionList: PermissionKey[]): boolean => {
    return permissionList.some(permission => permissions.has(permission));
  };

  const hasAllPermissions = (permissionList: PermissionKey[]): boolean => {
    return permissionList.every(permission => permissions.has(permission));
  };

  // Funções de conveniência para verificações comuns
  const canViewDashboard = () => hasPermission(PERMISSIONS.DASHBOARD_VIEW);
  const canViewTraffic = () => hasPermission(PERMISSIONS.TRAFFIC_VIEW);
  const canViewQualification = () => hasPermission(PERMISSIONS.QUALIFICATION_VIEW);
  const canManageQualification = () => hasPermission(PERMISSIONS.QUALIFICATION_MANAGE);
  const canViewAnalysis = () => hasPermission(PERMISSIONS.ANALYSIS_VIEW);
  const canViewSettings = () => hasPermission(PERMISSIONS.SETTINGS_VIEW);
  const canManageUsers = () => hasPermission(PERMISSIONS.SETTINGS_USERS);
  const canExportReports = () => hasAnyPermission([
    PERMISSIONS.TRAFFIC_EXPORT,
    PERMISSIONS.ANALYSIS_EXPORT,
    PERMISSIONS.REPORTS_EXPORT,
  ]);

  return {
    permissions: Array.from(permissions),
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchPermissions,
    
    // Funções de conveniência
    canViewDashboard,
    canViewTraffic,
    canViewQualification,
    canManageQualification,
    canViewAnalysis,
    canViewSettings,
    canManageUsers,
    canExportReports,
  };
}
