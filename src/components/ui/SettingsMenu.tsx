import { Settings, Users, Plug, CreditCard, LogOut, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const SettingsMenu = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="glass hover:glass-medium"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 glass-heavy backdrop-blur-xl border-border/50"
      >
        <DropdownMenuLabel className="text-foreground">Configurações</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => handleNavigation("/configuracoes?tab=users")}
          className="cursor-pointer hover:bg-accent/50"
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Usuários e Permissões</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigation("/configuracoes?tab=databases")}
          className="cursor-pointer hover:bg-accent/50"
        >
          <Database className="mr-2 h-4 w-4" />
          <span>Bancos de Dados</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigation("/configuracoes?tab=integrations")}
          className="cursor-pointer hover:bg-accent/50"
        >
          <Plug className="mr-2 h-4 w-4" />
          <span>Integrações</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigation("/configuracoes?tab=plans")}
          className="cursor-pointer hover:bg-accent/50"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Planos e Cobrança</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-destructive/50 text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
