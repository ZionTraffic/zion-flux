import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Plug, Settings, Trash2, UserPlus, Database, Shield, Plus, History, Ban, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRole } from "@/hooks/useUserRole";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { AddMemberModal } from "@/components/workspace/AddMemberModal";
import { useSearchParams } from "react-router-dom";
import { PermissionGuard, AccessDenied } from "@/components/permissions/PermissionGuard";
import { PERMISSIONS } from "@/types/permissions";
import { supabase as defaultSupabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { TenantSelector } from "@/components/ui/TenantSelector";
import { AddDatabaseModal } from "@/components/database/AddDatabaseModal";
import { EditPermissionsModal } from "@/components/permissions/EditPermissionsModal";
import { WorkspaceMember } from "@/hooks/useWorkspaceMembers";
import { AuditLogViewer } from "@/components/audit/AuditLogViewer";
import logoZionIcon from "@/assets/logo-zion-icon.png";
import { APP_VERSION } from "@/lib/version";

const Configuracoes = () => {
  const { isOwner } = useUserRole();
  const { availableDatabases, refetchConfigs, supabase } = useDatabase();
  const { members, loading: membersLoading, updateMemberRole, removeMember, addMember, refetch: refetchMembers, toggleBlockMember } = useWorkspaceMembers();
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isEditPermissionsModalOpen, setIsEditPermissionsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "users";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { currentTenant, refreshTenants } = useTenant();

  // Verificar se é master user
  const [isMasterUser, setIsMasterUser] = useState(false);
  
  useEffect(() => {
    const checkMasterUser = async () => {
      console.log('🔍 [Configuracoes] Verificando master user...');
      try {
        // Usar defaultSupabase para obter o usuário autenticado
        const { data: { user } } = await defaultSupabase.auth.getUser();
        const masterEmails = ['george@ziontraffic.com.br', 'leonardobasiliozion@gmail.com', 'eliasded51@gmail.com'];
        console.log('🔍 [Configuracoes] User obtido:', { email: user?.email, isMaster: masterEmails.includes(user?.email || '') });
        if (masterEmails.includes(user?.email || '')) {
          setIsMasterUser(true);
          console.log('🔓 MASTER USER detectado em Configurações');
        } else {
          console.log('❌ [Configuracoes] Não é master user:', user?.email);
        }
      } catch (error) {
        console.error('❌ [Configuracoes] Erro ao verificar master user:', error);
      }
    };
    checkMasterUser();
  }, []);
  
  // Master user ou owner podem gerenciar
  const canManage = isMasterUser || isOwner;

  // Função para abrir modal de editar permissões
  const handleEditPermissions = (member: WorkspaceMember) => {
    setSelectedMember(member);
    setIsEditPermissionsModalOpen(true);
  };

  // Debug log
  console.log('🔍 [Configuracoes] Permissões:', { 
    isMasterUser, 
    isOwner, 
    canManage,
    currentTenant 
  });

  useEffect(() => {
    const current = searchParams.get("tab");
    if (current) setActiveTab(current);
  }, [searchParams]);

  if (!currentTenant) {
    return (
      <DashboardLayout
        onRefresh={() => refreshTenants()}
        isRefreshing={false}
        lastUpdate={new Date()}
      >
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="glass rounded-2xl p-8 border border-border/50 max-w-lg w-full text-center">
            <div className="text-4xl mb-3">🏢</div>
            <h2 className="text-xl font-semibold mb-2">Selecione uma empresa</h2>
            <p className="text-sm text-muted-foreground">
              Escolha um tenant para acessar as configurações.
            </p>
            <div className="mt-4 flex justify-center">
              <TenantSelector />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      onRefresh={() => window.location.reload()} 
      isRefreshing={false} 
      lastUpdate={new Date()}
    >
      <PermissionGuard 
        permission={PERMISSIONS.SETTINGS_VIEW}
        fallback={
          <AccessDenied 
            title="Acesso às Configurações Negado"
            message="Você não tem permissão para acessar as configurações."
          />
        }
      >
        <main className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Configurações</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie usuários, integrações e configurações do sistema
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
          }}
          className="space-y-4 sm:space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 lg:w-[900px] h-auto p-1">
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
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 sm:space-y-4">
            <Card className="p-4 sm:p-6 glass border border-border/60 flex flex-col gap-2">
              <h3 className="text-base sm:text-lg font-semibold">Empresa selecionada</h3>
              <div className="text-xs sm:text-sm text-muted-foreground">
                <p><strong>Nome:</strong> {currentTenant.name}</p>
                <p><strong>Slug:</strong> {currentTenant.slug}</p>
              </div>
            </Card>
            <Card className="p-4 sm:p-6 glass border border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                <h3 className="text-base sm:text-lg font-semibold">Usuários e Permissões</h3>
                      <p className="text-xs sm:text-sm text-foreground mt-1 sm:mt-2">
                    Empresa atual: <strong className="text-blue-600 dark:text-blue-400">{currentTenant.name}</strong>
                  </p>
                </div>
                {canManage && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Adicionar Usuário</span>
                  </Button>
                )}
              </div>
              
              {canManage && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl mt-0.5">
                      ℹ️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed">
                        <strong className="text-base">💡 Dica:</strong> Os usuários são específicos por empresa. Para trocar, use o seletor de empresas no topo.
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
                    <div key={member.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-xs sm:text-sm">
                            {member.user_name?.substring(0, 2).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm sm:text-base truncate">{member.user_name}</p>
                            {member.bloqueado && (
                              <Badge variant="destructive" className="text-[10px] sm:text-xs">Bloqueado</Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 justify-end flex-wrap">
                        {canManage ? (
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => updateMemberRole(member.user_id, newRole)}
                          >
                            <SelectTrigger className="w-[100px] sm:w-[140px] h-8 sm:h-10 text-xs sm:text-sm">
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
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPermissions(member)}
                            className="text-primary hover:text-primary h-8 w-8 p-0"
                            title="Editar Permissões"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        {canManage && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBlockMember(member.user_id, !member.bloqueado)}
                            className={`h-8 w-8 p-0 ${member.bloqueado ? "text-green-600 hover:text-green-700" : "text-orange-500 hover:text-orange-600"}`}
                            title={member.bloqueado ? "Desbloquear Usuário" : "Bloquear Usuário"}
                          >
                            {member.bloqueado ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                        )}
                        {canManage && member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.user_id)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
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
              onAddMember={async (email, role, tenantId) => {
                await addMember(email, role, tenantId);
                await refetchMembers();
              }}
              currentTenantId={currentTenant.id}
              currentTenantName={currentTenant.name}
            />

            {selectedMember && (
              <EditPermissionsModal
                open={isEditPermissionsModalOpen}
                onOpenChange={(open) => {
                  setIsEditPermissionsModalOpen(open);
                  if (!open) setSelectedMember(null);
                }}
                userId={selectedMember.user_id}
                userName={selectedMember.user_name}
                userEmail={selectedMember.user_email}
                userRole={selectedMember.role}
                workspaceId={currentTenant.id}
                onPermissionsUpdated={async () => {
                  await refetchMembers();
                  setSelectedMember(null);
                  setIsEditPermissionsModalOpen(false);
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="databases" className="space-y-4">
            <Card className="p-6 glass border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bancos de Dados</h3>
                {canManage && (
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

          {/* Aba de Histórico de Alterações (Audit Log) */}
          <TabsContent value="audit" className="space-y-4">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-center gap-3">
            <img src={logoZionIcon} alt="Zion Traffic" className="h-8 w-auto" />
            <p className="text-sm text-muted-foreground">
              © Copyright 2025 Zion Traffic v{APP_VERSION}
            </p>
          </div>
        </div>
      </footer>
      </PermissionGuard>
    </DashboardLayout>
  );
};

export default Configuracoes;
