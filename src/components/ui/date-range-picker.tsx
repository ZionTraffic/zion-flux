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
      setError("");
      return;
    }

    // Criar cópia da data para não mutar o original
    const fromDate = new Date(date);
    fromDate.setHours(0, 0, 0, 0);
    
    // Sempre atualizar a data, mesmo que a validação falhe depois
    // Isso garante que o usuário veja a data selecionada
    const newRange: DateRange = { from: fromDate, to: dateRange?.to };
    
    // Validar se a data de término é depois da data de início
    if (newRange.to && newRange.to < fromDate) {
      setError("Data de término não pode ser anterior à data de início");
      // Ainda assim atualiza para mostrar a seleção
      onDateRangeChange(newRange);
      return;
    }

    // Validar range de dias (inclusivo: conta dia inicial e final)
    if (newRange.to) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const toNormalized = new Date(newRange.to);
      toNormalized.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(toNormalized.getTime() - fromDate.getTime());
      const inclusiveDays = Math.floor(diffTime / msPerDay) + 1;
      if (inclusiveDays < minDays || inclusiveDays > maxDays) {
        setError(`O período deve ter entre ${minDays} e ${maxDays} dias`);
        // Ainda assim atualiza para mostrar a seleção
        onDateRangeChange(newRange);
        return;
      }
    }

    setError("");
    onDateRangeChange(newRange);
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (!date) {
      onDateRangeChange({ from: dateRange?.from, to: undefined });
      setError("");
      return;
    }

    // Criar cópia da data para não mutar o original
    const toDate = new Date(date);
    toDate.setHours(23, 59, 59, 999);
    
    const newRange: DateRange = { from: dateRange?.from, to: toDate };
    
    // Validar se a data de término é depois da data de início
    if (newRange.from && toDate < newRange.from) {
      setError("Data de término não pode ser anterior à data de início");
      // Ainda assim atualiza para mostrar a seleção
      onDateRangeChange(newRange);
      return;
    }

    // Validar range de dias (inclusivo: conta dia inicial e final)
    if (newRange.from) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const fromNormalized = new Date(newRange.from);
      fromNormalized.setHours(0, 0, 0, 0);
      const toNormalized = new Date(toDate);
      toNormalized.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(toNormalized.getTime() - fromNormalized.getTime());
      const inclusiveDays = Math.floor(diffTime / msPerDay) + 1;
      if (inclusiveDays < minDays || inclusiveDays > maxDays) {
        setError(`O período deve ter entre ${minDays} e ${maxDays} dias`);
        // Ainda assim atualiza para mostrar a seleção
        onDateRangeChange(newRange);
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
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'last30':
        from.setDate(from.getDate() - 30);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
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
    <div className="flex flex-wrap items-center gap-2">
      {/* Calendários */}
      <DatePickerField
        date={dateRange?.from}
        onDateChange={handleFromDateChange}
        label="De"
        maxDate={dateRange?.to || new Date()}
        compact
      />
      
      <span className="text-muted-foreground text-sm">até</span>
      
      <DatePickerField
        date={dateRange?.to}
        onDateChange={handleToDateChange}
        label="Até"
        minDate={dateRange?.from}
        maxDate={new Date()}
        compact
      />

      {/* Separador */}
      <div className="h-6 w-px bg-border mx-1" />

      {/* Filtros Rápidos */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('today')}
        className="h-8 px-3 text-xs"
      >
        Hoje
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('yesterday')}
        className="h-8 px-3 text-xs"
      >
        Ontem
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('last7')}
        className="h-8 px-3 text-xs"
      >
        7 dias
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('last30')}
        className="h-8 px-3 text-xs"
      >
        30 dias
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('thisMonth')}
        className="h-8 px-3 text-xs"
      >
        Este mês
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleQuickFilter('lastMonth')}
        className="h-8 px-3 text-xs"
      >
        Mês passado
      </Button>
      
      {onClearFilter && dateRange?.from && dateRange?.to && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilter}
          className="text-muted-foreground hover:text-destructive transition-all h-8 px-2"
          title="Limpar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive animate-fade-in ml-2">{error}</p>
      )}
    </div>
  );
}
