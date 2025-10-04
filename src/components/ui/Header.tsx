import { RefreshCw, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: Date | null;
}

export const Header = ({ onRefresh, isRefreshing, lastUpdate }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-medium">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Zion App</h1>
              <p className="text-xs text-muted-foreground">ASF Finance Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
