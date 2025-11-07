import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type InviteCustomData = {
  tenant_id?: string;
  tenant_name?: string | null;
  tenant_slug?: string | null;
  requester_role?: string | null;
  requester_active?: boolean | null;
  is_existing_member?: boolean | null;
  [key: string]: unknown;
};

type InviteData = {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  custom_data?: InviteCustomData | string | null;
  workspaces?: { name?: string | null } | null;
};

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const parsedCustomData = useMemo<InviteCustomData>(() => {
    if (!inviteData?.custom_data) return {};
    if (typeof inviteData.custom_data === 'object') {
      return inviteData.custom_data as InviteCustomData;
    }

    try {
      return JSON.parse(inviteData.custom_data) as InviteCustomData;
    } catch (error) {
      console.warn('[AcceptInvite] Não foi possível parsear custom_data:', error);
      return {};
    }
  }, [inviteData]);

  const tenantName = parsedCustomData.tenant_name ?? inviteData?.workspaces?.name ?? 'empresa';

  useEffect(() => {
    console.log('🔍 AcceptInvite: Token from URL:', token);
    
    if (!token) {
      console.error('❌ AcceptInvite: No token provided');
      toast.error('Link de convite inválido');
      navigate('/auth');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('🔍 AcceptInvite: Verifying token in database...');
      
      const { data, error } = await supabase
        .from('pending_invites')
        .select('*, workspaces(name), permissions')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      console.log('📊 AcceptInvite: Query result:', { data, error });

      if (error) {
        console.error('❌ AcceptInvite: Database error', error);
        
        // Verificar se é erro de RLS ou outro problema
        if (error.code === 'PGRST116') {
          toast.error('Convite inválido ou expirado');
        } else {
          toast.error('Erro ao verificar convite. Verifique as permissões RLS.');
        }
        navigate('/auth');
        return;
      }

      if (!data) {
        console.error('❌ AcceptInvite: No invite data found');
        toast.error('Convite inválido ou expirado');
        navigate('/auth');
        return;
      }

      console.log('✅ AcceptInvite: Invite verified successfully');
      setInviteData(data as InviteData);
    } catch (error) {
      console.error('❌ AcceptInvite: Error verifying token:', error);
      toast.error('Erro ao verificar convite');
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 2) {
      toast.error('O nome deve ter no mínimo 2 caracteres');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsProcessing(true);

    try {
      let { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            invited_via_token: token
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
          console.log('[AcceptInvite] Email já cadastrado, tentando fazer login...');
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: inviteData.email,
            password
          });

          if (signInError) {
            console.error('[AcceptInvite] Erro ao fazer login:', signInError);
            setIsProcessing(false);
            toast.error(
              'Este email já está cadastrado. Por favor, use a senha da sua conta existente para aceitar o convite.',
              { duration: 5000 }
            );
            return;
          }

          console.log('[AcceptInvite] Login realizado com sucesso');
          // Atualizar authData com os dados do login
          authData = signInData;
        } else {
          throw signUpError;
        }
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('Erro ao criar usuário');
      }

      // Aguardar um pouco para garantir que a sessão está estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Obter sessão atualizada
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não estabelecida. Por favor, faça login novamente.');
      }

      console.log('[AcceptInvite] Chamando Edge Function com sessão válida');

      // Call edge function to add user to workspace (bypasses RLS)
      const { data: inviteResult, error: inviteAcceptError } = await supabase.functions.invoke(
        'accept-workspace-invite',
        {
          body: { token, user_id: userId }
        }
      );

      if (inviteAcceptError || !inviteResult?.success) {
        console.error('[AcceptInvite] Erro ao aceitar convite:', inviteAcceptError);
        
        // Se falhou ao adicionar ao workspace, deletar o usuário criado
        try {
          console.log('[AcceptInvite] Revertendo criação de usuário...');
          await supabase.auth.admin.deleteUser(userId);
          console.log('[AcceptInvite] Usuário revertido com sucesso');
        } catch (deleteError) {
          console.error('[AcceptInvite] Erro ao reverter usuário:', deleteError);
        }
        
        throw new Error(inviteAcceptError?.message || 'Erro ao processar convite. Por favor, tente novamente.');
      }

      console.log('[AcceptInvite] Convite aceito com sucesso:', inviteResult);

      toast.success(`Bem-vindo à empresa ${tenantName}!`);
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      toast.error(error.message || 'Erro ao processar convite');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 border-border/50">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Aceitar Convite</h1>
          <p className="text-muted-foreground">
            Você foi convidado para a empresa <strong className="text-foreground">{tenantName}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Email: {inviteData.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Função: {inviteData.role}
          </p>
        </div>

        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            ℹ️ <strong>Importante:</strong> Se este email já estiver cadastrado no sistema, use a senha da sua conta existente para aceitar o convite.
          </p>
        </div>

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
              minLength={2}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Defina sua senha (ou use a senha existente)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirme sua senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              minLength={6}
              disabled={isProcessing}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Aceitar Convite e Criar Conta'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
