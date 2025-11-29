import { User, Bot } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface ConversationTimelineProps {
  messages: Message[] | string | any;
}

// Parser para converter texto concatenado em mensagens separadas
const parseConversationText = (text: string): Message[] => {
  const messages: Message[] = [];
  
  // Padrões para identificar mensagens do Bot e do Usuário
  // Formato: "Bot: mensagem","You: mensagem" ou "Bot: mensagem","You: mensagem"
  const patterns = [
    /"Bot:\s*([^"]+)"/g,
    /"You:\s*([^"]+)"/g,
    /Bot:\s*([^",]+)/g,
    /You:\s*([^",]+)/g,
  ];
  
  // Primeiro, tentar extrair todas as mensagens usando regex
  const botMatches = [...text.matchAll(/"?Bot:\s*([^"]+?)(?:"|,|$)/g)];
  const youMatches = [...text.matchAll(/"?You:\s*([^"]+?)(?:"|,|$)/g)];
  
  // Criar um array com todas as mensagens e suas posições
  const allMessages: { role: string; content: string; position: number }[] = [];
  
  botMatches.forEach(match => {
    if (match[1] && match[1].trim()) {
      allMessages.push({
        role: 'assistant',
        content: match[1].trim(),
        position: match.index || 0
      });
    }
  });
  
  youMatches.forEach(match => {
    if (match[1] && match[1].trim()) {
      allMessages.push({
        role: 'user',
        content: match[1].trim(),
        position: match.index || 0
      });
    }
  });
  
  // Ordenar por posição para manter a ordem da conversa
  allMessages.sort((a, b) => a.position - b.position);
  
  return allMessages.map(({ role, content }) => ({ role, content }));
};

export const ConversationTimeline = ({ messages }: ConversationTimelineProps) => {
  // Processar mensagens - pode vir como array ou como string concatenada
  let processedMessages: Message[] = [];
  
  if (typeof messages === 'string') {
    // Se for string, fazer parse
    processedMessages = parseConversationText(messages);
  } else if (Array.isArray(messages)) {
    // Se for array, verificar se cada item é uma mensagem ou string
    messages.forEach(msg => {
      if (typeof msg === 'string') {
        // String individual - fazer parse
        const parsed = parseConversationText(msg);
        processedMessages.push(...parsed);
      } else if (msg && msg.content) {
        // Objeto de mensagem normal
        processedMessages.push(msg);
      }
    });
  }
  
  // Filtrar mensagens válidas para exibição
  const validMessages = processedMessages.filter(msg => {
    if (!msg.content) return false;
    if (msg.content.trim() === '') return false;
    if (msg.content === 'undefined') return false;
    if (msg.content.includes('[wa_template]: undefined')) return false;
    // Filtrar mensagens muito curtas ou inválidas
    if (msg.content.length < 2) return false;
    return true;
  });

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
    <div className="space-y-3 py-4 px-2">
      {validMessages.map((message, index) => {
        const isUser = message.role === 'user';
        const isBot = message.role === 'assistant';
        
        return (
          <div
            key={index}
            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar do Bot (esquerda) */}
            {isBot && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[75%] ${isUser ? 'order-1' : 'order-2'}`}>
              {/* Label do remetente */}
              <div className={`text-xs font-medium mb-1 ${isUser ? 'text-right text-blue-400' : 'text-left text-emerald-400'}`}>
                {isUser ? '👤 Cliente' : '🤖 IA Zion'}
              </div>
              
              {/* Balão da mensagem */}
              <div className={`relative px-4 py-3 rounded-2xl shadow-md ${
                isUser 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-bl-md border border-emerald-500/30'
              }`}>
                {/* Indicador de tipo de mensagem */}
                <div className={`absolute -top-1 ${isUser ? 'right-2' : 'left-2'}`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isUser 
                      ? 'bg-blue-400/20 text-blue-200' 
                      : 'bg-emerald-400/20 text-emerald-200'
                  }`}>
                    {isUser ? 'Resposta' : 'IA'}
                  </span>
                </div>
                
                <p className="text-sm whitespace-pre-wrap leading-relaxed mt-2">{message.content}</p>
              </div>
              
              {/* Timestamp */}
              {message.timestamp && (
                <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {format(new Date(message.timestamp), "HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
            
            {/* Avatar do Usuário (direita) */}
            {isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg order-2">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
