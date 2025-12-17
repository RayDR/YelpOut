"use client";

import { PlanContext } from "@/modules/planning/types";
import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiDollarSign, FiCoffee, FiStar, FiEdit2, FiX } from "react-icons/fi";
import { useState } from "react";

interface ContextPillsProps {
  context: PlanContext;
  onEdit: (field: string) => void;
  onRemove: (field: string) => void;
}

interface Pill {
  key: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  editable: boolean;
}

export default function ContextPills({ context, onEdit, onRemove }: ContextPillsProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [hoveredPill, setHoveredPill] = useState<string | null>(null);

  const pills: Pill[] = [];

  // Event type
  if (context.event?.type) {
    pills.push({
      key: "event",
      icon: <FiStar className="w-4 h-4" />,
      label: t("context.eventType") || "Evento",
      value: context.event.type,
      editable: false, // Only removable, not editable
    });
  }

  // Location
  if (context.location?.text) {
    pills.push({
      key: "location",
      icon: <FiMapPin className="w-4 h-4" />,
      label: t("context.location"),
      value: context.location.text,
      editable: true,
    });
  }

  // Date
  if (context.event?.dateISO) {
    const fecha = new Date(context.event.dateISO);
    const fechaStr = fecha.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
      month: "short",
      day: "numeric",
    });
    pills.push({
      key: "date",
      icon: <FiCalendar className="w-4 h-4" />,
      label: t("context.date"),
      value: fechaStr,
      editable: true,
    });
  }

  // Time
  if (context.event?.startTime && context.event?.endTime) {
    pills.push({
      key: "time",
      icon: <FiClock className="w-4 h-4" />,
      label: t("context.time"),
      value: `${context.event.startTime} - ${context.event.endTime}`,
      editable: true,
    });
  }

  // Group
  if (context.participants?.size) {
    let grupoText = '';
    
    // Check if we have a range
    if ((context.participants as any).sizeRange) {
      grupoText = `${(context.participants as any).sizeRange} ${language === 'es' ? 'personas' : 'persons'}`;
    } else {
      grupoText = `${context.participants.size} ${
        language === 'es' ? 'persona' : 'person'
      }${context.participants.size > 1 ? 's' : ''}`;
    }

    if (context.participants.isCouple) {
      grupoText = language === 'es' ? 'Pareja' : 'Couple';
    } else if (context.participants.hasKids === true) {
      grupoText += language === 'es' ? ' (con niños)' : ' (with kids)';
    }

    pills.push({
      key: "group",
      icon: <FiUsers className="w-4 h-4" />,
      label: t("context.group"),
      value: grupoText,
      editable: true,
    });
  }

  // Budget
  if (context.budget?.tier && context.budget.tier !== "NA") {
    pills.push({
      key: "budget",
      icon: <FiDollarSign className="w-4 h-4" />,
      label: t("context.budget"),
      value: context.budget.tier,
      editable: true,
    });
  }

  // Cuisine
  if (context.preferences?.cuisine && context.preferences.cuisine.length > 0) {
    pills.push({
      key: "cuisine",
      icon: <FiCoffee className="w-4 h-4" />,
      label: t("context.cuisine"),
      value: context.preferences.cuisine.slice(0, 2).join(", "),
      editable: true,
    });
  }

  // Mood
  if (context.preferences?.mood && context.preferences.mood.length > 0) {
    // Filter out "any" (skip value)
    const displayMoods = context.preferences.mood.filter(m => m !== "any");
    
    if (displayMoods.length > 0) {
      // Translate mood values
      const translatedMoods = displayMoods.map(mood => {
        const moodKey = `mood.${mood}`;
        const translated = t(moodKey);
        return translated !== moodKey ? translated : mood;
      });
      
      pills.push({
        key: "mood",
        icon: <FiStar className="w-4 h-4" />,
        label: t("context.mood"),
        value: translatedMoods.slice(0, 2).join(", "),
        editable: true,
      });
    }
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600 p-4 transition-colors">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {pills.map((pill) => (
            <motion.div
              key={pill.key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onMouseEnter={() => setHoveredPill(pill.key)}
              onMouseLeave={() => setHoveredPill(null)}
              className="relative group"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer">
                <span className="text-primary-600 dark:text-primary-400">{pill.icon}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                  {pill.label}:
                </span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{pill.value}</span>

                {/* Botones de acción */}
                <div className="flex items-center gap-1 ml-2">
                  {pill.editable && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(pill.key)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title={t("context.edit")}
                    >
                      <FiEdit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(pill.key)}
                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Remove"
                  >
                    <FiX className="w-3 h-3 text-red-500 dark:text-red-400" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
