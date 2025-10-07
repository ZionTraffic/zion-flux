"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  minDays?: number;
  maxDays?: number;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  minDays = 1,
  maxDays = 90,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const validateRange = (range: DateRange | undefined): boolean => {
    if (!range?.from || !range?.to) return true;
    
    const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= minDays && diffDays <= maxDays;
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (validateRange(range)) {
      onDateRangeChange(range);
      if (range?.from && range?.to) {
        setOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) {
      return <span className="text-muted-foreground">Selecione o período</span>;
    }
    
    if (!dateRange.to) {
      return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    }
    
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal glass-medium hover:border-primary/50 transition-all w-[280px]",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass-medium shadow-glow-blue backdrop-blur-xl" align="start">
          <Calendar
            mode="range"
            selectedRange={dateRange}
            onSelectRange={handleSelect}
            showMonthYearPickers={true}
            className="rounded-lg border-0"
          />
          <div className="px-4 pb-3 text-xs text-muted-foreground/80 text-center border-t border-border/50">
            O período deve ter entre {minDays} e {maxDays} dias
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
