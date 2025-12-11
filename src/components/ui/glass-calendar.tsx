"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

interface GlassCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  showSelectedDateInfo?: boolean;
  className?: string;
}

// Meses em português
const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Dias da semana em português
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const GlassCalendar: React.FC<GlassCalendarProps> = ({
  selectedDate: propSelectedDate,
  onDateSelect,
  minDate,
  maxDate,
  showSelectedDateInfo = true,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(propSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(propSelectedDate || null);

  // Atualizar quando prop mudar
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
      setCurrentDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  // Verificar se data está desabilitada
  const isDateDisabled = (date: Date) => {
    const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (minDate) {
      const minNormalized = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (dateNormalized < minNormalized) return true;
    }
    if (maxDate) {
      const maxNormalized = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (dateNormalized > maxNormalized) return true;
    }
    return false;
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);

      days.push({
        date: currentDay,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        isSelected: selectedDate
          ? currentDay.toDateString() === selectedDate.toDateString()
          : false,
        isDisabled: isDateDisabled(currentDay),
      });
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const days = getDaysInMonth(currentDate);

  // Formatar data selecionada em português
  const formatSelectedDate = (date: Date) => {
    const dia = date.getDate();
    const mes = MESES_PT[date.getMonth()];
    const ano = date.getFullYear();
    const diaSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][date.getDay()];
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-white rounded-2xl shadow-2xl p-5 w-full max-w-[340px]",
        "border border-gray-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>

        <motion.h2
          key={currentDate.getMonth()}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-gray-800"
        >
          {MESES_PT[currentDate.getMonth()]} {currentDate.getFullYear()}
        </motion.h2>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        <AnimatePresence mode="wait">
          {days.map((day, index) => (
            <motion.button
              key={`${day.date.toDateString()}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.005 }}
              whileHover={{ scale: day.isDisabled ? 1 : 1.1 }}
              whileTap={{ scale: day.isDisabled ? 1 : 0.95 }}
              onClick={() => handleDateClick(day.date, day.isDisabled)}
              disabled={day.isDisabled}
              className={cn(
                "p-2 rounded-lg text-center text-sm transition-all duration-150",
                // Mês atual vs outros meses
                day.isCurrentMonth
                  ? "text-gray-800"
                  : "text-gray-300",
                // Hover
                !day.isDisabled && !day.isSelected && !day.isToday && day.isCurrentMonth
                  ? "hover:bg-blue-50"
                  : "",
                // Hoje
                day.isToday && !day.isSelected
                  ? "bg-blue-500 text-white font-bold"
                  : "",
                // Selecionado
                day.isSelected
                  ? "bg-blue-600 text-white font-bold shadow-lg"
                  : "",
                // Desabilitado
                day.isDisabled
                  ? "text-gray-300 cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              )}
            >
              {day.date.getDate()}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Data selecionada */}
      {showSelectedDateInfo && selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gray-50 rounded-lg"
        >
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium">Selecionado:</span>{" "}
            {formatSelectedDate(selectedDate)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

GlassCalendar.displayName = "GlassCalendar";
