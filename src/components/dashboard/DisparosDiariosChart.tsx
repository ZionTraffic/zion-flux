import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";
import { useDisparosDiarios } from "@/hooks/useDisparosDiarios";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { type DateRange } from "react-day-picker";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DisparosDiariosChartProps {
  tenantId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const DisparosDiariosChart = ({
  tenantId,
  dateFrom: initialDateFrom,
  dateTo: initialDateTo,
}: DisparosDiariosChartProps) => {
  // Estado local para o filtro de data - padrão últimos 30 dias
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialDateFrom && initialDateTo) {
      return { from: initialDateFrom, to: initialDateTo };
    }
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
  });

  const { disparos, total, media, isLoading } = useDisparosDiarios(
    tenantId,
    dateRange?.from,
    dateRange?.to
  );

  const handleClearFilter = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    setDateRange({ from, to });
  };

  if (isLoading) {
    return (
      <Card className="p-6 glass border border-border/50 shadow-premium">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 glass border border-border/50 shadow-premium">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Disparos Diários</h3>
              <p className="text-sm text-muted-foreground">
                Evolução de disparos no período
              </p>
            </div>
          </div>
          
          {/* Filtro de Data */}
          <div className="flex-shrink-0">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onClearFilter={handleClearFilter}
              minDays={30}
              maxDays={30}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="p-4 rounded-xl glass border border-border/50 shadow-premium hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {total.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              disparos no período
            </p>
          </div>

          <div className="p-4 rounded-xl glass border border-border/50 shadow-premium hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Média Diária
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {media.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              disparos/dia
            </p>
          </div>

          <div className="p-4 rounded-xl glass border border-border/50 shadow-premium hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dias Ativos
              </p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {disparos.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              com disparos
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={disparos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="dataFormatada"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6',
                }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value: number) => [
                  `${value} disparos`,
                  'Quantidade',
                ]}
              />
              <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
                {disparos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.quantidade > media ? '#3B82F6' : '#60A5FA'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Acima da média</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-muted-foreground">Abaixo da média</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
