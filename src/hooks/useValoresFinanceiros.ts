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
  totalEmpresas: number;
}

export function useValoresFinanceiros(startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<ValoresFinanceiros>({
    valorPendente: 0,
    valorRecuperado: 0,
    valorRecuperadoIA: 0,
    valorRecuperadoHumano: 0,
    valorEmNegociacao: 0,
    metaMensal: 0,
    totalEmpresas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();

  useEffect(() => {
    async function fetchValores() {
      if (tenantLoading) return;
      if (!tenant) {
        setData({ valorPendente: 0, valorRecuperado: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0, metaMensal: 0, totalEmpresas: 0 });
        setIsLoading(false);
        return;
      }

      // Apenas para SIEG Financeiro
      const isSiegFinanceiro = tenant.slug === 'sieg-financeiro' || tenant.slug?.includes('financeiro');
      if (!isSiegFinanceiro) {
        setData({ valorPendente: 0, valorRecuperado: 0, valorRecuperadoIA: 0, valorRecuperadoHumano: 0, valorEmNegociacao: 0, metaMensal: 0, totalEmpresas: 0 });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Função para parsear valor - valores já vêm no formato numérico do banco (ex: "1.003" = 1.003)
        const parseValorBR = (valor: any): number => {
          if (!valor) return 0;
          const num = parseFloat(String(valor));
          return isNaN(num) ? 0 : num;
        };

        // ========== MODO SEM FILTRO (GERAL) ==========
        // Quando não tem startDate nem endDate, buscar total geral direto da tabela financeiro_sieg
        if (!startDate && !endDate) {
          console.log(`💰 [useValoresFinanceiros] Modo GERAL - buscando totais sem filtro de data`);
          
          // Buscar todos os registros da tabela financeiro_sieg para este tenant
          const { data: financeiroData, error: financeiroError } = await (centralSupabase as any)
            .from('financeiro_sieg')
            .select('valor_em_aberto, cnpj, telefone')
            .eq('empresa_id', tenant.id);
          
          if (financeiroError) {
            console.error('💰 [useValoresFinanceiros] Erro ao buscar financeiro_sieg:', financeiroError);
            setIsLoading(false);
            return;
          }

          // Agrupar por CNPJ para evitar duplicatas
          const valoresPorCnpj = new Map<string, number>();
          const empresasUnicas = new Set<string>();
          
          (financeiroData || []).forEach((item: any) => {
            const chave = item.cnpj && String(item.cnpj).trim().length > 0 
              ? String(item.cnpj).trim() 
              : item.telefone;
            if (chave) empresasUnicas.add(chave);
            
            const valorAtual = valoresPorCnpj.get(chave) || 0;
            const valorItem = parseValorBR(item.valor_em_aberto);
            if (valorItem > valorAtual) {
              valoresPorCnpj.set(chave, valorItem);
            }
          });

          let totalEmAberto = 0;
          valoresPorCnpj.forEach((valor) => {
            totalEmAberto += valor;
          });

          // Buscar valor recuperado total (T3 e T4) sem filtro de data
          const { data: pagosIA } = await (centralSupabase as any)
            .from('historico_tags_financeiros')
            .select('valor_recuperado_ia')
            .eq('empresa_id', tenant.id)
            .ilike('tag_nova', '%T3%');
          
          const { data: pagosHumano } = await (centralSupabase as any)
            .from('historico_tags_financeiros')
            .select('valor_recuperado_ia')
            .eq('empresa_id', tenant.id)
            .ilike('tag_nova', '%T4%');

          let valorRecuperadoIA = 0;
          let valorRecuperadoHumano = 0;
          
          (pagosIA || []).forEach((item: any) => {
            valorRecuperadoIA += parseValorBR(item.valor_recuperado_ia);
          });
          
          (pagosHumano || []).forEach((item: any) => {
            valorRecuperadoHumano += parseValorBR(item.valor_recuperado_ia);
          });

          const valorRecuperadoTotal = valorRecuperadoIA + valorRecuperadoHumano;

          console.log('💰 [useValoresFinanceiros] Valores GERAIS:', {
            totalEmAberto,
            valorRecuperadoTotal,
            valorRecuperadoIA,
            valorRecuperadoHumano,
            totalEmpresas: empresasUnicas.size
          });

          setData({
            valorPendente: totalEmAberto,
            valorRecuperado: valorRecuperadoTotal,
            valorRecuperadoIA,
            valorRecuperadoHumano,
            valorEmNegociacao: 0,
            metaMensal: 50000.00,
            totalEmpresas: empresasUnicas.size,
          });
          
          setIsLoading(false);
          return;
        }

        // ========== MODO COM FILTRO DE DATA ==========
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

        // ========== TOTAL COBRADO (disparos enviados no período) ==========
        let disparosQuery = (centralSupabase as any)
          .from('disparos')
          .select('telefone')
          .eq('empresa_id', tenant.id)
          .eq('status', 'enviado')
          .gte('criado_em', startISO);
        
        if (endISO) {
          disparosQuery = disparosQuery.lt('criado_em', endISO);
        }
        
        const { data: disparosData, error: disparosError } = await disparosQuery;

        if (disparosError) {
          console.error('💰 [useValoresFinanceiros] Erro ao buscar disparos:', disparosError);
          setIsLoading(false);
          return;
        }

        const telefonesEnviados = [...new Set((disparosData || []).map((d: any) => d.telefone).filter(Boolean))];
        console.log(`💰 [useValoresFinanceiros] Telefones com disparo 'enviado': ${telefonesEnviados.length}`);

        let totalCobrado = 0;

        // Se teve disparos, buscar valor em aberto dos telefones
        if (telefonesEnviados.length > 0) {
          const PAGE_SIZE = 200;
          let allValores: any[] = [];
          
          for (let i = 0; i < telefonesEnviados.length; i += PAGE_SIZE) {
            const batch = telefonesEnviados.slice(i, i + PAGE_SIZE);
            
            const { data: financeiroData, error: financeiroError } = await (centralSupabase as any)
              .from('financeiro_sieg')
              .select('valor_em_aberto, cnpj, telefone, data_vencimento')
              .eq('empresa_id', tenant.id)
              .in('telefone', batch);
            
            if (!financeiroError && financeiroData) {
              allValores.push(...financeiroData);
            }
          }

          // Agrupar por CNPJ para evitar duplicatas (mesmo cliente com múltiplos telefones)
          const valoresPorCnpj = new Map<string, number>();
          allValores.forEach((item: any) => {
            const chave = item.cnpj && String(item.cnpj).trim().length > 0 
              ? String(item.cnpj).trim() 
              : item.telefone;
            const valorAtual = valoresPorCnpj.get(chave) || 0;
            const valorItem = parseValorBR(item.valor_em_aberto);
            // Pegar o maior valor para cada CNPJ
            if (valorItem > valorAtual) {
              valoresPorCnpj.set(chave, valorItem);
            }
          });

          valoresPorCnpj.forEach((valor) => {
            totalCobrado += valor;
          });

          console.log(`💰 [useValoresFinanceiros] Total cobrado no período: ${totalCobrado}`);
        }

        // ========== VALORES RECUPERADOS ==========
        // Buscar da tabela historico_tags_financeiros filtrado por data_registro no período
        let valorRecuperadoIA = 0;
        let valorRecuperadoHumano = 0;
        
        // Buscar mudanças de tag para PAGO IA (T3) no período
        // Usar filtro combinado com .and() para garantir que data_registro seja respeitado
        let queryIA = (centralSupabase as any)
          .from('historico_tags_financeiros')
          .select('valor_recuperado_ia, telefone, cnpj, data_registro, tag_nova')
          .eq('empresa_id', tenant.id)
          .gte('data_registro', startISO)
          .ilike('tag_nova', '%T3%');
        
        if (endISO) {
          queryIA = queryIA.lt('data_registro', endISO);
        }
        
        const { data: pagosIA, error: errorIA } = await queryIA;
        
        console.log(`💰 [useValoresFinanceiros] Query IA: ${pagosIA?.length || 0} registros encontrados`);
        
        if (!errorIA && pagosIA) {
          pagosIA.forEach((item: any) => {
            const valorItem = parseValorBR(item.valor_recuperado_ia);
            valorRecuperadoIA += valorItem;
          });
        }
        
        // Buscar mudanças de tag para TRANSFERIDO/HUMANO (T4) no período
        let queryHumano = (centralSupabase as any)
          .from('historico_tags_financeiros')
          .select('valor_recuperado_ia, telefone, cnpj, data_registro, tag_nova')
          .eq('empresa_id', tenant.id)
          .gte('data_registro', startISO)
          .ilike('tag_nova', '%T4%');
        
        if (endISO) {
          queryHumano = queryHumano.lt('data_registro', endISO);
        }
        
        const { data: pagosHumano, error: errorHumano } = await queryHumano;
        
        console.log(`💰 [useValoresFinanceiros] Query Humano: ${pagosHumano?.length || 0} registros encontrados`);
        
        if (!errorHumano && pagosHumano) {
          pagosHumano.forEach((item: any) => {
            const valorItem = parseValorBR(item.valor_recuperado_ia);
            valorRecuperadoHumano += valorItem;
          });
        }
        
        console.log(`💰 [useValoresFinanceiros] Recuperados do histórico: IA=${valorRecuperadoIA}, Humano=${valorRecuperadoHumano}`);

        const valorRecuperadoTotal = valorRecuperadoIA + valorRecuperadoHumano;
        const metaMensal = 50000.00;

        // Contar empresas únicas (por CNPJ) que receberam cobrança no período
        const empresasUnicas = new Set<string>();
        if (telefonesEnviados.length > 0) {
          const PAGE_SIZE = 200;
          for (let i = 0; i < telefonesEnviados.length; i += PAGE_SIZE) {
            const batch = telefonesEnviados.slice(i, i + PAGE_SIZE);
            const { data: cnpjData } = await (centralSupabase as any)
              .from('financeiro_sieg')
              .select('cnpj, telefone')
              .eq('empresa_id', tenant.id)
              .in('telefone', batch);
            
            if (cnpjData) {
              cnpjData.forEach((item: any) => {
                const chave = item.cnpj && String(item.cnpj).trim().length > 0 
                  ? String(item.cnpj).trim() 
                  : item.telefone;
                if (chave) empresasUnicas.add(chave);
              });
            }
          }
        }
        const totalEmpresas = empresasUnicas.size;

        // Valor pendente = Total cobrado - Total recuperado no período
        const valorPendente = totalCobrado - valorRecuperadoTotal;

        setData({
          valorPendente: Math.max(0, valorPendente),
          valorRecuperado: valorRecuperadoTotal,
          valorRecuperadoIA: valorRecuperadoIA,
          valorRecuperadoHumano: valorRecuperadoHumano,
          valorEmNegociacao: 0,
          metaMensal,
          totalEmpresas,
        });
        
        console.log('💰 [useValoresFinanceiros] Valores finais:', {
          totalCobrado,
          valorPendente,
          valorRecuperado: valorRecuperadoTotal,
          valorRecuperadoIA,
          valorRecuperadoHumano,
          totalEmpresas
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
