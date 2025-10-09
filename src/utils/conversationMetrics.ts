interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ConversationData {
  positives?: string[];
  negatives?: string[];
  qualified?: boolean;
  started_at?: string | null;
  ended_at?: string | null;
  messages?: Message[];
  ai_suggestions?: string[];
  summary?: string;
  tag?: string;
}

export const calculateEngagement = (conversation: ConversationData): number => {
  if (!conversation) return 0;
  
  const messageCount = conversation.messages?.length || 0;
  const hasPositives = (conversation.positives?.length || 0) > 0;
  const hasLongConversation = messageCount > 10;
  const isQualified = conversation.qualified || false;
  
  let score = 0;
  
  // Message count score (max 40 points)
  score += Math.min(40, messageCount * 2);
  
  // Quality indicators (max 30 points)
  if (hasPositives) score += 15;
  if (isQualified) score += 15;
  
  // Engagement indicators (max 30 points)
  if (hasLongConversation) score += 15;
  if (conversation.summary && conversation.summary.length > 100) score += 15;
  
  return Math.min(100, score);
};

export const calculateQualityScore = (conversation: ConversationData): number => {
  if (!conversation) return 0;
  
  const positivesCount = conversation.positives?.length || 0;
  const negativesCount = conversation.negatives?.length || 0;
  const isQualified = conversation.qualified || false;
  const hasSuggestions = (conversation.ai_suggestions?.length || 0) > 0;
  
  let score = 50; // Base score
  
  // Positives add points (max +30)
  score += Math.min(30, positivesCount * 10);
  
  // Negatives subtract points (max -20)
  score -= Math.min(20, negativesCount * 7);
  
  // Qualified status bonus (+20)
  if (isQualified) score += 20;
  
  // Has AI suggestions (means conversation was analyzed) (+10)
  if (hasSuggestions) score += 10;
  
  return Math.max(0, Math.min(100, score));
};

export const calculateResponseTime = (messages: Message[] = []): number => {
  if (!messages || messages.length < 2) return 0;
  
  const timestamps = messages
    .map(m => m.timestamp ? new Date(m.timestamp).getTime() : 0)
    .filter(t => t > 0);
  
  if (timestamps.length < 2) return 0;
  
  let totalDiff = 0;
  let count = 0;
  
  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i] - timestamps[i - 1];
    if (diff > 0 && diff < 3600000) { // Less than 1 hour
      totalDiff += diff;
      count++;
    }
  }
  
  return count > 0 ? Math.floor(totalDiff / count / 1000) : 0; // Return in seconds
};

export const identifyRiskFactors = (conversation: ConversationData): string[] => {
  const risks: string[] = [];
  
  // Add all negatives as risk factors
  if (conversation.negatives && conversation.negatives.length > 0) {
    risks.push(...conversation.negatives);
  }
  
  // Check for low engagement
  const engagement = calculateEngagement(conversation);
  if (engagement < 40) {
    risks.push("Baixo engajamento na conversa");
  }
  
  // Check status based on tag
  if (conversation.tag) {
    const tagLower = conversation.tag.toLowerCase();
    
    if (tagLower.includes('t5') || tagLower.includes('desqualificado')) {
      // Não adicionar como risco, já está desqualificado
    } else if (tagLower.includes('t1') || tagLower.includes('novo')) {
      risks.push("Lead ainda não iniciou qualificação");
    } else if (tagLower.includes('t2') || tagLower.includes('qualificando')) {
      risks.push("Lead em processo de qualificação - acompanhar");
    } else if (tagLower.includes('follow')) {
      risks.push("Cliente não está respondendo aos follow-ups");
    }
  }
  
  // Check for short conversation
  const messageCount = conversation.messages?.length || 0;
  if (messageCount < 5) {
    risks.push("Conversa muito curta - pouca interação");
  }
  
  return risks;
};

export const generateActivityTimeline = (conversation: ConversationData) => {
  const activities: Array<{
    time: Date;
    label: string;
    type: 'info' | 'success' | 'warning' | 'error';
    icon: string;
  }> = [];
  
  // Started conversation
  if (conversation.started_at) {
    activities.push({
      time: new Date(conversation.started_at),
      label: 'Conversa iniciada',
      type: 'info',
      icon: 'MessageSquare'
    });
  }
  
  // Messages exchanged
  const messageCount = conversation.messages?.length || 0;
  if (messageCount > 0 && conversation.started_at) {
    activities.push({
      time: new Date(conversation.started_at),
      label: `${messageCount} mensagens trocadas`,
      type: 'info',
      icon: 'MessageCircle'
    });
  }
  
  // Análise do status do lead baseado na TAG
  if (conversation.tag) {
    const tagLower = conversation.tag.toLowerCase();
    
    // Novo Lead (T1)
    if (tagLower.includes('t1') || tagLower.includes('novo')) {
      activities.push({
        time: conversation.started_at ? new Date(conversation.started_at) : new Date(),
        label: 'Novo lead - Primeira mensagem recebida',
        type: 'info',
        icon: 'UserPlus'
      });
    }
    
    // Qualificando (T2)
    else if (tagLower.includes('t2') || tagLower.includes('qualificando')) {
      activities.push({
        time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
        label: 'Lead em qualificação - Respondeu nome e seguindo fluxo',
        type: 'info',
        icon: 'Clock'
      });
    }
    
    // Qualificado (T3/T4)
    else if (tagLower.includes('t3') || tagLower.includes('t4') || tagLower.includes('qualificado')) {
      activities.push({
        time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
        label: 'Lead qualificado - Atendeu todos os requisitos',
        type: 'success',
        icon: 'CheckCircle2'
      });
    }
    
    // Desqualificado (T5)
    else if (tagLower.includes('t5') || tagLower.includes('desqualificado')) {
      let reason = 'Não atendeu requisitos de qualificação';
      
      // Tentar identificar o motivo pelos negativos
      if (conversation.negatives && conversation.negatives.length > 0) {
        const negativesText = conversation.negatives.join(' ').toLowerCase();
        
        if (negativesText.includes('faturamento') || negativesText.includes('30 mil')) {
          reason = 'Desqualificado - Faturamento abaixo de R$ 30 mil';
        } else if (negativesText.includes('distância') || negativesText.includes('30km') || negativesText.includes('montes claros')) {
          reason = 'Desqualificado - Fora do raio de 30km de Montes Claros';
        } else if (negativesText.includes('empresa') || negativesText.includes('cnpj')) {
          reason = 'Desqualificado - Não possui empresa';
        }
      }
      
      activities.push({
        time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
        label: reason,
        type: 'error',
        icon: 'XCircle'
      });
    }
    
    // Follow-up Concluído
    else if (tagLower.includes('follow') || tagLower.includes('follow-up concluido')) {
      activities.push({
        time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
        label: 'Follow-up concluído - Cliente não respondeu',
        type: 'warning',
        icon: 'AlertCircle'
      });
    }
  }
  
  // Summary generated
  if (conversation.summary) {
    activities.push({
      time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
      label: 'Resumo da conversa gerado',
      type: 'info',
      icon: 'FileText'
    });
  }
  
  // Insights generated
  if (conversation.positives && conversation.positives.length > 0) {
    activities.push({
      time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
      label: `${conversation.positives.length} insights positivos identificados`,
      type: 'success',
      icon: 'Lightbulb'
    });
  }
  
  // Objections detected
  if (conversation.negatives && conversation.negatives.length > 0) {
    activities.push({
      time: conversation.ended_at ? new Date(conversation.ended_at) : new Date(),
      label: `${conversation.negatives.length} pontos de melhoria detectados`,
      type: 'warning',
      icon: 'AlertTriangle'
    });
  }
  
  // Ended conversation
  if (conversation.ended_at) {
    activities.push({
      time: new Date(conversation.ended_at),
      label: 'Conversa finalizada',
      type: 'info',
      icon: 'CheckCircle'
    });
  }
  
  return activities.sort((a, b) => a.time.getTime() - b.time.getTime());
};

export const detectObjections = (messages: Message[] = []): string[] => {
  const objectionKeywords = [
    'caro', 'preço', 'não tenho', 'não posso', 'depois',
    'mais tarde', 'pensar', 'dúvida', 'problema', 'difícil'
  ];
  
  const objections: string[] = [];
  
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      objectionKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          objections.push(`Possível objeção detectada: "${msg.content.substring(0, 100)}..."`);
        }
      });
    }
  });
  
  return objections.slice(0, 5); // Limit to 5 objections
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getQualityScoreColor = (score: number): string => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
};

export const getQualityScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Precisa Melhorar';
};
