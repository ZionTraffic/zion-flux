import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface WorkspaceContextType {
  currentWorkspaceId: string;
  setCurrentWorkspaceId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    // Try to load from localStorage
    return localStorage.getItem('currentWorkspaceId') || '3f14bb25-0eda-4c58-8486-16b96dca6f9e';
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('currentWorkspaceId', currentWorkspaceId);
  }, [currentWorkspaceId]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceId, setCurrentWorkspaceId }}>
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
