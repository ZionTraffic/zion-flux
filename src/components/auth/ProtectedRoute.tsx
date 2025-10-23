import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // ACESSO IRRESTRITO PARA GEORGE - MASTER DO SISTEMA
      if (session?.user?.email === 'george@ziontraffic.com.br') {
        console.log('[AUTH] MASTER ACCESS GRANTED: george@ziontraffic.com.br - ACESSO TOTAL');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
