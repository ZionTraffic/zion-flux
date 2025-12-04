import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

export interface TagCountsHistorico {
  'T1 - SEM RESPOSTA': number;
  'T2 - RESPONDIDO': number;
  'T3 - PAGO IA': number;
  'T4 - TRANSFERIDO': number;
  'T5 - PASSÍVEL DE SUSPENSÃO': number;
}

const DATA_MINIMA = '2025-12-04T00:00:00';

export function useTagCountsHistorico() {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [counts, setCounts] = useState<TagCountsHistorico>({
    'T1 - SEM RESPOSTA': 0,
    'T2 - RESPONDIDO': 0,
    'T3 - PAGO IA': 0,
    'T4 - TRANSFERIDO': 0,
    'T5 - PASSÍVEL DE SUSPENSÃO': 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      if (tenantLoading || !tenant) return;

      const isSiegFinanceiro = tenant.slug === 'sieg-financeiro' || tenant.slug?.includes('financeiro');
      if (!isSiegFinanceiro) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Buscar contagens do histórico de tags (leads únicos por estágio)
        const { data: historicoData, error: historicoError } = await (centralSupabase as any)
          .from('historico_tags_lead')
          .select('lead_id, estagio_novo')
          .eq('empresa_id', tenant.id)
          .gte('criado_em', DATA_MINIMA)
          .not('estagio_novo', 'is', null);

        if (historicoError) {
          console.error('Erro ao buscar histórico:', historicoError);
        }

        // Contar leads únicos por estágio
        const leadsPerEstagio: Record<string, Set<string>> = {
          'T1': new Set(),
          'T2': new Set(),
          'T3': new Set(),
          'T4': new Set(),
          'T5': new Set(),
        };

        (historicoData || []).forEach((item: any) => {
          if (item.estagio_novo && leadsPerEstagio[item.estagio_novo]) {
            leadsPerEstagio[item.estagio_novo].add(item.lead_id);
          }
        });

        // Também buscar leads com valor_recuperado_ia > 0 ou valor_recuperado_humano > 0
        const { data: pagosData } = await (centralSupabase as any)
          .from('financeiro_sieg')
          .select('id')
          .eq('empresa_id', tenant.id)
          .gte('criado_em', DATA_MINIMA)
          .or('valor_recuperado_ia.gt.0,valor_recuperado_humano.gt.0');

        // Adicionar ao T3 os que pagaram
        (pagosData || []).forEach((item: any) => {
          leadsPerEstagio['T3'].add(item.id);
        });

        setCounts({
          'T1 - SEM RESPOSTA': leadsPerEstagio['T1'].size,
          'T2 - RESPONDIDO': leadsPerEstagio['T2'].size,
          'T3 - PAGO IA': leadsPerEstagio['T3'].size,
          'T4 - TRANSFERIDO': leadsPerEstagio['T4'].size,
          'T5 - PASSÍVEL DE SUSPENSÃO': leadsPerEstagio['T5'].size,
        });

        console.log('📊 [useTagCountsHistorico] Contagens históricas:', {
          T1: leadsPerEstagio['T1'].size,
          T2: leadsPerEstagio['T2'].size,
          T3: leadsPerEstagio['T3'].size,
          T4: leadsPerEstagio['T4'].size,
          T5: leadsPerEstagio['T5'].size,
        });

      } catch (err) {
        console.error('Erro ao buscar contagens:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCounts();
  }, [tenant?.id, tenant?.slug, tenantLoading]);

  return { counts, isLoading };
}
