import { Badge } from "@/components/ui/badge";
import { User, Bot } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ConversationTimelineProps {
  messages: Message[];
}

export const ConversationTimeline = ({ messages }: ConversationTimelineProps) => {
  // Filtrar mensagens válidas para exibição
  const validMessages = messages?.filter(msg => {
    // Aceitar mensagens com conteúdo válido
    if (!msg.content) return false;
    if (msg.content.trim() === '') return false;
    if (msg.content === 'undefined') return false;
    if (msg.content.includes('[wa_template]: undefined')) return false;
    return true;
  }) || [];

  if (!validMessages || validMessages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhuma mensagem disponível</p>
        {messages && messages.length > 0 && (
          <p className="text-xs mt-2">({messages.length} mensagens no total, mas sem conteúdo válido)</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {validMessages.map((message, index) => {
        const isUser = message.role === 'user';
        const isAssistant = message.role === 'assistant';
        
        return (
          <div
            key={index}
            className={`flex gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-500/10' : 'bg-emerald-500/10'
            }`}>
              {isUser ? (
                <User className="h-4 w-4 text-blue-400" />
              ) : (
                <Bot className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            
            <div className={`flex-1 max-w-[80%] ${isUser ? 'text-left' : 'text-right'}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl ${
                isUser 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {message.timestamp && (
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
