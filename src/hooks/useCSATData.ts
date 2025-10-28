import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
  satisfeito: number;
  poucoSatisfeito: number;
  insatisfeito: number;
}

export function useCSATData(workspaceId: string, startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<CSATData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCSATData() {
      if (!workspaceId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Buscar workspace slug para determinar a tabela
        const { data: ws } = await supabase
          .from('workspaces')
          .select('slug')
          .eq('id', workspaceId)
          .maybeSingle();

        // Por enquanto, apenas Sieg tem dados de CSAT
        if (ws?.slug !== 'sieg') {
          setData([]);
          setIsLoading(false);
          return;
        }

        // Usar datas fornecidas ou calcular início do mês atual
        let filterStartDate: string;
        let filterEndDate: string | undefined;

        if (startDate) {
          filterStartDate = startDate.toISOString().split('T')[0] + 'T00:00:00';
        } else {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filterStartDate = startOfMonth.toISOString();
        }

        if (endDate) {
          filterEndDate = endDate.toISOString().split('T')[0] + 'T23:59:59';
        }

        console.log('📅 DEBUG CSAT - Filtro de data:', {
          startDate: filterStartDate,
          endDate: filterEndDate,
        });

        // Buscar dados da tabela conversas_sieg_financeiro COM FILTRO DE DATA
        let query = (supabase as any)
          .from('conversas_sieg_financeiro')
          .select('analista, csat, created_at')
          .eq('id_workspace', workspaceId)
          .gte('created_at', filterStartDate)
          .not('analista', 'is', null)
          .neq('analista', '') // Ignorar analistas vazios
          .not('csat', 'is', null)
          .neq('csat', '-'); // Ignorar registros sem CSAT

        // Aplicar filtro de data final se fornecido
        if (filterEndDate) {
          query = query.lte('created_at', filterEndDate);
        }

        const { data: conversas, error: fetchError } = await query;

        console.log('🔍 DEBUG CSAT - Dados brutos:', {
          workspaceId,
          totalRegistros: conversas?.length || 0,
          conversas: conversas?.slice(0, 5), // Primeiros 5 registros
        });

        if (fetchError) throw fetchError;

        // Se não houver dados de CSAT no período filtrado, retornar array vazio
        if (!conversas || conversas.length === 0) {
          console.log('⚠️ DEBUG CSAT - Nenhum dado encontrado no período filtrado');
          setData([]);
          setIsLoading(false);
          return;
        }

        // Agrupar por analista e contar cada categoria de CSAT
        const grouped = (conversas || []).reduce((acc, conv) => {
          const analista = conv.analista;
          const csatOriginal = conv.csat;
          const csat = conv.csat?.toLowerCase().trim();
          
          console.log('📝 DEBUG CSAT - Processando:', { analista, csatOriginal, csatNormalizado: csat });

          if (!acc[analista]) {
            acc[analista] = {
              analista,
              totalAtendimentos: 0,
              satisfeito: 0,
              poucoSatisfeito: 0,
              insatisfeito: 0,
            };
          }

          acc[analista].totalAtendimentos++;

          // Mapear valores de CSAT para as 3 categorias (case-insensitive)
          if (csat === 'satisfeito' || csat === 'satisfeita') {
            acc[analista].satisfeito++;
          } else if (csat === 'pouco satisfeito' || csat === 'pouco' || csat === 'pouco satisfeita') {
            acc[analista].poucoSatisfeito++;
          } else if (csat === 'insatisfeito' || csat === 'insatisfeita') {
            acc[analista].insatisfeito++;
          } else {
            console.log('⚠️ Valor de CSAT não reconhecido:', csat);
          }

          return acc;
        }, {} as Record<string, Omit<CSATData, 'csatMedio'>>);

        // Calcular CSAT médio e ordenar por melhor desempenho
        const result = (Object.values(grouped) as Array<Omit<CSATData, 'csatMedio'>>)
          .map((item) => {
            // CSAT médio: (Satisfeitos * 3 + Pouco Satisfeitos * 2 + Insatisfeitos * 1) / Total
            // Normalizado para escala 1-5
            const pontuacao = (item.satisfeito * 5 + item.poucoSatisfeito * 3 + item.insatisfeito * 1);
            const csatMedio = item.totalAtendimentos > 0 
              ? pontuacao / item.totalAtendimentos 
              : 0;

            return {
              ...item,
              csatMedio,
            } as CSATData;
          })
          .sort((a, b) => b.csatMedio - a.csatMedio); // Ordenar do melhor para o pior

        console.log('✅ DEBUG CSAT - Resultado final:', {
          totalAnalistas: result.length,
          analistas: result.map(r => ({
            nome: r.analista,
            total: r.totalAtendimentos,
            satisfeito: r.satisfeito,
            pouco: r.poucoSatisfeito,
            insatisfeito: r.insatisfeito,
          })),
        });

        setData(result);
      } catch (err: any) {
        console.error('Erro ao buscar dados de CSAT:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCSATData();
  }, [workspaceId, startDate, endDate]);

  return { data, isLoading, error };
}
