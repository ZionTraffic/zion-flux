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
  const { supabase } = useDatabase();
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

        // 1. Tentar carregar workspace padrão de user_settings
        const { data: settings } = await supabase
          .from('user_settings')
          .select('default_workspace_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        let targetWorkspaceId = settings?.default_workspace_id;

        // 2. Se não existe, buscar primeira workspace do usuário
        if (!targetWorkspaceId) {
          const { data: firstMembership } = await supabase
            .from('membros_workspace')
            .select('workspace_id, role')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();
          
          if (firstMembership) {
            targetWorkspaceId = firstMembership.workspace_id;
            setUserRole(firstMembership.role || null);
          }
        }

        // 3. Se encontrou workspace, validar acesso e carregar
        if (targetWorkspaceId) {
          const { data: memberData } = await supabase
            .from('membros_workspace')
            .select('role')
            .eq('user_id', user.id)
            .eq('workspace_id', targetWorkspaceId)
            .maybeSingle();
          
          if (memberData) {
            setCurrentWorkspaceIdState(targetWorkspaceId);
            setUserRole(memberData.role || null);
            localStorage.setItem('currentWorkspaceId', targetWorkspaceId);
          } else {
            console.log('User lost access to default workspace');
          }
        } else {
          console.log('User has no workspace assigned');
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
        .select('role, workspaces(name)')
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

      // Salvar como workspace padrão
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          default_workspace_id: id,
        }, {
          onConflict: 'user_id'
        });
      
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
