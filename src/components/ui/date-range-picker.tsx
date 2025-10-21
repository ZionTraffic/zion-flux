"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { DatePickerField } from "@/components/ui/date-picker-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onClearFilter?: () => void;
  minDays?: number;
  maxDays?: number;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  onClearFilter,
  minDays = 1,
  maxDays = 90,
}: DateRangePickerProps) {
  const [error, setError] = React.useState<string>("");

  const handleFromDateChange = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange({ from: undefined, to: dateRange?.to });
      return;
    }

    const newRange: DateRange = { from: date, to: dateRange?.to };
    
    // Validar se a data de término é depois da data de início
    if (newRange.to && newRange.to < date) {
      setError("Data de término não pode ser anterior à data de início");
      return;
    }

    // Validar range de dias (inclusivo: conta dia inicial e final)
    if (newRange.to) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const diffTime = Math.abs(newRange.to.setHours(0,0,0,0) - date.setHours(0,0,0,0));
      const inclusiveDays = Math.floor(diffTime / msPerDay) + 1;
      if (inclusiveDays < minDays || inclusiveDays > maxDays) {
        setError(`O período deve ter entre ${minDays} e ${maxDays} dias`);
        return;
      }
    }

    setError("");
    onDateRangeChange(newRange);
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange({ from: dateRange?.from, to: undefined });
      return;
    }

    const newRange: DateRange = { from: dateRange?.from, to: date };
    
    // Validar se a data de término é depois da data de início
    if (newRange.from && date < newRange.from) {
      setError("Data de término não pode ser anterior à data de início");
      return;
    }

    // Validar range de dias (inclusivo: conta dia inicial e final)
    if (newRange.from) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const diffTime = Math.abs(date.setHours(0,0,0,0) - newRange.from.setHours(0,0,0,0));
      const inclusiveDays = Math.floor(diffTime / msPerDay) + 1;
      if (inclusiveDays < minDays || inclusiveDays > maxDays) {
        setError(`O período deve ter entre ${minDays} e ${maxDays} dias`);
        return;
      }
    }

    setError("");
    onDateRangeChange(newRange);
  };

  const handleQuickFilter = (type: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth') => {
    const today = new Date();
    const from = new Date();
    const to = new Date();

    switch (type) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last7':
        from.setDate(from.getDate() - 7);
        break;
      case 'last30':
        from.setDate(from.getDate() - 30);
        break;
      case 'thisMonth':
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0); // Last day of previous month
        to.setHours(23, 59, 59, 999);
        break;
    }

    setError("");
    onDateRangeChange({ from, to });
  };

  const isCustomRange = () => {
    if (!dateRange?.from || !dateRange?.to) return false;
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
    
    return !(isSameDay(dateRange.from, thirtyDaysAgo) && isSameDay(dateRange.to, today));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <DatePickerField
          date={dateRange?.from}
          onDateChange={handleFromDateChange}
          label="Data de Início"
          maxDate={dateRange?.to || new Date()}
        />
        
        <DatePickerField
          date={dateRange?.to}
          onDateChange={handleToDateChange}
          label="Data de Término"
          minDate={dateRange?.from}
          maxDate={new Date()}
        />
        
        {onClearFilter && (
          <Button
            variant="outline"
            onClick={onClearFilter}
            className={cn(
              "glass-medium hover:border-destructive/50 hover:text-destructive transition-all",
              "sm:self-end w-full sm:w-auto"
            )}
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtro
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive animate-fade-in">{error}</p>
      )}

      {dateRange?.from && dateRange?.to && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Exibindo: {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
            {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
          </span>
          {isCustomRange() && (
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Personalizado
            </span>
          )}
        </div>
      )}

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('today')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('yesterday')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Ontem
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('last7')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Últimos 7 Dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('last30')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Últimos 30 Dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('thisMonth')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Este Mês
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('lastMonth')}
          className="glass-medium hover:bg-primary/10 hover:border-primary/50 transition-all text-xs"
        >
          Mês Passado
        </Button>
      </div>
    </div>
  );
}
