import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link as LinkIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingInvitesList } from './PendingInvitesList';
import { PermissionSelector } from '@/components/permissions/PermissionSelector';
import { PermissionKey, DEFAULT_PERMISSIONS_BY_ROLE } from '@/types/permissions';
import { useCurrentTenant } from '@/contexts/TenantContext';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (email: string, role: string, tenantId: string) => Promise<void>;
  currentTenantId: string | null;
  currentTenantName?: string | null;
}

const addMemberSchema = z.object({
  tenant_id: z.string().uuid('Empresa inválida'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  role: z.enum(['owner', 'admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Por favor, selecione uma função válida' })
  })
});

export function AddMemberModal({ open, onOpenChange, onAddMember, currentTenantId, currentTenantName }: AddMemberModalProps) {
  const { tenant } = useCurrentTenant();
  const effectiveTenantId = tenant?.id || currentTenantId || '';
  const effectiveTenantName = tenant?.name || currentTenantName || 'Empresa';
  const [tenantId, setTenantId] = useState<string>(effectiveTenantId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('member');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>(
    [...DEFAULT_PERMISSIONS_BY_ROLE.member] as PermissionKey[]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [hasTemplate, setHasTemplate] = useState(false);

  // Carregar template salvo quando workspace mudar
  useEffect(() => {
    if (tenantId) {
      const templateKey = `permission_template_${tenantId}`;
      const savedTemplate = localStorage.getItem(templateKey);
      
      if (savedTemplate) {
        try {
          const template = JSON.parse(savedTemplate);
          setRole(template.role || 'member');
          setSelectedPermissions(template.permissions || [...DEFAULT_PERMISSIONS_BY_ROLE.member]);
          setHasTemplate(true);
          
          toast.info(`Template carregado para ${template.tenantName}`, {
            description: `${template.permissions?.length || 0} permissões configuradas`
          });
        } catch (error) {
          console.error('Erro ao carregar template:', error);
          setHasTemplate(false);
        }
      } else {
        setHasTemplate(false);
      }
    }
  }, [tenantId]);

  const handleSavePermissions = async () => {
    try {
      if (!tenantId) {
        toast.error('Nenhuma empresa selecionada');
        return;
      }

      // Validar se email está preenchido
      if (!email.trim()) {
        toast.error('Digite o email do usuário');
        return;
      }

      // Validar se há permissões selecionadas
      if (selectedPermissions.length === 0) {
        toast.error('Selecione pelo menos uma permissão');
        return;
      }

      setIsLoading(true);

      // Gerar convite com permissões customizadas
      const { data, error: functionError } = await supabase.functions.invoke('generate-invite-link', {
        body: {
          email: email.toLowerCase().trim(),
          role: role,
          tenant_id: tenantId,
          permissions: selectedPermissions
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Convite gerado com permissões customizadas:', data);

      // Salvar template também
      const templateKey = `permission_template_${tenantId}`;
      const template = {
        role,
        permissions: selectedPermissions,
        savedAt: new Date().toISOString(),
        tenantName: effectiveTenantName,
      };

      localStorage.setItem(templateKey, JSON.stringify(template));
      
      toast.success('Usuário cadastrado! Link de convite gerado.');
      
      handleClose();
      
      // Forçar atualização da lista de usuários sem recarregar a página
      setTimeout(() => {
        // Disparar evento customizado para atualizar a lista
        window.dispatchEvent(new CustomEvent('refreshUserList'));
      }, 500);
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao adicionar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTenantId(effectiveTenantId);
    setEmail('');
    setRole('member');
    setSelectedPermissions([...DEFAULT_PERMISSIONS_BY_ROLE.member] as PermissionKey[]);
    setError(null);
    setGeneratedLink(null);
    setInviteDetails(null);
    onOpenChange(false);
  };

  const handleGenerateLink = async () => {
    setError(null);
    
    const targetTenantId = tenantId || effectiveTenantId;
    
    if (!targetTenantId) {
      setError('Nenhuma empresa selecionada');
      return;
    }

    if (!email) {
      setError('Digite um email');
      return;
    }

    try {
      // Verificar se está autenticado antes de chamar a function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Você precisa estar autenticado. Faça logout e login novamente.');
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const validation = addMemberSchema.parse({
        tenant_id: targetTenantId,
        email,
        role
      });

      setIsLoading(true);

      const { data, error: functionError } = await supabase.functions.invoke('generate-invite-link', {
        body: {
          email: validation.email,
          role: validation.role,
          tenant_id: validation.tenant_id,
          permissions: selectedPermissions
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedLink(data.invite_url);
      setInviteDetails(data);
      toast.success('Link de convite gerado!');
      
    } catch (err: any) {
      console.error('Erro ao gerar link:', err);
      const errorMessage = err.message || 'Erro ao gerar link de convite';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success('Link copiado!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Gerenciar Convites</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Gerar Convite</TabsTrigger>
            <TabsTrigger value="pending">Convites Pendentes</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Empresa selecionada</Label>
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-background/80 text-sm">
                {effectiveTenantName}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select 
                value={role} 
                onValueChange={(newRole) => {
                  setRole(newRole);
                  // Atualizar permissões padrão quando o role muda
                  if (DEFAULT_PERMISSIONS_BY_ROLE[newRole as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE]) {
                    setSelectedPermissions([...DEFAULT_PERMISSIONS_BY_ROLE[newRole as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE]] as PermissionKey[]);
                  }
                }} 
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner - Controle total</SelectItem>
                  <SelectItem value="admin">Admin - Gerenciar usuários e configurações</SelectItem>
                  <SelectItem value="member">Member - Acesso básico</SelectItem>
                  <SelectItem value="viewer">Viewer - Apenas visualização</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seletor de Permissões */}
            <div className="space-y-2">
              <PermissionSelector
                selectedPermissions={selectedPermissions}
                onPermissionsChange={setSelectedPermissions}
                userRole={role}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {generatedLink && inviteDetails && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <LinkIcon className="h-5 w-5" />
                  <p className="font-medium">Link de Convite Gerado</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={generatedLink} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={copyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Email: {inviteDetails.email}</p>
                    <p>Role: {inviteDetails.role}</p>
                    <p>Expira em: {new Date(inviteDetails.expires_at).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Compartilhe este link diretamente com o usuário (WhatsApp, email, etc.)
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-between">
              <Button 
                variant={hasTemplate ? "default" : "secondary"}
                onClick={handleSavePermissions}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
{hasTemplate ? 'Cadastrar com Template' : 'Cadastrar Usuário'}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerateLink} disabled={isLoading}>
                  {isLoading ? 'Gerando...' : 'Gerar Link de Convite'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <PendingInvitesList 
              tenantId={tenantId || effectiveTenantId} 
              onUpdate={() => {}}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
