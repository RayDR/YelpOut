/**
 * Hours Validator
 * Validates business operating hours against planned visit time
 */

import { YelpBusiness } from "./yelpClient";

export interface HoursValidation {
  isValid: boolean;
  warning?: string;
  reason?: 'closed' | 'too_close_to_closing' | 'past_closing';
}

/**
 * Validates if a business will be open at the planned visit time
 * @param business Yelp business with hours data
 * @param visitDate Date of planned visit (ISO string or Date object)
 * @param visitTime Time of planned visit in "HH:MM" format (24-hour)
 * @param language Language for warning messages
 * @returns Validation result with warning if applicable
 */
export function validateBusinessHours(
  business: YelpBusiness,
  visitDate: string | Date,
  visitTime: string,
  language: 'en' | 'es' = 'en'
): HoursValidation {
  // If no hours data available, assume valid (can't validate)
  if (!business.hours || business.hours.length === 0) {
    return { isValid: true };
  }

  const hours = business.hours[0]; // Use first hours schedule (regular hours)
  
  // Get day of week (0 = Monday, 6 = Sunday in Yelp format)
  const date = typeof visitDate === 'string' ? new Date(visitDate) : visitDate;
  const jsDay = date.getDay(); // 0 = Sunday, 6 = Saturday
  const yelpDay = jsDay === 0 ? 6 : jsDay - 1; // Convert to Yelp format
  
  // Find hours for this day
  const dayHours = hours.open.find(h => h.day === yelpDay);
  
  if (!dayHours) {
    return {
      isValid: false,
      warning: language === 'en' 
        ? `${business.name} is closed on this day`
        : `${business.name} está cerrado este día`,
      reason: 'closed'
    };
  }
  
  // Parse visit time (HH:MM to HHMM format)
  const [visitHour, visitMinute] = visitTime.split(':').map(Number);
  const visitTimeNum = visitHour * 100 + visitMinute;
  
  // Parse business hours (HHMM format already)
  const openTime = parseInt(dayHours.start);
  const closeTime = parseInt(dayHours.end);
  
  // Check if visit is before opening
  if (visitTimeNum < openTime) {
    return {
      isValid: false,
      warning: language === 'en'
        ? `${business.name} opens at ${formatTime(dayHours.start)}`
        : `${business.name} abre a las ${formatTime(dayHours.start)}`,
      reason: 'closed'
    };
  }
  
  // Check if visit is after closing
  if (visitTimeNum >= closeTime) {
    return {
      isValid: false,
      warning: language === 'en'
        ? `${business.name} closes at ${formatTime(dayHours.end)}`
        : `${business.name} cierra a las ${formatTime(dayHours.end)}`,
      reason: 'past_closing'
    };
  }
  
  // Check if visit is too close to closing (< 30 minutes)
  const minutesToClosing = calculateMinutesUntil(visitTimeNum, closeTime);
  if (minutesToClosing < 30) {
    return {
      isValid: true, // Still valid but with warning
      warning: language === 'en'
        ? `${business.name} closes in ${minutesToClosing} minutes - limited time available`
        : `${business.name} cierra en ${minutesToClosing} minutos - tiempo limitado`,
      reason: 'too_close_to_closing'
    };
  }
  
  // All good!
  return { isValid: true };
}

/**
 * Calculate minutes between two times in HHMM format
 */
function calculateMinutesUntil(fromTime: number, toTime: number): number {
  const fromHour = Math.floor(fromTime / 100);
  const fromMinute = fromTime % 100;
  const toHour = Math.floor(toTime / 100);
  const toMinute = toTime % 100;
  
  const fromMinutes = fromHour * 60 + fromMinute;
  const toMinutes = toHour * 60 + toMinute;
  
  return toMinutes - fromMinutes;
}

/**
 * Format HHMM time string to readable format (e.g., "0900" -> "9:00 AM")
 */
function formatTime(timeStr: string): string {
  const hour = parseInt(timeStr.substring(0, 2));
  const minute = timeStr.substring(2, 4);
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `${hour}:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
}
