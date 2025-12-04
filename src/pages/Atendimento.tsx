import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useTenant } from "@/contexts/TenantContext";
import { MessageSquare, Users, Bot } from "lucide-react";
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { AtendimentosKpiCards } from "@/components/dashboard/AtendimentosKpiCards";
import { CSATAnalystTable } from "@/components/dashboard/CSATAnalystTablePremium";
import { useAtendimentosMetrics } from "@/hooks/useAtendimentosMetrics";
import { useCSATData } from "@/hooks/useCSATData";
import { ConversationHistorySection } from "@/components/dashboard/ConversationHistorySection";
import { useConversationsData } from "@/hooks/useConversationsData";
import { useSiegFinanceiroData } from "@/hooks/useSiegFinanceiroData";

const Atendimento = () => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  // Date range state - default to last 90 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { from, to };
  });

  // Hook para métricas de atendimento (com filtro de data)
  const atendimentosMetrics = useAtendimentosMetrics(null, dateRange?.from, dateRange?.to);
  
  // Hook para dados de CSAT (com filtro de data)
  const csatData = useCSATData('', dateRange?.from, dateRange?.to);

  // Verificar se é workspace SIEG Financeiro
  const isSiegFinanceiro = currentTenant?.slug === 'sieg-financeiro' || currentTenant?.slug?.includes('financeiro');

  // Hook para conversas genéricas
  const {
    conversations: genericConversations,
    stats: genericStats,
    isLoading: genericLoading,
  } = useConversationsData(currentTenant?.id || '', dateRange?.from, dateRange?.to);

  // Hook específico para SIEG Financeiro (busca da tabela financeiro_sieg)
  const {
    conversations: siegConversations,
    stats: siegStats,
    isLoading: siegLoading,
  } = useSiegFinanceiroData(dateRange?.from, dateRange?.to);

  // Usar dados do SIEG se for workspace financeiro, senão usar genérico
  const conversationHistory = isSiegFinanceiro ? siegConversations : genericConversations;
  const conversationStats = isSiegFinanceiro ? siegStats : genericStats;
  const conversationsLoading = isSiegFinanceiro ? siegLoading : genericLoading;

  const handleClearFilter = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    setDateRange({ from, to });
    toast({
      title: "Filtro limpo",
      description: "Exibindo dados dos últimos 90 dias",
    });
  };

  // Se não for SIEG Financeiro, mostrar mensagem de acesso negado
  if (!isSiegFinanceiro) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Página não disponível</h2>
          <p className="text-muted-foreground max-w-md">
            A tela de Atendimento está disponível apenas para o workspace SIEG Financeiro.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Atendimento</h1>
          <p className="text-muted-foreground">
            Central de métricas de atendimento, CSAT e performance de IA
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center justify-between gap-4">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onClearFilter={handleClearFilter}
            minDays={1}
            maxDays={90}
          />
        </div>

        {/* Métricas de Atendimento */}
        <AtendimentosKpiCards
          atendimentosHoje={atendimentosMetrics.atendimentosHoje}
          atendimentosIA={atendimentosMetrics.atendimentosIA}
          percentualIA={atendimentosMetrics.percentualIA}
          atendimentosTransferidos={atendimentosMetrics.atendimentosTransferidos}
          isLoading={atendimentosMetrics.isLoading}
        />

        {/* CSAT por Analista */}
        <CSATAnalystTable
          data={csatData.data}
          totals={csatData.totals}
          feedbacks={csatData.feedbacks}
          isLoading={csatData.isLoading}
          dateRange={dateRange}
          onDateRangeChange={(range) => setDateRange(range)}
        />

        {/* Histórico de Conversas */}
        <ConversationHistorySection
          conversations={conversationHistory}
          stats={conversationStats}
          isLoading={conversationsLoading}
          workspaceSlug={currentTenant?.slug}
        />
      </div>
    </DashboardLayout>
  );
};

export default Atendimento;
