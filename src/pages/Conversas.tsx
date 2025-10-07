import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useConversationsData } from "@/hooks/useConversationsData";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Search, TrendingUp, Clock, Lightbulb, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Conversas = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { conversations, stats, isLoading, error } = useConversationsData(currentWorkspaceId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleWorkspaceChange = async (workspaceId: string) => {
    await setCurrentWorkspaceId(workspaceId);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.phone.includes(searchTerm)
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleViewDetails = (conversation: any) => {
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
        isRefreshing={isLoading} 
        lastUpdate={new Date()}
        currentWorkspace={currentWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">
            Análise detalhada de todas as conversas com a IA
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 glass border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 glass border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <MessageSquare className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Conversas</p>
                  <p className="text-2xl font-bold">{stats.totalConversations}</p>
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
                  <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
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
                  <p className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {!isLoading && !error && (
          filteredConversations.length === 0 ? (
            <Card className="p-12 glass border border-border/50 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredConversations.map((conversation) => (
                <Card key={conversation.id} className="p-6 glass border border-border/50 hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{conversation.leadName}</h3>
                        <p className="text-sm text-muted-foreground">{conversation.product || "Sem produto"}</p>
                        <p className="text-xs text-muted-foreground">{conversation.phone}</p>
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
                        {conversation.startedAt.toLocaleDateString("pt-BR")} • {formatDuration(conversation.duration)}
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
          )
        )}
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
                  
                  {selectedConversation.positives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Pontos Positivos
                      </p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.positives.map((positive: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{positive}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedConversation.negatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Melhorias Sugeridas
                      </p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.negatives.map((negative: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground list-disc">{negative}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedConversation.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Próximas Ações
                      </p>
                      <ul className="space-y-1 ml-4">
                        {selectedConversation.suggestions.map((suggestion: string, i: number) => (
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
