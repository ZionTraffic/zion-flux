import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { TrainerKpiCard } from "@/components/trainer/TrainerKpiCard";
import { TrainerInsightCard } from "@/components/trainer/TrainerInsightCard";
import { AiTrainerNarrative } from "@/components/trainer/AiTrainerNarrative";
import { SentimentChart } from "@/components/trainer/SentimentChart";
import { TrainerTable } from "@/components/trainer/TrainerTable";
import { TrainerModal } from "@/components/trainer/TrainerModal";
import { useTrainerData, TrainerConversation } from "@/hooks/useTrainerData";
import insightsData from "@/data/mock/trainer-insights.json";
import { Gauge, Clock, MessageSquare, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  TrendingUp,
  AlertTriangle,
  Clock,
  MessageSquare,
};

const AiTrainer = () => {
  const workspaceId = "3f14bb25-0eda-4c58-8486-16b96dca6f9e";
  const { conversations, stats, isLoading } = useTrainerData(workspaceId);
  const [selectedConversation, setSelectedConversation] = useState<TrainerConversation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (conversation: TrainerConversation) => {
    setSelectedConversation(conversation);
    setModalOpen(true);
  };

  const kpis = [
    {
      icon: Gauge,
      label: "Índice de Satisfação",
      value: `${(stats.satisfactionIndex * 100).toFixed(0)}%`,
      subtitle: "Baseado em sentimento médio",
      colorScheme: "emerald" as const,
    },
    {
      icon: Clock,
      label: "Tempo Médio de Resposta",
      value: `${Math.floor(stats.avgResponseTime / 60)}m ${stats.avgResponseTime % 60}s`,
      subtitle: "Duração média por conversa",
      colorScheme: "blue" as const,
    },
    {
      icon: MessageSquare,
      label: "Conversas Treináveis",
      value: stats.trainableCount.toString(),
      subtitle: "Identificadas para melhoria",
      colorScheme: "amber" as const,
    },
    {
      icon: Lightbulb,
      label: "Total de Conversas",
      value: stats.totalConversations.toString(),
      subtitle: "Analisadas nos últimos 30 dias",
      colorScheme: "violet" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-2">Carregando análises...</div>
          <p className="text-muted-foreground">Processando conversas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={workspaceId}
        onWorkspaceChange={() => {}}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Treinador de IA</h1>
          <p className="text-muted-foreground">
            Análise inteligente de conversas e recomendações de otimização
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <TrainerKpiCard
              key={index}
              {...kpi}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Insights */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Insights de Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insightsData.map((insight, index) => {
              const IconComponent = iconMap[insight.iconName];
              return (
                <TrainerInsightCard
                  key={insight.id}
                  icon={IconComponent}
                  title={insight.title}
                  description={insight.description}
                  suggestion={insight.suggestion}
                  type={insight.type as any}
                  delay={index * 0.1}
                />
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <SentimentChart data={stats.sentimentTrend} />

        {/* AI Narrative */}
        <AiTrainerNarrative />

        {/* Table */}
        <TrainerTable 
          conversations={conversations} 
          onViewDetails={handleViewDetails}
        />
      </main>

      {/* Modal */}
      <TrainerModal
        conversation={selectedConversation}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Treinador de IA Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AiTrainer;
