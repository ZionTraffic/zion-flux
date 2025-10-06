import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ConversationData {
  id: number;
  leadName: string;
  phone: string;
  product?: string;
  status: "qualified" | "follow-up" | "discarded";
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  positives: string[];
  negatives: string[];
  suggestions: string[];
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

        const { data: analysisData, error: analysisError } = await supabase
          .from("analise_ia")
          .select(`
            id,
            summary,
            qualified,
            positives,
            negatives,
            ai_suggestions,
            started_at,
            ended_at,
            phone,
            lead_id,
            leads (
              nome,
              produto,
              stage
            )
          `)
          .eq("workspace_id", workspaceId)
          .order("started_at", { ascending: false });

        if (analysisError) throw analysisError;

        const conversationsData: ConversationData[] = (analysisData || []).map((item: any) => {
          const positives = item.positives || [];
          const negatives = item.negatives || [];
          const leadData = item.leads || {};

          let status: "qualified" | "follow-up" | "discarded" = "discarded";
          if (item.qualified) {
            status = "qualified";
          } else if (leadData.stage === "follow-up") {
            status = "follow-up";
          }

          return {
            id: item.id,
            leadName: leadData.nome || "Lead sem nome",
            phone: item.phone || "",
            product: leadData.produto,
            status,
            sentiment: calculateSentiment(positives, negatives),
            summary: item.summary || "Sem resumo disponível",
            startedAt: item.started_at ? new Date(item.started_at) : new Date(),
            endedAt: item.ended_at ? new Date(item.ended_at) : undefined,
            duration: calculateDuration(item.started_at, item.ended_at),
            positives,
            negatives,
            suggestions: item.ai_suggestions || [],
          };
        });

        setConversations(conversationsData);

        // Calculate stats
        const total = conversationsData.length;
        const qualified = conversationsData.filter(c => c.status === "qualified").length;
        const totalDuration = conversationsData.reduce((acc, c) => acc + c.duration, 0);

        setStats({
          totalConversations: total,
          conversionRate: total > 0 ? (qualified / total) * 100 : 0,
          averageDuration: total > 0 ? totalDuration / total : 0,
        });
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas");
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversations();
  }, [workspaceId]);

  return { conversations, stats, isLoading, error };
}
