import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Campaign {
  name: string;
  spend: number;
  roi: number;
}

interface TopCampaignsTableProps {
  campaigns: Campaign[];
  worstCampaign?: Campaign;
}

export const TopCampaignsTable = ({ campaigns, worstCampaign }: TopCampaignsTableProps) => {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass rounded-2xl p-6 border border-border/50 shadow-premium"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          🏆 Top 3 Campanhas
        </h3>
        <p className="text-xs text-muted-foreground">
          Melhor performance por ROI
        </p>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign, index) => {
          const estimatedReturn = campaign.spend * (campaign.roi / 100 + 1);
          
          return (
            <motion.div
              key={campaign.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="glass rounded-lg p-4 border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{medals[index]}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate mb-2">
                    {campaign.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Investido</p>
                      <p className="font-medium text-foreground">
                        R$ {campaign.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retorno Est.</p>
                      <p className="font-medium text-foreground">
                        R$ {estimatedReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">
                      ROI: {campaign.roi.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {worstCampaign && worstCampaign.roi < 100 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="glass rounded-lg p-4 border border-destructive/30 bg-destructive/5"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate mb-1">
                  Pior: {worstCampaign.name}
                </h4>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-bold text-destructive">
                    ROI: {worstCampaign.roi.toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Considere pausar ou otimizar
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
