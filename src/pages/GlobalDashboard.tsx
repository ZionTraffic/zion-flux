import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { GlobalKpiCard } from "@/components/global/GlobalKpiCard";
import { AiGlobalInsights } from "@/components/global/AiGlobalInsights";
import { GlobalPerformanceChart } from "@/components/global/GlobalPerformanceChart";
import { WorkspaceMiniCard } from "@/components/global/WorkspaceMiniCard";
import { useGlobalData } from "@/hooks/useGlobalData";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, DollarSign, Brain, MessageCircle, Search, Globe } from "lucide-react";

const GlobalDashboard = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { data, isLoading, refetch } = useGlobalData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkspaces = data?.workspaces.filter((workspace) =>
    workspace.workspaceName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-2">Carregando dados globais...</div>
          <p className="text-muted-foreground">Consolidando informações de todas as workspaces</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const kpis = [
    {
      icon: Users,
      label: "Total de Leads",
      value: data.kpis.totalLeads.toLocaleString('pt-BR'),
      subtitle: "Todas as workspaces",
      colorScheme: "blue" as const,
    },
    {
      icon: TrendingUp,
      label: "Conversão Média",
      value: `${data.kpis.avgConversion.toFixed(1)}%`,
      subtitle: "Média ponderada",
      colorScheme: "emerald" as const,
    },
    {
      icon: DollarSign,
      label: "CPL Médio",
      value: `R$ ${data.kpis.avgCpl.toFixed(2)}`,
      subtitle: "Custo por lead global",
      colorScheme: "amber" as const,
    },
    {
      icon: Brain,
      label: "Eficiência IA",
      value: `${Math.floor(data.kpis.avgAiEfficiency / 60)}m ${data.kpis.avgAiEfficiency % 60}s`,
      subtitle: "Tempo médio de resposta",
      colorScheme: "violet" as const,
    },
    {
      icon: MessageCircle,
      label: "Conversas Ativas",
      value: data.kpis.activeConversations,
      subtitle: "Total do dia",
      colorScheme: "purple" as const,
    },
  ];

  const workspaceNames = data.workspaces.map(w => w.workspaceName);

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={refetch} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={setCurrentWorkspaceId}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <Globe className="h-8 w-8 text-blue-400" />
            </div>
            Painel Global
          </h1>
          <p className="text-muted-foreground">
            Visão consolidada de todas as suas operações
          </p>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => (
            <GlobalKpiCard
              key={index}
              {...kpi}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* AI Insights */}
        <AiGlobalInsights />

        {/* Performance Chart */}
        {data.chartData.length > 0 && (
          <GlobalPerformanceChart 
            data={data.chartData} 
            workspaceNames={workspaceNames}
          />
        )}

        {/* Workspace Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Performance por Workspace</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-medium border-border/50"
              />
            </div>
          </div>

          {filteredWorkspaces.length === 0 ? (
            <div className="glass rounded-2xl p-12 border border-border/50 text-center">
              <p className="text-muted-foreground">Nenhuma workspace encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkspaces.map((workspace, index) => (
                <WorkspaceMiniCard
                  key={workspace.workspaceId}
                  workspaceId={workspace.workspaceId}
                  workspaceName={workspace.workspaceName}
                  leads={workspace.leads}
                  conversions={workspace.conversions}
                  spend={workspace.spend}
                  cpl={workspace.cpl}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Painel Global Consolidado
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GlobalDashboard;
