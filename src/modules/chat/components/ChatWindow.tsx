"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
} from "react-icons/fi";
import MessageList from "./MessageList";
import Composer from "./Composer";
import { Message } from "@/modules/chat/types";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onRestart?: () => void;
}

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  onRestart,
}: ChatWindowProps) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [height, setHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startY.current = e.clientY;
    startHeight.current = height;
    document.body.style.cursor = "ns-resize";
  };

  // Handle resize move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const deltaY = startY.current - e.clientY;
      const newHeight = Math.min(
        Math.max(startHeight.current + deltaY, 300),
        window.innerHeight - 100
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Auto-open on mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {/* Mobile-first: Chat Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-full shadow-2xl transition-colors"
          aria-label="Open chat"
        >
          <FiMessageSquare className="w-6 h-6" />
          {messages.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {messages.length}
            </motion.span>
          )}
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed z-40 flex flex-col bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 ${
              isFullscreen
                ? "inset-0 rounded-none"
                : "bottom-0 right-0 md:bottom-6 md:right-6 rounded-t-2xl md:rounded-2xl"
            }`}
            style={{
              width: isFullscreen ? "100%" : "min(500px, 100vw)",
              height: isFullscreen ? "100%" : `min(${height}px, 100vh)`,
            }}
          >
            {/* Resize Handle (Desktop only, not in fullscreen) */}
            {!isFullscreen && (
              <div
                onMouseDown={handleResizeStart}
                className="hidden md:block absolute top-0 left-0 right-0 h-2 cursor-ns-resize group hover:bg-primary-500/20 transition-colors"
              >
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-primary-500" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg">
                  <FiMessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">
                    {t("app.title")}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t("app.subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Restart Button */}
                {onRestart && messages.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onRestart}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t("chat.restart")}
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Fullscreen Toggle (Desktop) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="w-5 h-5" />
                  ) : (
                    <FiMaximize2 className="w-5 h-5" />
                  )}
                </motion.button>

                {/* Close Button (Desktop) */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="hidden md:block p-2 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList messages={messages} isLoading={isLoading} />
            </div>

            {/* Composer */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <Composer onSend={onSendMessage} disabled={isLoading} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile fullscreen */}
      <AnimatePresence>
        {isOpen && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
}
