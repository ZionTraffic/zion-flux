import { 
  Phone, 
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  MessageSquare,
  Tag,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDuration } from "@/utils/conversationMetrics";

interface VisaoGeralTabProps {
  conversation: any;
  engagementScore: number;
  qualityScore: number;
  messageCount: number;
  qualificationRate: number;
  activities: any[];
  riskFactors: string[];
  opportunities: string[];
}

export const VisaoGeralTab = ({
  conversation,
  messageCount,
}: VisaoGeralTabProps) => {
  // Formatar valor financeiro
  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Mensagens */}
        <div className="bg-white dark:bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-muted-foreground">Mensagens</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{messageCount}</p>
        </div>

        {/* Duração */}
        <div className="bg-white dark:bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm text-muted-foreground">Duração</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatDuration(conversation.duration)}</p>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg">
              <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-sm text-muted-foreground">Status</span>
          </div>
          <p className="text-lg font-bold text-violet-600 dark:text-violet-400 truncate">{conversation.tag || conversation.stageAfter || 'N/A'}</p>
        </div>

        {/* Valor */}
        <div className="bg-white dark:bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
              <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm text-muted-foreground">Valor</span>
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCurrency(conversation.valorEmAberto)}</p>
        </div>
      </div>

      {/* Informações do Lead */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="font-semibold text-lg mb-5 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Informações do Lead
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Telefone */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Telefone</span>
            </div>
            <p className="text-base font-medium">{conversation.phone || 'Não informado'}</p>
          </div>

          {/* Empresa */}
          {conversation.product && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Empresa</span>
              </div>
              <p className="text-base font-medium truncate">{conversation.product}</p>
            </div>
          )}

          {/* Iniciou em */}
          {conversation.startedAt && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Iniciou em</span>
              </div>
              <p className="text-base font-medium">
                {format(new Date(conversation.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Encerrou em */}
          {conversation.endedAt && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Encerrou em</span>
              </div>
              <p className="text-base font-medium">
                {format(new Date(conversation.endedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>

        {/* Resumo */}
        {conversation.summary && (
          <div className="mt-4 bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-muted-foreground">Resumo da Conversa</span>
            </div>
            <p className="text-sm">{conversation.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};
