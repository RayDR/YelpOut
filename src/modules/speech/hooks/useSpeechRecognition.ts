/**
 * useSpeechRecognition Hook
 * Manages Speech Recognition using Web Speech API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RecognitionConfig, RecognitionState } from '../types';
import { Language } from '@/modules/translation/types';

const DEFAULT_CONFIG: RecognitionConfig = {
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(
  language: Language = 'es',
  config: Partial<RecognitionConfig> = {}
) {
  const [state, setState] = useState<RecognitionState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionConfig = useRef<RecognitionConfig>({ ...DEFAULT_CONFIG, ...config });
  const recognitionRef = useRef<any>(null);

  // Initialize recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = recognitionConfig.current.continuous;
    recognition.interimResults = recognitionConfig.current.interimResults;
    recognition.maxAlternatives = recognitionConfig.current.maxAlternatives;
    recognition.lang = language === 'es' ? 'es-MX' : 'en-US';

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: event.error,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      setState(prev => ({ ...prev, transcript: '', interimTranscript: '', error: null }));
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  // Check if browser supports speech recognition
  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}
