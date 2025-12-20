import { PlanContext, BudgetTier } from "@/modules/planning/types";

/**
 * Validation result for plan context
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: keyof PlanContext;
  message: string;
  currentValue?: any;
}

/**
 * Valid event types
 */
const VALID_EVENT_TYPES = [
  "date",
  "celebration",
  "friends",
  "graduation",
  "business",
  "family",
] as const;

/**
 * Valid cuisine types (matching Yelp categories)
 */
const VALID_CUISINES = [
  "mexican",
  "italian",
  "asian",
  "chinese",
  "japanese",
  "thai",
  "indian",
  "american",
  "french",
  "mediterranean",
  "seafood",
  "vegetarian",
  "any", // "No preference" maps to this
] as const;

/**
 * Valid mood/atmosphere types
 */
const VALID_MOODS = [
  "romantic",
  "quiet",
  "lively",
  "upscale",
  "casual",
  "any", // "No preference" maps to this
] as const;

/**
 * Valid budget tiers
 */
const VALID_BUDGET_TIERS: BudgetTier[] = ["$", "$$", "$$$", "$$$$", "NA"];

/**
 * Validate event type
 */
function validateEventType(eventType?: string): ValidationError | null {
  if (!eventType) return null; // Optional field
  
  if (!VALID_EVENT_TYPES.includes(eventType as any)) {
    return {
      field: "event",
      message: `Invalid event type: "${eventType}". Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
      currentValue: eventType,
    };
  }
  
  return null;
}

/**
 * Validate location format
 * Must be: "City, ST" or ZIP code (5 digits)
 */
function validateLocation(location?: { text?: string }): ValidationError | null {
  if (!location?.text) {
    return {
      field: "location",
      message: "Location is required",
    };
  }
  
  const locationText = location.text;
  
  // Allow geolocation request
  if (locationText === "REQUEST_GEOLOCATION") {
    return null;
  }
  
  // Check for ZIP code (5 digits or 5+4)
  if (/^\d{5}(-\d{4})?$/.test(locationText)) {
    return null;
  }
  
  // Check for City, ST format
  if (/^[A-Za-z\s]+,\s*[A-Z]{2}$/.test(locationText)) {
    return null;
  }
  
  // Check for full address
  if (/^\d+\s+[A-Za-z]/.test(locationText)) {
    return null;
  }
  
  return {
    field: "location",
    message: `Invalid location format: "${locationText}". Must be "City, ST" or ZIP code`,
    currentValue: locationText,
  };
}

/**
 * Validate date format (ISO YYYY-MM-DD)
 */
function validateDate(dateISO?: string): ValidationError | null {
  if (!dateISO) {
    return {
      field: "event",
      message: "Date is required",
    };
  }
  
  // Check ISO format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return {
      field: "event",
      message: `Invalid date format: "${dateISO}". Must be YYYY-MM-DD`,
      currentValue: dateISO,
    };
  }
  
  // Validate it's a real date
  const date = new Date(dateISO + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return {
      field: "event",
      message: `Invalid date: "${dateISO}"`,
      currentValue: dateISO,
    };
  }
  
  return null;
}

/**
 * Validate time format (24h HH:MM)
 */
function validateTime(time?: string): ValidationError | null {
  if (!time) {
    return {
      field: "event",
      message: "Start time is required",
    };
  }
  
  // Skip validation if needs clarification
  if (time === "NEEDS_CLARIFICATION") {
    return null;
  }
  
  // Check 24h format HH:MM
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return {
      field: "event",
      message: `Invalid time format: "${time}". Must be HH:MM (24h format)`,
      currentValue: time,
    };
  }
  
  // Validate hour and minute ranges
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23) {
    return {
      field: "event",
      message: `Invalid hour: ${hours}. Must be 0-23`,
      currentValue: time,
    };
  }
  
  if (minutes < 0 || minutes > 59) {
    return {
      field: "event",
      message: `Invalid minutes: ${minutes}. Must be 0-59`,
      currentValue: time,
    };
  }
  
  return null;
}

/**
 * Validate time range (startTime must be before endTime, or next day)
 */
function validateTimeRange(startTime?: string, endTime?: string): ValidationError | null {
  if (!startTime || !endTime) {
    return null; // Both required, but checked separately
  }
  
  if (startTime === "NEEDS_CLARIFICATION") {
    return null;
  }
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  // End time can be next day (e.g., 22:00 to 01:00)
  // We allow this if endTime < startTime (assumes next day)
  // But if they're equal, that's an error
  if (startTotalMinutes === endTotalMinutes) {
    return {
      field: "event",
      message: "Start time and end time cannot be the same",
      currentValue: { startTime, endTime },
    };
  }
  
  return null;
}

/**
 * Validate group size
 */
function validateGroupSize(participants?: PlanContext['participants']): ValidationError | null {
  if (!participants?.size || participants.size < 1) {
    return {
      field: "participants",
      message: "Group size must be at least 1",
      currentValue: participants?.size,
    };
  }
  
  if (participants.size > 100) {
    return {
      field: "participants",
      message: "Group size cannot exceed 100",
      currentValue: participants.size,
    };
  }
  
  // Validate kids count
  if (participants.kids && participants.kids < 0) {
    return {
      field: "participants",
      message: "Number of kids cannot be negative",
      currentValue: participants.kids,
    };
  }
  
  return null;
}

/**
 * Validate cuisine preferences
 */
function validateCuisine(cuisine?: string[]): ValidationError | null {
  if (!cuisine || cuisine.length === 0) {
    return null; // Optional field
  }
  
  const invalidCuisines = cuisine.filter(c => !VALID_CUISINES.includes(c as any));
  
  if (invalidCuisines.length > 0) {
    return {
      field: "preferences",
      message: `Invalid cuisine types: ${invalidCuisines.join(", ")}. Valid options: ${VALID_CUISINES.join(", ")}`,
      currentValue: cuisine,
    };
  }
  
  return null;
}

/**
 * Validate mood preferences
 */
function validateMood(mood?: string[]): ValidationError | null {
  if (!mood || mood.length === 0) {
    return null; // Optional field
  }
  
  const invalidMoods = mood.filter(m => !VALID_MOODS.includes(m as any));
  
  if (invalidMoods.length > 0) {
    return {
      field: "preferences",
      message: `Invalid mood types: ${invalidMoods.join(", ")}. Valid options: ${VALID_MOODS.join(", ")}`,
      currentValue: mood,
    };
  }
  
  return null;
}

/**
 * Validate budget tier
 */
function validateBudget(budget?: { tier?: BudgetTier }): ValidationError | null {
  if (!budget?.tier) {
    return null; // Optional field
  }
  
  if (!VALID_BUDGET_TIERS.includes(budget.tier)) {
    return {
      field: "budget",
      message: `Invalid budget tier: "${budget.tier}". Must be one of: ${VALID_BUDGET_TIERS.join(", ")}`,
      currentValue: budget.tier,
    };
  }
  
  return null;
}

/**
 * Comprehensive validation of PlanContext before sending to Yelp API
 */
export function validatePlanContext(context: PlanContext): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate event type
  const eventTypeError = validateEventType(context.event?.type);
  if (eventTypeError) errors.push(eventTypeError);
  
  // Validate location (REQUIRED)
  const locationError = validateLocation(context.location);
  if (locationError) errors.push(locationError);
  
  // Validate date (REQUIRED)
  const dateError = validateDate(context.event?.dateISO);
  if (dateError) errors.push(dateError);
  
  // Validate start time (REQUIRED)
  const startTimeError = validateTime(context.event?.startTime);
  if (startTimeError) errors.push(startTimeError);
  
  // Validate end time (optional but must be valid if present)
  if (context.event?.endTime) {
    const endTimeError = validateTime(context.event.endTime);
    if (endTimeError) errors.push(endTimeError);
    
    // Validate time range
    const timeRangeError = validateTimeRange(context.event.startTime, context.event.endTime);
    if (timeRangeError) errors.push(timeRangeError);
  }
  
  // Validate group size
  const groupSizeError = validateGroupSize(context.participants);
  if (groupSizeError) errors.push(groupSizeError);
  
  // Validate cuisine
  const cuisineError = validateCuisine(context.preferences?.cuisine);
  if (cuisineError) errors.push(cuisineError);
  
  // Validate mood
  const moodError = validateMood(context.preferences?.mood);
  if (moodError) errors.push(moodError);
  
  // Validate budget
  const budgetError = validateBudget(context.budget);
  if (budgetError) errors.push(budgetError);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format group display with kids/pets in parentheses
 */
export function formatGroupDisplay(participants?: PlanContext['participants']): string {
  if (!participants?.size) return "Not specified";
  
  let display = `${participants.size} ${participants.size === 1 ? 'person' : 'people'}`;
  
  const extras: string[] = [];
  if (participants.kids && participants.kids > 0) {
    extras.push(`${participants.kids} ${participants.kids === 1 ? 'kid' : 'kids'}`);
  }
  if (participants.pets) {
    extras.push('pets');
  }
  
  if (extras.length > 0) {
    display += ` (${extras.join(', ')})`;
  }
  
  return display;
}
