import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, TrendingUp, Users } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";

interface Lead {
  id: string;
  name: string;
  phone: string;
  product: string;
  source: string;
  createdAt: Date;
}

interface Column {
  id: string;
  title: string;
  leads: Lead[];
}

const Qualificacao = () => {
  const [workspaceId, setWorkspaceId] = useState("3f14bb25-0eda-4c58-8486-16b96dca6f9e");
  
  const [columns, setColumns] = useState<Record<string, Column>>({
    recebidos: {
      id: "recebidos",
      title: "Recebidos",
      leads: [
        { id: "1", name: "João Silva", phone: "11999999999", product: "Produto A", source: "Meta Ads", createdAt: new Date() },
        { id: "2", name: "Maria Santos", phone: "11888888888", product: "Produto B", source: "Google Ads", createdAt: new Date() },
      ],
    },
    qualificacao: {
      id: "qualificacao",
      title: "Em Qualificação",
      leads: [
        { id: "3", name: "Pedro Costa", phone: "11777777777", product: "Produto A", source: "Meta Ads", createdAt: new Date() },
      ],
    },
    qualificados: {
      id: "qualificados",
      title: "Qualificados",
      leads: [
        { id: "4", name: "Ana Lima", phone: "11666666666", product: "Produto C", source: "Indicação", createdAt: new Date() },
      ],
    },
    followup: {
      id: "followup",
      title: "Follow-up",
      leads: [],
    },
    descartados: {
      id: "descartados",
      title: "Descartados",
      leads: [],
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceLeads = [...sourceColumn.leads];
    const destLeads = source.droppableId === destination.droppableId ? sourceLeads : [...destColumn.leads];

    const [movedLead] = sourceLeads.splice(source.index, 1);
    destLeads.splice(destination.index, 0, movedLead);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, leads: sourceLeads },
      [destination.droppableId]: { ...destColumn, leads: destLeads },
    });
  };

  const totalLeads = Object.values(columns).reduce((acc, col) => acc + col.leads.length, 0);
  const qualifiedLeads = columns.qualificados.leads.length;
  const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

  const kpiCards = [
    {
      label: "Total de Leads",
      value: totalLeads.toString(),
      icon: "👥",
      gradient: "rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)",
      trend: { value: 12.5, isPositive: true },
      delay: 0,
    },
    {
      label: "Taxa de Qualificação",
      value: `${qualificationRate.toFixed(1)}%`,
      icon: "📊",
      gradient: "rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)",
      trend: { value: 8.3, isPositive: true },
      delay: 0.05,
    },
    {
      label: "Tempo Médio (IA)",
      value: "2m 34s",
      icon: "⏱️",
      gradient: "rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)",
      trend: { value: 5.1, isPositive: false },
      delay: 0.1,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={workspaceId}
        onWorkspaceChange={setWorkspaceId}
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
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
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
                                  <h4 className="font-semibold text-sm">{lead.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {lead.source}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{lead.phone}</p>
                                <p className="text-xs font-medium">{lead.product}</p>
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
