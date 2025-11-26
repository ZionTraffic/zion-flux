import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { NoWorkspaceAccess } from '@/components/workspace/NoWorkspaceAccess';
import { supabase as centralSupabase } from '@/integrations/supabase/client';

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => Promise<void>;
  isLoading: boolean;
  userRole: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { supabase, setDatabase, setTenant } = useDatabase();
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const { toast } = useToast();

  const applyWorkspaceSelection = (options: {
    workspaceId: string;
    role: string | null;
    workspaceInfo?: { database?: string | null; tenant_id?: string | null; name?: string | null };
  }) => {
    const { workspaceId, role, workspaceInfo } = options;

    setCurrentWorkspaceIdState(workspaceId);
    setUserRole(role);
    localStorage.setItem('currentWorkspaceId', workspaceId);

    const dbKey = workspaceInfo?.database || 'asf';
    setDatabase(dbKey);

    if (workspaceInfo?.tenant_id) {
      setTenant(workspaceInfo.tenant_id);
    }
  };

  const fetchWorkspaceInfo = async (workspaceId: string) => {
    // Retornar dados básicos sem acessar tabela workspaces
    // O database será determinado pelo tenant context
    return { database: 'asf' }; // Default, será sobrescrito pelo tenant
  };

  useEffect(() => {
    async function initializeWorkspace() {
      try {
        const { data: { user } } = await centralSupabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email);

        // VERIFICAR SE HÁ WORKSPACE SALVO NO LOCALSTORAGE
        const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        console.log(`🔍 Workspace salvo no localStorage:`, savedWorkspaceId);

        // ACESSO IRRESTRITO PARA GEORGE - MASTER DO SISTEMA
        if (user.email === 'george@ziontraffic.com.br') {
          const georgeWorkspaceId = savedWorkspaceId || '01d0cff7-2de1-4731-af0d-ee62f5ba974b';
          console.log('🔓 MASTER ACCESS: george@ziontraffic.com.br - Carregando workspace:', georgeWorkspaceId);

          const workspaceInfo = await fetchWorkspaceInfo(georgeWorkspaceId);
          applyWorkspaceSelection({
            workspaceId: georgeWorkspaceId,
            role: 'owner',
            workspaceInfo: workspaceInfo || { database: 'asf' }
          });
          setIsLoading(false);
          return;
        }

        // PRIORIDADE 1: Tentar carregar workspace salvo no localStorage
        if (savedWorkspaceId) {
          console.log(`🔄 Tentando restaurar workspace salvo:`, savedWorkspaceId);
          
          // Verificar se usuário tem acesso ao workspace salvo usando RPC
          const { data: isMember, error: savedError } = await centralSupabase
            .rpc('is_workspace_member', { 
              _user_id: user.id, 
              _workspace_id: savedWorkspaceId 
            });
          
          if (!savedError && isMember) {
            console.log('✅ Workspace salvo restaurado com sucesso:', savedWorkspaceId);
            // Buscar informações do workspace via RPC get_user_workspaces
            const { data: workspaceIds } = await centralSupabase
              .rpc('get_user_workspaces', { _user_id: user.id });
            
            const hasAccess = workspaceIds?.some((w: any) => w.workspace_id === savedWorkspaceId);
            
            if (hasAccess) {
              applyWorkspaceSelection({
                workspaceId: savedWorkspaceId,
                role: 'member', // Role padrão, pode ser ajustado se necessário
                workspaceInfo: undefined // Será carregado depois se necessário
              });
              setIsLoading(false);
              return;
            }
          }
          
          console.log('⚠️ Workspace salvo não encontrado ou sem acesso, buscando alternativa');
          localStorage.removeItem('currentWorkspaceId');
        }

        // PRIORIDADE 2: Buscar primeira workspace disponível usando RPC
        console.log(`🔍 Buscando workspaces para usuário:`, user.email);
        
        const { data: workspaceIds, error: membershipError } = await centralSupabase
          .rpc('get_user_workspaces', { _user_id: user.id });
        
        if (membershipError) {
          console.error('❌ Erro ao buscar membership:', membershipError);
          // Tentar uma consulta mais simples como fallback
          try {
            const { data: fallbackData } = await centralSupabase
              .rpc('get_workspace_members_with_details', { p_workspace_id: 'b939a331-44d9-4122-ab23-dcd60413bd46' });
            
            if (fallbackData && fallbackData.length > 0) {
              const userMember = fallbackData.find((m: any) => m.user_id === user.id);
              if (userMember) {
                console.log('✅ Fallback: Usuário encontrado no workspace Sieg');
                setCurrentWorkspaceIdState('b939a331-44d9-4122-ab23-dcd60413bd46');
                setUserRole(userMember.role || 'viewer');
                setDatabase('sieg');
                localStorage.setItem('currentWorkspaceId', 'b939a331-44d9-4122-ab23-dcd60413bd46');
                setIsLoading(false);
                return;
              }
            }
          } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError);
          }
          setIsLoading(false);
          return;
        }
        
        let targetWorkspaceId = null;
        
        if (workspaceIds && workspaceIds.length > 0) {
          targetWorkspaceId = workspaceIds[0].workspace_id;
          setUserRole('member'); // Role padrão
          console.log('✅ Workspace encontrado:', targetWorkspaceId);
        } else {
          console.log('❌ Nenhum workspace encontrado para o usuário');
        }

        // 3. Se encontrou workspace, validar acesso e carregar
        if (targetWorkspaceId) {
          // Já validamos o acesso via RPC, apenas aplicar seleção
          applyWorkspaceSelection({
            workspaceId: targetWorkspaceId,
            role: 'member',
            workspaceInfo: undefined // Será carregado depois se necessário
          });

          console.log('✅ Workspace carregado com sucesso:', {
            workspaceId: targetWorkspaceId,
            role: 'member'
          });
        } else {
          console.log('❌ Usuário não tem workspace atribuído após todas as tentativas');
        }
      } catch (error) {
        console.error('Failed to initialize workspace:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    const { data: { subscription } } = centralSupabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentWorkspaceIdState(null);
        setUserRole(null);
        localStorage.removeItem('currentWorkspaceId');
      } else if (event === 'SIGNED_IN') {
        initializeWorkspace();
      }
    });
    
    initializeWorkspace();
    
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrentWorkspaceId = async (id: string) => {
    try {
      const { data: { user } } = await centralSupabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Autenticação necessária',
          description: 'Por favor faça login para trocar de workspace',
          variant: 'destructive',
        });
        return;
      }

      // Validar acesso à workspace usando RPC
      const { data: isMember, error: memberError } = await centralSupabase
        .rpc('is_workspace_member', { 
          _user_id: user.id, 
          _workspace_id: id 
        });
      
      if (memberError || !isMember) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem acesso a esta workspace',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar workspace atual
      applyWorkspaceSelection({
        workspaceId: id,
        role: 'member', // Role padrão
        workspaceInfo: undefined // Será carregado pelo tenant context
      });

      // Salvar como workspace padrão (opcional - não crítico se falhar)
      try {
        await (centralSupabase as any)
          .from('user_settings')
          .upsert({
            user_id: user.id,
            default_workspace_id: id,
          }, {
            onConflict: 'user_id'
          });
      } catch (settingsError) {
        console.log('Info: Não foi possível salvar configuração padrão:', settingsError);
        // Não é crítico, continuar normalmente
      }
      
      toast({
        title: 'Workspace alterado',
        description: `Workspace alterado com sucesso`,
      });
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao trocar workspace',
        variant: 'destructive',
      });
    }
  };

  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceId, setCurrentWorkspaceId, isLoading, userRole }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando workspaces...</p>
          </div>
        </div>
      ) : !currentWorkspaceId ? (
        <NoWorkspaceAccess userEmail={userEmail} />
      ) : (
        children
      )}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

