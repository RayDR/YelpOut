"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

interface ParticipantCheckboxesProps {
  onSubmit: (hasKids: boolean, hasPets: boolean) => void;
}

export default function ParticipantCheckboxes({ onSubmit }: ParticipantCheckboxesProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [hasKids, setHasKids] = useState(false);
  const [hasPets, setHasPets] = useState(false);

  const handleSubmit = () => {
    onSubmit(hasKids, hasPets);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
    >
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        {t('questions.participantFilters')}
      </p>

      {/* Kids Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setHasKids(!hasKids)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            hasKids
              ? "bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500"
              : "border-gray-300 dark:border-gray-600 group-hover:border-primary-400"
          }`}
        >
          {hasKids && <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
          {t('participants.withKids')}
        </span>
      </label>

      {/* Pets Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setHasPets(!hasPets)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            hasPets
              ? "bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500"
              : "border-gray-300 dark:border-gray-600 group-hover:border-primary-400"
          }`}
        >
          {hasPets && <FiCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
          {t('participants.withPets')}
        </span>
      </label>

      {/* Continue Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
      >
        {t('common.continue')}
      </motion.button>
    </motion.div>
  );
}
