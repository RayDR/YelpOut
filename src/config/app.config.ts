/**
 * Application Configuration
 * Centralized configuration for the entire app
 */

export const APP_CONFIG = {
  // Application
  name: 'YelpOut',
  version: '1.0.0',
  description: 'Your conversational outing planner',
  
  // API
  api: {
    yelp: {
      endpoint: '/api/yelp/recommendations',
      timeout: 10000,
    },
  },
  
  // Storage
  storage: {
    keys: {
      context: 'yelpout-context',
      messages: 'yelpout-messages',
      history: 'yelpout-history',
      showStarters: 'yelpout-show-starters',
      settings: 'yelpout-settings',
    },
  },
  
  // i18n
  i18n: {
    defaultLanguage: 'es' as const,
    supportedLanguages: ['en', 'es'] as const,
  },
  
  // Theme
  theme: {
    default: 'light' as const,
  },
  
  // Planning
  planning: {
    defaultRadius: 10, // km
    maxRecommendations: 3,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
