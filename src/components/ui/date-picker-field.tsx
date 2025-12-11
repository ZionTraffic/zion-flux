"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { GlassCalendar } from "@/components/ui/glass-calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  compact?: boolean;
}

export function DatePickerField({
  date,
  onDateChange,
  label,
  minDate,
  maxDate,
  disabled,
  compact = false,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date) => {
    // Criar cópia da data para evitar mutações
    const newDate = new Date(selectedDate);
    onDateChange(newDate);
    setOpen(false);
  };

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-2"}>
      {!compact && <label className="text-sm font-medium text-foreground">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            disabled={disabled}
            className={cn(
              "justify-start text-left font-normal glass-medium hover:border-primary/50 transition-all",
              compact ? "w-[130px] h-9" : "w-full sm:w-[200px]",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>{compact ? label : "Selecionar data"}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0 bg-transparent shadow-none" align="start">
          <GlassCalendar
            selectedDate={date}
            onDateSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            showSelectedDateInfo={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
