import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Language = 'en' | 'es';

interface AppState {
  theme: Theme;
  language: Language;
  ttsEnabled: boolean;
  _hasHydrated: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleTTS: () => void;
  setTheme: (theme: Theme) => void;
  setTTSEnabled: (enabled: boolean) => void;
  _setHasHydrated: (val: boolean) => void;
}

// Simple store without persist middleware to avoid hydration issues
export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  language: 'es',
  ttsEnabled: true,
  _hasHydrated: false,
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('yelpout-theme', newTheme);
      }
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yelpout-theme', theme);
    }
    set({ theme });
  },
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yelpout-language', language);
    }
    set({ language });
  },
  setTTSEnabled: (ttsEnabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yelpout-tts', String(ttsEnabled));
    }
    set({ ttsEnabled });
  },
  toggleTTS: () =>
    set((state) => {
      const newTTS = !state.ttsEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('yelpout-tts', String(newTTS));
      }
      return { ttsEnabled: newTTS };
    }),
  _setHasHydrated: (val) => set({ _hasHydrated: val }),
}));
