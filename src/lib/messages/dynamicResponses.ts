/**
 * Dynamic response system for friendly, emotionally intelligent bot messages
 * Now integrated with i18n translation system
 */

import { translations, Language } from '@/lib/i18n/translations';

// Helper functions
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function getDayOfWeek(): 'friday' | 'saturday' | 'sunday' | 'weekday' {
  const day = new Date().getDay();
  if (day === 5) return 'friday';
  if (day === 6) return 'saturday';
  if (day === 0) return 'sunday';
  return 'weekday';
}

export function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// Main functions to get dynamic responses
export function getWelcomeMessage(language: Language = 'en'): string {
  const dayOfWeek = getDayOfWeek();
  const timeOfDay = getTimeOfDay();
  const t = translations[language].dynamic.welcome;
  
  // Priority: day of week special messages
  if (dayOfWeek === 'friday' && Math.random() > 0.3) {
    return getRandomMessage(t.friday);
  }
  if (dayOfWeek === 'saturday' && Math.random() > 0.3) {
    return getRandomMessage(t.saturday);
  }
  if (dayOfWeek === 'sunday' && Math.random() > 0.3) {
    return getRandomMessage(t.sunday);
  }
  
  // Otherwise: time of day message
  return getRandomMessage(t[timeOfDay]);
}

export function getEventTypeResponse(eventType: string, language: Language = 'en'): string {
  const t = translations[language].dynamic.eventType;
  const responses = (t as any)[eventType] || t.other;
  return getRandomMessage(responses);
}

export function getLocationResponse(language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.location);
}

export function getDateResponse(dateType: 'today' | 'tomorrow' | 'future' | 'weekend', language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.date[dateType]);
}

export function getTimeResponse(timeSlot: 'morning' | 'afternoon' | 'evening' | 'night', language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.time[timeSlot]);
}

export function getGroupSizeResponse(
  size: 'solo' | 'couple' | 'two' | 'small' | 'medium' | 'large', 
  language: Language = 'en',
  eventType?: string
): string {
  // For 2 people, use romantic messages only for dates/anniversaries
  let responseKey = size;
  if (size === 'couple' && eventType) {
    const romanticEvents = ['date', 'cita', 'anniversary', 'aniversario'];
    const isRomantic = romanticEvents.some(type => eventType.includes(type));
    if (!isRomantic) {
      responseKey = 'two'; // Use neutral messages for non-romantic 2-person events
    }
  }
  return getRandomMessage(translations[language].dynamic.groupSize[responseKey as 'solo' | 'couple' | 'two' | 'small' | 'medium' | 'large']);
}

export function getBudgetResponse(budgetType: 'specific' | 'flexible', language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.budget[budgetType]);
}

export function getCuisineResponse(language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.cuisine);
}

export function getMoodResponse(language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.mood);
}

export function getPlanGenerationResponse(language: Language = 'en'): string {
  return getRandomMessage(translations[language].dynamic.planGeneration);
}
