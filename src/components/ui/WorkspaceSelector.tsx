import { useEffect, useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  current: string | null;
  onChange: (workspaceId: string) => Promise<void>;
}

export function WorkspaceSelector({ current, onChange }: WorkspaceSelectorProps) {
  const { supabase } = useDatabase();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        // RLS will automatically filter to user's workspaces
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name')
          .order('name');
        
        if (data && !error) {
          setWorkspaces(data);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkspaces();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Loading workspaces...</span>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return null;
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
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id} className="bg-background text-foreground">
            {ws.name}
          </option>
        ))}
      </select>
    </div>
  );
}
