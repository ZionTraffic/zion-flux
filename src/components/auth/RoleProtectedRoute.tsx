import { Navigate } from 'react-router-dom';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/no-access" replace />;
  }

  return <>{children}</>;
}
