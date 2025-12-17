"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMic, FiMicOff } from "react-icons/fi";
import { useSpeechRecognition } from "@/modules/speech";

interface ComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function Composer({ onSend, disabled }: ComposerProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [message, setMessage] = useState("");
  
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition(language);

  // Update message when speech recognition provides transcript
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      resetTranscript();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-2 items-center">
        {/* Microphone Button */}
        {isSpeechSupported && (
          <motion.button
            type="button"
            onClick={toggleListening}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            className={`p-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center min-w-[48px] ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
          >
            {isListening ? (
              <FiMicOff className="w-5 h-5" />
            ) : (
              <FiMic className="w-5 h-5" />
            )}
          </motion.button>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message || interimTranscript}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.typeMessage")}
            disabled={disabled}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          
          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-red-500 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: message.trim() && !disabled ? 1.05 : 1 }}
          whileTap={{ scale: message.trim() && !disabled ? 0.95 : 1 }}
          disabled={!message.trim() || disabled}
          className="p-3 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white rounded-xl font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-md disabled:shadow-none flex items-center justify-center min-w-[48px]"
        >
          <FiSend className="w-5 h-5" />
        </motion.button>
      </div>
    </form>
  );
}
