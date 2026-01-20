import { useState, useEffect } from 'react';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

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
        // Data mínima: 04/12/2025 (desconsiderar dados anteriores)
        const DATA_MINIMA = new Date('2025-12-04T00:00:00');
        
        // Normalizar datas para início e fim do dia
        let startRange = startDate ? startOfDay(startDate) : DATA_MINIMA;
        if (startRange < DATA_MINIMA) {
          startRange = DATA_MINIMA;
        }
        const startISO = startRange.toISOString();
        
        // Se tem endDate, usar endOfDay + 1 dia para incluir todo o dia
        let endISO: string | null = null;
        if (endDate) {
          const endRange = endOfDay(endDate);
          endISO = new Date(endRange.getTime() + 1).toISOString();
        }

        console.log(`💰 [useValoresFinanceiros] Período: ${startISO} até ${endISO || 'sem fim'}`);

        // NOVA LÓGICA: Buscar TODOS os valores do histórico no período
        // Isso garante que a soma dos dias = total do mês
        // Tipos: pendente, recuperado_ia, recuperado_humano
        let historicoQuery = (centralSupabase as any)
          .from('historico_valores_financeiros')
          .select('tipo_valor, diferenca, telefone, data_registro')
          .eq('empresa_id', tenant.id)
          .in('tipo_valor', ['pendente', 'recuperado_ia', 'recuperado_humano'])
          .gte('data_registro', startISO);
        
        if (endISO) {
          historicoQuery = historicoQuery.lt('data_registro', endISO);
        }
        
        const { data: historicoData, error: historicoError } = await historicoQuery;
        
        if (historicoError) {
          console.error('💰 [useValoresFinanceiros] Erro ao buscar histórico:', historicoError);
          setIsLoading(false);
          return;
        }

        console.log(`💰 [useValoresFinanceiros] Registros no histórico: ${historicoData?.length || 0}`);

        // Calcular valores a partir do histórico
        let valorPendente = 0;
        let valorRecuperadoIA = 0;
        let valorRecuperadoHumano = 0;
        
        if (historicoData && historicoData.length > 0) {
          historicoData.forEach((item: any) => {
            const diferenca = parseFloat(item.diferenca) || 0;
            
            if (item.tipo_valor === 'pendente') {
              // Valor pendente: soma as diferenças (pode ser positivo ou negativo)
              valorPendente += diferenca;
            } else if (item.tipo_valor === 'recuperado_ia') {
              valorRecuperadoIA += diferenca;
            } else if (item.tipo_valor === 'recuperado_humano') {
              valorRecuperadoHumano += diferenca;
            }
          });
          
          console.log(`💰 [useValoresFinanceiros] Valores do histórico:`, {
            pendente: valorPendente,
            recuperadoIA: valorRecuperadoIA,
            recuperadoHumano: valorRecuperadoHumano
          });
        } else {
          console.warn(`💰 [useValoresFinanceiros] Sem dados no histórico para o período`);
        }

        const valorRecuperadoTotal = valorRecuperadoIA + valorRecuperadoHumano;

        // Meta mensal pode vir de configuração do workspace ou ser fixa
        const metaMensal = 50000.00;

        setData({
          valorPendente: Math.max(0, valorPendente), // Nunca negativo
          valorRecuperado: valorRecuperadoTotal,
          valorRecuperadoIA: valorRecuperadoIA,
          valorRecuperadoHumano: valorRecuperadoHumano,
          valorEmNegociacao: 0, // TODO: Implementar histórico de negociação se necessário
          metaMensal,
        });
        
        console.log('💰 [useValoresFinanceiros] Valores finais:', {
          valorPendente,
          valorRecuperado: valorRecuperadoTotal,
          valorRecuperadoIA,
          valorRecuperadoHumano
        });

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
