import { RefreshCw, Download, BarChart3, Layers, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { SettingsMenu } from "./SettingsMenu";
import { useNavigate, useLocation } from "react-router-dom";
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
  currentWorkspace: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

export const Header = ({ onRefresh, isRefreshing, lastUpdate, currentWorkspace, onWorkspaceChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-medium">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-xl font-bold">Z</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold tracking-tight">Zion App</h1>
                <p className="text-xs text-muted-foreground">Premium Analytics</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className={location.pathname === "/" ? "bg-primary/10 text-primary" : ""}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/qualificacao")}
                className={location.pathname === "/qualificacao" ? "bg-primary/10 text-primary" : ""}
              >
                <Layers className="h-4 w-4 mr-2" />
                Qualificação
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/conversas")}
                className={location.pathname === "/conversas" ? "bg-primary/10 text-primary" : ""}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversas
              </Button>
            </nav>
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
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
