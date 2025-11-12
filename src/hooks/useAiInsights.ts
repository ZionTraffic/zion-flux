import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { generateAiInsights, AiInsight } from '@/utils/insightsGenerator';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

export function useAiInsights() {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (tenantLoading) return;
      if (!tenant) {
        setInsights([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const thirtyDaysAgo = subDays(new Date(), 30);
        const from = format(thirtyDaysAgo, 'yyyy-MM-dd');
        const to = format(new Date(), 'yyyy-MM-dd');

        const { data: leadsData, error: leadsError } = await (centralSupabase.from as any)
          ('tenant_conversations')
          .select('created_at, tag')
          .eq('tenant_id', tenant.id)
          .gte('created_at', `${from}T00:00:00`)
          .lte('created_at', `${to}T23:59:59`)
          .limit(50000);

        if (leadsError) throw leadsError;

        const { data: costData, error: costError } = await (centralSupabase.from as any)
          ('tenant_ad_costs')
          .select('amount, day')
          .eq('tenant_id', tenant.id)
          .gte('day', from)
          .lte('day', to);

        if (costError) throw costError;

        const leads = leadsData || [];
        const totalLeads = leads.length;
        const qualifiedLeads = leads.filter((lead) => {
          const tag = (lead.tag || '').toLowerCase();
          if (tenant.slug === 'sieg') {
            return tag.includes('t3') || tag.includes('pago');
          }
          return tag.includes('qualificado') || tag.includes('t3');
        }).length;

        const totalInvestment = (costData || []).reduce((sum: number, cost: any) => {
          const amount = typeof cost.amount === 'string' ? parseFloat(cost.amount) : cost.amount || 0;
          return sum + amount;
        }, 0);

        const conversion = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
        const cpl = qualifiedLeads > 0 ? totalInvestment / qualifiedLeads : 0;

        const workspaceMetrics = [{
          id: tenant.id,
          name: tenant.name,
          conversion,
          cpl,
          leads: totalLeads,
          investment: totalInvestment,
        }];

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

    // Auto-refresh every 5 minutos
    const interval = setInterval(fetchInsights, 300000);
    return () => clearInterval(interval);
  }, [tenantLoading, tenant?.id]);

  return { insights, isLoading, error };
}
