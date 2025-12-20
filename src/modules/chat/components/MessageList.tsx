"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMessageCircle, FiVolume2, FiVolumeX, FiGlobe, FiHelpCircle } from "react-icons/fi";
import Chips from "./Chips";
import StarterCards from "./StarterCards";
import { Message } from "@/modules/chat/types";
import { useSpeech } from "@/modules/speech";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentChips?: string[];
  onChipSelect?: (chip: string) => void;
  showStarters?: boolean;
  onStarterSelect?: (value: string) => void;
  onShowPlan?: () => void; // Callback to show/regenerate plan
  onShowHelp?: () => void; // Callback to open help modal
  showHelpButton?: boolean; // Control visibility of help button
}

export default function MessageList({
  messages,
  isLoading,
  currentChips = [],
  onChipSelect,
  showStarters = false,
  onStarterSelect,
  onShowPlan,
  onShowHelp,
  showHelpButton = true,
}: MessageListProps) {
  const { language, theme, ttsEnabled, setLanguage } = useAppStore();
  const { t } = useTranslation(language);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak, stop, isSpeaking, currentText, isSupported } = useSpeech(language);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Update speaking state when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking]);

  const handleSpeak = (message: Message) => {
    if (isSpeaking && speakingMessageId === message.id) {
      stop();
      setSpeakingMessageId(null);
    } else {
      const textToSpeak = message.translationKey ? t(message.translationKey) : message.content;
      speak(textToSpeak);
      setSpeakingMessageId(message.id);
    }
  };

  const handleToggleLanguage = () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth max-h-full
      scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 
      scrollbar-track-gray-200 dark:scrollbar-track-gray-800
      hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-3 ${
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === "user"
                  ? "bg-primary-600 dark:bg-primary-500 text-white"
                  : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
              }`}
            >
              {message.role === "user" ? (
                <FiUser className="w-5 h-5" />
              ) : (
                <FiMessageCircle className="w-5 h-5" />
              )}
            </motion.div>

            {/* Message Bubble */}
            <div
              className={`flex-1 max-w-[75%] ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.15 }}
                className={`inline-block rounded-2xl p-4 shadow-md max-w-full ${
                  message.role === "user"
                    ? "bg-primary-600 dark:bg-primary-500 text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <p className="text-sm md:text-base whitespace-pre-wrap break-words flex-1 min-w-0 overflow-wrap-anywhere">
                    {message.translationKey ? t(message.translationKey) : message.content}
                  </p>
                  
                  {/* Speaker button for assistant messages */}
                  {message.role === "assistant" && isSupported && ttsEnabled && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSpeak(message)}
                      className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label={isSpeaking && speakingMessageId === message.id ? "Detener" : "Escuchar"}
                    >
                      {isSpeaking && speakingMessageId === message.id ? (
                        <FiVolumeX className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <FiVolume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Action button for plan generation messages */}
              {message.role === "assistant" && message.dynamicType === 'planGeneration' && onShowPlan && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={onShowPlan}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>{t('plan.viewPlan') || 'Ver Plan'}</span>
                </motion.button>
              )}

              {/* Timestamp */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                className={`text-xs text-gray-500 dark:text-gray-400 mt-1 block ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {message.timestamp.toLocaleTimeString(
                  theme === "dark" ? "en-US" : "es-MX",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </motion.span>
              
              {/* Chips below last assistant message */}
              {message.role === "assistant" && 
               index === messages.length - 1 && 
               currentChips.length > 0 && 
               onChipSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                  className="mt-3"
                >
                  <Chips
                    options={currentChips}
                    onSelect={onChipSelect}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <FiMessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="inline-block rounded-2xl rounded-tl-none p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: 0,
                    }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: 0.2,
                    }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      delay: 0.4,
                    }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Starter Cards - Show after welcome message */}
      {showStarters && onStarterSelect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden"
        >
          <StarterCards onSelect={onStarterSelect} />
        </motion.div>
      )}

      {/* Language Toggle Button - Show after first message */}
      {messages.length > 0 && messages[0].role === "assistant" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-2 gap-2"
        >
          {onShowHelp && showHelpButton && (
            <button
              onClick={onShowHelp}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <FiHelpCircle className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'How it works' : 'Cómo funciona'}
              </span>
            </button>
          )}
          <button
            onClick={handleToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <FiGlobe className="w-3.5 h-3.5" />
            <span>
              {language === 'en' ? 'Cambiar a Español' : 'Change to English'}
            </span>
          </button>
          
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
