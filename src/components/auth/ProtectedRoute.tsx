import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Verificar se é um link de recovery (reset password) via hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');
    
    console.log('[ProtectedRoute] Checking URL:', { 
      hash: window.location.hash, 
      hashType,
      pathname: window.location.pathname 
    });
    
    if (hashType === 'recovery') {
      console.log('[AUTH] Recovery token detected in hash, redirecting to reset-password');
      setIsRecovery(true);
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // ACESSO IRRESTRITO PARA GEORGE - MASTER DO SISTEMA
      if (session?.user?.email === 'george@ziontraffic.com.br') {
        console.log('[AUTH] MASTER ACCESS GRANTED: george@ziontraffic.com.br - ACESSO TOTAL');
      }
    });

    // Listen for auth changes - detectar evento PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AUTH] Auth state changed:', event);
      
      // Se é um evento de recovery, redirecionar para reset-password
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[AUTH] PASSWORD_RECOVERY event detected, redirecting...');
        setIsRecovery(true);
        return;
      }
      
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se é um link de recovery, redirecionar para reset-password mantendo o hash
  if (isRecovery) {
    const newUrl = `/reset-password${window.location.hash}`;
    return <Navigate to={newUrl} replace />;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // ACESSO IRRESTRITO PARA GEORGE - BYPASS TOTAL
  if (session.user.email === 'george@ziontraffic.com.br') {
    console.log('✅ GEORGE MASTER ACCESS - Bypassing all restrictions');
    return <>{children}</>;
  }

  return <>{children}</>;
}
