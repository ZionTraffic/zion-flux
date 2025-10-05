import { motion } from "framer-motion";
import { Building2, TrendingUp, Users, Brain, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Workspace } from "@/hooks/useWorkspaces";

interface WorkspaceCardProps {
  workspace: Workspace;
  index: number;
}

export function WorkspaceCard({ workspace, index }: WorkspaceCardProps) {
  const navigate = useNavigate();
  const { setCurrentWorkspaceId } = useWorkspace();

  const handleOpenDashboard = () => {
    setCurrentWorkspaceId(workspace.id);
    navigate('/');
  };

  const handleOpenReports = () => {
    setCurrentWorkspaceId(workspace.id);
    navigate('/reports');
  };

  const kpis = [
    {
      icon: Users,
      label: "Leads no Mês",
      value: workspace.kpis?.leads || 0,
      colorScheme: "blue",
    },
    {
      icon: TrendingUp,
      label: "Conversões",
      value: `${(workspace.kpis?.conversions || 0).toFixed(1)}%`,
      colorScheme: "emerald",
    },
    {
      icon: Brain,
      label: "Eficiência IA",
      value: `${Math.floor((workspace.kpis?.aiEfficiency || 0) / 60)}m ${(workspace.kpis?.aiEfficiency || 0) % 60}s`,
      colorScheme: "purple",
    },
    {
      icon: MessageCircle,
      label: "Conversas Ativas",
      value: workspace.kpis?.activeConversations || 0,
      colorScheme: "amber",
    },
  ];

  const colorSchemes = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass rounded-2xl p-6 border border-border/50 hover:shadow-xl hover:border-white/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{workspace.name}</h3>
            <p className="text-sm text-muted-foreground">
              Criada em {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl bg-gradient-to-br ${colorSchemes[kpi.colorScheme as keyof typeof colorSchemes]} border`}
          >
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className="h-4 w-4" />
              <p className="text-xs font-medium opacity-80">{kpi.label}</p>
            </div>
            <p className="text-xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleOpenDashboard}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
        >
          Abrir Painel
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button
          onClick={handleOpenReports}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          Relatórios
        </Button>
      </div>
    </motion.div>
  );
}
