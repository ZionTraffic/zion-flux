import { Calendar, Building2 } from "lucide-react";
import { WorkspaceSelector } from "@/components/ui/WorkspaceSelector";
import { format } from "date-fns";

interface ReportHeaderProps {
  workspaceId: string | null;
  onWorkspaceChange: (id: string) => Promise<void>;
  fromDate: Date;
  toDate: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
}

export function ReportHeader({
  workspaceId,
  onWorkspaceChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: ReportHeaderProps) {
  return (
    <div className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Building2 className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Configuração do Relatório</h2>
          <p className="text-sm text-muted-foreground">
            Selecione o período e workspace para análise
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Workspace</label>
          <WorkspaceSelector current={workspaceId} onChange={onWorkspaceChange} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data Inicial
          </label>
          <input
            type="date"
            value={format(fromDate, 'yyyy-MM-dd')}
            onChange={(e) => onFromDateChange(new Date(e.target.value))}
            className="w-full glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data Final
          </label>
          <input
            type="date"
            value={format(toDate, 'yyyy-MM-dd')}
            onChange={(e) => onToDateChange(new Date(e.target.value))}
            className="w-full glass-medium backdrop-blur-xl border border-border/50 rounded-xl px-4 py-2 text-sm font-medium hover:glass-heavy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background/80"
          />
        </div>
      </div>
    </div>
  );
}
