/**
 * Shared Types
 * Common types used across modules
 */

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  language: 'en' | 'es';
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'es') => void;
}

export interface ChipOption {
  label: string;
  value: string;
  translationKey?: string;
}
