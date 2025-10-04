import { useState, useEffect } from "react";
import conversationsData from "@/data/mock/trainer-conversations.json";

export interface TrainerConversation {
  id: number;
  conversation_id: string;
  workspace_id: string;
  agent_name: string;
  summary_text: string;
  sentiment: number;
  duration: number;
  lead_status: string;
  created_at: string;
  total_messages: number;
}

export interface TrainerStats {
  satisfactionIndex: number;
  avgResponseTime: number;
  trainableCount: number;
  totalConversations: number;
  sentimentTrend: { day: string; sentiment: number; volume: number }[];
}

export function useTrainerData(workspaceId: string) {
  const [conversations, setConversations] = useState<TrainerConversation[]>([]);
  const [stats, setStats] = useState<TrainerStats>({
    satisfactionIndex: 0,
    avgResponseTime: 0,
    trainableCount: 0,
    totalConversations: 0,
    sentimentTrend: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar por workspace
      const filtered = conversationsData.filter(
        (conv) => conv.workspace_id === workspaceId
      );
      
      setConversations(filtered);
      
      // Calcular estatísticas
      const totalSentiment = filtered.reduce((sum, c) => sum + c.sentiment, 0);
      const avgSentiment = filtered.length > 0 ? totalSentiment / filtered.length : 0;
      
      const totalDuration = filtered.reduce((sum, c) => sum + c.duration, 0);
      const avgDuration = filtered.length > 0 ? totalDuration / filtered.length : 0;
      
      const trainable = filtered.filter(c => c.sentiment >= 0.3 && c.sentiment < 0.7);
      
      // Tendência de sentimento por dia
      const trendMap = new Map<string, { sentiment: number; count: number }>();
      filtered.forEach(conv => {
        const day = new Date(conv.created_at).toISOString().split('T')[0];
        const existing = trendMap.get(day) || { sentiment: 0, count: 0 };
        trendMap.set(day, {
          sentiment: existing.sentiment + conv.sentiment,
          count: existing.count + 1
        });
      });
      
      const sentimentTrend = Array.from(trendMap.entries())
        .map(([day, data]) => ({
          day: new Date(day).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          sentiment: data.sentiment / data.count,
          volume: data.count
        }))
        .sort((a, b) => a.day.localeCompare(b.day));
      
      setStats({
        satisfactionIndex: avgSentiment,
        avgResponseTime: avgDuration,
        trainableCount: trainable.length,
        totalConversations: filtered.length,
        sentimentTrend,
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, [workspaceId]);

  return { conversations, stats, isLoading };
}
