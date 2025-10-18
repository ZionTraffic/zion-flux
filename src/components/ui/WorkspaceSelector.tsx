import { useEffect, useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { createSupabaseClient } from '@/integrations/supabase/client';

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
  const { supabase } = useDatabase();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        // Buscar do banco ASF
        const asfClient = createSupabaseClient(
          'https://wrebkgazdlyjenbpexnc.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
        );
        
        // Buscar do banco SIEG
        const siegClient = createSupabaseClient(
          'https://vrbgptrmmvsaoozrplng.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI'
        );

        const [asfResult, siegResult] = await Promise.all([
          asfClient.from('workspaces').select('id, name, database').order('name'),
          siegClient.from('workspaces').select('id, name, database').order('name')
        ]);

        const allWorkspaces: Workspace[] = [];
        
        if (asfResult.data) {
          allWorkspaces.push(...asfResult.data.map(w => ({ ...w, database: 'asf' as const })));
        }
        
        if (siegResult.data) {
          allWorkspaces.push(...siegResult.data.map(w => ({ ...w, database: 'sieg' as const })));
        }

        setWorkspaces(allWorkspaces);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWorkspaces();
  }, []);

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
