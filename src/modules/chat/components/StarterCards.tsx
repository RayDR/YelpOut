"use client";

import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion } from "framer-motion";
import {
  FiGift,
  FiHeart,
  FiUsers,
  FiSmile,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";

interface StarterCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  gradient: string;
}

interface StarterCardsProps {
  onSelect: (value: string) => void;
}

export default function StarterCards({ onSelect }: StarterCardsProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const cards: StarterCard[] = [
    {
      icon: <FiGift className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.birthday"),
      description: t("events.birthdayDesc"),
      value: language === 'en' ? 'birthday' : 'cumpleaños',
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: <FiHeart className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.date"),
      description: t("events.dateDesc"),
      value: language === 'en' ? 'date' : 'cita',
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: <FiUsers className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.family"),
      description: t("events.familyDesc"),
      value: language === 'en' ? 'family' : 'familia',
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiSmile className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.friends"),
      description: t("events.friendsDesc"),
      value: language === 'en' ? 'friends' : 'amigos',
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: <FiAward className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.anniversary"),
      description: t("events.anniversaryDesc"),
      value: language === 'en' ? 'anniversary' : 'aniversario',
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiTrendingUp className="w-5 h-5 lg:w-8 lg:h-8" />,
      title: t("events.graduation"),
      description: t("events.graduationDesc"),
      value: language === 'en' ? 'graduation' : 'graduación',
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="p-3 lg:p-6">
      <motion.h3
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 lg:mb-6 text-center"
      >
        {t("events.title")}
      </motion.h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {cards.map((card, index) => (
          <motion.button
            key={card.value}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(card.value)}
            className="relative overflow-hidden flex flex-col items-center p-3 lg:p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-2xl hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-xl transition-all text-center group"
          >
            {/* Gradient Background on Hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`}
            />

            {/* Icon */}
            <motion.div
              whileHover={{ rotate: 5 }}
              className={`mb-2 lg:mb-4 p-2 lg:p-4 rounded-full bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
            >
              {card.icon}
            </motion.div>

            {/* Title */}
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm lg:text-lg mb-1 lg:mb-2">
              {card.title}
            </h4>

            {/* Description - Hidden on mobile */}
            <p className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
