import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { motion } from 'framer-motion';
import logoZionCircular from "@/assets/logo-zion-circular.jpg";
import logoZionBlue from "@/assets/logo-zion-blue.png";

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para recuperar senha
  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Email necessário",
        description: "Digite seu email no campo acima para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  useEffect(() => {
    // Verificar se é um link de recovery (reset password)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      console.log('[Auth] Recovery token detected, redirecting to reset-password');
      // Redirecionar para reset-password mantendo o hash
      navigate(`/reset-password${window.location.hash}`, { replace: true });
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Validate inputs
      const validatedData = authSchema.parse({ email, password });

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) {
          throw error;
        }

        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar a conta.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: validatedData.email,
          password: validatedData.password
        });
        
        if (error) {
          throw error;
        }

        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
        navigate('/');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        logger.error('Auth error:', error);
        
        // User-friendly error messages
        let message = 'Ocorreu um erro. Tente novamente.';
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email ou senha incorretos.';
        } else if (error.message.includes('User already registered')) {
          message = 'Este email já está cadastrado.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Por favor, confirme seu email antes de fazer login.';
        }
        
        toast({
          title: "Erro de autenticação",
          description: message,
          variant: "destructive",
        });
      }
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
              <h2 className="text-2xl font-bold text-foreground">
                {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
              </h2>
              <p className="text-center text-muted-foreground mt-2">
                {isSignUp 
                  ? 'Crie sua conta para começar' 
                  : 'Entre com suas credenciais'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Email ou Telefone
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  name="email"
                  inputMode="email"
                  autoComplete="username"
                  className="flex h-12 w-full rounded-apple-md border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-apple-base"
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive animate-apple-slide-up">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword}
                    className="text-xs text-blue-500 hover:underline transition-apple-fast disabled:opacity-50"
                  >
                    {isResettingPassword ? 'Enviando...' : 'Esqueceu a senha?'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    name="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    className="flex h-12 w-full rounded-apple-md border border-white/10 bg-white/5 px-4 py-2 pr-16 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-apple-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive animate-apple-slide-up">{validationErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 text-white font-medium rounded-apple-md transition-apple-base shadow-apple-sm hover:shadow-apple-md active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="px-4 text-sm text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Toggle Login/Signup */}
              <p className="text-sm text-center text-muted-foreground">
                {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={isLoading}
                  className="text-blue-500 font-medium hover:underline transition-apple-fast disabled:opacity-50"
                >
                  {isSignUp ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
