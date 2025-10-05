import { RefreshCw, Download, Settings, BarChart3, Brain, Workflow, FileText, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSelector } from "./WorkspaceSelector";
import { useNavigate, useLocation } from "react-router-dom";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-medium">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Zion App</h1>
              <p className="text-xs text-muted-foreground">Premium Analytics</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
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
              onClick={() => navigate("/global")}
              className={location.pathname === "/global" ? "bg-primary/10 text-primary" : ""}
            >
              <Globe className="h-4 w-4 mr-2" />
              Global
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/operations")}
              className={location.pathname === "/operations" ? "bg-primary/10 text-primary" : ""}
            >
              <Workflow className="h-4 w-4 mr-2" />
              Operações
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/trainer")}
              className={location.pathname === "/trainer" ? "bg-primary/10 text-primary" : ""}
            >
              <Brain className="h-4 w-4 mr-2" />
              Treinador IA
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reports")}
              className={location.pathname === "/reports" ? "bg-primary/10 text-primary" : ""}
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/workspaces")}
              className={location.pathname === "/workspaces" ? "bg-primary/10 text-primary" : ""}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Workspaces
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <WorkspaceSelector 
            current={currentWorkspace} 
            onChange={onWorkspaceChange} 
          />

          {lastUpdate && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            <span className="text-xs text-accent font-medium">Live</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="glass hover:glass-medium"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Atualizar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="glass hover:glass-medium"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Exportar</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="glass hover:glass-medium"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
