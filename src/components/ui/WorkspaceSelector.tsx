import { useEffect, useMemo } from 'react';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useDatabase } from '@/contexts/DatabaseContext';

interface WorkspaceSelectorProps {
  current: string | null;
  onChange: (workspaceId: string) => Promise<void>;
}

export function WorkspaceSelector({ current, onChange }: WorkspaceSelectorProps) {
  const { workspaces, isLoading, error } = useWorkspaces();
  const { hasCustomPermissions } = usePermissions();
  const { isOwner, isAdmin } = useUserRole();
  const { tenants, currentTenantId, setTenant } = useDatabase();

  const tenantGroups = useMemo(() => {
    if (tenants.length === 0) {
      return [{ tenant: { id: null, name: 'Workspaces' }, workspaces }];
    }

    return tenants.map(tenant => ({
      tenant,
      workspaces: workspaces.filter(ws => ws.tenantId === tenant.id)
    }));
  }, [tenants, workspaces]);

  const fallbackTenantId = useMemo(() => {
    if (currentTenantId) return currentTenantId;
    const groupWithWorkspaces = tenantGroups.find(group => group.workspaces.length > 0);
    return groupWithWorkspaces?.tenant.id || null;
  }, [currentTenantId, tenantGroups]);

  // O hook já faz o fetch inicial. Evite refetch em toda renderização para não travar em loading.

  useEffect(() => {
    // se não houver seleção atual, define a primeira disponível
    if (!current && !isLoading && !error && workspaces.length > 0) {
      onChange(workspaces[0].id);
    }
  }, [current, isLoading, error, workspaces, onChange]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">Erro ao carregar workspaces</div>
    );
  }
  if (workspaces.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Sem workspaces</span>
      </div>
    );
  }

  // Esconder seletor para usuários com permissões customizadas (não owners/admins)
  const shouldHideSelector = hasCustomPermissions() && !isOwner && !isAdmin;
  
  if (shouldHideSelector) {
    // Mostrar apenas o nome do workspace atual, sem possibilidade de trocar
    const currentWorkspace = workspaces.find(w => w.id === current);
    return (
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground font-medium">
          Workspace:
        </label>
        <span className="text-sm font-medium text-foreground">
          {currentWorkspace?.name || 'Carregando...'}
        </span>
      </div>
    );
  }

  const renderTenantSwitcher = tenants.length > 1;

  return (
    <div className="flex items-center gap-4">
      {renderTenantSwitcher ? (
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground font-medium">Empresa:</label>
          <select
            className="glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-3 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
            value={fallbackTenantId || ''}
            onChange={(e) => setTenant(e.target.value)}
          >
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id} className="bg-background text-foreground">
                {tenant.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground font-medium">
          Workspace:
        </label>
        <select
          className="glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
          value={current || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          {tenantGroups.map(({ tenant, workspaces: tenantWorkspaces }) => (
            tenantWorkspaces.length > 0 ? (
              <optgroup key={tenant.id} label={tenant.name} className="bg-background text-foreground">
                {tenantWorkspaces.map(ws => (
                  <option key={ws.id} value={ws.id} className="bg-background text-foreground">
                    {ws.name}
                  </option>
                ))}
              </optgroup>
            ) : null
          ))}
        </select>
      </div>
    </div>
  );
}

