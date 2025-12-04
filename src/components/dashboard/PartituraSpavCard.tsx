import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music2, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import { usePartituraSpav } from "@/hooks/usePartituraSpav";

interface PartituraSpavCardProps {
  tenantId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const PartituraSpavCard = ({
  tenantId,
  dateFrom,
  dateTo,
}: PartituraSpavCardProps) => {
  const { data, isLoading } = usePartituraSpav(tenantId, dateFrom, dateTo);

  if (isLoading) {
    return (
      <Card className="p-6 glass border border-border/50 shadow-premium">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 glass border border-border/50 shadow-premium">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Partitura SPAV</h3>
            <p className="text-sm text-muted-foreground">
              Métricas de performance e recuperação
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Leads Retornaram */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
              Leads Retornaram
            </p>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {data.leadsRetornaram}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              contatos ativos
            </p>
          </div>

          {/* Valor Recuperado */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
              Recuperado
            </p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(data.valorRecuperado)}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              no período
            </p>
          </div>

          {/* Valor Pendente */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">
              Pendente
            </p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(data.valorPendente)}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              a recuperar
            </p>
          </div>

          {/* Percentual de Avanço */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">
              Avanço do Dia
            </p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {data.percentualAvanco}%
            </p>
            <div className="mt-3">
              <div className="w-full h-2 bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.percentualAvanco, 100)}%` }}
                />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Meta: {formatCurrency(data.metaDiaria)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
