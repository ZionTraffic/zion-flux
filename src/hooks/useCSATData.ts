import { useState, useEffect } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

// Interface com notas 1-5
export interface CSATData {
  analista: string;
  csatMedio: number;
  totalAtendimentos: number;
  nota1: number;
  nota2: number;
  nota3: number;
  nota4: number;
  nota5: number;
  // Compatibilidade com código antigo
  satisfeito?: number;
  poucoSatisfeito?: number;
  insatisfeito?: number;
}

// Feedback individual de CSAT
export interface CSATFeedback {
  nota: number;
  feedback: string;
  analista: string;
  nome?: string;
  telefone?: string;
  data: string;
  origem?: 'ia' | 'humano';
}

// Totais gerais para exibição
export interface CSATTotals {
  csatMedioGeral: number;
  totalAvaliacoes: number;
  distribuicao: {
    nota1: number;
    nota2: number;
    nota3: number;
    nota4: number;
    nota5: number;
  };
}

export function useCSATData(_workspaceId: string, startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<CSATData[]>([]);
  const [feedbacks, setFeedbacks] = useState<CSATFeedback[]>([]);
  const [totals, setTotals] = useState<CSATTotals>({
    csatMedioGeral: 0,
    totalAvaliacoes: 0,
    distribuicao: { nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0 }
  });
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

      // CSAT disponível apenas para Sieg Financeiro
      // Slug padrão: 'sieg-financeiro'
      const isSiegFinanceiro = tenant.slug === 'sieg-financeiro' || tenant.slug?.includes('financeiro');
      console.log('📊 CSAT - Verificando tenant:', { slug: tenant.slug, isSiegFinanceiro });
      if (!isSiegFinanceiro) {
        setData([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Converter texto para nota numérica 1-5
        const mapCsatToNumber = (value: string): number | null => {
          const cleaned = value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[()]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

          // Se já for número, usar diretamente
          const numValue = parseInt(cleaned, 10);
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
            return numValue;
          }

          // Mapear texto para nota
          if (['muito satisfeito', 'muito satisfeita', 'excelente', 'otimo', 'perfeito', '5'].includes(cleaned)) {
            return 5;
          }
          if (['satisfeito', 'satisfeita', 'satisfeito a', 'bom', '4'].includes(cleaned)) {
            return 4;
          }
          if (['pouco satisfeito', 'pouco satisfeita', 'pouco', 'ok', 'regular', 'neutro', '3'].includes(cleaned)) {
            return 3;
          }
          if (['insatisfeito', 'insatisfeita', 'ruim', '2'].includes(cleaned)) {
            return 2;
          }
          if (['muito insatisfeito', 'muito insatisfeita', 'pessimo', '1'].includes(cleaned)) {
            return 1;
          }

          return null;
        };

        // Filtros de data
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

        console.log('📅 DEBUG CSAT - Filtro:', { tenantId: tenant.id, startDate: filterStartDate, endDate: filterEndDate });

        // Buscar dados com csat_feedback e origem_atendimento
        let query = (centralSupabase as any)
          .from('conversas_leads')
          .select('analista, csat, csat_feedback, origem_atendimento, data_resposta_csat, nome, telefone')
          .eq('empresa_id', tenant.id)
          .not('analista', 'is', null)
          .neq('analista', '')
          .not('csat', 'is', null)
          .not('data_resposta_csat', 'is', null)
          .gte('data_resposta_csat', filterStartDate);

        if (filterEndDate) {
          query = query.lte('data_resposta_csat', filterEndDate);
        }

        const { data: conversas, error: fetchError } = await query;

        console.log('🔍 DEBUG CSAT - Dados brutos:', { totalRegistros: conversas?.length || 0 });

        if (fetchError) throw fetchError;

        if (!conversas || conversas.length === 0) {
          setData([]);
          setFeedbacks([]);
          setTotals({ csatMedioGeral: 0, totalAvaliacoes: 0, distribuicao: { nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0 } });
          setIsLoading(false);
          return;
        }

        // Coletar feedbacks (justificativas)
        const feedbacksList: CSATFeedback[] = [];

        // Agrupar por analista com notas 1-5
        const grouped = (conversas || []).reduce((acc: any, conv: any) => {
          const analista = conv.analista;
          // Converter para string e limpar valores inválidos
          const csatRaw = String(conv.csat || '').trim();

          // Ignorar valores vazios ou inválidos
          if (!analista || !csatRaw || csatRaw === '-' || csatRaw === 'null' || csatRaw === 'undefined') return acc;

          const nota = mapCsatToNumber(csatRaw);
          if (!nota) {
            // Log apenas para valores não reconhecidos (não para "-")
            if (csatRaw !== '-' && csatRaw.length > 0) {
              console.log('⚠️ CSAT não reconhecido:', { analista, csatOriginal: csatRaw });
            }
            return acc;
          }

          // Coletar feedback se existir
          if (conv.csat_feedback && conv.csat_feedback.trim()) {
            feedbacksList.push({
              nota,
              feedback: conv.csat_feedback,
              analista,
              nome: conv.nome || undefined,
              telefone: conv.telefone || undefined,
              data: conv.data_resposta_csat,
              origem: conv.origem_atendimento || undefined,
            });
          }

          if (!acc[analista]) {
            acc[analista] = { analista, totalAtendimentos: 0, nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0, somaNotas: 0 };
          }

          acc[analista].totalAtendimentos++;
          acc[analista].somaNotas += nota;
          acc[analista][`nota${nota}`]++;

          return acc;
        }, {} as Record<string, any>);

        // Ordenar feedbacks por data (mais recentes primeiro)
        feedbacksList.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setFeedbacks(feedbacksList);

        // Calcular médias e ordenar
        const result: CSATData[] = Object.values(grouped)
          .map((item: any) => ({
            analista: item.analista,
            totalAtendimentos: item.totalAtendimentos,
            csatMedio: item.totalAtendimentos > 0 ? item.somaNotas / item.totalAtendimentos : 0,
            nota1: item.nota1,
            nota2: item.nota2,
            nota3: item.nota3,
            nota4: item.nota4,
            nota5: item.nota5,
            // Compatibilidade: mapear para categorias antigas
            satisfeito: item.nota4 + item.nota5,
            poucoSatisfeito: item.nota3,
            insatisfeito: item.nota1 + item.nota2,
          }))
          .sort((a: CSATData, b: CSATData) => b.csatMedio - a.csatMedio);

        // Calcular totais gerais
        const totalNotas = result.reduce((acc, item) => ({
          nota1: acc.nota1 + item.nota1,
          nota2: acc.nota2 + item.nota2,
          nota3: acc.nota3 + item.nota3,
          nota4: acc.nota4 + item.nota4,
          nota5: acc.nota5 + item.nota5,
        }), { nota1: 0, nota2: 0, nota3: 0, nota4: 0, nota5: 0 });

        const totalAvaliacoes = totalNotas.nota1 + totalNotas.nota2 + totalNotas.nota3 + totalNotas.nota4 + totalNotas.nota5;
        const somaTotal = (totalNotas.nota1 * 1) + (totalNotas.nota2 * 2) + (totalNotas.nota3 * 3) + (totalNotas.nota4 * 4) + (totalNotas.nota5 * 5);
        const csatMedioGeral = totalAvaliacoes > 0 ? somaTotal / totalAvaliacoes : 0;

        setTotals({
          csatMedioGeral,
          totalAvaliacoes,
          distribuicao: totalNotas
        });

        console.log('✅ DEBUG CSAT - Resultado:', { totalAnalistas: result.length, csatMedioGeral: csatMedioGeral.toFixed(2), distribuicao: totalNotas });

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

  return { data, totals, feedbacks, isLoading, error };
}
