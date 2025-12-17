"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface DatePickerProps {
  onSelectDate: (dateISO: string) => void;
  onClose: () => void;
  language: 'en' | 'es';
}

export function DatePicker({ onSelectDate, onClose, language }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  };
  
  const dayNames = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  };
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const isDateInPast = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  };
  
  const handleDateSelect = (day: number) => {
    if (isDateInPast(day)) return;
    
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateISO = selectedDate.toISOString().split('T')[0];
    onSelectDate(dateISO);
    onClose();
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && 
                         currentMonth.getFullYear() === today.getFullYear();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {monthNames[language][currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames[language].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }
            
            const isPast = isDateInPast(day);
            const isToday = isCurrentMonth && day === today.getDate();
            
            return (
              <button
                key={day}
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                  transition-all duration-200
                  ${isPast 
                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                    : 'hover:bg-blue-500 hover:text-white cursor-pointer'
                  }
                  ${isToday 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold' 
                    : 'text-slate-700 dark:text-slate-200'
                  }
                  ${!isPast && !isToday ? 'hover:scale-110' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 
                     text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
        >
          {language === 'en' ? 'Cancel' : 'Cancelar'}
        </button>
      </motion.div>
    </motion.div>
  );
}
