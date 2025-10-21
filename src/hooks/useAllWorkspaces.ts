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

      // Busca nos dois bancos de forma resiliente
      let asfWsData: any[] = [];
      let siegWsData: any[] = [];
      let asfErr: any = null;
      let siegErr: any = null;

      try {
        const asfWs = await (asf.from('workspaces').select('*') as any);
        if (asfWs.error) throw asfWs.error;
        asfWsData = asfWs.data || [];
      } catch (e: any) {
        asfErr = e;
      }

      try {
        const siegWs = await (sieg.from('workspaces').select('*') as any);
        if (siegWs.error) throw siegWs.error;
        siegWsData = siegWs.data || [];
      } catch (e: any) {
        siegErr = e;
      }

      // Se houver user, valida acesso por membros
      let allowedAsf = asfWsData;
      let allowedSieg = siegWsData;

      if (userId) {
        const [asfMembersRes, siegMembersRes] = await Promise.allSettled([
          asf.from('membros_workspace').select('workspace_id').eq('user_id', userId),
          sieg.from('membros_workspace').select('workspace_id').eq('user_id', userId),
        ]);
        const asfMembers =
          asfMembersRes.status === 'fulfilled' && !('error' in asfMembersRes.value)
            ? (asfMembersRes.value as any)
            : { data: [] };
        const siegMembers =
          siegMembersRes.status === 'fulfilled' && !('error' in siegMembersRes.value)
            ? (siegMembersRes.value as any)
            : { data: [] };
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
      if (merged.length === 0 && asfErr && siegErr) {
        // Só marca erro se ambos os projetos falharam
        setError(asfErr?.message || siegErr?.message || 'Erro ao carregar workspaces');
      }
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
