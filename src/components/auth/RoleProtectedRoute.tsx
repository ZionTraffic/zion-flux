import { Navigate } from 'react-router-dom';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * SECURITY NOTE: This component provides route-level UX protection only.
 * Actual authorization is enforced server-side through RLS policies on all database tables.
 * Client-side route protection can be bypassed via DevTools but RLS prevents unauthorized data access.
 */
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { role, loading } = useUserRole();
  const [isMasterUser, setIsMasterUser] = useState(false);
  const [checkingMaster, setCheckingMaster] = useState(true);

  useEffect(() => {
    const checkMasterUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const masterEmails = ['george@ziontraffic.com.br', 'leonardobasiliozion@gmail.com', 'eliasded51@gmail.com'];
      if (masterEmails.includes(user?.email || '')) {
        setIsMasterUser(true);
        console.log('🔓 MASTER USER - Bypass de proteção de rota:', user?.email);
      }
      setCheckingMaster(false);
    };
    checkMasterUser();
  }, []);

  if (loading || checkingMaster) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Master user sempre tem acesso
  if (isMasterUser) {
    return <>{children}</>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
}
