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
        console.log('🔍 [WorkspaceSelector] Iniciando busca de workspaces...');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('❌ [WorkspaceSelector] Usuário não autenticado');
          setIsLoading(false);
          return;
        }

        console.log('✅ [WorkspaceSelector] Usuário autenticado:', user.email);

        // Buscar workspaces onde o usuário tem acesso via membros_workspace
        // Fazemos JOIN com workspaces para pegar os dados completos
        const { data: memberWorkspaces, error } = await supabase
          .from('membros_workspace')
          .select(`
            workspace_id,
            workspaces!inner (
              id,
              name,
              database
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ [WorkspaceSelector] Erro ao buscar workspaces:', error);
          setIsLoading(false);
          return;
        }

        console.log('📊 [WorkspaceSelector] Membros workspace encontrados:', memberWorkspaces);

        // Transformar dados para o formato esperado
        const workspacesList: Workspace[] = memberWorkspaces
          ?.map((member: any) => ({
            id: member.workspaces.id,
            name: member.workspaces.name,
            database: member.workspaces.database
          })) || [];

        console.log('✅ [WorkspaceSelector] Workspaces carregados:', workspacesList.length, workspacesList);
        setWorkspaces(workspacesList);
      } catch (error) {
        console.error('❌ [WorkspaceSelector] Erro fatal:', error);
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
