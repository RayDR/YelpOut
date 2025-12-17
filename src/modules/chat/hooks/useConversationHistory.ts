/**
 * useConversationHistory Hook
 * Manages conversation history with undo functionality
 */

import { useState, useCallback } from 'react';
import { ConversationStep } from '../types';

export const useConversationHistory = () => {
  const [history, setHistory] = useState<ConversationStep[]>([]);

  const saveStep = useCallback((step: ConversationStep) => {
    setHistory(prev => [...prev, step]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length === 0) return null;
    
    const previousStep = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    return previousStep;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const canGoBack = history.length > 0;

  return {
    history,
    saveStep,
    goBack,
    clearHistory,
    canGoBack,
  };
};
