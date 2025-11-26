import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { generateAiInsights, AiInsight } from '@/utils/insightsGenerator';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';
import {
  normalizeStage,
  extractPrimaryTag,
  toStartOfDayIso,
  buildEndExclusiveIso,
} from '@/hooks/useLeadsShared';

export function useAiInsights() {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const { getStageFromTag, loading: mappingsLoading } = useTagMappings(tenant?.id || null);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (tenantLoading || mappingsLoading) return;
      if (!tenant) {
        setInsights([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 30);
        const startISO = toStartOfDayIso(startDate);
        const endISO = buildEndExclusiveIso(endDate);
        const rangeStart = format(startDate, 'yyyy-MM-dd');
        const rangeEnd = format(endDate, 'yyyy-MM-dd');

        const { data: leadsData, error: leadsError } = await (centralSupabase.from as any)
          ('leads')
          .select('id, empresa_id, criado_em, status, tags_atuais, metadados')
          .eq('empresa_id', tenant.id)
          .gte('criado_em', startISO)
          .lt('criado_em', endISO)
          .limit(50000);

        if (leadsError) throw leadsError;

        const { data: costData, error: costError } = await (centralSupabase.from as any)
          ('custos_anuncios_tenant')
          .select('valor, dia')
          .eq('tenant_id', tenant.id)
          .gte('dia', rangeStart)
          .lte('dia', rangeEnd);

        if (costError) throw costError;

        const leads = (leadsData || []).map((lead: any) => {
          const primaryTag = extractPrimaryTag(lead.metadados, lead.tags_atuais);
          const mappedStage = primaryTag && getStageFromTag ? getStageFromTag(primaryTag) : undefined;
          const stage = normalizeStage(mappedStage ?? lead.status, tenant.slug, primaryTag);
          return { ...lead, stage };
        });

        const totalLeads = leads.length;
        const qualifiedLeads = leads.filter((lead) => lead.stage === 'qualificados').length;

        const totalInvestment = (costData || []).reduce((sum: number, cost: any) => {
          const amount = typeof cost.valor === 'string' ? parseFloat(cost.valor) : cost.valor || 0;
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
  }, [tenantLoading, mappingsLoading, tenant?.id, tenant?.slug, getStageFromTag]);

  return { insights, isLoading, error };
}
