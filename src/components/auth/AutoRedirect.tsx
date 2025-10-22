import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

/**
 * Componente que redireciona automaticamente o usuário para a primeira página
 * que ele tem permissão de acessar, caso tente acessar uma página sem permissão
 */
export function AutoRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { isOwner, loading: roleLoading } = useUserRole();
  const {
    canViewDashboard,
    canViewTraffic,
    canViewQualification,
    canViewAnalysis,
    loading: permissionsLoading
  } = usePermissions();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  useEffect(() => {
    // MASTER ACCESS: George nunca é redirecionado
    if (userEmail === 'george@ziontraffic.com.br') {
      return;
    }

    // Não fazer nada enquanto está carregando
    if (roleLoading || permissionsLoading) return;

    // Owners têm acesso a tudo, não precisam de redirecionamento
    if (isOwner) return;

    // Lista de páginas em ordem de prioridade
    const routes = [
      { path: '/', canAccess: canViewDashboard },
      { path: '/trafego', canAccess: canViewTraffic },
      { path: '/qualificacao', canAccess: canViewQualification },
      { path: '/analise', canAccess: canViewAnalysis },
    ];

    // Verificar se o usuário pode acessar a página atual
    const currentRoute = routes.find(r => r.path === location.pathname);
    
    if (currentRoute && !currentRoute.canAccess()) {
      // Usuário não tem permissão para a página atual
      // Redirecionar para a primeira página que ele tem acesso
      const firstAccessibleRoute = routes.find(r => r.canAccess());
      
      if (firstAccessibleRoute) {
        console.log(`🔀 Redirecting to ${firstAccessibleRoute.path} - no permission for ${location.pathname}`);
        navigate(firstAccessibleRoute.path, { replace: true });
      } else {
        // Usuário não tem acesso a nenhuma página
        console.log('❌ User has no access to any page');
        navigate('/no-access', { replace: true });
      }
    }
  }, [location.pathname, roleLoading, permissionsLoading, isOwner, canViewDashboard, canViewTraffic, canViewQualification, canViewAnalysis, navigate]);

  return null; // Este componente não renderiza nada
}
