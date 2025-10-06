import { Header } from "@/components/ui/Header";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useLeadsKanban, LeadStage } from "@/hooks/useLeadsKanban";

const Qualificacao = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { columns, isLoading, error, moveLead, refetch, kpis } = useLeadsKanban(currentWorkspaceId);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const leadId = parseInt(result.draggableId);
    const fromStage = source.droppableId as LeadStage;
    const toStage = destination.droppableId as LeadStage;

    moveLead(leadId, fromStage, toStage, source.index, destination.index);
  };

  const kpiCards = [
    {
      label: "Total de Leads",
      value: kpis.totalLeads.toString(),
      icon: "👥",
      gradient: "rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)",
      trend: { value: 12.5, isPositive: true },
      delay: 0,
    },
    {
      label: "Taxa de Qualificação",
      value: `${kpis.qualificationRate.toFixed(1)}%`,
      icon: "📊",
      gradient: "rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)",
      trend: { value: 8.3, isPositive: true },
      delay: 0.05,
    },
    {
      label: "Qualificados",
      value: kpis.qualifiedLeads.toString(),
      icon: "⏱️",
      gradient: "rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)",
      trend: { value: 5.1, isPositive: true },
      delay: 0.1,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={refetch} 
        isRefreshing={isLoading} 
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={setCurrentWorkspaceId}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Qualificação de Leads</h1>
          <p className="text-muted-foreground">
            Gerencie o funil de qualificação com drag & drop
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.label} {...card} />
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass rounded-xl p-6 border border-destructive/50 text-center">
            <p className="text-destructive">Erro ao carregar leads: {error}</p>
            <Button onClick={refetch} className="mt-4">Tentar novamente</Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.values(columns).map((column) => (
              <div key={column.id} className="space-y-3">
                <div className="glass rounded-xl p-3 border border-border/50">
                  <h3 className="font-semibold text-sm mb-1">{column.title}</h3>
                  <p className="text-xs text-muted-foreground">{column.leads.length} leads</p>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[400px] rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      }`}
                    >
                      {column.leads.map((lead, index) => (
                        <Draggable key={lead.id.toString()} draggableId={lead.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 cursor-move hover:shadow-lg transition-all ${
                                snapshot.isDragging ? "shadow-2xl ring-2 ring-primary" : ""
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-semibold text-sm">{lead.nome || 'Sem nome'}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {lead.canal_origem || 'N/A'}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{lead.telefone}</p>
                                <p className="text-xs font-medium">{lead.produto || 'Sem produto'}</p>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-full text-xs"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Ver Conversa
                                </Button>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
          </DragDropContext>
        )}
      </main>

      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Sistema de Qualificação Inteligente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Qualificacao;
