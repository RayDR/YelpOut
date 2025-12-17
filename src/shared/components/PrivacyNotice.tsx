"use client";

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiX, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const PRIVACY_ACCEPTED_KEY = 'yelpout-privacy-accepted';

export default function PrivacyNotice() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [showNotice, setShowNotice] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem(PRIVACY_ACCEPTED_KEY);
    if (!hasAccepted) {
      // Show notice after a short delay
      const timer = setTimeout(() => setShowNotice(true), 1000);
      return () => clearTimeout(timer);
    }
    
    // Make privacy notice accessible from footer even if dismissed
    if (typeof window !== 'undefined') {
      (window as any).showPrivacyNotice = () => {
        setShowNotice(true);
        setIsExpanded(true);
      };
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(PRIVACY_ACCEPTED_KEY, 'true');
    setShowNotice(false);
  };

  const handleClose = () => {
    setShowNotice(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AnimatePresence>
      {showNotice && (
        <motion.div
          id="privacy-notice"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
        >
          {/* Main Footer Container */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-700 dark:to-purple-700">
            {/* Collapsed Header - Always Visible */}
            <div className="p-4 md:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                    <FiShield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-white truncate">
                      {t('privacy.title')}
                    </h3>
                    <p className="text-xs text-white/80 hidden sm:block">
                      {t('privacy.subtitle')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={toggleExpanded}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? (
                      <FiChevronDown className="w-5 h-5" />
                    ) : (
                      <FiChevronUp className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Actions when collapsed */}
              {!isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 mt-3"
                >
                  <motion.button
                    onClick={handleAccept}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-4 py-2.5 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md text-sm md:text-base"
                  >
                    {t('privacy.accept')}
                  </motion.button>
                  <button
                    onClick={toggleExpanded}
                    className="px-4 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors text-sm md:text-base"
                  >
                    {t('privacy.readMore') || 'Read More'}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white dark:bg-gray-800 border-t border-white/20">
                    <div className="p-4 md:p-6 space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {t('privacy.message1')}
                        </p>
                        
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {t('privacy.whatWeCollect')}
                          </h4>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.collect1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.collect2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.collect3')}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {t('privacy.whatWeStore')}
                          </h4>
                          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.storage1')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.storage2')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span>{t('privacy.storage3')}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            {t('privacy.yelpData')}
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            {t('privacy.yelpInfo')}
                          </p>
                        </div>

                        <div className="mt-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                            ✓ {t('privacy.dataDeletion')}
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                          {t('privacy.footer')}
                        </p>
                      </div>
                    </div>

                    {/* Actions when expanded */}
                    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                      <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium text-sm md:text-base"
                      >
                        {t('privacy.readLater')}
                      </button>
                      <motion.button
                        onClick={handleAccept}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-lg text-sm md:text-base"
                      >
                        {t('privacy.accept')}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
