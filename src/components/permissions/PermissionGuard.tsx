import { ReactNode, useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionKey } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: PermissionKey;
  permissions?: PermissionKey[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirect?: string;
}

export function PermissionGuard({ 
  children, 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const [isMasterUser, setIsMasterUser] = useState(false);
  const [checkingMaster, setCheckingMaster] = useState(true);

  // Verificar se é master user
  useEffect(() => {
    const checkMasterUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const masterEmails = ['george@ziontraffic.com.br', 'leonardobasiliozion@gmail.com', 'eliasded51@gmail.com'];
      const isMaster = masterEmails.includes(user?.email || '');
      setIsMasterUser(isMaster);
      setCheckingMaster(false);
      if (isMaster) {
        console.log('🔓 MASTER USER - Bypassando PermissionGuard');
      }
    };
    checkMasterUser();
  }, []);

  // Mostrar loading enquanto verifica master user ou carrega permissões
  if (checkingMaster || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-muted-foreground text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Master user sempre tem acesso
  if (isMasterUser) {
    return <>{children}</>;
  }

  // Verificar permissão única
  if (permission && !hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }

  // Verificar múltiplas permissões
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

// Componente de fallback padrão para acesso negado
export function AccessDenied({ 
  title = "Acesso Negado", 
  message = "Você não tem permissão para acessar esta funcionalidade." 
}: { 
  title?: string; 
  message?: string; 
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md space-y-4">
        <svg className="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}
