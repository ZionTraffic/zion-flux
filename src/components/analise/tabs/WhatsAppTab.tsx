import { Card } from "@/components/ui/card";
import { ConversationTimeline } from "../components/ConversationTimeline";
import { MessageSquare } from "lucide-react";

interface WhatsAppTabProps {
  messages: any[];
}

export const WhatsAppTab = ({ messages }: WhatsAppTabProps) => {
  return (
    <div className="p-6">
      <Card className="glass border border-border/50">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Transcrição da Conversa WhatsApp
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {messages.length} mensagens trocadas
          </p>
        </div>
        <div className="p-4 max-h-[600px] overflow-y-auto">
          <ConversationTimeline messages={messages} />
        </div>
      </Card>
    </div>
  );
};
