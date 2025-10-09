import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiMetricCard } from "../components/KpiMetricCard";
import { 
  TrendingUp, 
  MessageSquare, 
  Target, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Activity
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
  engagementScore,
  qualityScore,
  messageCount,
  qualificationRate,
  activities,
  riskFactors,
  opportunities
}: VisaoGeralTabProps) => {
  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiMetricCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Engajamento"
          value={`${engagementScore}%`}
          gradient="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"
          delay={0}
        />
        <KpiMetricCard
          icon={<MessageSquare className="h-6 w-6" />}
          label="Mensagens WhatsApp"
          value={messageCount}
          gradient="bg-gradient-to-br from-blue-500/10 to-blue-600/5"
          delay={0.1}
        />
        <KpiMetricCard
          icon={<Target className="h-6 w-6" />}
          label="Score de Qualidade"
          value={`${qualityScore}%`}
          gradient="bg-gradient-to-br from-purple-500/10 to-purple-600/5"
          delay={0.2}
        />
      </div>

      {/* Basic Info and Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card className="p-6 glass border border-border/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Informações Básicas
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{conversation.phone}</p>
              </div>
            </div>
            
            {conversation.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{conversation.email}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Target className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Stage</p>
                <Badge variant="outline">{conversation.stageAfter || "N/A"}</Badge>
              </div>
            </div>
            
            {conversation.startedAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Iniciou em</p>
                  <p className="font-medium">
                    {format(conversation.startedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            
            {conversation.endedAt && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Encerrou em</p>
                  <p className="font-medium">
                    {format(conversation.endedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{formatDuration(conversation.duration)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6 glass border border-border/50">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Atividade Recente
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-border/30 last:border-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-emerald-400' :
                  activity.type === 'warning' ? 'bg-amber-400' :
                  activity.type === 'error' ? 'bg-red-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(activity.time, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <Card className="p-6 glass border border-amber-500/30 bg-amber-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Fatores de Risco
          </h3>
          <ul className="space-y-2">
            {riskFactors.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Insights & Opportunities */}
      {opportunities.length > 0 && (
        <Card className="p-6 glass border border-emerald-500/30 bg-emerald-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-emerald-400" />
            Insights & Oportunidades
          </h3>
          <ul className="space-y-2">
            {opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{opportunity}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
