import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { generateAiInsights, AiInsight } from '@/utils/insightsGenerator';

export function useAiInsights() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const from = format(thirtyDaysAgo, 'yyyy-MM-dd');
        const to = format(new Date(), 'yyyy-MM-dd');

        // Fetch all workspaces
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('id, name')
          .order('name');

        if (workspacesError) throw workspacesError;

        if (!workspacesData || workspacesData.length === 0) {
          setInsights([{
            id: 1,
            title: "Bem-vindo ao Analytics",
            description: "Crie seu primeiro workspace para começar a receber insights inteligentes baseados em dados reais.",
            type: "success",
            iconName: "Target",
            priority: 1,
          }]);
          setIsLoading(false);
          return;
        }

        // Fetch metrics for each workspace
        const metricsPromises = workspacesData.map(async (workspace) => {
          const { data: kpiData } = await supabase.rpc('kpi_totais_periodo', {
            p_workspace_id: workspace.id,
            p_from: from,
            p_to: to,
          });

          const kpi = kpiData?.[0] || {
            recebidos: 0,
            qualificados: 0,
            investimento: 0,
            cpl: 0,
          };

          const conversion = kpi.recebidos > 0 ? (kpi.qualificados / kpi.recebidos) * 100 : 0;
          const cpl = typeof kpi.cpl === 'string' ? parseFloat(kpi.cpl) : kpi.cpl || 0;
          const investment = typeof kpi.investimento === 'string' ? parseFloat(kpi.investimento) : kpi.investimento || 0;

          return {
            id: workspace.id,
            name: workspace.name,
            conversion,
            cpl,
            leads: kpi.recebidos,
            investment,
          };
        });

        const workspaceMetrics = await Promise.all(metricsPromises);
        const generatedInsights = generateAiInsights(workspaceMetrics);
        
        setInsights(generatedInsights);
      } catch (err: any) {
        setError(err.message);
        // Fallback to default insight
        setInsights([{
          id: 1,
          title: "Erro ao carregar insights",
          description: "Não foi possível carregar os insights. Verifique sua conexão e tente novamente.",
          type: "alert",
          iconName: "AlertTriangle",
          priority: 1,
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchInsights, 300000);
    return () => clearInterval(interval);
  }, []);

  return { insights, isLoading, error };
}
