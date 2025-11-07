import { useState, useEffect, useCallback } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentTenant } from '@/contexts/TenantContext';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  database: string;
  created_at: string;
  segment?: string;
  logo_url?: string;
  primary_color?: string;
  tenantId?: string | null;
  tenantName?: string | null;
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
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, membership, isLoading: tenantLoading, refreshTenants } = useCurrentTenant();

  const fetchWorkspaces = useCallback(async () => {
    if (tenantLoading) return;
    if (!tenant) {
      setWorkspaces([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await centralSupabase.auth.getSession();
      if (!session) {
        console.log('❌ No session found');
        throw new Error('Sessão não encontrada');
      }

      const { data: tenantWorkspaces, error: tenantWsError } = await (centralSupabase.from as any)('tenant_workspaces')
        .select(`
          id,
          name,
          slug,
          created_at,
          segment,
          logo_url,
          primary_color,
          status,
          tenant_id,
          tenant:tenants_new(name),
          role,
          database_config:database_configs(database_key)
        `)
        .eq('tenant_id', tenant.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (tenantWsError) {
        console.error('Error fetching tenant workspaces:', tenantWsError);
        throw tenantWsError;
      }

      const workspacesData: Workspace[] = (tenantWorkspaces || []).map((workspace: any) => ({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        database: workspace.database_config?.database_key || tenant.database_key,
        created_at: workspace.created_at,
        segment: workspace.segment || undefined,
        logo_url: workspace.logo_url || undefined,
        primary_color: workspace.primary_color || undefined,
        tenantId: workspace.tenant_id,
        tenantName: workspace.tenant?.name ?? tenant.name,
      }));

      setWorkspaces(workspacesData);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar workspaces');
    } finally {
      setIsLoading(false);
    }
  }, [tenantLoading, tenant?.id, tenant?.database_key]);

  const createWorkspace = async (data: CreateWorkspaceData) => {
    try {
      const { data: { session } } = await centralSupabase.auth.getSession();
      if (!session) throw new Error('Sessão não encontrada');

      if (!tenant) throw new Error('Selecione uma empresa antes de criar workspaces');

      const { data: workspace, error } = await centralSupabase.functions.invoke('create-workspace', {
        body: {
          ...data,
          tenant_id: tenant.id,
        },
      });

      if (error) throw error;

      toast.success(`Workspace criada com sucesso!`);
      await Promise.all([fetchWorkspaces(), refreshTenants()]);
      
      return workspace;
    } catch (err: any) {
      console.error('Error creating workspace:', err);
      toast.error('Erro ao criar workspace');
      throw err;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return {
    workspaces,
    isLoading,
    error,
    refetch: fetchWorkspaces,
    createWorkspace,
  };
}
