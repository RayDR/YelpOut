/**
 * Translation Module Types
 */

export type Language = 'en' | 'es';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}
