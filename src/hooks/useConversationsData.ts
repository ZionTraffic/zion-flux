import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

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
  sentiment: "positive" | "neutral" | "negative";
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

function calculateSentiment(positives: string[], negatives: string[]): "positive" | "neutral" | "negative" {
  const score = positives.length - negatives.length;
  if (score > 1) return "positive";
  if (score < -1) return "negative";
  return "neutral";
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

function analyzeSentimentFromMessages(messages: any[]): "positive" | "neutral" | "negative" {
  if (!messages || messages.length === 0) return "neutral";
  
  const positiveWords = ["sim", "ótimo", "bom", "perfeito", "obrigado", "interessado", "quero", "gostei"];
  const negativeWords = ["não", "ruim", "problema", "difícil", "caro", "impossível", "desculpa"];
  
  let score = 0;
  
  messages.forEach(msg => {
    if (msg.role === "user") {
      const content = msg.content?.toLowerCase() || "";
      positiveWords.forEach(word => {
        if (content.includes(word)) score += 1;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) score -= 1;
      });
    }
  });
  
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
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
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [stats, setStats] = useState<ConversationsStats>({
    totalConversations: 0,
    conversionRate: 0,
    averageDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      if (!workspaceId) return;

      try {
        setIsLoading(true);
        setError(null);

        // 1. Buscar conversas principais de historico_conversas
        const { data: conversationsData, error: conversationsError } = await supabase
          .from("historico_conversas")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("started_at", { ascending: false });

        if (conversationsError) throw conversationsError;

        // 2. Para cada conversa, buscar dados complementares
        const enrichedConversations = await Promise.all(
          (conversationsData || []).map(async (conv) => {
            // Buscar análise IA (opcional)
            const { data: analysisData } = await supabase
              .from("analise_ia")
              .select("*")
              .eq("phone", conv.phone)
              .eq("workspace_id", workspaceId)
              .maybeSingle();

            // Buscar lead (opcional)
            const { data: leadData } = await supabase
              .from("leads")
              .select("nome, email, produto, stage")
              .eq("telefone", conv.phone)
              .eq("workspace_id", workspaceId)
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
          .filter(item => item.conversation.phone) // Filtrar conversas sem telefone
          .map(({ conversation, analysis, lead }) => {
            // Mensagens já vêm direto de historico_conversas.messages
            const messages: Message[] = Array.isArray(conversation.messages) 
              ? (conversation.messages as unknown as Message[])
              : [];

            const positives = analysis?.positives || [];
            const negatives = analysis?.negatives || [];

            return {
              id: conversation.id,
              leadName: conversation.lead_name || lead?.nome || `Lead ${conversation.phone}`,
              phone: conversation.phone,
              product: lead?.produto,
              email: lead?.email,
              status: mapTagToStatus(conversation.tag, analysis?.qualified),
              sentiment: analysis 
                ? calculateSentiment(positives, negatives)
                : analyzeSentimentFromMessages(messages),
              summary: analysis?.summary || generateSummaryFromMessages(messages),
              startedAt: conversation.started_at ? new Date(conversation.started_at) : new Date(),
              endedAt: conversation.ended_at ? new Date(conversation.ended_at) : undefined,
              duration: calculateDuration(conversation.started_at, conversation.ended_at),
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
    }

    fetchConversations();
  }, [workspaceId]);

  return { conversations, stats, isLoading, error };
}
