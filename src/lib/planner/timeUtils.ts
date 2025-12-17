/**
 * Utility functions for handling time calculations and business hours
 */

import { PlanBlock } from "@/modules/planning/types";

/**
 * Parse time string "HH:MM AM/PM" to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to "HH:MM AM/PM"
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Check if a place is closing soon
 * @returns { isClosed: boolean, closingSoon: boolean, minutesUntilClose: number }
 */
export function checkClosingTime(place: any, currentTimeMinutes: number): {
  isClosed: boolean;
  closingSoon: boolean;
  minutesUntilClose: number;
} {
  if (!place.hours || place.hours.length === 0) {
    return { isClosed: false, closingSoon: false, minutesUntilClose: Infinity };
  }

  // Assuming hours are in format "9:00 AM - 10:00 PM"
  const todayHours = place.hours[0]; // Simplified - should check day of week
  const match = todayHours.match(/(\d+:\d+\s*[AP]M)\s*-\s*(\d+:\d+\s*[AP]M)/i);
  
  if (!match) {
    return { isClosed: false, closingSoon: false, minutesUntilClose: Infinity };
  }

  const closeTime = parseTimeToMinutes(match[2]);
  const minutesUntilClose = closeTime - currentTimeMinutes;

  return {
    isClosed: minutesUntilClose <= 0,
    closingSoon: minutesUntilClose > 0 && minutesUntilClose <= 60,
    minutesUntilClose
  };
}

/**
 * Filter out places that are too close to closing time
 */
export function filterByClosingTime(places: any[], startTimeMinutes: number): any[] {
  return places.filter(place => {
    const { isClosed, minutesUntilClose } = checkClosingTime(place, startTimeMinutes);
    // Filter out if closed or less than 30 minutes until close
    return !isClosed && minutesUntilClose >= 30;
  });
}

/**
 * Recalculate times for all blocks after reordering
 * Skips blocks that are marked as skipped
 */
export function recalculateTimes(blocks: PlanBlock[], startTimeStr: string): PlanBlock[] {
  let currentTimeMinutes = parseTimeToMinutes(startTimeStr);
  
  return blocks.map(block => {
    // If block is skipped, don't recalculate its time and don't advance the current time
    if (block.skipped) {
      return block; // Keep original times but don't contribute to timeline
    }
    
    const startTime = formatMinutesToTime(currentTimeMinutes);
    const endTimeMinutes = currentTimeMinutes + block.durationMinutes;
    const endTime = formatMinutesToTime(endTimeMinutes);
    
    // Move to next block start time (only for non-skipped blocks)
    currentTimeMinutes = endTimeMinutes;
    
    return {
      ...block,
      startTime,
      endTime
    };
  });
}

/**
 * Check if block exceeds closing time and should be removed
 */
export function shouldRemoveBlock(block: PlanBlock): boolean {
  if (!block.selected || !block.options) return false;
  
  const selectedPlace = block.options.find(opt => opt.id === block.selected);
  if (!selectedPlace) return false;
  
  const blockStartMinutes = parseTimeToMinutes(block.startTime);
  const { isClosed, minutesUntilClose } = checkClosingTime(selectedPlace, blockStartMinutes);
  
  // Remove if activity would exceed closing time
  return isClosed || minutesUntilClose < block.durationMinutes;
}
