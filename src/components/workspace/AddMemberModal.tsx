import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingInvitesList } from './PendingInvitesList';
import type { Workspace } from '@/hooks/useWorkspaces';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (email: string, role: string, workspaceId: string) => Promise<void>;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
}

const addMemberSchema = z.object({
  workspace_id: z.string().uuid('Workspace inválido'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  role: z.enum(['owner', 'admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Por favor, selecione uma função válida' })
  })
});

export function AddMemberModal({ open, onOpenChange, onAddMember, workspaces, currentWorkspaceId }: AddMemberModalProps) {
  const [workspaceId, setWorkspaceId] = useState<string>(currentWorkspaceId || '');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  const handleClose = () => {
    setWorkspaceId(currentWorkspaceId || '');
    setEmail('');
    setRole('member');
    setError(null);
    setGeneratedLink(null);
    setInviteDetails(null);
    onOpenChange(false);
  };

  const handleGenerateLink = async () => {
    setError(null);
    
    const targetWorkspaceId = workspaceId || currentWorkspaceId;
    
    if (!targetWorkspaceId) {
      setError('Selecione um workspace');
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
        workspace_id: targetWorkspaceId,
        email,
        role
      });

      setIsLoading(true);

      const { data, error: functionError } = await supabase.functions.invoke('generate-invite-link', {
        body: {
          email: validation.email,
          role: validation.role,
          workspace_id: validation.workspace_id
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
              <Label htmlFor="workspace">Workspace</Label>
              <Select value={workspaceId} onValueChange={setWorkspaceId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um workspace" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id} className="cursor-pointer">
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
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

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateLink} disabled={isLoading}>
                {isLoading ? 'Gerando...' : 'Gerar Link de Convite'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <PendingInvitesList 
              workspaceId={workspaceId || currentWorkspaceId || ''} 
              onUpdate={() => {}}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
