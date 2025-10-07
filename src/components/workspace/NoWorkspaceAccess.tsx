import { useState } from "react";
import { Building2, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateWorkspaceModal } from "@/components/workspaces/CreateWorkspaceModal";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function NoWorkspaceAccess({ userEmail }: { userEmail?: string }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { createWorkspace, refetch } = useWorkspaces();
  const { toast } = useToast();

  const handleCreateWorkspace = async (data: any) => {
    const result = await createWorkspace(data);
    if (result) {
      await refetch();
      window.location.reload(); // Refresh to load new workspace
    }
    return result;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass border-border/50">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto p-4 rounded-2xl bg-primary/10 border border-primary/20 w-fit">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Nenhum Workspace Disponível</CardTitle>
          <CardDescription className="text-base">
            Você não tem acesso a nenhum workspace ainda.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {userEmail && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{userEmail}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Criar Novo Workspace
            </Button>

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full border-border/50 hover:bg-muted/50"
              size="lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Se você foi convidado para um workspace, entre em contato com o administrador.
          </p>
        </CardContent>
      </Card>

      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </div>
  );
}
