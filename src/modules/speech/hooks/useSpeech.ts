/**
 * useSpeech Hook
 * Manages Text-to-Speech using Web Speech API
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechConfig, SpeechState } from '../types';
import { Language } from '@/modules/translation/types';
import { useAppStore } from '@/shared';

const DEFAULT_CONFIG: SpeechConfig = {
  enabled: true,
  rate: 1,
  pitch: 1,
  volume: 0.8,
};

export function useSpeech(language: Language = 'es', config: Partial<SpeechConfig> = {}) {
  const { ttsEnabled } = useAppStore();
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    currentText: null,
    availableVoices: [],
  });

  const speechConfig = useRef<SpeechConfig>({ ...DEFAULT_CONFIG, ...config });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setState(prev => ({ ...prev, availableVoices: voices }));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Get best voice for language
  const getVoiceForLanguage = useCallback((lang: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    
    const voices = window.speechSynthesis.getVoices();
    
    // Prefer Spanish voices for ES, English for EN
    const langCode = lang === 'es' ? 'es' : 'en';
    const preferredVoices = voices.filter(v => v.lang.startsWith(langCode));
    
    // Try to get a good quality voice
    const qualityVoice = preferredVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Microsoft') ||
      v.localService === false
    );

    return qualityVoice || preferredVoices[0] || voices[0];
  }, []);

  // Speak text
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!ttsEnabled || !speechConfig.current.enabled || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechConfig.current.rate;
    utterance.pitch = speechConfig.current.pitch;
    utterance.volume = speechConfig.current.volume;
    
    const voice = getVoiceForLanguage(language);
    if (voice) utterance.voice = voice;
    utterance.lang = language === 'es' ? 'es-MX' : 'en-US';

    utterance.onstart = () => {
      setState(prev => ({ 
        ...prev, 
        isSpeaking: true, 
        isPaused: false,
        currentText: text 
      }));
    };

    utterance.onend = () => {
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        isPaused: false,
        currentText: null 
      }));
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        isPaused: false,
        currentText: null 
      }));
    };

    utterance.onpause = () => {
      setState(prev => ({ ...prev, isPaused: true }));
    };

    utterance.onresume = () => {
      setState(prev => ({ ...prev, isPaused: false }));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language, getVoiceForLanguage, ttsEnabled]);

  // Pause speech
  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  // Resume speech
  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  // Stop speech
  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setState(prev => ({ 
      ...prev, 
      isSpeaking: false, 
      isPaused: false,
      currentText: null 
    }));
  }, []);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<SpeechConfig>) => {
    speechConfig.current = { ...speechConfig.current, ...newConfig };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    updateConfig,
    isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}
