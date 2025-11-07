import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
  satisfeito: number;
  poucoSatisfeito: number;
  insatisfeito: number;
}

export function useCSATData(_workspaceId: string, startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<CSATData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();

  useEffect(() => {
    async function fetchCSATData() {
      if (tenantLoading) return;
      if (!tenant) {
        setData([]);
        setIsLoading(false);
        return;
      }

      // CSAT atualmente disponível apenas para Sieg
      if (tenant.slug !== 'sieg') {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Funções auxiliares para trabalhar com o CSAT
        const normalizeCsatValue = (value: string) =>
          value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove acentos
            .replace(/[()]/g, '')
            .trim()
            .toLowerCase();

        const mapCsatToCategory = (value: string) => {
          const cleaned = value.replace(/\s+/g, ' ');
          if (!cleaned) return null;

          if (['satisfeito', 'satisfeita', 'satisfeito a', 'muito satisfeito', 'muito satisfeita'].includes(cleaned)) {
            return 'satisfeito';
          }

          if (['pouco satisfeito', 'pouco satisfeita', 'pouco', 'ok'].includes(cleaned)) {
            return 'poucoSatisfeito';
          }

          if (['insatisfeito', 'insatisfeita', 'ruim', 'pessimo', 'péssimo', 'muito insatisfeito', 'muito insatisfeita'].includes(cleaned)) {
            return 'insatisfeito';
          }

          return null;
        };

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
          tenantId: tenant.id,
          startDate: filterStartDate,
          endDate: filterEndDate,
        });

        // Buscar dados da tabela tenant_conversations usando a data da resposta CSAT
        let query = (centralSupabase as any)
          .from('tenant_conversations')
          .select('analista, csat, data_resposta_csat')
          .eq('tenant_id', tenant.id)
          .not('analista', 'is', null)
          .neq('analista', '') // Ignorar analistas vazios
          .not('csat', 'is', null)
          .neq('csat', '-')
          .neq('csat', '') // Ignorar registros sem CSAT preenchido
          .not('data_resposta_csat', 'is', null)
          .gte('data_resposta_csat', filterStartDate)

        // Aplicar filtro de data final se fornecido
        if (filterEndDate) {
          query = query.lte('data_resposta_csat', filterEndDate);
        }

        const { data: conversas, error: fetchError } = await query;

        console.log('🔍 DEBUG CSAT - Dados brutos:', {
          tenantId: tenant.id,
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
          const csatRaw = (conv.csat || '').trim();

          if (!analista || !csatRaw || csatRaw === '-') {
            return acc;
          }

          const csatNormalized = normalizeCsatValue(csatRaw);
          const category = mapCsatToCategory(csatNormalized);

          console.log('📝 DEBUG CSAT - Processando:', { analista, csatOriginal: csatRaw, csatNormalizado: csatNormalized, categoria: category });

          if (!category) {
            console.log('⚠️ Valor de CSAT não reconhecido:', { analista, csatOriginal: csatRaw, csatNormalizado: csatNormalized });
            return acc;
          }

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

          if (category === 'satisfeito') {
            acc[analista].satisfeito++;
          }

          if (category === 'poucoSatisfeito') {
            acc[analista].poucoSatisfeito++;
          }

          if (category === 'insatisfeito') {
            acc[analista].insatisfeito++;
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
  }, [tenantLoading, tenant?.id, tenant?.slug, startDate, endDate]);

  return { data, isLoading, error };
}
