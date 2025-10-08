import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (email: string, role: string) => Promise<void>;
}

export function AddMemberModal({ open, onOpenChange, onAddMember }: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (!role) {
      setError('Por favor, selecione uma função');
      return;
    }

    setIsLoading(true);
    try {
      await onAddMember(email, role);
      // Reset form
      setEmail('');
      setRole('member');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar membro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
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
