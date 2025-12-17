"use client";

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { detectBrowserLanguage } from '@/lib/i18n/useTranslation';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setLanguage, setTheme, setTTSEnabled, _setHasHydrated } = useAppStore();

  // Hydrate from localStorage AFTER mount to avoid hydration mismatch
  useEffect(() => {
    const savedTheme = localStorage.getItem('yelpout-theme');
    const savedLanguage = localStorage.getItem('yelpout-language');
    const savedTTS = localStorage.getItem('yelpout-tts');

    // Apply saved values
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage);
    } else {
      // Detect browser language if no saved preference
      const detectedLang = detectBrowserLanguage();
      setLanguage(detectedLang);
    }
    if (savedTTS !== null) {
      setTTSEnabled(savedTTS === 'true');
    }

    _setHasHydrated(true);
  }, [setTheme, setLanguage, setTTSEnabled, _setHasHydrated]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
