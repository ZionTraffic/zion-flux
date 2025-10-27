import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PremiumKpiCard } from "@/components/dashboard/cards/PremiumKpiCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useLeadsFromConversations, LeadStage } from "@/hooks/useLeadsFromConversations";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NovoLeadsChart from "@/components/qualificacao/NovoLeadsChart";
import LeadsQualificadosChart from "@/components/qualificacao/LeadsQualificadosChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { FunnelPremium5Stages } from "@/components/dashboard/charts/FunnelPremium5Stages";
import { supabase } from "@/integrations/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { QualificacaoPDF } from "@/components/reports/QualificacaoPDF";
import { format } from "date-fns";
import { useEffect } from "react";

const Qualificacao = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { currentDatabase } = useDatabase();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [workspaceSlug, setWorkspaceSlug] = useState<string>('');
  
  // Date range state - default to last 90 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { from, to };
  });

  const { columns, isLoading, error, moveLead, refetch, kpis, charts } = useLeadsFromConversations(
    currentWorkspaceId,
    dateRange?.from,
    dateRange?.to
  );

  // Buscar workspace slug
  useEffect(() => {
    const fetchWorkspaceSlug = async () => {
      if (!currentWorkspaceId) return;
      const { data: ws } = await supabase
        .from('workspaces')
        .select('slug')
        .eq('id', currentWorkspaceId)
        .maybeSingle();
      setWorkspaceSlug(ws?.slug || '');
    };
    fetchWorkspaceSlug();
  }, [currentWorkspaceId]);

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

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

  const applyQuickFilter = (type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
    const to = new Date();
    const from = new Date();
    
    switch(type) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        from.setDate(to.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        from.setDate(to.getDate() - 7);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        from.setDate(to.getDate() - 30);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'thisMonth':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        from.setMonth(to.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setMonth(to.getMonth() - 1);
        to.setDate(new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate());
        to.setHours(23, 59, 59, 999);
        break;
    }
    
    setDateRange({ from, to });
    toast({
      title: "Filtro aplicado",
      description: "Período atualizado",
    });
  };

  const isActiveFilter = (type: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
    if (!dateRange?.from || !dateRange?.to) return false;
    
    const today = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
    
    switch(type) {
      case 'today': {
        return isSameDay(dateRange.from, today) && isSameDay(dateRange.to, today);
      }
      case 'yesterday': {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return isSameDay(dateRange.from, yesterday) && isSameDay(dateRange.to, yesterday);
      }
      case 'last7days': {
        const from = new Date();
        from.setDate(today.getDate() - 7);
        return isSameDay(dateRange.from, from) && isSameDay(dateRange.to, today);
      }
      case 'last30days': {
        const from = new Date();
        from.setDate(today.getDate() - 30);
        return isSameDay(dateRange.from, from) && isSameDay(dateRange.to, today);
      }
      case 'thisMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return isSameDay(dateRange.from, firstDay) && isSameDay(dateRange.to, today);
      }
      case 'lastMonth': {
        const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        return isSameDay(dateRange.from, firstDay) && isSameDay(dateRange.to, lastDay);
      }
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const leadId = parseInt(result.draggableId);
    const fromStage = source.droppableId as LeadStage;
    const toStage = destination.droppableId as LeadStage;

    moveLead(leadId, fromStage, toStage);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await pdf(
        <QualificacaoPDF
          kpis={kpis}
          charts={charts}
          dateRange={dateRange}
          workspaceName={currentWorkspaceId}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = dateRange?.from && dateRange?.to 
        ? `${format(dateRange.from, 'yyyy-MM-dd')}-${format(dateRange.to, 'yyyy-MM-dd')}`
        : format(new Date(), 'yyyy-MM-dd');
      link.download = `qualificacao-${currentWorkspaceId}-${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "✅ Relatório de Qualificação exportado!",
        description: "PDF gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "❌ Erro ao gerar PDF",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const kpiCards = [
    {
      label: "Total de Leads",
      value: kpis.totalLeads.toString(),
      icon: "👥",
      variant: 'blue' as const,
      delay: 0,
    },
    {
      label: "Recuperados IA",
      value: `${Math.ceil(kpis.qualificationRate * 10) / 10}%`,
      icon: "📊",
      variant: 'blue' as const,
      delay: 0.1,
    },
    {
      label: "Qualificados",
      value: kpis.qualifiedLeads.toString(),
      icon: "✅",
      variant: 'blue' as const,
      delay: 0.2,
    },
  ];

  const componentKey = `${currentWorkspaceId}-${currentDatabase}`;

  return (
    <DashboardLayout key={componentKey}
      onRefresh={refetch}
      isRefreshing={isLoading}
      lastUpdate={new Date()}
      currentWorkspace={currentWorkspaceId}
      onWorkspaceChange={handleWorkspaceChange}
      onExportPdf={handleExportPdf}
      isExporting={isExporting}
    >
      {/* Date Range Filter */}
      <div className="mb-6">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClearFilter={handleClearFilter}
          minDays={1}
          maxDays={90}
        />
      </div>

      {/* Title and Description */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Qualificação de Leads</h1>
        <p className="text-muted-foreground">
          Gerencie o funil de qualificação com drag & drop
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card) => (
          <PremiumKpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <NovoLeadsChart data={charts?.dailyLeads || []} />
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <DonutChart 
            data={(charts?.stageDistribution || []).filter(item => !item.name.includes('Desqualificado'))} 
            title="Distribuição por Estágio" 
          />
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LeadsQualificadosChart data={charts?.dailyQualified || []} />
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <FunnelPremium5Stages 
            stages={workspaceSlug === 'sieg' 
              ? [...charts.funnelData, { id: 'hidden', label: '', value: 0 }] as [any, any, any, any, any]
              : charts.funnelData as [any, any, any, any, any]
            } 
            coinsCount={16} 
            showCoins={true} 
          />
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Qualificacao;
