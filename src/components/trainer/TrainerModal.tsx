import { TrainerConversation } from "@/hooks/useTrainerData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";

interface TrainerModalProps {
  conversation: TrainerConversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrainerModal({ conversation, open, onOpenChange }: TrainerModalProps) {
  if (!conversation) return null;

  const recommendations = [
    {
      type: "primary",
      text: "Simplificar pergunta inicial sobre tipo de crédito",
      icon: Lightbulb,
    },
    {
      type: "warning",
      text: "Evitar termos técnicos antes da qualificação",
      icon: TrendingDown,
    },
    {
      type: "positive",
      text: "Adicionar gatilho de reengajamento após 45s de inatividade",
      icon: TrendingUp,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl">Análise Detalhada</DialogTitle>
          <DialogDescription>
            Conversa #{conversation.conversation_id} • {conversation.agent_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Resumo da Conversa</h3>
            <p className="text-sm leading-relaxed">{conversation.summary_text}</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Sentimento</p>
              <p className="text-2xl font-bold">
                {(conversation.sentiment * 100).toFixed(0)}%
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Duração</p>
              <p className="text-2xl font-bold">
                {Math.floor(conversation.duration / 60)}m
              </p>
            </div>
            <div className="glass rounded-lg p-4 border border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Mensagens</p>
              <p className="text-2xl font-bold">{conversation.total_messages}</p>
            </div>
          </div>

          {/* Recomendações de IA */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
              Recomendações de Melhoria
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => {
                const Icon = rec.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20"
                  >
                    <Icon className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground/80">{rec.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sugestão de Reescrita */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-400" />
              Sugestão de Prompt
            </h3>
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              "Olá! Vejo que você está interessado em crédito empresarial. Para
              te ajudar melhor, me conta: qual é o valor aproximado que você
              precisa e qual o prazo ideal para você?"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
