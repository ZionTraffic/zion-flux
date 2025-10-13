import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useConversationsData } from "@/hooks/useConversationsData";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Search, TrendingUp, Clock, Lightbulb, CheckCircle2 } from "lucide-react";
import { DetailedAnalysisModal } from "@/components/analise/DetailedAnalysisModal";
import { calculateQualityScore } from "@/utils/conversationMetrics";
import { EditableTagBadge } from "@/components/analise/components/EditableTagBadge";

const Conversas = () => {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const { conversations: conversationsData, stats, isLoading, error } = useConversationsData(currentWorkspaceId);
  const [conversations, setConversations] = useState(conversationsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync conversations with data from hook
  useEffect(() => {
    setConversations(conversationsData);
  }, [conversationsData]);

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
              {filteredConversations.map((conversation) => {
                const qualityScore = calculateQualityScore(conversation);
                const scoreColor = qualityScore >= 80 ? 'text-emerald-400' : 
                                 qualityScore >= 60 ? 'text-blue-400' : 
                                 qualityScore >= 40 ? 'text-amber-400' : 'text-red-400';
                
                return (
                  <Card key={conversation.id} className="p-6 glass border border-border/50 hover:shadow-lg transition-all">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{conversation.leadName}</h3>
                            <Badge variant="outline" className={scoreColor}>
                              {qualityScore}% Score
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{conversation.product || "Sem produto"}</p>
                          <p className="text-xs text-muted-foreground">{conversation.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <EditableTagBadge 
                            conversationId={conversation.id}
                            currentTag={conversation.tag || conversation.status}
                            onTagUpdated={(newTag) => {
                              setConversations(prev => 
                                prev.map(c => c.id === conversation.id 
                                  ? { ...c, tag: newTag } 
                                  : c
                                )
                              );
                            }}
                          />
                          <Badge className={sentimentColors[conversation.sentiment]}>
                            {conversation.sentiment === "positive" ? "😊 Positivo" : 
                             conversation.sentiment === "neutral" ? "😐 Neutro" : "😞 Negativo"}
                            {conversation.sentimentIntensity && (
                              <span className="ml-1 text-xs opacity-70">
                                ({conversation.sentimentIntensity})
                              </span>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{conversation.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{conversation.startedAt.toLocaleDateString("pt-BR")}</span>
                          <span>•</span>
                          <span>{formatDuration(conversation.duration)}</span>
                          <span>•</span>
                          <span>{conversation.messages?.length || 0} mensagens</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(conversation)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        )}
      </main>

      <DetailedAnalysisModal
        conversation={selectedConversation}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

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
