import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { NoWorkspaceAccess } from '@/components/workspace/NoWorkspaceAccess';

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => Promise<void>;
  isLoading: boolean;
  userRole: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { supabase, setDatabase } = useDatabase();
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    async function initializeWorkspace() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserEmail(user.email);

        // ACESSO IRRESTRITO PARA GEORGE - MASTER DO SISTEMA
        if (user.email === 'george@ziontraffic.com.br') {
          console.log('🔓 MASTER ACCESS: george@ziontraffic.com.br - Carregando workspace ASF Finance');
          setCurrentWorkspaceIdState('01d0cff7-2de1-4731-af0d-ee62f5ba974b');
          setUserRole('owner');
          // Não precisa setar database - DatabaseContext já gerencia isso
          localStorage.setItem('currentWorkspaceId', '01d0cff7-2de1-4731-af0d-ee62f5ba974b');
          setIsLoading(false);
          return;
        }

        // Buscar diretamente a primeira workspace do usuário
        console.log(`🔍 Buscando workspaces para usuário:`, user.email);
        
        const { data: firstMembership, error: membershipError } = await supabase
          .from('membros_workspace')
          .select('workspace_id, role')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (membershipError) {
          console.error('❌ Erro ao buscar membership:', membershipError);
          // Tentar uma consulta mais simples como fallback
          try {
            const { data: fallbackData } = await supabase
              .rpc('get_workspace_members_with_details', { p_workspace_id: 'b939a331-44d9-4122-ab23-dcd60413bd46' });
            
            if (fallbackData && fallbackData.length > 0) {
              const userMember = fallbackData.find((m: any) => m.user_id === user.id);
              if (userMember) {
                console.log('✅ Fallback: Usuário encontrado no workspace Sieg');
                setCurrentWorkspaceIdState('b939a331-44d9-4122-ab23-dcd60413bd46');
                setUserRole(userMember.role || 'viewer');
                setDatabase('sieg');
                localStorage.setItem('currentWorkspaceId', 'b939a331-44d9-4122-ab23-dcd60413bd46');
                return;
              }
            }
          } catch (fallbackError) {
            console.error('❌ Fallback também falhou:', fallbackError);
          }
          return;
        }
        
        let targetWorkspaceId = null;
        
        if (firstMembership) {
          targetWorkspaceId = firstMembership.workspace_id;
          setUserRole(firstMembership.role || null);
          console.log('✅ Workspace encontrado:', targetWorkspaceId);
        } else {
          console.log('❌ Nenhum workspace encontrado para o usuário');
        }

        // 3. Se encontrou workspace, validar acesso e carregar
        if (targetWorkspaceId) {
          const { data: memberData } = await supabase
            .from('membros_workspace')
            .select('role, workspaces(name, database)')
            .eq('user_id', user.id)
            .eq('workspace_id', targetWorkspaceId)
            .maybeSingle();
          
          if (memberData) {
            setCurrentWorkspaceIdState(targetWorkspaceId);
            setUserRole(memberData.role || null);
            localStorage.setItem('currentWorkspaceId', targetWorkspaceId);
            const dbKey = (memberData as any).workspaces?.database || 'asf';
            
            // Configurar banco de dados correto
            setDatabase(dbKey);
            
            console.log('✅ Workspace carregado com sucesso:', {
              workspaceId: targetWorkspaceId,
              workspaceName: (memberData as any).workspaces?.name,
              database: dbKey,
              role: memberData.role
            });
          } else {
            console.log('❌ Usuário perdeu acesso ao workspace padrão');
          }
        } else {
          console.log('❌ Usuário não tem workspace atribuído após todas as tentativas');
        }
      } catch (error) {
        console.error('Failed to initialize workspace:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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
  }, [supabase]);

  const setCurrentWorkspaceId = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Autenticação necessária',
          description: 'Por favor faça login para trocar de workspace',
          variant: 'destructive',
        });
        return;
      }

      // Validar acesso à workspace
      const { data: memberData } = await supabase
        .from('membros_workspace')
        .select('role, workspaces(name, database)')
        .eq('user_id', user.id)
        .eq('workspace_id', id)
        .maybeSingle();
      
      if (!memberData) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem acesso a esta workspace',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar workspace atual
      setCurrentWorkspaceIdState(id);
      setUserRole(memberData.role || null);
      localStorage.setItem('currentWorkspaceId', id);

      // Ajustar banco ativo conforme workspace
      const dbKey = (memberData as any).workspaces?.database || 'asf';
      setDatabase(dbKey);

      // Salvar como workspace padrão (opcional - não crítico se falhar)
      try {
        await (supabase as any)
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
        description: `Agora visualizando: ${(memberData.workspaces as any)?.name || 'workspace'}`,
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

