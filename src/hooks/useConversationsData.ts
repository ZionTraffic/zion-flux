import { useState, useEffect } from "react";
import { useDatabase } from '@/contexts/DatabaseContext';
import { logger } from "@/utils/logger";
import { MIN_DATA_DATE } from "@/lib/constants";

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
    return "Conversa sem mensagens registradas";
  }
  
  const userMessages = messages.filter(m => m.role === "user");
  const firstUserMsg = userMessages[0];
  
  if (!firstUserMsg) {
    return `Conversa com ${messages.length} mensagens do assistente`;
  }
  
  const preview = firstUserMsg.content?.substring(0, 80) || "...";
  return `${userMessages.length} mensagens do lead. Iniciou com: "${preview}${firstUserMsg.content.length > 80 ? '...' : ''}"`;
}

export function useConversationsData(workspaceId: string) {
  const { supabase } = useDatabase();
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
      if (!workspaceId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Resolver tabela por workspace
        const { data: ws } = await supabase
          .from("workspaces")
          .select("slug,name")
          .eq("id", workspaceId)
          .maybeSingle();

        const tableName = ws?.slug === "asf" ? "conversas_asf" : ws?.slug === "sieg" ? "conversas_sieg_financeiro" : "conversas_asf";
        const dateField = tableName === "conversas_asf" || tableName === "conversas_sieg_financeiro" ? "created_at" : "created_at";
        const workspaceField = tableName === "conversas_asf" || tableName === "conversas_sieg_financeiro" ? "id_workspace" : "id_workspace";

        console.log('[useConversationsData] Buscando conversas:', { tableName, workspaceId, dateField });

        const { data: conversationsData, error: conversationsError } = await (supabase.from as any)(tableName)
          .select("*")
          .eq(workspaceField, workspaceId)
          .gte(dateField, `${MIN_DATA_DATE}T00:00:00`)
          .order(dateField, { ascending: false });

        if (conversationsError) {
          console.error('[useConversationsData] Erro ao buscar conversas:', conversationsError);
          throw conversationsError;
        }

        console.log('[useConversationsData] Conversas encontradas:', conversationsData?.length || 0);

        // 2. Para cada conversa, buscar dados complementares
        const enrichedConversations = await Promise.all(
          (((conversationsData as any[]) || [])).map(async (conv: any) => {
            // Buscar análise IA (opcional)
            const { data: analysisData } = await supabase
              .from("analise_ia")
              .select("*")
              .eq("phone", conv.phone)
              .eq("workspace_id", workspaceId)
              .gte("started_at", MIN_DATA_DATE)
              .maybeSingle();

            // Buscar lead (opcional)
            const { data: leadData } = await supabase
              .from("leads")
              .select("nome, email, produto, stage")
              .eq("telefone", conv.phone)
              .eq("workspace_id", workspaceId)
              .gte("created_at", MIN_DATA_DATE)
              .maybeSingle();

            return {
              conversation: conv,
              analysis: analysisData,
              lead: leadData
            };
          })
        );

        // 3. Mapear para ConversationData
        const mappedConversations: ConversationData[] = enrichedConversations
          .filter(item => {
            // Verificar se tem telefone
            if (!item.conversation.phone) return false;
            
            // Verificar se messages existe e tem conteúdo
            const messages = item.conversation.messages;
            
            // Se messages for um array válido com tamanho > 0
            if (Array.isArray(messages) && messages.length > 0) {
              return true;
            }
            
            // Se messages for um objeto JSONB válido com conteúdo
            if (messages && typeof messages === 'object' && Object.keys(messages).length > 0) {
              return true;
            }
            
            return false; // Filtrar conversas sem mensagens
          })
          .map(({ conversation, analysis, lead }) => {
            // Mensagens já vêm direto de historico_conversas.messages
            const messages: Message[] = Array.isArray(conversation.messages) 
              ? (conversation.messages as unknown as Message[])
              : [];

            const positives = analysis?.positives || [];
            const negatives = analysis?.negatives || [];

            // Calcular sentimento com score e intensidade
            const sentimentData = analysis 
              ? calculateSentiment(positives, negatives)
              : analyzeSentimentFromMessages(messages);

            const startedAtStr = (conversation as any).started_at || (conversation as any).created_at || null;
            const endedAtStr = (conversation as any).ended_at || null;

            return {
              id: conversation.id,
              leadName: conversation.lead_name || lead?.nome || `Lead ${conversation.phone}`,
              phone: conversation.phone,
              product: lead?.produto,
              email: lead?.email,
              status: mapTagToStatus(conversation.tag, analysis?.qualified),
              tag: conversation.tag,
              sentiment: sentimentData.sentiment,
              sentimentScore: sentimentData.score,
              sentimentIntensity: sentimentData.intensity,
              summary: analysis?.summary || generateSummaryFromMessages(messages),
              startedAt: startedAtStr ? new Date(startedAtStr) : new Date(),
              endedAt: endedAtStr ? new Date(endedAtStr) : undefined,
              duration: calculateDuration(startedAtStr, endedAtStr),
              positives,
              negatives,
              suggestions: analysis?.ai_suggestions || [],
              adSuggestions: analysis?.ad_suggestions || [],
              stageAfter: analysis?.stage_after || conversation.tag,
              qualified: analysis?.qualified || conversation.tag?.includes("Qualificando") || false,
              messages
            };
          });

        setConversations(mappedConversations);

        // Calculate stats
        const total = mappedConversations.length;
        const qualified = mappedConversations.filter(c => c.status === "qualified").length;
        const totalDuration = mappedConversations.reduce((acc, c) => acc + c.duration, 0);

        setStats({
          totalConversations: total,
          conversionRate: total > 0 ? (qualified / total) * 100 : 0,
          averageDuration: total > 0 ? totalDuration / total : 0,
        });
      } catch (err) {
        logger.error("Error fetching conversations:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [workspaceId]);

  return { conversations, stats, isLoading, error };
}
