import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import logoZionCircular from "@/assets/logo-zion-circular.jpg";
import logoZionBlue from "@/assets/logo-zion-blue.png";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há um token de recuperação na URL (hash ou query params)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const type = hashParams.get('type') || queryParams.get('type');

    console.log('[ResetPassword] URL params:', { accessToken: !!accessToken, type, hash: window.location.hash });

    if (accessToken && type === 'recovery') {
      // Definir a sessão com o token de recuperação
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || queryParams.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          console.error('[ResetPassword] Erro ao definir sessão:', error);
          toast({
            title: "Link inválido",
            description: "Este link de recuperação é inválido ou expirou.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      });
    } else {
      // Verificar se o usuário está autenticado
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast({
            title: "Link inválido",
            description: "Este link de recuperação é inválido ou expirou.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      });
    }
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background com logo azul expandida */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${logoZionBlue})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(1.1)'
            }}
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-heavy rounded-apple-2xl shadow-apple-xl overflow-hidden border border-white/10 relative">
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-green-500/20 via-green-400/10 to-transparent opacity-40 blur-3xl -mt-20" />
            
            <div className="relative p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">Senha Alterada!</h1>
              <p className="text-muted-foreground mb-4">
                Sua senha foi alterada com sucesso. Você será redirecionado...
              </p>
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background com logo azul expandida */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${logoZionBlue})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(1.1)'
          }}
        />
      </div>

      {/* Card principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-heavy rounded-apple-2xl shadow-apple-xl overflow-hidden border border-white/10 relative">
          {/* Gradient top blur */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-500/20 via-blue-400/10 to-transparent opacity-40 blur-3xl -mt-20" />
          
          {/* Content */}
          <div className="relative p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="bg-white p-3 rounded-full shadow-apple-xl mb-6 animate-apple-fade-in">
                <img 
                  src={logoZionCircular} 
                  alt="Zion" 
                  className="w-20 h-20 object-contain rounded-full"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Redefinir Senha</h2>
              <p className="text-center text-muted-foreground mt-2">
                Digite sua nova senha abaixo
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Nova Senha */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full h-12 px-4 pr-12 rounded-apple-lg bg-input/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-apple-fast"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full h-12 px-4 pr-12 rounded-apple-lg bg-input/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-apple-fast"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Botão Alterar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-apple-lg transition-apple-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </button>

              {/* Voltar ao Login */}
              <div className="text-center">
                <span className="text-sm text-muted-foreground">ou</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="w-full text-sm text-primary hover:text-primary/80 transition-apple-fast"
              >
                Voltar ao Login
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
