import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionKey } from '@/types/permissions';

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

  // Mostrar loading enquanto carrega permissões
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-muted-foreground text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
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
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
