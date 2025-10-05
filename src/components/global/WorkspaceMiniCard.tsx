import { motion } from "framer-motion";
import { Building2, TrendingUp, DollarSign, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface WorkspaceMiniCardProps {
  workspaceId: string;
  workspaceName: string;
  leads: number;
  conversions: number;
  spend: number;
  cpl: number;
  index: number;
}

export function WorkspaceMiniCard({
  workspaceId,
  workspaceName,
  leads,
  conversions,
  spend,
  cpl,
  index,
}: WorkspaceMiniCardProps) {
  const navigate = useNavigate();
  const { setCurrentWorkspaceId } = useWorkspace();

  const handleViewDetails = () => {
    setCurrentWorkspaceId(workspaceId);
    navigate('/');
  };

  const conversionRate = leads > 0 ? (conversions / leads) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass rounded-2xl p-5 border border-border/50 hover:shadow-xl hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <Building2 className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{workspaceName}</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3 w-3 text-emerald-400" />
            <p className="text-xs text-emerald-400">Leads</p>
          </div>
          <p className="text-lg font-bold">{leads}</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <p className="text-xs text-blue-400">Conversão</p>
          </div>
          <p className="text-lg font-bold">{conversionRate.toFixed(1)}%</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-3 w-3 text-amber-400" />
            <p className="text-xs text-amber-400">Gasto</p>
          </div>
          <p className="text-lg font-bold">R$ {spend.toFixed(0)}</p>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3 w-3 text-violet-400" />
            <p className="text-xs text-violet-400">CPL</p>
          </div>
          <p className="text-lg font-bold">R$ {cpl.toFixed(2)}</p>
        </div>
      </div>

      <Button
        onClick={handleViewDetails}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
        size="sm"
      >
        Ver Detalhes
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );
}
