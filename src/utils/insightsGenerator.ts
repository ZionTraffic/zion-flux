import { LucideIcon } from "lucide-react";

export interface AiInsight {
  id: number;
  title: string;
  description: string;
  type: "performance" | "alert" | "opportunity" | "success";
  iconName: string;
  workspaceId?: string;
  priority: number;
}

interface WorkspaceMetrics {
  id: string;
  name: string;
  conversion: number;
  cpl: number;
  leads: number;
  investment: number;
}

export function generateAiInsights(workspaces: WorkspaceMetrics[]): AiInsight[] {
  const insights: AiInsight[] = [];
  let insightId = 1;

  if (workspaces.length === 0) {
    return [{
      id: 1,
      title: "Aguardando dados",
      description: "Configure seus workspaces e comece a receber insights inteligentes baseados em dados reais.",
      type: "success",
      iconName: "Target",
      priority: 1,
    }];
  }

  // Calcular médias globais
  const avgConversion = workspaces.reduce((sum, w) => sum + w.conversion, 0) / workspaces.length;
  const avgCpl = workspaces.reduce((sum, w) => sum + w.cpl, 0) / workspaces.length;
  const totalLeads = workspaces.reduce((sum, w) => sum + w.leads, 0);
  const totalInvestment = workspaces.reduce((sum, w) => sum + w.investment, 0);

  // 1. Performance: Workspace com melhor conversão
  const bestConversion = workspaces.reduce((best, current) =>
    current.conversion > best.conversion ? current : best
  );

  if (bestConversion.conversion > avgConversion * 1.2) {
    insights.push({
      id: insightId++,
      title: `${bestConversion.name} lidera em conversão`,
      description: `A ${bestConversion.name} mantém a melhor taxa de conversão com ${bestConversion.conversion.toFixed(1)}%, superando a média das demais workspaces em ${((bestConversion.conversion / avgConversion - 1) * 100).toFixed(0)}%.`,
      type: "performance",
      iconName: "TrendingUp",
      workspaceId: bestConversion.id,
      priority: 3,
    });
  }

  // 2. Alert: Workspace com CPL muito alto
  const highCplWorkspaces = workspaces.filter(w => w.cpl > avgCpl * 1.2 && w.cpl > 0);
  if (highCplWorkspaces.length > 0) {
    const worstCpl = highCplWorkspaces.reduce((worst, current) =>
      current.cpl > worst.cpl ? current : worst
    );

    insights.push({
      id: insightId++,
      title: `${worstCpl.name} com CPL elevado`,
      description: `O custo por lead do ${worstCpl.name} está ${((worstCpl.cpl / avgCpl - 1) * 100).toFixed(0)}% acima da média (R$ ${worstCpl.cpl.toFixed(2)} vs R$ ${avgCpl.toFixed(2)}). Sugerimos revisar segmentação de campanhas.`,
      type: "alert",
      iconName: "AlertTriangle",
      workspaceId: worstCpl.id,
      priority: 5,
    });
  }

  // 3. Opportunity: Workspace com baixa conversão mas bom CPL
  const opportunities = workspaces.filter(w =>
    w.conversion < avgConversion && w.cpl < avgCpl && w.leads > 10
  );

  if (opportunities.length > 0) {
    const bestOpportunity = opportunities[0];
    insights.push({
      id: insightId++,
      title: `${bestOpportunity.name} pode otimizar conversão`,
      description: `Com CPL competitivo de R$ ${bestOpportunity.cpl.toFixed(2)}, ${bestOpportunity.name} pode melhorar sua conversão de ${bestOpportunity.conversion.toFixed(1)}% ajustando critérios de qualificação da IA.`,
      type: "opportunity",
      iconName: "Zap",
      workspaceId: bestOpportunity.id,
      priority: 4,
    });
  }

  // 4. Success: Volume total em crescimento
  if (totalLeads > 50) {
    insights.push({
      id: insightId++,
      title: "Volume consolidado saudável",
      description: `O volume consolidado atingiu ${totalLeads} leads com investimento de R$ ${totalInvestment.toFixed(2)}, mantendo CPL médio de R$ ${avgCpl.toFixed(2)}.`,
      type: "success",
      iconName: "Target",
      priority: 2,
    });
  }

  // 5. Alert: Workspace com baixa conversão
  const lowConversion = workspaces.filter(w => w.conversion < 50 && w.leads > 10);
  if (lowConversion.length > 0) {
    const worst = lowConversion.reduce((w1, w2) => w1.conversion < w2.conversion ? w1 : w2);
    insights.push({
      id: insightId++,
      title: `${worst.name} com baixa qualificação`,
      description: `Taxa de qualificação de apenas ${worst.conversion.toFixed(1)}% detectada. Recomendamos revisar prompts de qualificação e critérios da IA.`,
      type: "alert",
      iconName: "AlertTriangle",
      workspaceId: worst.id,
      priority: 4,
    });
  }

  // Ordenar por prioridade (maior primeiro) e limitar a 4 insights
  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4);
}

export function generateWorkspaceRecommendations(
  kpi: any,
  aiData: { avgSentiment: number; avgDuration: number; trainable: number; critical: number }
): string[] {
  const recommendations: string[] = [];

  // Análise de follow-up
  if (kpi.followup > kpi.qualificados * 0.5 && kpi.followup > 5) {
    recommendations.push('Implementar automação de follow-up para reduzir tempo de resposta e aumentar taxa de conversão');
  }

  // Análise de tempo de resposta da IA
  if (aiData.avgDuration > 300) {
    recommendations.push('Otimizar prompt da IA para respostas mais rápidas (tempo médio acima de 5 minutos detectado)');
  }

  // Análise de conversas treináveis
  if (aiData.trainable > 10) {
    recommendations.push(`Revisar ${aiData.trainable} conversas treináveis para aprimorar base de conhecimento da IA`);
  }

  // Análise de taxa de descarte
  const discardRate = kpi.descartados / Math.max(kpi.recebidos, 1);
  if (discardRate > 0.2 && kpi.descartados > 5) {
    recommendations.push(`Taxa de descarte em ${(discardRate * 100).toFixed(1)}% - refinar segmentação de anúncios para reduzir leads não qualificados`);
  }

  // Análise de CPL
  if (kpi.cpl > 40) {
    recommendations.push(`CPL de R$ ${kpi.cpl.toFixed(2)} acima do ideal - considerar ajustar lances e segmentação de audiência`);
  }

  // Análise de taxa de conversão
  const conversionRate = (kpi.qualificados / Math.max(kpi.recebidos, 1)) * 100;
  if (conversionRate < 50 && kpi.recebidos > 10) {
    recommendations.push(`Taxa de conversão de ${conversionRate.toFixed(1)}% abaixo do esperado - revisar critérios de qualificação`);
  }

  // Análise de conversas críticas
  if (aiData.critical > 5) {
    recommendations.push(`${aiData.critical} conversas críticas detectadas - análise manual urgente necessária para evitar perda de leads`);
  }

  // Se tudo estiver bem
  if (recommendations.length === 0) {
    recommendations.push('Desempenho dentro dos padrões esperados - manter estratégia atual e monitorar tendências');
  }

  return recommendations;
}

export function generateWorkspaceInsights(
  kpi: any,
  aiData: { avgSentiment: number; avgDuration: number; trainable: number; critical: number }
): string[] {
  const insights: string[] = [];

  // Análise de CPL
  if (kpi.cpl > 50) {
    insights.push('CPL acima da média do mercado - revisar estratégia de segmentação e lances');
  } else if (kpi.cpl < 30) {
    insights.push('CPL competitivo detectado - oportunidade para escalar campanhas mantendo eficiência');
  }

  // Análise de qualificação
  const qualificationRate = kpi.qualificados / Math.max(kpi.recebidos, 1);
  if (qualificationRate < 0.3 && kpi.recebidos > 10) {
    insights.push('Taxa de qualificação baixa - melhorar critérios de filtro inicial e prompts da IA');
  } else if (qualificationRate > 0.7) {
    insights.push('Excelente taxa de qualificação - critérios bem ajustados');
  }

  // Análise de sentimento
  if (aiData.avgSentiment < 0.5) {
    insights.push('Sentimento geral negativo detectado - ajustar tom e abordagem da IA nas conversas');
  } else if (aiData.avgSentiment > 0.8) {
    insights.push('Sentimento positivo consistente - leads demonstram boa receptividade');
  }

  // Análise de conversas críticas
  if (aiData.critical > 5) {
    insights.push(`${aiData.critical} conversas críticas detectadas - análise urgente necessária`);
  }

  // Análise de investimento vs resultados
  const roi = kpi.qualificados / Math.max(kpi.investimento / 100, 1);
  if (roi > 2) {
    insights.push('ROI positivo - cada R$ 100 investidos gera mais de 2 leads qualificados');
  }

  // Análise de tempo de resposta
  if (aiData.avgDuration < 120) {
    insights.push('Tempo de resposta da IA otimizado - média abaixo de 2 minutos');
  }

  return insights;
}
