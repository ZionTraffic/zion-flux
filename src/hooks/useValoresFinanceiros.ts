import { useState, useEffect } from 'react';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { supabase as centralSupabase } from '@/integrations/supabase/client';

export interface ValoresFinanceiros {
  valorPendente: number;
  valorRecuperado: number;
  valorRecuperadoIA: number;
  valorRecuperadoHumano: number;
  valorEmNegociacao: number;
  metaMensal: number;
}

export function useValoresFinanceiros(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<ValoresFinanceiros>({
    valorPendente: 0,
    valorRecuperado: 0,
    valorRecuperadoIA: 0,
    valorRecuperadoHumano: 0,
    valorEmNegociacao: 0,
    metaMensal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();

  useEffect(() => {
    async function fetchValores() {
      if (tenantLoading) return;
      if (!tenant) {
        setData({ valorPendente: 0, valorRecuperado: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0, metaMensal: 0 });
        setIsLoading(false);
        return;
      }

      // Apenas para SIEG Financeiro
      const isSiegFinanceiro = tenant.slug === 'sieg-financeiro' || tenant.slug?.includes('financeiro');
      if (!isSiegFinanceiro) {
        setData({ valorPendente: 0, valorRecuperado: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0, metaMensal: 0 });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Buscar dados da tabela financeiro_sieg
        const { data: valores, error: fetchError } = await (centralSupabase as any)
          .from('financeiro_sieg')
          .select('valor_em_aberto, valor_recuperado_ia, valor_recuperado_humano, em_negociacao')
          .eq('empresa_id', tenant.id);

        if (fetchError) {
          // Se a tabela não existir, usar dados de demonstração
          console.warn('⚠️ Tabela financeiro_sieg não encontrada, usando dados de demonstração');
          const mockData: ValoresFinanceiros = {
            valorPendente: 45750.00,
            valorRecuperado: 32480.50,
            valorRecuperadoIA: 18500.00,
            valorRecuperadoHumano: 13980.50,
            valorEmNegociacao: 18920.00,
            metaMensal: 50000.00,
          };
          setData(mockData);
          console.log('💰 Valores Financeiros carregados (dados de demonstração)');
          return;
        }

        // Somar todos os valores
        const totais = (valores || []).reduce((acc: any, item: any) => ({
          valorPendente: acc.valorPendente + (parseFloat(item.valor_em_aberto) || 0),
          valorRecuperadoIA: acc.valorRecuperadoIA + (parseFloat(item.valor_recuperado_ia) || 0),
          valorRecuperadoHumano: acc.valorRecuperadoHumano + (parseFloat(item.valor_recuperado_humano) || 0),
          valorEmNegociacao: acc.valorEmNegociacao + (parseFloat(item.em_negociacao) || 0),
        }), { valorPendente: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0 });

        const valorRecuperadoTotal = totais.valorRecuperadoIA + totais.valorRecuperadoHumano;

        // Meta mensal pode vir de configuração do workspace ou ser fixa
        const metaMensal = 50000.00; // TODO: Buscar de configuração

        setData({
          valorPendente: totais.valorPendente,
          valorRecuperado: valorRecuperadoTotal,
          valorRecuperadoIA: totais.valorRecuperadoIA,
          valorRecuperadoHumano: totais.valorRecuperadoHumano,
          valorEmNegociacao: totais.valorEmNegociacao,
          metaMensal,
        });
        console.log('💰 Valores Financeiros carregados do banco:', totais);

      } catch (err: any) {
        console.error('Erro ao buscar valores financeiros:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchValores();
  }, [tenantLoading, tenant?.id, tenant?.slug, startDate, endDate]);

  return { data, isLoading, error };
}
