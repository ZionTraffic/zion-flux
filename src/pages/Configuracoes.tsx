import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Users, Plug, Settings, CreditCard, Trash2, UserPlus, Database, Plus, Building2, Shield } from "lucide-react";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { useUserRole } from "@/hooks/useUserRole";
import { AddMemberModal } from "@/components/workspace/AddMemberModal";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useDatabase } from "@/contexts/DatabaseContext";
import { AddDatabaseModal } from "@/components/database/AddDatabaseModal";
import { CreateWorkspaceModal } from "@/components/workspaces/CreateWorkspaceModal";
import { EditPermissionsModal } from "@/components/permissions/EditPermissionsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PermissionGuard, AccessDenied } from "@/components/permissions/PermissionGuard";
import { PERMISSIONS } from "@/types/permissions";

const Configuracoes = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { members, loading: membersLoading, updateMemberRole, removeMember, addMember } = useWorkspaceMembers();
  const { isOwner } = useUserRole();
  const { workspaces, isLoading: workspacesLoading, refetch: refetchWorkspaces, createWorkspace } = useWorkspaces();
  const { availableDatabases, refetchConfigs } = useDatabase();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
  } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "workspaces";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const current = searchParams.get("tab") || "workspaces";
    setActiveTab(current);
  }, [searchParams]);

  // Listener para atualizar lista de usuários
  useEffect(() => {
    const handleRefreshUserList = () => {
      // Recarregar membros do workspace
      window.location.reload();
    };

    window.addEventListener('refreshUserList', handleRefreshUserList);
    
    return () => {
      window.removeEventListener('refreshUserList', handleRefreshUserList);
    };
  }, []);

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

  const handleEditPermissions = (member: any) => {
    setSelectedUserForPermissions({
      userId: member.user_id,
      userName: member.user_name,
      userEmail: member.user_email,
      userRole: member.role,
    });
    setIsEditPermissionsModalOpen(true);
  };

  const handlePermissionsUpdated = () => {
    // Recarregar membros para refletir mudanças
    // O hook useWorkspaceMembers já tem um refetch que pode ser usado
  };
  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <PermissionGuard 
        permission={PERMISSIONS.SETTINGS_VIEW}
        fallback={
          <AccessDenied 
            title="Acesso às Configurações Negado"
            message="Você não tem permissão para acessar as configurações."
          />
        }
      >
        <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, integrações e configurações do sistema
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6 lg:w-[900px]">
            <TabsTrigger value="workspaces" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Workspaces</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="databases" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Bancos</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Planos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Workspaces</h3>
                {isOwner && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsCreateWorkspaceModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Workspace
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {workspacesLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Carregando workspaces...
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma workspace encontrada
                  </div>
                ) : (
                  workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{workspace.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Banco: {workspace.database.toUpperCase()} • Slug: {workspace.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {workspace.database.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            <CreateWorkspaceModal
              open={isCreateWorkspaceModalOpen}
              onOpenChange={setIsCreateWorkspaceModalOpen}
              onCreateWorkspace={async (data) => {
                await createWorkspace(data);
                setIsCreateWorkspaceModalOpen(false);
                refetchWorkspaces();
              }}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Usuários e Permissões</h3>
                  <p className="text-sm text-foreground mt-2">
                    Workspace atual: <strong className="text-blue-600 dark:text-blue-400">{workspaces.find(w => w.id === currentWorkspaceId)?.name || 'Carregando...'}</strong>
                  </p>
                </div>
                {isOwner && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                )}
              </div>
              
              {isOwner && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-0.5">
                      ℹ️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed">
                        <strong className="text-base">💡 Dica:</strong> Os usuários são específicos por workspace. Para ver usuários de outro workspace, 
                        use o seletor de workspace no topo da página.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {membersLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Carregando membros...
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum membro encontrado
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-semibold text-sm">
                            {member.user_name?.substring(0, 2).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.user_name}</p>
                          <p className="text-sm text-muted-foreground">{member.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwner ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => updateMemberRole(member.user_id, newRole)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">{member.role}</Badge>
                        )}
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPermissions(member)}
                            className="text-primary hover:text-primary"
                            title="Editar Permissões"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        {isOwner && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.user_id)}
                            className="text-destructive hover:text-destructive"
                            title="Remover Usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            
            <AddMemberModal
              open={isAddMemberModalOpen}
              onOpenChange={setIsAddMemberModalOpen}
              onAddMember={addMember}
              workspaces={workspaces}
              currentWorkspaceId={currentWorkspaceId}
            />
          </TabsContent>

          <TabsContent value="databases" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bancos de Dados</h3>
                {isOwner && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsDatabaseModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Banco
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {availableDatabases.map((db) => (
                  <div key={db.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Database className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{db.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {db.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-400">Ativo</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
            <AddDatabaseModal
              open={isDatabaseModalOpen}
              onOpenChange={setIsDatabaseModalOpen}
              onSuccess={refetchConfigs}
            />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <h3 className="text-lg font-semibold mb-4">Integrações Disponíveis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-2xl">📘</span>
                    </div>
                    <div>
                      <p className="font-medium">Meta Ads</p>
                      <p className="text-sm text-muted-foreground">Sincronização de campanhas e métricas</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <p className="font-medium">Nicochat Webhook</p>
                      <p className="text-sm text-muted-foreground">Recebimento de conversas em tempo real</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-2xl">🗄️</span>
                    </div>
                    <div>
                      <p className="font-medium">Banco de Dados</p>
                      <p className="text-sm text-muted-foreground">Sistema de dados e autenticação</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <p className="font-medium">IA Conversacional</p>
                      <p className="text-sm text-muted-foreground">Análise e insights automáticos</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400">Ativo</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <h3 className="text-lg font-semibold mb-4">Configurações do Sistema</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                  </div>
                  <Switch id="dark-mode" defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-interval">Intervalo de Atualização</Label>
                  <Input 
                    id="update-interval" 
                    type="number" 
                    defaultValue="30" 
                    placeholder="Minutos"
                  />
                  <p className="text-sm text-muted-foreground">
                    Frequência de atualização automática dos dados (em minutos)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cache">Cache de Dados</Label>
                    <p className="text-sm text-muted-foreground">Melhorar performance com cache local</p>
                  </div>
                  <Switch id="cache" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Notificações</Label>
                    <p className="text-sm text-muted-foreground">Receber alertas de novos leads</p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>

                <Button className="w-full">Salvar Configurações</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <h3 className="text-lg font-semibold mb-4">Plano Atual</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-bold">Plano Professional</h4>
                    <Badge className="bg-primary/20 text-primary">Ativo</Badge>
                  </div>
                  <p className="text-3xl font-bold mb-2">R$ 497<span className="text-base font-normal text-muted-foreground">/mês</span></p>
                  <p className="text-sm text-muted-foreground mb-4">Próxima cobrança: 15/02/2025</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Até 10.000 leads/mês</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Todas as integrações</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">IA avançada ilimitada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="text-sm">Suporte prioritário</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Gerenciar Assinatura
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Funcionalidade de gerenciamento de planos em desenvolvimento</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Edição de Permissões */}
      {selectedUserForPermissions && (
        <EditPermissionsModal
          open={isEditPermissionsModalOpen}
          onOpenChange={setIsEditPermissionsModalOpen}
          userId={selectedUserForPermissions.userId}
          userName={selectedUserForPermissions.userName}
          userEmail={selectedUserForPermissions.userEmail}
          userRole={selectedUserForPermissions.userRole}
          workspaceId={currentWorkspaceId || ''}
          onPermissionsUpdated={handlePermissionsUpdated}
        />
      )}

      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Sistema de Configuração
          </p>
        </div>
      </footer>
      </PermissionGuard>
    </div>
  );
};

export default Configuracoes;
