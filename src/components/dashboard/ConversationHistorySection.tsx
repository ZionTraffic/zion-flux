import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DetailedAnalysisModal } from "@/components/analise/DetailedAnalysisModal";
import { MessageSquare, Search, TrendingUp, Clock } from "lucide-react";
import { EditableTagBadge } from "@/components/analise/components/EditableTagBadge";
import type { ConversationData, ConversationsStats } from "@/hooks/useConversationsData";

interface ConversationHistorySectionProps {
  conversations: ConversationData[];
  stats: ConversationsStats;
  isLoading: boolean;
  workspaceSlug?: string;
}

export function ConversationHistorySection({
  conversations: conversationsData,
  stats,
  isLoading,
}: ConversationHistorySectionProps) {
  const [conversations, setConversations] = useState(conversationsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync conversations with data from hook
  useEffect(() => {
    setConversations(conversationsData);
  }, [conversationsData]);

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

  return (
    <main className="space-y-8">
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {!isLoading && (
        filteredConversations.length === 0 ? (
          <Card className="p-12 glass border border-border/50 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma conversa encontrada</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredConversations.map((conversation) => {
              return (
                <Card key={conversation.id} className="p-6 glass border border-border/50 hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{conversation.leadName}</h3>
                          {conversation.csat && conversation.csat !== '-' && (
                            <Badge 
                              className={
                                conversation.csat.toUpperCase().includes('INSATISFEITO') ? 'bg-red-500 hover:bg-red-500 text-white border-0' :
                                conversation.csat.toUpperCase().includes('POUCO') ? 'bg-blue-500 hover:bg-blue-500 text-white border-0' :
                                conversation.csat.toUpperCase().includes('SATISFEITO') ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-0' :
                                'bg-gray-500 hover:bg-gray-500 text-white border-0'
                              }
                            >
                              {conversation.csat}
                            </Badge>
                          )}
                          {conversation.analista && (
                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                              {conversation.analista}
                            </Badge>
                          )}
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

      <DetailedAnalysisModal
        conversation={selectedConversation}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </main>
  );
}
