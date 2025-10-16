import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
        .select('*, workspaces(name)')
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
      setInviteData(data);
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
            invited_via_token: token
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: inviteData.email,
            password
          });

          if (signInError) {
            toast.error('Email já cadastrado. Use a senha correta para entrar.');
            return;
          }

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

      // Call edge function to add user to workspace (bypasses RLS)
      const { data: inviteResult, error: inviteAcceptError } = await supabase.functions.invoke(
        'accept-workspace-invite',
        {
          body: { token, user_id: userId }
        }
      );

      if (inviteAcceptError || !inviteResult?.success) {
        console.error('Erro ao aceitar convite:', inviteAcceptError);
        throw new Error(inviteAcceptError?.message || 'Erro ao processar convite');
      }

      console.log('✅ Convite aceito com sucesso:', inviteResult);

      toast.success(`Bem-vindo ao workspace ${inviteData.workspaces.name}!`);
      
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
            Você foi convidado para o workspace <strong className="text-foreground">{inviteData.workspaces.name}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Email: {inviteData.email}
          </p>
          <p className="text-sm text-muted-foreground">
            Função: {inviteData.role}
          </p>
        </div>

        <form onSubmit={handleAcceptInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Defina sua senha</Label>
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
