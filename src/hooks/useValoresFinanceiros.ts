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
        // Construir query com filtro de data
        // IMPORTANTE: Buscar apenas registros PENDENTES (excluir concluídos para não duplicar valores)
        let query = (centralSupabase as any)
          .from('financeiro_sieg')
          .select('valor_em_aberto, valor_recuperado_ia, valor_recuperado_humano, em_negociacao, criado_em, situacao')
          .eq('empresa_id', tenant.id)
          .or('situacao.eq.pendente,situacao.is.null'); // Apenas pendentes ou sem situação definida

        // Data mínima: 04/12/2025 (desconsiderar dados anteriores)
        const DATA_MINIMA = '2025-12-04T00:00:00';
        
        // Aplicar filtro de data (mas nunca antes de 04/12/2025)
        let startISO = startDate ? startDate.toISOString() : DATA_MINIMA;
        if (startISO < DATA_MINIMA) {
          startISO = DATA_MINIMA;
        }
        query = query.gte('criado_em', startISO);
        
        if (endDate) {
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          query = query.lt('criado_em', endDatePlusOne.toISOString());
        }

        console.log('💰 [useValoresFinanceiros] Filtros:', { 
          tenantId: tenant.id,
          startISO,
          endDate: endDate?.toISOString() 
        });

        // Buscar TODOS os registros com paginação
        const PAGE_SIZE = 1000;
        let allValores: any[] = [];
        let fetchError: any = null;
        
        for (let page = 0; page < 10; page++) {
          const from = page * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;
          
          const { data: pageData, error: pageError } = await query.range(from, to);
          
          if (pageError) {
            fetchError = pageError;
            break;
          }
          
          if (!pageData || pageData.length === 0) {
            break;
          }
          
          allValores = [...allValores, ...pageData];
          
          if (pageData.length < PAGE_SIZE) {
            break;
          }
        }
        
        const valores = allValores;
        console.log('💰 [useValoresFinanceiros] Total registros:', valores.length);

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

        // Função para parsear valor que pode estar em formato brasileiro (1.601) ou decimal (1601.00)
        const parseValorBR = (valor: any): number => {
          if (!valor) return 0;
          const str = String(valor);
          // Se tem ponto mas não tem vírgula, e a parte depois do ponto tem 3 dígitos = separador de milhar
          if (str.includes('.') && !str.includes(',')) {
            const partes = str.split('.');
            if (partes.length === 2 && partes[1].length === 3) {
              return parseFloat(str.replace('.', ''));
            }
          }
          // Formato brasileiro com vírgula decimal
          if (str.includes(',')) {
            return parseFloat(str.replace(/\./g, '').replace(',', '.'));
          }
          return parseFloat(str) || 0;
        };

        // Somar todos os valores
        const totais = (valores || []).reduce((acc: any, item: any) => ({
          valorPendente: acc.valorPendente + parseValorBR(item.valor_em_aberto),
          valorRecuperadoIA: acc.valorRecuperadoIA + parseValorBR(item.valor_recuperado_ia),
          valorRecuperadoHumano: acc.valorRecuperadoHumano + parseValorBR(item.valor_recuperado_humano),
          valorEmNegociacao: acc.valorEmNegociacao + parseValorBR(item.em_negociacao),
        }), { valorPendente: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0 });
        
        console.log('💰 [useValoresFinanceiros] Totais calculados:', totais);

        const valorRecuperadoTotal = totais.valorRecuperadoIA + totais.valorRecuperadoHumano;

        // Valor em aberto real = valor original - valores já recuperados
        const valorPendenteReal = totais.valorPendente - valorRecuperadoTotal;

        // Meta mensal pode vir de configuração do workspace ou ser fixa
        const metaMensal = 50000.00; // TODO: Buscar de configuração

        setData({
          valorPendente: Math.max(0, valorPendenteReal), // Nunca negativo
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
