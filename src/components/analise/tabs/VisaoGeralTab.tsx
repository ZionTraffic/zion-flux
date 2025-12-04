import { 
  Phone, 
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  MessageSquare,
  Tag,
  FileText,
  Star,
  MessageCircle
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
      {/* Informações do Lead */}
      <div className="bg-white dark:bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="font-semibold text-lg mb-5 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Informações do Lead
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Situação/Tag */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">Situação</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                <Tag className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{conversation.tag || conversation.stageAfter || 'Não definido'}</p>
          </div>

          {/* Valor do Débito */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">Valor do Débito</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{formatCurrency(conversation.valorEmAberto)}</p>
          </div>

          {/* Empresa */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">Empresa</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground truncate">{conversation.product || conversation.nome || 'Não informado'}</p>
          </div>

          {/* Telefone */}
          <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-muted-foreground">Telefone</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{conversation.phone || 'Não informado'}</p>
          </div>

          {/* Iniciou em - Data de criação do registro */}
          {conversation.startedAt && (
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-muted-foreground">Início (Criação)</span>
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                {format(new Date(conversation.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Término - Data da pesquisa de satisfação */}
          {conversation.endedAt && (
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 dark:text-muted-foreground">Término (Pesquisa)</span>
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-foreground">
                {format(new Date(conversation.endedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
        </div>

        {/* Seção de Avaliação do Cliente */}
        {(conversation.csat || conversation.nota_csat || conversation.opiniao_csat) && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-muted-foreground mb-4">Avaliação do Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nota CSAT */}
              {(conversation.csat || conversation.nota_csat) && (
                <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-muted-foreground">Nota de Satisfação</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-gray-900 dark:text-foreground">
                      {conversation.nota_csat || conversation.csat || '-'}
                    </p>
                    <span className="text-sm text-gray-400">/5</span>
                  </div>
                </div>
              )}

              {/* Opinião do Cliente */}
              {conversation.opiniao_csat && (
                <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-muted-foreground">Opinião do Cliente</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-foreground">
                    "{conversation.opiniao_csat}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumo da Conversa */}
        {conversation.summary && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-muted-foreground mb-4">Resumo da Conversa</h4>
            <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-border shadow-sm">
              <p className="text-sm text-gray-700 dark:text-muted-foreground leading-relaxed">{conversation.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
