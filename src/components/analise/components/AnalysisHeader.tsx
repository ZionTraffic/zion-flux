import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalysisHeaderProps {
  leadName: string;
  phone: string;
  email?: string;
  status: string;
  startedAt?: Date;
  endedAt?: Date;
  isActive: boolean;
}

export const AnalysisHeader = ({
  leadName,
  phone,
  email,
  status,
  startedAt,
  endedAt,
  isActive
}: AnalysisHeaderProps) => {
  const statusColors = {
    qualified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "follow-up": "bg-amber-500/10 text-amber-400 border-amber-500/30",
    discarded: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <div className="p-6 border-b border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{leadName}</h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </div>
            {email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.discarded}>
            {status === "qualified" ? "Qualificado" : 
             status === "follow-up" ? "Follow-up" : "Descartado"}
          </Badge>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "🟢 Ativo" : "⚫ Finalizado"}
          </Badge>
        </div>
      </div>
      
      <div className="flex gap-4 text-sm text-muted-foreground">
        {startedAt && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Iniciou: {format(startedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
        )}
        {endedAt && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Encerrou: {format(endedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
          </div>
        )}
      </div>
    </div>
  );
};
