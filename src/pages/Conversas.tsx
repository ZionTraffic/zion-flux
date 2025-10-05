import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, TrendingUp, Clock, Users, Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  leadName: string;
  product: string;
  status: "qualified" | "follow-up" | "discarded";
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  createdAt: Date;
  insights: {
    positives: string[];
    improvements: string[];
    suggestions: string[];
  };
}

const Conversas = () => {
  const [workspaceId, setWorkspaceId] = useState("3f14bb25-0eda-4c58-8486-16b96dca6f9e");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const conversations: Conversation[] = [
    {
      id: "1",
      leadName: "João Silva",
      product: "Produto A",
      status: "qualified",
      sentiment: "positive",
      summary: "Lead demonstrou interesse em agendar reunião para conhecer melhor o produto.",
      createdAt: new Date("2025-01-15"),
      insights: {
        positives: ["Resposta rápida", "Interesse genuíno", "Disponibilidade imediata"],
        improvements: ["Adicionar mais detalhes sobre preços", "Enviar material complementar"],
        suggestions: ["Agendar follow-up em 48h", "Preparar proposta personalizada"],
      },
    },
    {
      id: "2",
      leadName: "Maria Santos",
      product: "Produto B",
      status: "follow-up",
      sentiment: "neutral",
      summary: "Lead solicitou mais informações sobre condições de pagamento.",
      createdAt: new Date("2025-01-14"),
      insights: {
        positives: ["Engajamento ativo", "Perguntas específicas"],
        improvements: ["Responder com mais clareza sobre parcelamento"],
        suggestions: ["Enviar simulação de financiamento", "Ligar em 24h"],
      },
    },
    {
      id: "3",
      leadName: "Pedro Costa",
      product: "Produto C",
      status: "discarded",
      sentiment: "negative",
      summary: "Lead não se encaixa no perfil de cliente ideal.",
      createdAt: new Date("2025-01-13"),
      insights: {
        positives: [],
        improvements: ["Melhorar triagem inicial", "Ajustar targeting de anúncios"],
        suggestions: ["Revisar critérios de qualificação"],
      },
    },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setModalOpen(true);
  };

  const statusColors = {
    qualified: "bg-green-500/10 text-green-400 border-green-500/30",
    "follow-up": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    discarded: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  const sentimentColors = {
    positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    neutral: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    negative: "bg-red-500/10 text-red-400 border-red-500/30",
  };

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
          <h1 className="text-4xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">
            Análise detalhada de todas as conversas com a IA
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 glass border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Conversas</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 glass border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">33%</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 glass border border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">2m 34s</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="p-6 glass border border-border/50 hover:shadow-lg transition-all">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{conversation.leadName}</h3>
                    <p className="text-sm text-muted-foreground">{conversation.product}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[conversation.status]}>
                      {conversation.status === "qualified" ? "Qualificado" : 
                       conversation.status === "follow-up" ? "Follow-up" : "Descartado"}
                    </Badge>
                    <Badge className={sentimentColors[conversation.sentiment]}>
                      {conversation.sentiment === "positive" ? "Positivo" : 
                       conversation.sentiment === "neutral" ? "Neutro" : "Negativo"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{conversation.summary}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {conversation.createdAt.toLocaleDateString("pt-BR")}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(conversation)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Conversa</DialogTitle>
          </DialogHeader>
          {selectedConversation && (
            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Informações Básicas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Lead</p>
                      <p className="font-medium">{selectedConversation.leadName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Produto</p>
                      <p className="font-medium">{selectedConversation.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={statusColors[selectedConversation.status]}>
                        {selectedConversation.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sentimento</p>
                      <Badge className={sentimentColors[selectedConversation.sentiment]}>
                        {selectedConversation.sentiment}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Resumo</h4>
                  <p className="text-sm text-muted-foreground">{selectedConversation.summary}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Insights da IA
                  </h4>
                  
                  {selectedConversation.insights.positives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-400 mb-2">✓ Pontos Positivos</p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.insights.positives.map((positive, i) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{positive}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedConversation.insights.improvements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-amber-400 mb-2">⚠ Melhorias Sugeridas</p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.insights.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedConversation.insights.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-2">💡 Próximas Ações</p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.insights.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Análise Inteligente de Conversas
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Conversas;
