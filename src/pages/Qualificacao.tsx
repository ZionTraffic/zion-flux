import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { PremiumKpiCard } from "@/components/dashboard/cards/PremiumKpiCard";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useLeadsFromConversations, LeadStage } from "@/hooks/useLeadsFromConversations";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { DonutChart } from "@/components/dashboard/charts/DonutChart";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { FunnelPremium5Stages } from "@/components/dashboard/charts/FunnelPremium5Stages";

const Qualificacao = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { toast } = useToast();
  
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

  const applyQuickFilter = (type: 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
    const to = new Date();
    const from = new Date();
    
    switch(type) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        from.setDate(to.getDate() - 7);
        break;
      case 'last30days':
        from.setDate(to.getDate() - 30);
        break;
      case 'thisMonth':
        from.setDate(1);
        break;
      case 'lastMonth':
        from.setMonth(to.getMonth() - 1);
        from.setDate(1);
        to.setMonth(to.getMonth() - 1);
        to.setDate(new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate());
        break;
    }
    
    setDateRange({ from, to });
    toast({
      title: "Filtro aplicado",
      description: "Período atualizado",
    });
  };

  const isActiveFilter = (type: 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth') => {
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

  const kpiCards = [
    {
      label: "Total de Leads",
      value: kpis.totalLeads.toString(),
      icon: "👥",
      variant: 'emerald' as const,
      delay: 0,
    },
    {
      label: "Taxa de Qualificação",
      value: `${kpis.qualificationRate.toFixed(1)}%`,
      icon: "📊",
      variant: 'blue' as const,
      delay: 0.1,
    },
    {
      label: "Qualificados",
      value: kpis.qualifiedLeads.toString(),
      icon: "✅",
      variant: 'purple' as const,
      delay: 0.2,
    },
  ];

  return (
    <DashboardLayout
      onRefresh={refetch}
      isRefreshing={isLoading}
      lastUpdate={new Date()}
      currentWorkspace={currentWorkspaceId}
      onWorkspaceChange={handleWorkspaceChange}
    >
      {/* Date Range Filter with Quick Filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          <div className="flex-1">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilter={handleClearFilter}
              minDays={1}
              maxDays={90}
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('today')}
              className={cn(
                "glass-medium",
                isActiveFilter('today') && "border-primary bg-primary/10"
              )}
            >
              Hoje
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('last7days')}
              className={cn(
                "glass-medium",
                isActiveFilter('last7days') && "border-primary bg-primary/10"
              )}
            >
              Últimos 7 Dias
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('last30days')}
              className={cn(
                "glass-medium",
                isActiveFilter('last30days') && "border-primary bg-primary/10"
              )}
            >
              Últimos 30 Dias
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('thisMonth')}
              className={cn(
                "glass-medium",
                isActiveFilter('thisMonth') && "border-primary bg-primary/10"
              )}
            >
              Este Mês
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter('lastMonth')}
              className={cn(
                "glass-medium",
                isActiveFilter('lastMonth') && "border-primary bg-primary/10"
              )}
            >
              Mês Passado
            </Button>
          </div>
        </div>
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
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <BarChart 
            data={charts?.dailyLeads || []} 
            title="Novos Leads (Por Dia)" 
            valueType="number" 
          />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <DonutChart 
            data={charts?.stageDistribution || []} 
            title="Distribuição por Estágio" 
          />
        </div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <LineChart 
            data={charts?.dailyQualified || []} 
            title="Leads Qualificados (Evolução)" 
          />
        </div>
        <div className="glass rounded-2xl p-6 border border-border/50 shadow-premium">
          <FunnelPremium5Stages 
            stages={charts.funnelData as [any, any, any, any, any]} 
            coinsCount={16} 
            showCoins={true} 
          />
        </div>
      </div>

    </DashboardLayout>
  );
};

export default Qualificacao;
