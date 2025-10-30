import React from "react";
import { RefreshCw, Download, Layers, MessageSquare, LogOut, Home, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { SettingsMenu } from "./SettingsMenu";
import { MenuBar } from "./glow-menu";
import { MobileMenu } from "./MobileMenu";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoZion from "@/assets/logo-zion.jpg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/types/permissions";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: Date | null;
  currentWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string) => Promise<void>;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export const Header = ({ onRefresh, isRefreshing, lastUpdate, currentWorkspace, onWorkspaceChange, onExportPdf, isExporting }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { canAccessAnalysis, canAccessSettings } = useUserRole();
  const { 
    canViewDashboard, 
    canViewTraffic, 
    canViewQualification, 
    canViewAnalysis,
    loading: permissionsLoading
  } = usePermissions();

  // Verificar se é o usuário master
  const [isMasterUser, setIsMasterUser] = React.useState(false);
  
  React.useEffect(() => {
    const checkMasterUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'george@ziontraffic.com.br') {
        setIsMasterUser(true);
        console.log('🔓 MASTER USER - Mostrando todos os itens do menu');
      }
    };
    checkMasterUser();
  }, []);

  // Debug: Log para verificar se o Header está sendo renderizado
  console.log('[Header] Renderizando Header', { 
    currentWorkspace, 
    location: location.pathname, 
    isMasterUser,
    canAccessSettings,
    shouldShowSettings: isMasterUser || canAccessSettings
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const allMenuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Tráfego",
      href: "/trafego",
      gradient: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.06) 50%, rgba(217,119,6,0) 100%)",
      iconColor: "text-amber-400",
    },
    {
      icon: Layers,
      label: "Qualificação",
      href: "/qualificacao",
      gradient: "radial-gradient(circle, rgba(175,82,222,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
      iconColor: "text-secondary",
    },
    {
      icon: MessageSquare,
      label: "Análise",
      href: "/analise",
      gradient: "radial-gradient(circle, rgba(52,199,89,0.15) 0%, rgba(34,197,94,0.06) 50%, rgba(22,163,74,0) 100%)",
      iconColor: "text-accent",
    },
  ];

  // Filter menu items based on user permissions
  // Master user vê todos os itens, EXCETO regras específicas de workspace (como Tráfego para Sieg)
  const menuItems = allMenuItems.filter(item => {
    // Se ainda está carregando permissões, mostrar todos os itens temporariamente
    if (permissionsLoading) {
      return true;
    }
    
    let shouldShow = true;
    switch (item.label) {
      case 'Dashboard':
        shouldShow = isMasterUser || canViewDashboard();
        break;
      case 'Tráfego':
        // Master user sempre vê Tráfego, EXCETO no workspace Sieg
        if (isMasterUser) {
          // Verificar se é workspace Sieg
          const isSiegWorkspace = currentWorkspace?.name?.toLowerCase().includes('sieg') || 
                                 currentWorkspace?.slug === 'sieg';
          shouldShow = !isSiegWorkspace; // Mostrar para ASF, ocultar para SIEG
          console.log('🔑 [Header] MASTER USER - Tráfego:', { 
            shouldShow, 
            isSiegWorkspace,
            workspaceName: currentWorkspace?.name,
            workspaceSlug: currentWorkspace?.slug
          });
        } else {
          shouldShow = canViewTraffic();
          console.log('🔍 [Header] Filtro Tráfego (não-master):', { 
            shouldShow, 
            currentWorkspace, 
            permissionsLoading
          });
        }
        break;
      case 'Qualificação':
        shouldShow = isMasterUser || canViewQualification();
        break;
      case 'Análise':
        shouldShow = isMasterUser || canViewAnalysis();
        break;
      default:
        shouldShow = true;
    }
    return shouldShow;
  });
  
  console.log('📋 [Header] Menu items filtrados:', menuItems.map(i => i.label));

  const getActiveItem = () => {
    const path = location.pathname;
    const item = menuItems.find(i => i.href === path);
    return item?.label || "";
  };

  const handleMenuClick = (label: string) => {
    const item = menuItems.find(i => i.label === label);
    if (item) navigate(item.href);
  };
  
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* Mobile Menu Button */}
            <MobileMenu
              items={menuItems}
              activeItem={getActiveItem()}
              onItemClick={handleMenuClick}
              currentWorkspace={currentWorkspace}
              onWorkspaceChange={onWorkspaceChange}
            />

            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src={logoZion} 
                alt="Zion Analytics" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-glow-blue" 
              />
              <div className="hidden sm:block">
                <h1 className="text-base lg:text-lg font-bold tracking-tight">Zion Analytics</h1>
                <p className="text-xs text-muted-foreground">Premium Dashboard</p>
              </div>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden lg:block">
              <MenuBar 
                items={menuItems}
                activeItem={getActiveItem()}
                onItemClick={handleMenuClick}
                className="scale-90 xl:scale-100"
              />
            </div>
          </div>

          {/* Center Section: Workspace Selector */}
          <div className="flex flex-1 justify-center items-center gap-4 max-w-2xl">
            <WorkspaceSelector 
              current={currentWorkspace} 
              onChange={onWorkspaceChange} 
            />
          </div>

          {/* Right Section: Status + Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Live Status Indicator (Hidden on Mobile) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full glass">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                  <span className="text-xs text-accent font-medium">Live</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conectado ao Banco de Dados</p>
              </TooltipContent>
            </Tooltip>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="glass hover:glass-medium"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atualizar dados</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="glass hover:glass-medium hidden sm:flex"
                    onClick={onExportPdf}
                    disabled={isExporting}
                  >
                    <Download className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExporting ? 'Gerando PDF...' : 'Exportar relatório'}</p>
                </TooltipContent>
              </Tooltip>

              {(isMasterUser || canAccessSettings) && (
                <div className="hidden sm:block">
                  <SettingsMenu />
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="glass hover:glass-medium text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
