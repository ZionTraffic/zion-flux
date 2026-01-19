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
        
        // Normalizar datas para início e fim do dia (mesma lógica do useDisparosDiarios)
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

        // PASSO 1: Buscar telefones DISTINTOS com status 'enviado' no período
        // Exclui números inválidos e suspensões
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

        // Extrair telefones únicos com status 'enviado'
        const telefonesEnviados = [...new Set((disparosData || []).map((d: any) => d.telefone).filter(Boolean))];
        
        console.log(`💰 [useValoresFinanceiros] Telefones com status 'enviado': ${telefonesEnviados.length}`);

        // Se não teve disparo enviado no período, valores são zero
        if (telefonesEnviados.length === 0) {
          setData({
            valorPendente: 0,
            valorRecuperado: 0,
            valorRecuperadoIA: 0,
            valorRecuperadoHumano: 0,
            valorEmNegociacao: 0,
            metaMensal: 50000.00,
          });
          setIsLoading(false);
          return;
        }

        // PASSO 2: Buscar valores financeiros dos telefones enviados
        const PAGE_SIZE = 200;
        let allValores: any[] = [];
        
        for (let i = 0; i < telefonesEnviados.length; i += PAGE_SIZE) {
          const batch = telefonesEnviados.slice(i, i + PAGE_SIZE);
          
          const { data: financeiroData, error: financeiroError } = await (centralSupabase as any)
            .from('financeiro_sieg')
            .select('valor_em_aberto, valor_recuperado_ia, valor_recuperado_humano, em_negociacao, situacao, cnpj, telefone, data_vencimento')
            .eq('empresa_id', tenant.id)
            .in('telefone', batch);
          
          if (financeiroError) {
            console.error('💰 [useValoresFinanceiros] Erro ao buscar financeiro_sieg:', financeiroError);
          } else {
            allValores.push(...(financeiroData || []));
          }
        }

        const valores = allValores;
        console.log(`💰 [useValoresFinanceiros] Registros financeiros encontrados: ${valores.length}`);

        // Se não encontrou registros financeiros, valores são zero
        if (valores.length === 0) {
          setData({
            valorPendente: 0,
            valorRecuperado: 0,
            valorRecuperadoIA: 0,
            valorRecuperadoHumano: 0,
            valorEmNegociacao: 0,
            metaMensal: 50000.00,
          });
          setIsLoading(false);
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

        // Separar registros por situação para cálculo correto
        const registrosPendentes = (valores || []).filter((item: any) => 
          item.situacao === 'pendente' || item.situacao === null
        );
        const registrosConcluidos = (valores || []).filter((item: any) => 
          item.situacao === 'concluido'
        );

        console.log('💰 [useValoresFinanceiros] Registros:', {
          pendentes: registrosPendentes.length,
          concluidos: registrosConcluidos.length
        });

        // CORREÇÃO: Agrupar valor_em_aberto por FATURA (CNPJ + data_vencimento) quando possível.
        // Isso evita duplicação por múltiplos telefones e permite somar múltiplas mensalidades da mesma empresa.
        const valoresPorFatura = new Map<string, number>();
        registrosPendentes.forEach((item: any) => {
          const cnpjBase = item.cnpj || item.telefone || 'sem_cnpj';
          const dataVencimento = item.data_vencimento ? String(item.data_vencimento) : '';
          const chave = dataVencimento ? `${cnpjBase}::${dataVencimento}` : cnpjBase;

          const valorAtual = valoresPorFatura.get(chave) || 0;
          const valorItem = parseValorBR(item.valor_em_aberto);

          // Para a mesma fatura (mesmo vencimento), pegar o MAIOR valor (caso tenha variação entre telefones)
          if (valorItem > valorAtual) {
            valoresPorFatura.set(chave, valorItem);
          }
        });

        let valorPendenteTotal = 0;
        valoresPorFatura.forEach((valor) => {
          valorPendenteTotal += valor;
        });

        console.log('💰 [useValoresFinanceiros] Faturas únicas:', valoresPorFatura.size, 'Valor pendente agrupado:', valorPendenteTotal);

        // VALORES RECUPERADOS: Buscar da tabela historico_valores_financeiros
        // Isso mostra quanto foi recuperado NO PERÍODO (diferença), não o acumulado
        let historicoQuery = (centralSupabase as any)
          .from('historico_valores_financeiros')
          .select('tipo_valor, diferenca')
          .eq('empresa_id', tenant.id)
          .in('tipo_valor', ['recuperado_ia', 'recuperado_humano'])
          .gte('data_registro', startISO);
        
        if (endISO) {
          historicoQuery = historicoQuery.lt('data_registro', endISO);
        }
        
        const { data: historicoData, error: historicoError } = await historicoQuery;
        
        let valorRecuperadoIA = 0;
        let valorRecuperadoHumano = 0;
        
        console.log(`💰 [useValoresFinanceiros] Buscando histórico: startISO=${startISO}, endISO=${endISO}, error=${historicoError?.message || 'none'}, registros=${historicoData?.length || 0}`);
        
        if (!historicoError && historicoData && historicoData.length > 0) {
          historicoData.forEach((item: any) => {
            const diferenca = parseFloat(item.diferenca) || 0;
            if (item.tipo_valor === 'recuperado_ia') {
              valorRecuperadoIA += diferenca;
            } else if (item.tipo_valor === 'recuperado_humano') {
              valorRecuperadoHumano += diferenca;
            }
          });
          console.log(`💰 [useValoresFinanceiros] Histórico encontrado: ${historicoData.length} registros, IA=${valorRecuperadoIA}, Humano=${valorRecuperadoHumano}`);
        } else {
          console.warn(`💰 [useValoresFinanceiros] Sem dados no histórico para o período - os triggers só capturam mudanças novas`);
        }
        
        // Valor em negociação (ainda usa acumulado pois não tem histórico)
        const valorEmNegociacao = (valores || []).reduce((acc: number, item: any) => 
          acc + parseValorBR(item.em_negociacao), 0);
        
        const totais = { valorRecuperadoIA, valorRecuperadoHumano, valorEmNegociacao };
        console.log('💰 [useValoresFinanceiros] Totais calculados:', { valorPendenteTotal, ...totais });

        const valorRecuperadoTotal = valorRecuperadoIA + valorRecuperadoHumano;

        // Valor pendente real = valor em aberto agrupado por fatura - valores recuperados dessas faturas
        const recuperadosPorFatura = new Map<string, number>();
        registrosPendentes.forEach((item: any) => {
          const cnpjBase = item.cnpj || item.telefone || 'sem_cnpj';
          const dataVencimento = item.data_vencimento ? String(item.data_vencimento) : '';
          const chave = dataVencimento ? `${cnpjBase}::${dataVencimento}` : cnpjBase;

          const valorAtual = recuperadosPorFatura.get(chave) || 0;
          const valorRecuperado = parseValorBR(item.valor_recuperado_ia) + parseValorBR(item.valor_recuperado_humano);
          recuperadosPorFatura.set(chave, valorAtual + valorRecuperado);
        });

        let valorRecuperadoPendentes = 0;
        recuperadosPorFatura.forEach((valor) => {
          valorRecuperadoPendentes += valor;
        });
        
        const valorPendenteReal = valorPendenteTotal - valorRecuperadoPendentes;

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
