import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  database: 'asf' | 'sieg';
  created_at: string;
  segment?: string;
  logo_url?: string;
  primary_color?: string;
  kpis?: {
    leads: number;
    conversions: number;
    aiEfficiency: number;
    activeConversations: number;
  };
}

export interface CreateWorkspaceData {
  name: string;
  slug: string;
  database: string;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      // Call the unified edge function
      const { data, error } = await supabase.functions.invoke('list-workspaces', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling list-workspaces function:', error);
        throw error;
      }

      console.log('Workspaces from edge function:', data);
      setWorkspaces(data.workspaces || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (data: CreateWorkspaceData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      // Chamar edge function para criar workspace
      const { data: workspace, error } = await supabase.functions.invoke(
        'create-workspace',
        {
          body: data
        }
      );

      if (error) throw error;

      toast.success(`Workspace criada com sucesso!`);
      await fetchWorkspaces();
      
      // Disparar evento para recarregar seletor
      window.dispatchEvent(new Event('workspace-created'));
      
      return workspace;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      toast.error('Erro ao criar workspace');
      throw err;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces,
    isLoading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
  };
}
