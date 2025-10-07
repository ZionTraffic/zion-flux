import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function initializeWorkspace() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Try to load from localStorage and validate
        const stored = localStorage.getItem('currentWorkspaceId');
        
        if (stored) {
          const { data } = await supabase
            .from('membros_workspace')
            .select('workspace_id')
            .eq('user_id', user.id)
            .eq('workspace_id', stored)
            .maybeSingle();
          
          if (data) {
            setCurrentWorkspaceIdState(stored);
            setIsLoading(false);
            return;
          }
        }
        
        // If no valid stored workspace, fetch user's first workspace
        const { data } = await supabase
          .from('membros_workspace')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setCurrentWorkspaceIdState(data.workspace_id);
          localStorage.setItem('currentWorkspaceId', data.workspace_id);
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
  }, []);

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

      // Validate user has access to this workspace
      const { data } = await supabase
        .from('membros_workspace')
        .select('workspace_id')
        .eq('user_id', user.id)
        .eq('workspace_id', id)
        .maybeSingle();
      
      if (data) {
        setCurrentWorkspaceIdState(id);
        localStorage.setItem('currentWorkspaceId', id);
      } else {
        toast({
          title: 'Access denied',
          description: 'You do not have access to this workspace',
          variant: 'destructive',
        });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceId, setCurrentWorkspaceId, isLoading }}>
      {children}
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
