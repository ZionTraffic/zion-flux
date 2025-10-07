import { RefreshCw, Download, BarChart3, Layers, MessageSquare, LogOut, TrendingUp, Facebook, Search, MapPin, Calculator, Home, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { SettingsMenu } from "./SettingsMenu";
import { MenuBar } from "./glow-menu";
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

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: Date | null;
  currentWorkspace: string | null;
  onWorkspaceChange: (workspaceId: string) => Promise<void>;
}

export const Header = ({ onRefresh, isRefreshing, lastUpdate, currentWorkspace, onWorkspaceChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
  
  const menuItems = [
    {
      icon: Home,
      label: "Visão Geral",
      href: "/",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Mês vs Dia",
      href: "/mes-vs-dia",
      gradient: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.06) 50%, rgba(217,119,6,0) 100%)",
      iconColor: "text-amber-400",
    },
    {
      icon: Facebook,
      label: "Facebook ADS",
      href: "/facebook-ads",
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
    },
    {
      icon: Search,
      label: "Google ADS",
      href: "/google-ads",
      gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
      iconColor: "text-red-500",
    },
    {
      icon: MapPin,
      label: "Rastreamento",
      href: "/rastreamento",
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
    },
    {
      icon: Calculator,
      label: "Calculadoras",
      href: "/calculadoras",
      gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
      iconColor: "text-purple-500",
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
      label: "Conversas",
      href: "/conversas",
      gradient: "radial-gradient(circle, rgba(52,199,89,0.15) 0%, rgba(34,197,94,0.06) 50%, rgba(22,163,74,0) 100%)",
      iconColor: "text-accent",
    },
    {
      icon: BarChart3,
      label: "Configurações",
      href: "/configuracoes",
      gradient: "radial-gradient(circle, rgba(148,163,184,0.15) 0%, rgba(100,116,139,0.06) 50%, rgba(71,85,105,0) 100%)",
      iconColor: "text-muted-foreground",
    },
  ];

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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-medium">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src={logoZion} 
                alt="Zion Analytics" 
                className="w-12 h-12 rounded-full object-cover shadow-glow-blue" 
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">Zion Analytics</h1>
                <p className="text-xs text-muted-foreground">Premium Dashboard</p>
              </div>
            </div>

            {/* Navigation Menu with Glow Effect */}
            <div className="hidden lg:block">
              <MenuBar 
                items={menuItems}
                activeItem={getActiveItem()}
                onItemClick={handleMenuClick}
              />
            </div>
          </div>

          {/* Center Section: Workspace Selector */}
          <div className="hidden md:flex flex-1 justify-center max-w-xs">
            <WorkspaceSelector 
              current={currentWorkspace} 
              onChange={onWorkspaceChange} 
            />
          </div>

          {/* Right Section: Status + Actions */}
          <div className="flex items-center gap-3">
            {/* Live Status Indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full glass">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                  <span className="text-xs text-accent font-medium">Live</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conectado ao Supabase</p>
              </TooltipContent>
            </Tooltip>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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
                    className="glass hover:glass-medium"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar relatório</p>
                </TooltipContent>
              </Tooltip>

              <SettingsMenu />

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
