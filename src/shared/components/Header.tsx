"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { FiSun, FiMoon, FiGlobe, FiChevronDown, FiVolume2, FiVolumeX, FiHelpCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onShowHelp?: () => void;
  showHelpButton?: boolean;
}

export default function Header({ onShowHelp, showHelpButton = false }: HeaderProps) {
  const { theme, toggleTheme, language, setLanguage, ttsEnabled, toggleTTS } = useAppStore();
  const { t } = useTranslation(language);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇲🇽' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/images/logos/yelpout_logo.png" 
            alt="YelpOut Logo" 
            className="w-24 h-24 object-contain"
          />
          {/* Hidden on mobile, visible on desktop for SEO */}
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold">
              <span className="text-red-600 dark:text-red-500">Yelp</span>
              <span className="text-gray-800 dark:text-white">Out</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('app.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiGlobe className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-xl">{currentLanguage?.flag}</span>
              <FiChevronDown className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </motion.button>

            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'es');
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        language === lang.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {lang.name}
                      </span>
                      {language === lang.code && (
                        <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TTS Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTTS}
            className={`p-2 rounded-lg transition-colors ${
              ttsEnabled
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            } hover:bg-primary-200 dark:hover:bg-primary-900/50`}
            title={ttsEnabled ? t('settings.ttsDisable') || 'Desactivar Voz' : t('settings.ttsEnable') || 'Activar Voz'}
          >
            {ttsEnabled ? (
              <FiVolume2 className="w-5 h-5" />
            ) : (
              <FiVolumeX className="w-5 h-5" />
            )}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
          >
            {theme === 'light' ? (
              <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <FiSun className="w-5 h-5 text-yellow-400" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
