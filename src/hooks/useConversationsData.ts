import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { MIN_DATA_DATE } from "@/lib/constants";
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

export interface ConversationData {
  id: number;
  leadName: string;
  phone: string;
  product?: string;
  email?: string;
  status: "qualified" | "follow-up" | "discarded";
  tag?: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore?: number; // -100 a +100
  sentimentIntensity?: "baixa" | "média" | "alta";
  summary: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
  adSuggestions: string[];
  stageAfter: string | null;
  qualified: boolean;
  messages: Message[];
  csat?: string; // CSAT do atendimento (Satisfeito, Pouco Satisfeito, Insatisfeito)
  analista?: string; // Nome do analista responsável
}

export interface ConversationsStats {
  totalConversations: number;
  conversionRate: number;
  averageDuration: number;
}

function calculateSentiment(positives: string[], negatives: string[]): {
  sentiment: "positive" | "neutral" | "negative";
  score: number; // -100 a +100
  intensity: "baixa" | "média" | "alta";
} {
  const totalFeedback = positives.length + negatives.length;
  
  // Se não há feedback suficiente, considerar neutro
  if (totalFeedback === 0) {
    return { sentiment: "neutral", score: 0, intensity: "baixa" };
  }
  
  // Calcular score proporcional (-100 a +100)
  const ratio = totalFeedback > 0 
    ? (positives.length - negatives.length) / totalFeedback 
    : 0;
  const score = Math.round(ratio * 100);
  
  // Determinar sentimento com thresholds mais sensíveis
  let sentiment: "positive" | "neutral" | "negative";
  if (score > 20) sentiment = "positive";      // > 20% de diferença
  else if (score < -20) sentiment = "negative"; // < -20% de diferença
  else sentiment = "neutral";
  
  // Calcular intensidade baseada no volume de feedback
  let intensity: "baixa" | "média" | "alta";
  if (totalFeedback <= 2) intensity = "baixa";
  else if (totalFeedback <= 5) intensity = "média";
  else intensity = "alta";
  
  return { sentiment, score, intensity };
}

function calculateDuration(startedAt: string | null, endedAt: string | null): number {
  if (!startedAt || !endedAt) return 0;
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.floor((end - start) / 1000);
}

function mapTagToStatus(
  tag: string | null, 
  qualified?: boolean
): "qualified" | "follow-up" | "discarded" {
  if (qualified === true) return "qualified";
  if (!tag) return "discarded";
  
  const tagLower = tag.toLowerCase();
  
  if (tagLower.includes("qualificando") || tagLower.includes("t2")) {
    return "follow-up";
  }
  if (tagLower.includes("desqualificado") || tagLower.includes("t5")) {
    return "discarded";
  }
  if (tagLower.includes("qualificado") || tagLower.includes("t3") || tagLower.includes("t4")) {
    return "qualified";
  }
  
  return "follow-up";
}

function analyzeSentimentFromMessages(messages: any[]): {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  intensity: "baixa" | "média" | "alta";
} {
  if (!messages || messages.length === 0) {
    return { sentiment: "neutral", score: 0, intensity: "baixa" };
  }
  
  // Expandir vocabulário com ponderação
  const positiveWords: Record<string, number> = {
    // Forte (peso 3)
    excelente: 3, maravilhoso: 3, perfeito: 3, incrível: 3, amei: 3, adorei: 3,
    // Médio (peso 2)
    ótimo: 2, bom: 2, gostei: 2, interessado: 2, quero: 2, legal: 2, bacana: 2, boa: 2,
    // Fraco (peso 1)
    sim: 1, obrigado: 1, ok: 1, certo: 1, entendi: 1, beleza: 1
  };
  
  const negativeWords: Record<string, number> = {
    // Forte (peso -3)
    péssimo: -3, horrível: -3, impossível: -3, desisto: -3, nunca: -3, terrível: -3,
    // Médio (peso -2)
    ruim: -2, problema: -2, difícil: -2, caro: -2, complicado: -2, confuso: -2,
    // Fraco (peso -1)
    não: -1, desculpa: -1, mas: -1, porém: -1
  };
  
  let score = 0;
  let messageCount = 0;
  
  messages.forEach(msg => {
    if (msg.role === "user") {
      messageCount++;
      const content = msg.content?.toLowerCase() || "";
      
      // Checar palavras positivas com peso
      Object.entries(positiveWords).forEach(([word, weight]) => {
        const occurrences = (content.match(new RegExp(word, 'g')) || []).length;
        score += occurrences * weight;
      });
      
      // Checar palavras negativas com peso
      Object.entries(negativeWords).forEach(([word, weight]) => {
        const occurrences = (content.match(new RegExp(word, 'g')) || []).length;
        score += occurrences * weight;
      });
    }
  });
  
  // Normalizar por número de mensagens
  const normalizedScore = messageCount > 0 ? score / messageCount : 0;
  
  // Converter para escala -100 a 100
  const scaledScore = Math.min(100, Math.max(-100, Math.round(normalizedScore * 20)));
  
  // Determinar sentimento
  let sentiment: "positive" | "neutral" | "negative";
  if (normalizedScore > 1) sentiment = "positive";
  else if (normalizedScore < -1) sentiment = "negative";
  else sentiment = "neutral";
  
  // Determinar intensidade baseada no número de mensagens
  let intensity: "baixa" | "média" | "alta";
  if (messageCount <= 2) intensity = "baixa";
  else if (messageCount <= 5) intensity = "média";
  else intensity = "alta";
  
  return { sentiment, score: scaledScore, intensity };
}

function generateSummaryFromMessages(messages: any[]): string {
  if (!messages || messages.length === 0) {
    return "Conversa iniciada - aguardando mensagens";
  }
  
  // Filtrar mensagens válidas (com conteúdo não vazio)
  const validMessages = messages.filter(m => m.content && m.content.trim() !== '' && m.content !== 'undefined' && !m.content.includes('[wa_template]: undefined'));
  
  if (validMessages.length === 0) {
    return `Conversa com ${messages.length} mensagem(ns) - conteúdo em processamento`;
  }
  
  const userMessages = validMessages.filter(m => m.role === "user");
  const firstUserMsg = userMessages[0];
  
  if (!firstUserMsg) {
    return `Conversa com ${validMessages.length} mensagens do assistente`;
  }
  
  const preview = firstUserMsg.content?.substring(0, 80) || "...";
  return `${userMessages.length} mensagens do lead. Iniciou com: "${preview}${firstUserMsg.content.length > 80 ? '...' : ''}"`;
}

export function useConversationsData(_workspaceId: string, startDate?: Date, endDate?: Date) {
  const { tenant, isLoading: tenantLoading } = useCurrentTenant();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [stats, setStats] = useState<ConversationsStats>({
    totalConversations: 0,
    conversionRate: 0,
    averageDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (tenantLoading) return;
      if (!tenant) {
        setConversations([]);
        setStats({ totalConversations: 0, conversionRate: 0, averageDuration: 0 });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useConversationsData] Buscando conversas tenant:', { tenantId: tenant.id, slug: tenant.slug, startDate, endDate });

        let query = (centralSupabase.from as any)('tenant_conversations')
          .select("*")
          .eq('tenant_id', tenant.id)
          .gte('created_at', '2025-01-01T00:00:00');

        // Aplicar filtro de data inicial se fornecido
        if (startDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          query = query.gte('created_at', `${startDateStr}T00:00:00`);
        }

        // Aplicar filtro de data final se fornecido (limite superior exclusivo)
        if (endDate) {
          const endDateStr = endDate.toISOString().split('T')[0];
          const endNext = new Date(endDate);
          endNext.setDate(endNext.getDate() + 1);
          const endNextStr = endNext.toISOString().split('T')[0];
          query = query.lt('created_at', `${endNextStr}T00:00:00`);
        }

        query = query.order('created_at', { ascending: false }).limit(50000);

        const { data: conversationsData, error: conversationsError } = await query;

        if (conversationsError) {
          console.error('[useConversationsData] Erro ao buscar conversas:', conversationsError);
          throw conversationsError;
        }

        // Buscar COUNT total separadamente para estatísticas corretas
        let countQuery = (centralSupabase.from as any)('tenant_conversations')
          .select("*", { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', '2025-01-01T00:00:00');

        if (startDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          countQuery = countQuery.gte('created_at', `${startDateStr}T00:00:00`);
        }

        if (endDate) {
          const endDateStr = endDate.toISOString().split('T')[0];
          const endNext = new Date(endDate);
          endNext.setDate(endNext.getDate() + 1);
          const endNextStr = endNext.toISOString().split('T')[0];
          countQuery = countQuery.lt('created_at', `${endNextStr}T00:00:00`);
        }

        const { count: totalCount, error: countError } = await countQuery;

        if (countError) {
          console.error('[useConversationsData] Erro ao contar conversas:', countError);
        }

        console.log('[useConversationsData] Conversas encontradas:', conversationsData?.length || 0, '/ Total:', totalCount || 0);

        // 2. Mapear diretamente sem queries adicionais (otimização de performance)
        const mappedConversations: ConversationData[] = ((conversationsData as any[]) || [])
          .filter(conv => {
            // Verificar se tem telefone
            if (!conv.phone) return false;
            
            // Verificar se messages existe e tem conteúdo
            const messages = conv.messages;
            
            // Aceitar qualquer conversa que tenha o campo messages preenchido (não null/undefined)
            // Mesmo que seja um array vazio ou objeto vazio, incluir para análise
            if (messages !== null && messages !== undefined) {
              return true;
            }
            
            return false; // Filtrar apenas conversas sem o campo messages
          })
          .map(conv => {
            // Mensagens podem vir em dois formatos:
            // 1. Array de objetos: [{role: "user", content: "..."}]
            // 2. Array de strings: ["Bot: ...", "You: ..."]
            let messages: Message[] = [];
            
            if (Array.isArray(conv.messages)) {
              messages = conv.messages.map((msg: any) => {
                // Se já é um objeto com role e content, usar diretamente
                if (typeof msg === 'object' && msg.role && msg.content) {
                  return msg as Message;
                }
                
                // Se é uma string no formato "Bot: ..." ou "You: ...", converter
                if (typeof msg === 'string') {
                  if (msg.startsWith('Bot: ')) {
                    return {
                      role: 'assistant',
                      content: msg.substring(5), // Remove "Bot: "
                      timestamp: undefined
                    };
                  } else if (msg.startsWith('You: ')) {
                    return {
                      role: 'user',
                      content: msg.substring(5), // Remove "You: "
                      timestamp: undefined
                    };
                  }
                }
                
                // Fallback: retornar como mensagem do assistente
                return {
                  role: 'assistant',
                  content: typeof msg === 'string' ? msg : JSON.stringify(msg),
                  timestamp: undefined
                };
              });
            }

            // Calcular sentimento diretamente das mensagens
            const sentimentData = analyzeSentimentFromMessages(messages);

            const startedAtStr = conv.started_at || conv.created_at || null;
            const endedAtStr = conv.ended_at || null;

            return {
              id: conv.id,
              leadName: conv.lead_name || conv.nome || `Lead ${conv.phone}`,
              phone: conv.phone,
              product: undefined,
              email: undefined,
              status: mapTagToStatus(conv.tag, false),
              tag: conv.tag,
              sentiment: sentimentData.sentiment,
              sentimentScore: sentimentData.score,
              sentimentIntensity: sentimentData.intensity,
              summary: generateSummaryFromMessages(messages),
              startedAt: startedAtStr ? new Date(startedAtStr) : new Date(),
              endedAt: endedAtStr ? new Date(endedAtStr) : undefined,
              duration: calculateDuration(startedAtStr, endedAtStr),
              positives: [],
              negatives: [],
              suggestions: [],
              adSuggestions: [],
              stageAfter: conv.tag,
              qualified: conv.tag?.toLowerCase().includes("qualificado") || false,
              messages,
              csat: conv.csat, // CSAT do atendimento
              analista: conv.analista, // Nome do analista
            };
          });

        setConversations(mappedConversations);

        // Calculate stats usando o total real do banco
        const totalReal = totalCount || mappedConversations.length;
        const qualified = mappedConversations.filter(c => c.status === "qualified").length;
        const totalDuration = mappedConversations.reduce((acc, c) => acc + c.duration, 0);

        // Buscar total de qualificados no banco para taxa de conversão correta
        let qualifiedCountQuery = (centralSupabase.from as any)('tenant_conversations')
          .select("*", { count: 'exact', head: true })
          .eq('tenant_id', tenant.id)
          .gte('created_at', `${MIN_DATA_DATE}T00:00:00`);

        if (startDate) {
          const startDateStr = startDate.toISOString().split('T')[0];
          qualifiedCountQuery = qualifiedCountQuery.gte('created_at', `${startDateStr}T00:00:00`);
        }

        if (endDate) {
          const endDateStr = endDate.toISOString().split('T')[0];
          qualifiedCountQuery = qualifiedCountQuery.lte('created_at', `${endDateStr}T23:59:59`);
        }

        // Filtrar por tags de qualificados (apenas T3 e pago para Sieg Financeiro)
        // T4 é "Transferido" no Sieg, não conta como qualificado
        qualifiedCountQuery = qualifiedCountQuery.or('tag.ilike.%T3%,tag.ilike.%pago%');
        
        console.log('🔍 [useConversationsData] Query qualificados:', { tenantId: tenant.id });

        const { count: qualifiedCount } = await qualifiedCountQuery;

        const totalQualificadosReal = qualifiedCount || qualified;

        setStats({
          totalConversations: totalReal,
          conversionRate: totalReal > 0 ? (totalQualificadosReal / totalReal) * 100 : 0,
          averageDuration: mappedConversations.length > 0 ? totalDuration / mappedConversations.length : 0,
        });
      } catch (err) {
        logger.error("Error fetching conversations:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [tenantLoading, tenant?.id, startDate, endDate]);

  return { conversations, stats, isLoading, error };
}
