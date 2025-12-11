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

export function useTagCountsHistorico(startDate?: Date, endDate?: Date) {
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
        // Calcular datas de filtro
        let startISO = startDate ? startDate.toISOString() : DATA_MINIMA;
        if (startISO < DATA_MINIMA) {
          startISO = DATA_MINIMA;
        }
        
        let endISO: string | null = null;
        if (endDate) {
          const endDatePlusOne = new Date(endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          endISO = endDatePlusOne.toISOString();
        }

        // Buscar todos os registros da tabela financeiro_sieg com tag, historico_conversa e atendente
        let query = (centralSupabase as any)
          .from('financeiro_sieg')
          .select('id, tag, historico_conversa, valor_recuperado_ia, valor_recuperado_humano, atendente')
          .eq('empresa_id', tenant.id)
          .gte('criado_em', startISO);
        
        if (endISO) {
          query = query.lt('criado_em', endISO);
        }
        
        const { data: financeiroData, error: financeiroError } = await query;

        if (financeiroError) {
          console.error('Erro ao buscar financeiro_sieg:', financeiroError);
        }

        // Contar leads por estágio baseado na tag E histórico de conversa
        const leadsPerEstagio: Record<string, Set<string>> = {
          'T1': new Set(),
          'T2': new Set(),
          'T3': new Set(),
          'T4': new Set(),
          'T5': new Set(),
        };

        (financeiroData || []).forEach((item: any) => {
          const tag = item.tag || '';
          const tagUpper = String(tag).toUpperCase();
          const historicoConversa = item.historico_conversa || '';
          // Verificar se tem mensagens do cliente (You:) no histórico
          const temHistorico = historicoConversa && historicoConversa.includes('You:');
          const atendente = item.atendente || '';
          const semAgente = !atendente || atendente.trim() === '';
          
          // Verificar se tem comprovante de pagamento no histórico
          const historicoLower = historicoConversa.toLowerCase();
          const temComprovante = historicoLower.includes('comprovante') || 
                                 historicoLower.includes('pix') || 
                                 historicoLower.includes('pagamento') ||
                                 historicoLower.includes('paguei') ||
                                 historicoLower.includes('transferi') ||
                                 historicoLower.includes('boleto') ||
                                 historicoLower.includes('.jpg') ||
                                 historicoLower.includes('.jpeg') ||
                                 historicoLower.includes('.png') ||
                                 historicoLower.includes('.pdf') ||
                                 historicoLower.includes('image/') ||
                                 historicoLower.includes('wa.me') ||
                                 historicoLower.includes('whatsapp');
          
          // Verificar se tem mensagem de "passível de suspensão" no histórico
          const temMensagemSuspensao = historicoLower.includes('passivel de suspensao') ||
                                       historicoLower.includes('passível de suspensão') ||
                                       historicoLower.includes('suspensao') ||
                                       historicoLower.includes('suspensão');
          
          // Classificar baseado na tag e agente
          // REGRA 1: Se tag é T5 -> T5 (não muda nunca)
          if (tagUpper.includes('T5') || tagUpper.includes('SUSPENS')) {
            leadsPerEstagio['T5'].add(item.id);
          // REGRA 2: Se tem agente atribuído -> T4 (Transferido)
          } else if (!semAgente) {
            leadsPerEstagio['T4'].add(item.id);
          } else if (temMensagemSuspensao) {
            // Sem agente + mensagem de suspensão no histórico -> T5
            leadsPerEstagio['T5'].add(item.id);
          } else if (tagUpper.includes('T3') || tagUpper.includes('PAGO') || item.valor_recuperado_ia > 0 || item.valor_recuperado_humano > 0) {
            leadsPerEstagio['T3'].add(item.id);
          } else if (temComprovante) {
            // Sem agente + tem comprovante de pagamento -> T3
            leadsPerEstagio['T3'].add(item.id);
          } else if (tagUpper.includes('T2') || tagUpper.includes('QUALIFICANDO')) {
            leadsPerEstagio['T2'].add(item.id);
          } else {
            // T1 ou qualquer outra tag (sem agente)
            // Se tem histórico de conversa, significa que o cliente respondeu -> T2
            if (temHistorico) {
              leadsPerEstagio['T2'].add(item.id);
            } else {
              leadsPerEstagio['T1'].add(item.id);
            }
          }
        });

        setCounts({
          'T1 - SEM RESPOSTA': leadsPerEstagio['T1'].size,
          'T2 - RESPONDIDO': leadsPerEstagio['T2'].size,
          'T3 - PAGO IA': leadsPerEstagio['T3'].size,
          'T4 - TRANSFERIDO': leadsPerEstagio['T4'].size,
          'T5 - PASSÍVEL DE SUSPENSÃO': leadsPerEstagio['T5'].size,
        });

        console.log('📊 [useTagCountsHistorico] Contagens (com lógica de histórico):', {
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
  }, [tenant?.id, tenant?.slug, tenantLoading, startDate, endDate]);

  return { counts, isLoading };
}
