import { InsightCard } from "@/components/operations/InsightCard";
import { OperationalKpiCard } from "@/components/operations/OperationalKpiCard";
import { BottleneckChart } from "@/components/operations/BottleneckChart";
import { AiNarrative } from "@/components/operations/AiNarrative";
import { Header } from "@/components/ui/Header";
import insightsData from "@/data/mock/insights.json";

const OperationsManager = () => {
  const operationalKpis = [
    {
      icon: "🎯",
      label: "Taxa de Conversão Final",
      value: "4.2%",
      subtitle: "Leads → Clientes",
      gradient: "rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)",
    },
    {
      icon: "⚙️",
      label: "Eficiência da IA",
      value: "2m 34s",
      subtitle: "Tempo médio de resposta",
      gradient: "rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)",
    },
    {
      icon: "💬",
      label: "Taxa de Retorno",
      value: "18.5%",
      subtitle: "Leads reativados",
      gradient: "rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05)",
    },
    {
      icon: "📅",
      label: "Conversas Ativas Hoje",
      value: "47",
      subtitle: "Abertas nas últimas 24h",
      gradient: "rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace="3f14bb25-0eda-4c58-8486-16b96dca6f9e"
        onWorkspaceChange={() => {}}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Gerente de Operações</h1>
          <p className="text-muted-foreground">
            Insights inteligentes, análise de gargalos e recomendações estratégicas
          </p>
        </div>

        {/* Operational KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalKpis.map((kpi, index) => (
            <OperationalKpiCard
              key={index}
              {...kpi}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* AI Insights */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Insights Automáticos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insightsData.map((insight, index) => (
              <InsightCard
                key={insight.id}
                icon={insight.icon}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                type={insight.type as any}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        <BottleneckChart />

        {/* AI Narrative */}
        <AiNarrative />
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Gerente de Operações Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OperationsManager;
