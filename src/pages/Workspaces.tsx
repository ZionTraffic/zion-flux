import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { WorkspaceCard } from "@/components/workspaces/WorkspaceCard";
import { CreateWorkspaceModal } from "@/components/workspaces/CreateWorkspaceModal";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const Workspaces = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { workspaces, isLoading, refetch, createWorkspace } = useWorkspaces();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.segment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-2">Carregando workspaces...</div>
          <p className="text-muted-foreground">Buscando suas empresas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={refetch} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={setCurrentWorkspaceId}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
              Central de Workspaces
            </h1>
            <p className="text-muted-foreground">
              Gerencie todas as suas empresas em um só lugar
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Workspace
          </Button>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-2xl p-4 border border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou segmento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-medium border-border/50"
            />
          </div>
        </div>

        {/* Workspaces Grid */}
        {filteredWorkspaces.length === 0 ? (
          <div className="glass rounded-2xl p-12 border border-border/50 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "Nenhuma workspace encontrada" : "Nenhuma workspace ainda"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Tente buscar com outros termos" 
                : "Crie sua primeira workspace para começar"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Workspace
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map((workspace, index) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateWorkspace={createWorkspace}
      />

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Central de Workspaces
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Workspaces;
