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
  const { supabase, currentDatabase, setDatabase } = useDatabase();
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

        // Armazenar email do usuário
        setUserEmail(user.email);

        // Try to load from localStorage and validate
        const stored = localStorage.getItem('currentWorkspaceId');
        
        if (stored) {
          const { data } = await supabase
            .from('membros_workspace')
            .select('workspace_id, role')
            .eq('user_id', user.id)
            .eq('workspace_id', stored)
            .maybeSingle();
          
          if (data) {
            setCurrentWorkspaceIdState(stored);
            setUserRole(data.role || null);
            setIsLoading(false);
            return;
          }
        }
        
        // If no valid stored workspace, fetch user's first workspace
        const { data } = await supabase
          .from('membros_workspace')
          .select('workspace_id, role')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setCurrentWorkspaceIdState(data.workspace_id);
          setUserRole(data.role || null);
          localStorage.setItem('currentWorkspaceId', data.workspace_id);
        } else {
          // Usuário não tem workspace - manter isLoading false mas workspace null
          console.log('User has no workspace assigned');
        }
      } catch (error) {
        console.error('Failed to initialize workspace:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Clear workspace data on logout
        setCurrentWorkspaceIdState(null);
        localStorage.removeItem('currentWorkspaceId');
      } else if (event === 'SIGNED_IN') {
        // Reinitialize workspace on login
        initializeWorkspace();
      }
    });
    
    initializeWorkspace();
    
    return () => subscription.unsubscribe();
  }, [currentDatabase, supabase]);

  const setCurrentWorkspaceId = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to switch workspaces',
          variant: 'destructive',
        });
        return;
      }

      // Fetch workspace to get its database
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id, database')
        .eq('id', id)
        .maybeSingle();
      
      if (workspace) {
        // Switch database automatically based on workspace
        setDatabase(workspace.database as 'asf' | 'sieg');
        
        // Validate user has access to this workspace and get their role
        const { data: memberData } = await supabase
          .from('membros_workspace')
          .select('workspace_id, role')
          .eq('user_id', user.id)
          .eq('workspace_id', id)
          .maybeSingle();
        
        if (memberData) {
          setCurrentWorkspaceIdState(id);
          setUserRole(memberData.role || null);
          localStorage.setItem('currentWorkspaceId', id);
        } else {
          toast({
            title: 'Access denied',
            description: 'You do not have access to this workspace',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch workspace',
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
