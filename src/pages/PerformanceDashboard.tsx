import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { PerformanceDiagnostic } from "@/components/performance/PerformanceDiagnostic";
import { PredictiveChart } from "@/components/performance/PredictiveChart";
import { AiAdvisor } from "@/components/performance/AiAdvisor";
import { PerformanceCompare } from "@/components/performance/PerformanceCompare";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { TrendingUp } from "lucide-react";

const PerformanceDashboard = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const { metrics, predictiveData, isLoading, refetch } = usePerformanceData(selectedWorkspace);

  const selectedWorkspaceName = metrics.find(m => m.workspaceId === selectedWorkspace)?.workspaceName;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-2">Carregando análise...</div>
          <p className="text-muted-foreground">Processando dados de performance</p>
        </div>
      </div>
    );
  }

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
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
            Painel de Performance Avançada
          </h1>
          <p className="text-muted-foreground">
            Análise preditiva e diagnóstico inteligente de performance
          </p>
        </div>

        {/* Workspace Selector for Predictions */}
        <div className="glass rounded-2xl p-4 border border-border/50">
          <label className="text-sm font-medium mb-2 block">Selecionar Workspace para Previsões</label>
          <select
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
            className="w-full md:w-96 glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
          >
            <option value="">Todas as workspaces</option>
            {metrics.map(m => (
              <option key={m.workspaceId} value={m.workspaceId} className="bg-background text-foreground">
                {m.workspaceName}
              </option>
            ))}
          </select>
        </div>

        {/* Diagnostic */}
        <PerformanceDiagnostic metrics={metrics} />

        {/* Predictive Chart */}
        <PredictiveChart data={predictiveData} workspaceName={selectedWorkspaceName} />

        {/* AI Advisor */}
        <AiAdvisor workspaceId={selectedWorkspace} />

        {/* Performance Compare */}
        <PerformanceCompare metrics={metrics} />
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Painel de Performance Avançada
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PerformanceDashboard;
