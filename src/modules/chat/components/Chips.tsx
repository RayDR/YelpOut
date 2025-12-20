"use client";

import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";

interface ChipsProps {
  options: string[];
  onSelect: (value: string) => void;
  context?: string;
}

export default function Chips({ options, onSelect, context }: ChipsProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  // Get icon based on context
  const getIcon = () => {
    if (!context) return null;
    
    const iconMap: Record<string, React.ReactNode> = {
      location: <FiMapPin className="w-4 h-4" />,
      date: <FiCalendar className="w-4 h-4" />,
      startTime: <FiClock className="w-4 h-4" />,
      endTime: <FiClock className="w-4 h-4" />,
      groupSize: <FiUsers className="w-4 h-4" />,
      groupType: <FiUsers className="w-4 h-4" />,
      budget: <FiDollarSign className="w-4 h-4" />,
    };
    
    return iconMap[context];
  };

  const icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 py-2"
    >
      {options.map((option, index) => {
        // Translate chip keys dynamically based on current language
        let displayText = option;
        
        // Don't translate if it contains special characters, commas, or $ symbols
        // These are likely literal values (city names, prices, times like "10:00 AM", etc)
        const shouldTranslate = !option.includes(',') && 
                                !option.includes('$') && 
                                !option.match(/\d+:\d+/) &&
                                (option.startsWith('chips.') || 
                                 option.startsWith('mood.') || 
                                 option.startsWith('cuisine.') || 
                                 option.startsWith('context.'));
        
        if (shouldTranslate) {
          const translated = t(option);
          if (translated && translated !== option) {
            displayText = translated;
          }
        }
        // Otherwise use the value as-is (city names, literal values, etc.)

        // Special styling for viewUpdatedPlan chip to make it stand out
        const isViewUpdatedPlan = option === 'chips.viewUpdatedPlan';
        const chipClassName = isViewUpdatedPlan
          ? "inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
          : "inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full font-medium transition-all shadow-sm hover:shadow-md";

        return (
          <motion.button
            key={option}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(option)}
            className={chipClassName}
          >
            {icon && !isViewUpdatedPlan && (
              <span className="text-primary-600 dark:text-primary-400">
                {icon}
              </span>
            )}
            <span>{displayText}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
