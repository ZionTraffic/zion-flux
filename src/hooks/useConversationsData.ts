import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { MIN_DATA_DATE } from '@/lib/constants';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { useCurrentTenant } from '@/contexts/TenantContext';
import { useTagMappings } from '@/hooks/useTagMappings';
import {
  LeadStage,
  normalizeStage,
  extractPrimaryTag,
  toStartOfDayIso,
  buildEndExclusiveIso,
} from './useLeadsShared';

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

export interface ConversationData {
  id: number;
  leadId?: string | null;
  leadName: string;
  phone: string;
  product?: string;
  email?: string;
  status: "qualified" | "follow-up" | "discarded";
  tag?: string;
  stage?: LeadStage;
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
  stageAfter: LeadStage | null;
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
  const { getStageFromTag, loading: mappingsLoading } = useTagMappings(tenant?.id || null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [stats, setStats] = useState<ConversationsStats>({
    totalConversations: 0,
    conversionRate: 0,
    averageDuration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!tenant || tenantLoading) {
      console.log('[useConversationsData] Aguardando tenant...');
      return;
    }

    // CIRCUIT BREAKER: Prevenir loop infinito
    if (isLoading) {
      console.warn('[useConversationsData] CIRCUIT BREAKER: Requisição já em andamento, ignorando');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // TEMPORARIAMENTE DESABILITADO - Causando loop infinito
      console.warn('[useConversationsData] TEMPORARIAMENTE DESABILITADO - Investigando tabela correta');
      setConversations([]);
      setStats({
        totalConversations: 0,
        conversionRate: 0,
        averageDuration: 0,
      });
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar conversas');
    } finally {
      setIsLoading(false);
    }
  }, [tenant, tenantLoading]);

  useEffect(() => {
    // TEMPORARIAMENTE DESABILITADO - Causando loop infinito
    console.warn('[useConversationsData] useEffect DESABILITADO para prevenir loop');
    setIsLoading(false);
    // fetchConversations();
  }, []);

  return {
    conversations,
    stats,
    isLoading,
    error,
    refetch: fetchConversations,
  };
}
