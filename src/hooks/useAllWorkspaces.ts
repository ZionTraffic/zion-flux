import { useEffect, useMemo, useState } from 'react';
import { createSupabaseClient } from '@/integrations/supabase/client';

export interface CrossWorkspace {
  id: string;
  name: string;
  slug: string;
  database: 'asf' | 'sieg';
  created_at: string;
  logo_url?: string;
  primary_color?: string;
}

interface UseAllWorkspacesResult {
  workspaces: CrossWorkspace[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ASF_URL = import.meta.env.VITE_SUPABASE_ASF_URL as string;
const ASF_ANON = import.meta.env.VITE_SUPABASE_ASF_ANON_KEY as string;
const SIEG_URL = import.meta.env.VITE_SUPABASE_SIEG_URL as string;
const SIEG_ANON = import.meta.env.VITE_SUPABASE_SIEG_ANON_KEY as string;

export function useAllWorkspaces(): UseAllWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<CrossWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const asf = useMemo(() => createSupabaseClient(ASF_URL, ASF_ANON, 'sb-asf'), []);
  const sieg = useMemo(() => createSupabaseClient(SIEG_URL, SIEG_ANON, 'sb-sieg'), []);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [{ data: userData }] = await Promise.all([
        asf.auth.getUser(),
      ]);
      const userId = userData.user?.id;

      // Busca nos dois bancos com filtro por membro quando possível
      const [asfWs, siegWs] = await Promise.all([
        asf.from('workspaces').select('*') as any,
        sieg.from('workspaces').select('*') as any,
      ]);

      if (asfWs.error) throw asfWs.error;
      if (siegWs.error) throw siegWs.error;

      // Se houver user, valida acesso por membros
      let allowedAsf = asfWs.data || [];
      let allowedSieg = siegWs.data || [];

      if (userId) {
        const [asfMembers, siegMembers] = await Promise.all([
          asf.from('membros_workspace').select('workspace_id').eq('user_id', userId),
          sieg.from('membros_workspace').select('workspace_id').eq('user_id', userId),
        ]);
        const asfIds = new Set((asfMembers.data || []).map((m: any) => m.workspace_id));
        const siegIds = new Set((siegMembers.data || []).map((m: any) => m.workspace_id));
        allowedAsf = allowedAsf.filter((w: any) => asfIds.has(w.id));
        allowedSieg = allowedSieg.filter((w: any) => siegIds.has(w.id));
      }

      const merged: CrossWorkspace[] = [
        ...allowedAsf.map((w: any) => ({ ...w, database: 'asf' as const })),
        ...allowedSieg.map((w: any) => ({ ...w, database: 'sieg' as const })),
      ].sort((a, b) => (a.created_at > b.created_at ? -1 : 1));

      setWorkspaces(merged);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { workspaces, isLoading, error, refetch: fetchAll };
}
