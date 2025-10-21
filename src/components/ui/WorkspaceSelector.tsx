import { useEffect } from 'react';
import { useAllWorkspaces } from '@/hooks/useAllWorkspaces';

interface Workspace {
  id: string;
  name: string;
  database: 'asf' | 'sieg';
}

interface WorkspaceSelectorProps {
  current: string | null;
  onChange: (workspaceId: string) => Promise<void>;
}

export function WorkspaceSelector({ current, onChange }: WorkspaceSelectorProps) {
  const { workspaces, isLoading, error, refetch } = useAllWorkspaces();

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
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-muted-foreground font-medium">
        Workspace:
      </label>
      <select
        className="glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        {workspaces.map((ws: Workspace) => (
          <option key={ws.id} value={ws.id} className="bg-background text-foreground">
            {ws.name}
          </option>
        ))}
      </select>
    </div>
  );
}

