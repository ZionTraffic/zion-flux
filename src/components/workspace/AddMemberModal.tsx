import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import type { Workspace } from '@/hooks/useWorkspaces';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (email: string, role: string, workspaceId: string) => Promise<void>;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
}

const addMemberSchema = z.object({
  workspaceId: z.string().uuid('Workspace inválido'),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate with zod schema
    try {
      const validated = addMemberSchema.parse({ workspaceId, email: email.trim(), role });
      
      setIsLoading(true);
      await onAddMember(validated.email, validated.role, validated.workspaceId);
      // Reset form
      setWorkspaceId(currentWorkspaceId || '');
      setEmail('');
      setRole('member');
      onOpenChange(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setWorkspaceId(currentWorkspaceId || '');
    setEmail('');
    setRole('member');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Digite o email do usuário e selecione sua função no workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
            <div className="text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
