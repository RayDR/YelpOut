/**
 * useChat Hook
 * Manages chat state and message handling
 */

import { useState, useCallback } from 'react';
import { Message, ChatState } from '../types';

export const useChat = (initialMessages: Message[] = []) => {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
  });

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    addMessage,
    setMessages,
    setLoading,
    clearMessages,
  };
};
