import { PlanContext, BudgetTier } from "@/modules/planning/types";

/**
 * Conversation flow manager for YelpOut
 * Handles the question sequence and context updates during user interaction
 */

export type QuestionKey = 
  | "eventType"
  | "location"
  | "groupSize"
  | "groupType"
  | "hasPets"
  | "budget"
  | "cuisine"
  | "mood"
  | "date"
  | "startTime"
  | "duration"
  | "clarifyAmPm"
  | "refine";

export interface ConversationQuestion {
  key: QuestionKey;
  translationKey: string;
  chips: string[] | ((context: PlanContext) => string[]);
  contextField: keyof PlanContext;
  isRequired: boolean;
  shouldAsk: (context: PlanContext) => boolean;
}

export const CONVERSATION_FLOW: ConversationQuestion[] = [
  {
    key: "eventType",
    translationKey: "questions.eventType",
    chips: [
      "chips.date",
      "chips.celebration",
      "chips.friendsOuting",
      "chips.graduation",
      "chips.businessMeal",
      "chips.familyTime",
    ],
    contextField: "event",
    isRequired: false,
    shouldAsk: (ctx) => {
      // Skip if event type was already detected (date, family, etc.)
      return !ctx.event?.type || ctx.event.type === "";
    },
  },
  {
    key: "location",
    translationKey: "questions.location",
    chips: (ctx) => {
      // This will be replaced by dynamic chips from page.tsx
      // Default fallback
      return [
        "chips.useLocation",
        "Dallas, TX",
        "Plano, TX",
        "Frisco, TX",
      ];
    },
    contextField: "location",
    isRequired: true,
    shouldAsk: (ctx) => !ctx.location?.text,
  },
  {
    key: "date",
    translationKey: "questions.date",
    chips: [
      "chips.today",
      "chips.tomorrow",
      "chips.chooseDate",
    ],
    contextField: "event",
    isRequired: true,
    shouldAsk: (ctx) => !ctx.event?.dateISO,
  },
  {
    key: "startTime",
    translationKey: "questions.startTime",
    chips: (ctx) => {
      const allTimeChips = [
        "chips.now",  // Add "Now" option
        "10:00 AM",
        "12:00 PM",
        "2:00 PM",
        "6:00 PM",
        "8:00 PM",
      ];
      
      // If date is today, filter out past times and keep "Now"
      if (ctx.event?.dateISO) {
        const selectedDate = new Date(ctx.event.dateISO + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if selected date is today
        if (selectedDate.getTime() === today.getTime()) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          return allTimeChips.filter(timeChip => {
            // Always keep "Now" option for today
            if (timeChip === "chips.now") return true;
            
            // Parse time chip (e.g., "10:00 AM" or "6:00 PM")
            const match = timeChip.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) return true;
            
            let hour = parseInt(match[1]);
            const minute = parseInt(match[2]);
            const period = match[3].toUpperCase();
            
            // Convert to 24-hour format
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            
            // Keep chip if time is in the future (at least 30 minutes from now)
            if (hour > currentHour) return true;
            if (hour === currentHour && minute > currentMinute + 30) return true;
            
            return false;
          });
        }
      }
      
      return allTimeChips;
    },
    contextField: "event",
    isRequired: true,
    shouldAsk: (ctx) => {
      // Treat NEEDS_CLARIFICATION as not having a time
      return !ctx.event?.startTime || ctx.event.startTime === "NEEDS_CLARIFICATION";
    },
  },
  {
    key: "duration",
    translationKey: "questions.duration",
    chips: [
      "chips.hours2",
      "chips.hours4",
      "chips.hours6",
      "chips.allDay",
    ],
    contextField: "event",
    isRequired: true,
    shouldAsk: (ctx) => {
      // Don't ask for duration if startTime is not set or needs clarification
      if (!ctx.event?.startTime || ctx.event.startTime === "NEEDS_CLARIFICATION") {
        return false;
      }
      // Don't ask if endTime is already set
      return !ctx.event?.endTime;
    },
  },
  {
    key: "groupSize",
    translationKey: "questions.groupSize",
    chips: (ctx) => {
      const eventType = ctx.event?.type?.toLowerCase() || "";
      const allChips = [
        "chips.justMe",
        "chips.couple",
        "chips.small",
        "chips.medium",
        "chips.large",
      ];
      
      // Exclude "Just me" for events that require multiple people
      const multiPersonEvents = ["date", "cita", "family", "familia", "anniversary", "aniversario", "couple", "pareja", "friends", "amigos", "graduation", "graduación", "graduacion", "business", "negocios", "colleagues", "colegas"];
      if (multiPersonEvents.some(type => eventType.includes(type))) {
        return allChips.filter(chip => chip !== "chips.justMe");
      }
      
      return allChips;
    },
    contextField: "participants",
    isRequired: true,
    shouldAsk: (ctx) => {
      const eventType = ctx.event?.type?.toLowerCase() || "";
      // Skip for date/anniversary - auto-set to couple
      const coupleEvents = ["date", "cita", "anniversary", "aniversario"];
      if (coupleEvents.some(type => eventType.includes(type))) {
        return false;
      }
      return !ctx.participants?.size;
    },
  },
  {
    key: "groupType",
    translationKey: "questions.groupType",
    chips: [
      "chips.couple2",
      "chips.familyKids",
      "chips.friends2",
      "chips.colleagues",
      "chips.withPet",
    ],
    contextField: "participants",
    isRequired: false,
    shouldAsk: (ctx) => false, // Disabled - using checkboxes instead
  },
  {
    key: "hasPets",
    translationKey: "questions.hasPets",
    chips: [
      "chips.yes",
      "chips.no",
    ],
    contextField: "participants",
    isRequired: false,
    shouldAsk: (ctx) => false, // Disabled - using checkboxes instead
  },
  {
    key: "budget",
    translationKey: "questions.budget",
    chips: [
      "chips.economical",
      "chips.moderate",
      "chips.upscale",
      "chips.luxury",
      "chips.noPreference",
    ],
    contextField: "budget",
    isRequired: false,
    shouldAsk: (ctx) => !ctx.budget?.tier,
  },
  {
    key: "cuisine",
    translationKey: "questions.cuisine",
    chips: [
      "cuisine.mexican",
      "cuisine.italian",
      "cuisine.asian",
      "cuisine.american",
      "cuisine.mediterranean",
      "chips.noPreference",
    ],
    contextField: "preferences",
    isRequired: false,
    shouldAsk: (ctx) => !ctx.preferences?.cuisine || ctx.preferences.cuisine.length === 0,
  },
  {
    key: "mood",
    translationKey: "questions.mood",
    chips: [
      "mood.calm",
      "mood.romantic",
      "mood.fun",
      "mood.fancy",
      "mood.casual",
      "chips.noPreference",
    ],
    contextField: "preferences",
    isRequired: false,
    shouldAsk: (ctx) => !ctx.preferences?.mood || ctx.preferences.mood.length === 0,
  },
];

/**
 * Get the next question to ask based on current context
 */
// Helper: Get nearby city chips based on coordinates
function getNearbyChips(lat: number, lng: number): string[] {
  const chips = ["chips.useLocation"];
  
  // Dallas/Fort Worth Metroplex (around 32.7-33.0 lat, -96.5 to -97.5 lng)
  if (lat >= 32.5 && lat <= 33.2 && lng >= -97.5 && lng <= -96.0) {
    // North Dallas area (Frisco, Plano, McKinney)
    if (lat >= 33.0) {
      chips.push("Frisco, TX", "Plano, TX", "McKinney, TX");
    }
    // Central Dallas area
    else if (lat >= 32.7 && lat < 33.0) {
      chips.push("Dallas, TX", "Plano, TX", "Richardson, TX");
    }
    // South Dallas area
    else {
      chips.push("Dallas, TX", "Arlington, TX", "Irving, TX");
    }
  }
  // Houston area (around 29.7 lat, -95.4 lng)
  else if (lat >= 29.5 && lat <= 30.0 && lng >= -95.7 && lng <= -95.0) {
    chips.push("Houston, TX", "Sugar Land, TX", "The Woodlands, TX");
  }
  // Austin area (around 30.3 lat, -97.7 lng)
  else if (lat >= 30.0 && lat <= 30.5 && lng >= -98.0 && lng <= -97.5) {
    chips.push("Austin, TX", "Round Rock, TX", "Cedar Park, TX");
  }
  // San Antonio area (around 29.4 lat, -98.5 lng)
  else if (lat >= 29.2 && lat <= 29.6 && lng >= -98.7 && lng <= -98.3) {
    chips.push("San Antonio, TX", "New Braunfels, TX", "Boerne, TX");
  }
  // Default for other areas
  else {
    chips.push("Dallas, TX", "Houston, TX", "Austin, TX");
  }
  
  return chips;
}

// Helper: Get nearby Texas cities based on city name
function getTexasCitiesNearby(cityText: string): string[] {
  const lowerCity = cityText.toLowerCase();
  
  const cityGroups: Record<string, string[]> = {
    'frisco': ["Frisco, TX", "Plano, TX", "McKinney, TX"],
    'plano': ["Plano, TX", "Frisco, TX", "Richardson, TX"],
    'mckinney': ["McKinney, TX", "Frisco, TX", "Allen, TX"],
    'allen': ["Allen, TX", "Plano, TX", "McKinney, TX"],
    'richardson': ["Richardson, TX", "Plano, TX", "Dallas, TX"],
    'dallas': ["Dallas, TX", "Plano, TX", "Irving, TX"],
    'irving': ["Irving, TX", "Dallas, TX", "Arlington, TX"],
    'arlington': ["Arlington, TX", "Fort Worth, TX", "Irving, TX"],
    'fort worth': ["Fort Worth, TX", "Arlington, TX", "Grapevine, TX"],
    'houston': ["Houston, TX", "Sugar Land, TX", "The Woodlands, TX"],
    'austin': ["Austin, TX", "Round Rock, TX", "Cedar Park, TX"],
    'san antonio': ["San Antonio, TX", "New Braunfels, TX", "Boerne, TX"],
  };
  
  for (const [key, cities] of Object.entries(cityGroups)) {
    if (lowerCity.includes(key)) {
      return cities;
    }
  }
  
  return [];
}

export function getNextQuestion(context: PlanContext): ConversationQuestion | null {
  for (const question of CONVERSATION_FLOW) {
    if (question.shouldAsk(context)) {
      return question;
    }
  }
  return null;
}

/**
 * Get chips for a question, evaluating function if needed
 */
export function getQuestionChips(question: ConversationQuestion, context: PlanContext): string[] {
  if (typeof question.chips === 'function') {
    return question.chips(context);
  }
  return question.chips;
}

/**
 * Check if we have all required information or if there are no more questions to ask
 */
export function hasAllRequiredInfo(context: PlanContext): boolean {
  // Check if all required questions are answered
  const allRequiredAnswered = CONVERSATION_FLOW
    .filter(q => q.isRequired)
    .every(q => !q.shouldAsk(context));
  
  // If all required are done, check if there are any optional questions left
  if (allRequiredAnswered) {
    const hasMoreQuestions = CONVERSATION_FLOW.some(q => q.shouldAsk(context));
    // If no more questions, we're done
    return !hasMoreQuestions;
  }
  
  return false;
}

/**
 * Get default participants configuration based on event type
 */
function getDefaultParticipants(eventType: string): PlanContext['participants'] {
  const lowerType = eventType.toLowerCase();
  
  // Date/anniversary - default to 2 people (couple)
  if (lowerType.includes('date') || lowerType.includes('cita') || 
      lowerType.includes('anniversary') || lowerType.includes('aniversario')) {
    return {
      size: 2,
      isCouple: true,
      hasKids: false,
      hasPets: false,
    };
  }
  
  // Family - default to family with kids
  if (lowerType.includes('family') || lowerType.includes('familia') || 
      lowerType.includes('kids') || lowerType.includes('niños')) {
    return {
      hasKids: true,
      hasPets: false,
    };
  }
  
  // Friends - default to small group
  if (lowerType.includes('friends') || lowerType.includes('amigos')) {
    return {
      hasKids: false,
      hasPets: false,
    };
  }
  
  // Business - default to colleagues
  if (lowerType.includes('business') || lowerType.includes('negocios') ||
      lowerType.includes('colleagues') || lowerType.includes('colegas')) {
    return {
      hasKids: false,
      hasPets: false,
    };
  }
  
  // Default - return empty to ask for details
  return {
    hasKids: false,
    hasPets: false,
  };
}

/**
 * Detect if user wants to change a specific field
 * Returns the field to change and sets appropriate question
 */
export function detectChangeRequest(message: string, context: PlanContext): { 
  field: QuestionKey | null; 
  updates: Partial<PlanContext>;
} {
  const lowerMessage = message.toLowerCase();
  
  // Change patterns in English and Spanish
  const changePatterns = [
    /\b(change|modify|update|set|cambiar|modificar|actualizar)\s+(?:the\s+)?(\w+)\s+(?:to|a)\s+(.+)/i,
    /\b(make|hacer)\s+(?:it|the)\s+(\w+)\s+(.+)/i,
  ];
  
  for (const pattern of changePatterns) {
    const match = message.match(pattern);
    if (match) {
      const fieldHint = match[2].toLowerCase();
      const newValue = match[3].trim();
      
      
      // Map field hints to question keys and parse values
      if (fieldHint.includes('time') || fieldHint.includes('hora')) {
        // Parse the new time value
        const timeUpdates = parseTimeValue(newValue, context);
        if (timeUpdates.event?.startTime) {
          return {
            field: 'startTime',
            updates: timeUpdates
          };
        }
      }
      
      if (fieldHint.includes('date') || fieldHint.includes('fecha') || fieldHint.includes('day') || fieldHint.includes('día')) {
        const dateUpdates = parseDateValue(newValue, context);
        if (dateUpdates.event?.dateISO) {
          return {
            field: 'date',
            updates: dateUpdates
          };
        }
      }
      
      if (fieldHint.includes('location') || fieldHint.includes('place') || fieldHint.includes('ubicación') || fieldHint.includes('lugar')) {
        const locationUpdates = parseLocationValue(newValue);
        if (locationUpdates.location) {
          return {
            field: 'location',
            updates: locationUpdates
          };
        }
      }
      
      if (fieldHint.includes('budget') || fieldHint.includes('price') || fieldHint.includes('presupuesto') || fieldHint.includes('precio')) {
        const budgetUpdates = parseBudgetValue(newValue, context);
        if (budgetUpdates.budget?.tier !== undefined) {
          return {
            field: 'budget',
            updates: budgetUpdates
          };
        }
      }
      
      if (fieldHint.includes('duration') || fieldHint.includes('duración') || fieldHint.includes('long') || fieldHint.includes('hours')) {
        const durationUpdates = parseDurationValue(newValue, context);
        if (durationUpdates.event?.endTime) {
          return {
            field: 'duration',
            updates: durationUpdates
          };
        }
      }
    }
  }
  
  return { field: null, updates: {} };
}

// Helper functions for parsing specific field values
function parseTimeValue(value: string, context: PlanContext): Partial<PlanContext> {
  const updates: Partial<PlanContext> = {};
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
    /(\d{1,2})\s*(am|pm)/i,
  ];
  
  for (const pattern of timePatterns) {
    const match = value.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] || "00";
      const meridiem = match[3]?.toUpperCase();
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      updates.event = {
        ...context.event,
        startTime,
      };
      break;
    }
  }
  
  return updates;
}

function parseDateValue(value: string, context: PlanContext): Partial<PlanContext> {
  const updates: Partial<PlanContext> = {};
  const lowerValue = value.toLowerCase();
  const today = new Date();
  
  const getLocalDateISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  if (lowerValue === 'today' || lowerValue === 'hoy') {
    updates.event = { ...context.event, dateISO: getLocalDateISO(today) };
  } else if (lowerValue === 'tomorrow' || lowerValue === 'mañana') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    updates.event = { ...context.event, dateISO: getLocalDateISO(tomorrow) };
  } else {
    // Try ISO format or other date formats
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      updates.event = { ...context.event, dateISO: value.trim() };
    }
  }
  
  return updates;
}

function parseLocationValue(value: string): Partial<PlanContext> {
  const trimmedValue = value.trim();
  const updates: Partial<PlanContext> = {};
  
  // Check for geolocation request
  if (/\b(near me|cerca de mi|my location|mi ubicación|mi ubicacion|current location|aquí|aqui|here)\b/i.test(trimmedValue)) {
    updates.location = {
      text: "REQUEST_GEOLOCATION",
      radiusKm: 10,
    };
  } else {
    // Regular city/location name
    updates.location = {
      text: trimmedValue,
      radiusKm: 15,
    };
  }
  
  return updates;
}

function parseBudgetValue(value: string, context: PlanContext): Partial<PlanContext> {
  const updates: Partial<PlanContext> = {};
  const lowerValue = value.toLowerCase();
  
  let tier: BudgetTier | undefined;
  if (lowerValue.includes('$$$$') || lowerValue.includes('luxury') || lowerValue.includes('lujo')) {
    tier = "$$$$";
  } else if (lowerValue.includes('$$$') || lowerValue.includes('upscale') || lowerValue.includes('alto')) {
    tier = "$$$";
  } else if (lowerValue.includes('$$') || lowerValue.includes('moderate') || lowerValue.includes('moderado')) {
    tier = "$$";
  } else if (lowerValue.includes('$') || lowerValue.includes('economical') || lowerValue.includes('económico')) {
    tier = "$";
  }
  
  if (tier !== undefined) {
    updates.budget = { 
      ...context.budget,
      tier 
    };
  }
  
  return updates;
}

function parseDurationValue(value: string, context: PlanContext): Partial<PlanContext> {
  const updates: Partial<PlanContext> = {};
  const lowerValue = value.toLowerCase();
  
  let durationHours = 2; // default
  
  // Handle natural language durations
  if (lowerValue.includes("half") || lowerValue.includes("media")) {
    durationHours = 0.5;
  } else if (lowerValue.includes("all day") || lowerValue.includes("todo el día")) {
    durationHours = 8;
  } else {
    // Extract numbers with context: "2 hours", "1.5 hours", "2", "90 minutes"
    const hourMatch = value.match(/(\d+(?:\.\d+)?)\s*(?:hour|hora|hr)/i);
    if (hourMatch) {
      durationHours = parseFloat(hourMatch[1]);
    } else {
      const minuteMatch = value.match(/(\d+)\s*(?:min|minute|minuto)/i);
      if (minuteMatch) {
        durationHours = parseInt(minuteMatch[1]) / 60;
      } else {
        // Just a number: "2", "4", "6"
        const numberMatch = value.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
        if (numberMatch) {
          durationHours = parseFloat(numberMatch[1]);
        }
      }
    }
  }
  
  const startTime = context.event?.startTime && context.event.startTime !== "NEEDS_CLARIFICATION"
    ? context.event.startTime
    : '18:00';
  
  const endTime = calculateEndTime(startTime, durationHours);
  updates.event = {
    ...context.event,
    endTime,
  };
  
  return updates;
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + (duration * 60);
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = Math.floor(endMinutes % 60);
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

/**
 * Parse user response and update context accordingly
 * Handles different question types and extracts relevant information
 * Enhanced with natural language understanding
 */
export function parseUserResponse(
  message: string,
  question: QuestionKey,
  context: PlanContext
): Partial<PlanContext> {
  const updates: Partial<PlanContext> = {};
  const lowerMessage = message.toLowerCase();

  // FIRST: Check if user is changing event type mid-conversation
  // This should be detected regardless of current question
  if (question !== "eventType") {
    const detectedType = extractEventType(message);
    if (detectedType && detectedType.type !== context.event?.type) {
      // User is changing event type mid-conversation
      // Preserve all existing context except event type and participants
      updates.event = {
        ...context.event,
        type: detectedType.type,
      };
      // Update participants to match new event type
      updates.participants = getDefaultParticipants(detectedType.type);
      
      // Preserve ALL other fields: groupSize, location, date, time, duration, budget, cuisine, mood
      // Don't modify them - just return the event type change
      return updates;
    }
  }

  switch (question) {
    case "eventType":
      let eventType = message;
      
      // Extract event type from natural language
      if (lowerMessage.includes("date") || lowerMessage.includes("cita") || lowerMessage.includes("romantic") || 
          lowerMessage.includes("romántic") || lowerMessage.includes("esposa") || lowerMessage.includes("esposo") ||
          lowerMessage.includes("novia") || lowerMessage.includes("novio") || lowerMessage.includes("wife") || 
          lowerMessage.includes("husband") || lowerMessage.includes("girlfriend") || lowerMessage.includes("boyfriend")) {
        eventType = "date";
      } else if (lowerMessage.includes("birthday") || lowerMessage.includes("cumpleaños") || 
                 lowerMessage.includes("anniversary") || lowerMessage.includes("aniversario") ||
                 lowerMessage.includes("celebration") || lowerMessage.includes("celebración")) {
        eventType = "celebration";
      } else if (lowerMessage.includes("family") || lowerMessage.includes("familia") || 
                 lowerMessage.includes("kids") || lowerMessage.includes("niños")) {
        eventType = "family";
      } else if (lowerMessage.includes("friends") || lowerMessage.includes("amigos") || 
                 lowerMessage.includes("buddy") || lowerMessage.includes("buddies")) {
        eventType = "friends";
      } else if (lowerMessage.includes("graduation") || lowerMessage.includes("graduación") || 
                 lowerMessage.includes("graduate") || lowerMessage.includes("graduado")) {
        eventType = "graduation";
      } else if (lowerMessage.includes("business") || lowerMessage.includes("negocios") || 
                 lowerMessage.includes("colleagues") || lowerMessage.includes("colegas") ||
                 lowerMessage.includes("work") || lowerMessage.includes("trabajo")) {
        eventType = "business";
      }
      
      updates.event = {
        ...context.event,
        type: eventType,
      };
      break;

    case "location":
      // When answering location question directly, use parseLocationValue
      return parseLocationValue(message);

    case "duration":
      // When answering duration question directly, use parseDurationValue
      return parseDurationValue(message, context);

    case "clarifyAmPm":
      // Handle AM/PM clarification for ambiguous times
      const tempHour = context.event?._tempHour;
      const tempMinutes = context.event?._tempMinutes || "00";
      
      if (tempHour) {
        let hours = parseInt(tempHour);
        
        if (lowerMessage.includes("pm") || lowerMessage.includes("tarde") || lowerMessage.includes("noche")) {
          if (hours !== 12) hours += 12;
        } else if (lowerMessage.includes("am") || lowerMessage.includes("mañana") || lowerMessage.includes("morning")) {
          if (hours === 12) hours = 0;
        }
        
        const startTime = `${hours.toString().padStart(2, '0')}:${tempMinutes}`;
        updates.event = {
          ...context.event,
          startTime,
          _tempHour: undefined,
          _tempMinutes: undefined,
        };
      }
      break;

    case "location":
      // Handle "Use my current location" specially
      let locationText = "";
      
      if (message.includes("Use my current location") || 
          message.includes("Usar mi ubicación actual") ||
          message.includes("chips.useLocation")) {
        locationText = "REQUEST_GEOLOCATION";
      } else {
        const trimmedMessage = message.trim();
        
        // Direct acceptance for city chips like "Plano, TX", "Dallas, TX"
        // If it contains a comma, treat it as a valid location immediately
        if (trimmedMessage.includes(',')) {
          locationText = trimmedMessage;
        }
        // Check for ZIP code
        else if (/^\d{5}(-\d{4})?$/.test(trimmedMessage)) {
          locationText = trimmedMessage;
        }
        // Check for street address (has numbers)
        else if (/\d+/.test(trimmedMessage)) {
          locationText = trimmedMessage;
        }
        // Accept any text as city name
        else if (trimmedMessage.length >= 2) {
          locationText = trimmedMessage
            .replace(/^(?:in|en)\s+/i, '')
            .replace(/^(?:near|cerca de|around)\s+/i, '')
            .trim();
        }
      }
      
      // Only return empty if we truly have nothing
      if (!locationText) {
        console.error('[Location Parse] FAILED to parse:', message);
        return updates;
      }
      
      const radiusKm = locationText === "REQUEST_GEOLOCATION" ? 10 : 15;
      
      
      updates.location = {
        text: locationText,
        radiusKm,
      };
      break;

    case "date":
      let dateISO = "";
      const today = new Date();
      
      // Helper to get local date in YYYY-MM-DD format (avoiding UTC timezone issues)
      const getLocalDateISO = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Check for keyword chips first (today, tomorrow, weekend)
      if (lowerMessage === "today" || lowerMessage === "hoy") {
        dateISO = getLocalDateISO(today);
      } else if (lowerMessage === "tomorrow" || lowerMessage === "mañana" || lowerMessage === "mañana") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateISO = getLocalDateISO(tomorrow);
      } else if (lowerMessage === "weekend" || lowerMessage === "fin de semana") {
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        dateISO = getLocalDateISO(saturday);
      }
      // Check for ISO format (YYYY-MM-DD from DatePicker)
      else {
        const isoMatch = message.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) {
          dateISO = message.trim();
        } else {
          // Try to parse date formats like MM/DD/YYYY
          const dateMatch = message.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
          if (dateMatch) {
            const month = parseInt(dateMatch[1]) - 1;
            const day = parseInt(dateMatch[2]);
            const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
            const date = new Date(year, month, day);
            dateISO = date.toISOString().split('T')[0];
          } else {
            // Default to today if nothing matches
            dateISO = today.toISOString().split('T')[0];
          }
        }
      }
      
      
      updates.event = {
        ...context.event,
        dateISO,
      };
      break;

    case "startTime":
      let startTime = "18:00"; // Default to 6 PM
      let needsAmPmClarification = false;
      
      // Check for "Now" chip first
      if (lowerMessage === "now" || lowerMessage === "ahora" || lowerMessage.includes("chips.now")) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        updates.event = {
          ...context.event,
          startTime,
        };
        break;
      }
      
      // Try to extract time from natural language or chip format
      const timePatterns = [
        /(\d{1,2}):(\d{2})\s*(am|pm)/i,  // "10:00 AM" or "6:00 pm"
        /(\d{1,2})\s*(am|pm)/i,          // "10 AM" or "6 pm"
        /(\d{1,2}):(\d{2})/,              // "14:00" (24h format)
        /(?:at|a(?:\s+las)?)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i
      ];
      
      for (const pattern of timePatterns) {
        const match = message.match(pattern);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = match[2] ? match[2] : "00";
          const meridiem = match[3]?.toUpperCase();
          
          // If hour is ambiguous (1-12 without AM/PM) and not in 24h format, mark for clarification
          if (!meridiem && hours >= 1 && hours <= 12 && !message.match(/(\d{1,2}):(\d{2})/)) {
            needsAmPmClarification = true;
            updates.event = {
              ...context.event,
              startTime: "NEEDS_CLARIFICATION",
              _tempHour: hours.toString(),
              _tempMinutes: minutes,
            };
            break;
          }
          
          // Convert to 24h format if PM/AM provided
          if (meridiem === "PM" && hours !== 12) hours += 12;
          if (meridiem === "AM" && hours === 12) hours = 0;
          
          startTime = `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
          updates.event = {
            ...context.event,
            startTime,
          };
          break;
        }
      }
      
      // If no pattern matched and no clarification needed, check for time expressions
      if (!needsAmPmClarification && !updates.event?.startTime) {
        // Common time expressions (English and Spanish)
        if (lowerMessage.includes("morning") || lowerMessage.includes("mañana")) startTime = "10:00";
        if (lowerMessage.includes("noon") || lowerMessage.includes("mediodía") || lowerMessage.includes("mediodia")) startTime = "12:00";
        if (lowerMessage.includes("afternoon") || lowerMessage.includes("tarde")) startTime = "14:00";
        if (lowerMessage.includes("evening") || lowerMessage.includes("noche")) startTime = "18:00";
        if (lowerMessage.includes("night")) startTime = "20:00";
        
        updates.event = {
          ...context.event,
          startTime,
        };
      }
      break;

    case "duration":
      // Check if we have a valid start time (not NEEDS_CLARIFICATION)
      const start = context.event?.startTime && context.event.startTime !== "NEEDS_CLARIFICATION" 
        ? context.event.startTime 
        : "12:00";
      let durationHours = 2;
      
      // Validate start time format - must be HH:MM in 24h format
      if (!start || !start.match(/^\d{1,2}:\d{2}$/)) {
        // Invalid format, skip duration calculation
        break;
      }
      
      // Extract duration from natural language
      // Handle specific phrases first
      if (lowerMessage.includes("half an hour") || lowerMessage.includes("media hora")) {
        durationHours = 0.5;
      } else if (lowerMessage.includes("an hour") || lowerMessage.includes("una hora") || lowerMessage === "1 hour") {
        durationHours = 1;
      } else if (lowerMessage.includes("all day") || lowerMessage.includes("todo el día") || lowerMessage.includes("todo el dia")) {
        durationHours = 8;
      } else {
        // Try to match decimal hours: "1.5 hours", "2.5 hours"
        const decimalMatch = message.match(/(\d+\.?\d*)\s*(hour|hora|hr)/i);
        if (decimalMatch) {
          durationHours = parseFloat(decimalMatch[1]);
        } else {
          // Try to match minutes: "45 min", "30 minutes", "90 minutos"
          const minutesMatch = message.match(/(\d+)\s*(min|minute|minuto)/i);
          if (minutesMatch) {
            durationHours = parseInt(minutesMatch[1]) / 60;
          } else {
            // Try to match just numbers with context (chips like "2", "4", "6")
            const numberMatch = message.match(/^(\d+)$/);
            if (numberMatch) {
              durationHours = parseInt(numberMatch[1]);
            }
          }
        }
      }
      
      // Parse start time - ensure it's a valid time format
      if (!start.includes(":")) {
        // Invalid format, use default
        updates.event = {
          ...context.event,
          endTime: "14:00", // Default 2 hours from noon
        };
        break;
      }
      
      const [startHour, startMin] = start.split(":").map(Number);
      const totalMinutes = (startHour * 60 + startMin) + (durationHours * 60);
      let endHour = Math.floor(totalMinutes / 60);
      let endMin = Math.round(totalMinutes % 60);
      
      if (endHour >= 24) endHour = 23;
      if (endMin >= 60) {
        endMin = 59;
      }
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      updates.event = {
        ...context.event,
        endTime,
      };
      break;

    case "groupSize":
      let size = 2;
      let sizeRange: string | undefined;
      
      // Map for word numbers in English and Spanish
      const wordToNumber: Record<string, number> = {
        // English
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
        'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
        // Spanish
        'uno': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
        'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
        'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
        'dieciséis': 16, 'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 
        'diecinueve': 19, 'veinte': 20
      };
      
      // Check for range format first (3-5, 4-6, etc)
      const rangeMatch = message.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        const minSize = parseInt(rangeMatch[1]);
        const maxSize = parseInt(rangeMatch[2]);
        size = minSize; // Use minimum for internal logic
        sizeRange = `${minSize}-${maxSize}`;
      } else {
        // Extract single number from message
        const numberMatch = message.match(/(\d+)/);
        if (numberMatch) {
          size = parseInt(numberMatch[1]);
        } else {
          // Check for word numbers
          let foundWordNumber = false;
          for (const [word, num] of Object.entries(wordToNumber)) {
            if (lowerMessage.includes(word)) {
              size = num;
              foundWordNumber = true;
              break;
            }
          }
          
          // If no word number found, check for descriptive phrases
          if (!foundWordNumber) {
            if (lowerMessage.includes("alone") || lowerMessage.includes("solo") || lowerMessage.includes("just me")) {
              size = 1;
            } else if (lowerMessage.includes("couple") || lowerMessage.includes("pareja")) {
              size = 2;
            } else if (lowerMessage.includes("few") || lowerMessage.includes("small") || lowerMessage.includes("pequeño")) {
              size = 4;
            } else if (lowerMessage.includes("large") || lowerMessage.includes("big") || lowerMessage.includes("many") || lowerMessage.includes("muchos")) {
              size = 8;
            }
          }
        }
      }
      
      updates.participants = {
        ...context.participants,
        size,
        ...(sizeRange && { sizeRange }),
      };
      break;

    case "groupType":
      const type = lowerMessage;
      let isCouple = false;
      let kids = 0;
      let pets = false;

      if (type.includes("couple") || type.includes("pareja") || type.includes("partner") || type.includes("date") || 
          type.includes("cita") || type.includes("esposa") || type.includes("esposo") || type.includes("wife") || type.includes("husband") ||
          type.includes("novia") || type.includes("novio") || type.includes("girlfriend") || type.includes("boyfriend")) {
        isCouple = true;
      }
      if (type.includes("family") || type.includes("familia") || type.includes("kid") || type.includes("niño") || type.includes("niña") || type.includes("child")) {
        kids = 1;
      }
      if (type.includes("pet") || type.includes("mascota") || type.includes("dog") || type.includes("perro") || type.includes("cat") || type.includes("gato")) {
        pets = true;
      }

      updates.participants = {
        ...context.participants,
        isCouple,
        kids,
        pets,
      };
      break;

    case "hasPets":
      const hasPets = lowerMessage.includes("yes") || 
                      lowerMessage.includes("sí") || 
                      lowerMessage.includes("si") || 
                      lowerMessage.includes("yeah") || 
                      lowerMessage.includes("sure") || 
                      lowerMessage.includes("dog") || 
                      lowerMessage.includes("perro") || 
                      lowerMessage.includes("cat") || 
                      lowerMessage.includes("gato") ||
                      lowerMessage.includes("pet") ||
                      lowerMessage.includes("mascota");
      
      updates.participants = {
        ...context.participants,
        pets: hasPets,
      };
      break;

    case "budget":
      let tier: BudgetTier = "$$";
      
      // Check for "no preference" first
      if (lowerMessage.includes("no preference") || lowerMessage.includes("sin preferencia") || 
          lowerMessage.includes("any") || lowerMessage.includes("doesn't matter") ||
          lowerMessage.includes("cualquier") || lowerMessage.includes("da igual")) {
        tier = "NA";
      }
      // Check for explicit tier symbols
      else if (message.includes("$$$$")) tier = "$$$$";
      else if (message.includes("$$$")) tier = "$$$";
      else if (message.includes("$$")) tier = "$$";
      else if (message.includes("$") && !message.includes("$$")) tier = "$";
      // Check for text descriptions
      else if (lowerMessage.includes("economical") || lowerMessage.includes("económico") || lowerMessage.includes("cheap") || lowerMessage.includes("budget") || lowerMessage.includes("barato")) tier = "$";
      else if (lowerMessage.includes("moderate") || lowerMessage.includes("moderado") || lowerMessage.includes("reasonable") || lowerMessage.includes("medium")) tier = "$$";
      else if (lowerMessage.includes("upscale") || lowerMessage.includes("expensive") || lowerMessage.includes("fancy") || lowerMessage.includes("nice") || lowerMessage.includes("caro")) tier = "$$$";
      else if (lowerMessage.includes("luxury") || lowerMessage.includes("lujo") || lowerMessage.includes("high-end") || lowerMessage.includes("premium")) tier = "$$$$";

      updates.budget = {
        tier,
      };
      break;

    case "cuisine":
      const cuisines: string[] = [];
      
      // Check for "no preference" first
      if (lowerMessage.includes("no preference") || lowerMessage.includes("sin preferencia") || 
          lowerMessage.includes("any") || lowerMessage.includes("doesn't matter") ||
          lowerMessage.includes("cualquier") || lowerMessage.includes("da igual")) {
        updates.preferences = {
          ...context.preferences,
          cuisine: ["any"],
        };
      } else {
        // Extract cuisine types from natural language
        if (lowerMessage.includes("mexican") || lowerMessage.includes("mexicana") || lowerMessage.includes("tacos") || lowerMessage.includes("burritos")) cuisines.push("mexican");
        if (lowerMessage.includes("italian") || lowerMessage.includes("italiana") || lowerMessage.includes("pizza") || lowerMessage.includes("pasta")) cuisines.push("italian");
        if (lowerMessage.includes("asian") || lowerMessage.includes("asiática") || lowerMessage.includes("chinese") || lowerMessage.includes("japanese") || lowerMessage.includes("sushi") || lowerMessage.includes("thai")) cuisines.push("asian");
        if (lowerMessage.includes("american") || lowerMessage.includes("americana") || lowerMessage.includes("burger") || lowerMessage.includes("steak")) cuisines.push("american");
        if (lowerMessage.includes("mediterranean") || lowerMessage.includes("mediterránea") || lowerMessage.includes("greek") || lowerMessage.includes("middle eastern")) cuisines.push("mediterranean");
        if (lowerMessage.includes("indian") || lowerMessage.includes("india")) cuisines.push("indian");
        if (lowerMessage.includes("french") || lowerMessage.includes("francesa")) cuisines.push("french");

        if (cuisines.length > 0) {
          updates.preferences = {
            ...context.preferences,
            cuisine: cuisines,
          };
        }
      }
      break;

    case "mood":
      const moods: string[] = [];
      
      // Check for "no preference" first (works with both English and Spanish)
      if (lowerMessage.includes("no preference") || lowerMessage.includes("sin preferencia") || 
          lowerMessage.includes("any") || lowerMessage.includes("doesn't matter") ||
          lowerMessage.includes("cualquier") || lowerMessage.includes("da igual")) {
        updates.preferences = {
          ...context.preferences,
          mood: ["any"],
        };
      } else {
        // Extract mood keywords from natural language AND translated chip text
        if (lowerMessage.includes("calm") || lowerMessage.includes("tranquil") || 
            lowerMessage.includes("quiet") || lowerMessage.includes("peaceful") || 
            lowerMessage.includes("tranquilo")) moods.push("quiet");
        if (lowerMessage.includes("romantic") || lowerMessage.includes("romance") || 
            lowerMessage.includes("intimate") || lowerMessage.includes("romántico") || 
            lowerMessage.includes("date")) moods.push("romantic");
        if (lowerMessage.includes("fun") || lowerMessage.includes("lively") || 
            lowerMessage.includes("energetic") || lowerMessage.includes("party") || 
            lowerMessage.includes("divertido") || lowerMessage.includes("animado")) moods.push("lively");
        if (lowerMessage.includes("fancy") || lowerMessage.includes("elegant") || 
            lowerMessage.includes("upscale") || lowerMessage.includes("classy") || 
            lowerMessage.includes("elegante") || lowerMessage.includes("fino")) moods.push("upscale");
        if (lowerMessage.includes("casual") || lowerMessage.includes("relaxed") || 
            lowerMessage.includes("laid-back") || lowerMessage.includes("informal")) moods.push("casual");
        if (lowerMessage.includes("family") || lowerMessage.includes("familia") || 
            lowerMessage.includes("kid-friendly")) moods.push("family");

        if (moods.length > 0) {
          updates.preferences = {
            ...context.preferences,
            mood: moods,
          };
        }
      }
      break;
  }

  return updates;
}

/**
 * Extract as much information as possible from initial user message
 * Works with both English and Spanish natural language
 * Refactored for better modularity and scalability
 */

// Helper: Fix common typos before processing
function fixCommonTypos(message: string): string {
  const typoMap: Record<string, string> = {
    // Date typos
    '\\boy\\b': 'hoy',
    '\\bhoy\\b': 'hoy',
    '\\boi\\b': 'hoy',
    '\\bmanana\\b': 'mañana',
    '\\bmannana\\b': 'mañana',
    '\\bmañna\\b': 'mañana',
    '\\btomorrow\\b': 'tomorrow',
    '\\btomorow\\b': 'tomorrow',
    '\\btommorow\\b': 'tomorrow',
    
    // Time typos
    '\\bmedio\\s*dia\\b': 'mediodía',
    '\\bmedio dia\\b': 'mediodía',
    '\\bmedio día\\b': 'mediodía',
    '\\bmedioia\\b': 'mediodía',
    '\\bmediodia\\b': 'mediodía',
    '\\bmeiodia\\b': 'mediodía',
    '\\btarde\\b': 'tarde',
    
    // Location typos
    '\\bcerca\\s+mio\\b': 'cerca de mi',
    '\\bcerca\\s+mia\\b': 'cerca de mi',
    '\\bmio\\b': 'mi',
    '\\bmia\\b': 'mi',
    '\\bcerca\\s+de\\s+mi\\b': 'cerca de mi',
    '\\bserca\\b': 'cerca',
    '\\bserca\\s+de\\b': 'cerca de',
    '\\bceca\\s+de\\b': 'cerca de',
    
    // Event typos
    '\\bcta\\b': 'cita',
    '\\bsita\\b': 'cita',
    '\\bfamila\\b': 'familia',
    '\\bfmilia\\b': 'familia',
    '\\bespose\\b': 'esposa',
    '\\bespozo\\b': 'esposo',
  };
  
  let corrected = message;
  for (const [typo, correct] of Object.entries(typoMap)) {
    const regex = new RegExp(typo, 'gi');
    const beforeCorrection = corrected;
    corrected = corrected.replace(regex, correct);
    if (corrected !== beforeCorrection) {
    }
  }
  
  return corrected;
}

// Helper: Extract event type with confidence scoring
function extractEventType(message: string): { type: string; confidence: number } | null {
  const lowerMessage = message.toLowerCase();
  
  // Priority patterns - check these first with higher specificity
  const priorityPatterns = [
    { type: "date", keywords: ["\\bcita\\b", "\\bdate\\b"], minMatches: 1 },
    { type: "graduation", keywords: ["\\bgraduation\\b", "\\bgraduaci[óo]n\\b", "\\bgraduate\\b", "\\bgraduado\\b"], minMatches: 1 },
    { type: "friends", keywords: ["\\bfriends\\b", "\\bamigos\\b"], minMatches: 1 },
    { type: "family", keywords: ["\\bfamily\\b", "\\bfamilia\\b"], minMatches: 1 },
  ];
  
  // Check priority patterns first
  for (const pattern of priorityPatterns) {
    let matches = 0;
    for (const keyword of pattern.keywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(lowerMessage)) {
        matches++;
      }
    }
    
    if (matches >= pattern.minMatches) {
      const confidence = 0.9; // High confidence for explicit keywords
      return { type: pattern.type, confidence };
    }
  }
  
  // Secondary patterns - check additional context words
  const patterns = [
    { type: "date", keywords: ["romántic", "romantic", "esposa", "esposo", "novia", "novio", "wife", "husband", "girlfriend", "boyfriend", "pareja", "partner"], minMatches: 1 },
    { type: "family", keywords: ["\\bfamilia\\b", "\\bfamily\\b", "niños", "kids", "children", "hijos", "con mis hijos", "con los niños"], minMatches: 1 },
    { type: "celebration", keywords: ["cumpleaños", "birthday", "aniversario", "anniversary", "celebr"], minMatches: 1 },
    { type: "business", keywords: ["negocios", "business", "colegas", "colleagues", "trabajo", "work", "reunión"], minMatches: 1 },
  ];
  
  for (const pattern of patterns) {
    let matches = 0;
    for (const keyword of pattern.keywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(lowerMessage)) {
        matches++;
      }
    }
    
    if (matches >= pattern.minMatches) {
      const confidence = matches / pattern.keywords.length;
      return { type: pattern.type, confidence };
    }
  }
  
  return null;
}

// Helper: Extract date with flexible patterns
function extractDate(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  const today = new Date();
  
  // Check for "hoy" or "today" with word boundaries
  if (/\b(hoy|today)\b/i.test(lowerMessage)) {
    const dateISO = today.toISOString().split('T')[0];
    return dateISO;
  }
  
  // Check for time-of-day phrases that imply today
  // tonight, this evening, this afternoon, this morning, etc.
  if (/\b(tonight|tonite|this\s+(evening|afternoon|morning|night))\b/i.test(lowerMessage)) {
    const dateISO = today.toISOString().split('T')[0];
    return dateISO;
  }
  
  // Spanish equivalents: esta noche, esta tarde, esta mañana
  if (/\b(esta\s+(noche|tarde|mañana))\b/i.test(lowerMessage)) {
    const dateISO = today.toISOString().split('T')[0];
    return dateISO;
  }
  
  // Check for "mañana" or "tomorrow" as complete words (not in "en la mañana")
  if (/\b(mañana|tomorrow)\b/i.test(lowerMessage) && !/\b(la|en)\s+(mañana)\b/i.test(lowerMessage)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateISO = tomorrow.toISOString().split('T')[0];
    return dateISO;
  }
  
  // Check for day of week patterns (this Saturday, next Monday, etc)
  const daysOfWeek = [
    { en: ["sunday", "sun"], es: ["domingo", "dom"], index: 0 },
    { en: ["monday", "mon"], es: ["lunes", "lun"], index: 1 },
    { en: ["tuesday", "tue", "tues"], es: ["martes", "mar"], index: 2 },
    { en: ["wednesday", "wed"], es: ["miércoles", "mie", "miercoles"], index: 3 },
    { en: ["thursday", "thu", "thur", "thurs"], es: ["jueves", "jue"], index: 4 },
    { en: ["friday", "fri"], es: ["viernes", "vie"], index: 5 },
    { en: ["saturday", "sat"], es: ["sábado", "sab", "sabado"], index: 6 }
  ];
  
  for (const day of daysOfWeek) {
    const allNames = [...day.en, ...day.es];
    for (const name of allNames) {
      const thisPattern = new RegExp(`\\b(this|este|esta)\\s+${name}\\b`, 'i');
      const nextPattern = new RegExp(`\\b(next|pr[óo]ximo|pr[óo]xima)\\s+${name}\\b`, 'i');
      
      if (thisPattern.test(lowerMessage) || nextPattern.test(lowerMessage)) {
        const isNext = nextPattern.test(lowerMessage);
        const currentDay = today.getDay();
        let daysToAdd = day.index - currentDay;
        
        // If today or past, go to next week
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        
        // If "next", add another week
        if (isNext) {
          daysToAdd += 7;
        }
        
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysToAdd);
        const dateISO = targetDate.toISOString().split('T')[0];
        return dateISO;
      }
    }
  }
  
  // Date format patterns (DD/MM/YYYY, MM/DD/YYYY)
  const dateMatch = message.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1;
    const day = parseInt(dateMatch[2]);
    const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
    const date = new Date(year, month, day);
    const dateISO = date.toISOString().split('T')[0];
    return dateISO;
  }
  
  return null;
}

// Helper: Validate time is not in the past for today
export function validateTimeForToday(dateISO: string, timeStr: string): boolean {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  
  // Only validate if the date is today
  if (dateISO !== todayISO) {
    return true; // Future dates are always valid
  }
  
  // Parse the time
  const [hours, minutes] = timeStr.split(':').map(Number);
  const eventTime = new Date();
  eventTime.setHours(hours, minutes, 0, 0);
  
  // Check if time is in the past
  const isPast = eventTime < today;
  if (isPast) {
  }
  
  return !isPast;
}

// Helper: Extract time with comprehensive patterns
function extractTime(message: string): { time: string | null, needsClarification?: boolean, tempHour?: string, tempMinutes?: string } {
  const lowerMessage = message.toLowerCase();
  
  // First check for "para comer" which suggests lunch time (12:00 PM)
  if (/\bpara\s+(comer|almorzar|lunch)\b/i.test(lowerMessage)) {
    return { time: "12:00" };
  }
  
  // Explicit time patterns (3:30pm, 15:30, 3pm)
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,  // 3:30pm, 3:30 pm
    /(\d{1,2})\s*(am|pm)/i,          // 3pm, 3 pm
    /(?:at|a(?:\s+las)?)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i, // a las 3pm
  ];
  
  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? match[2] : "00";
      const meridiem = match[3]?.toUpperCase();
      
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;
      
      const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
      return { time };
    }
  }
  
  // Check for ambiguous times (no AM/PM) - look for ranges like "11 o 12" or "por ahi de las 11"
  const ambiguousRangePattern = /(?:por\s+ah[ií]|alrededor|around)\s+(?:de\s+)?(?:las?\s+)?(\d{1,2})(?:\s+o\s+(\d{1,2}))?/i;
  const rangeMatch = message.match(ambiguousRangePattern);
  if (rangeMatch) {
    const hour1 = parseInt(rangeMatch[1]);
    const hour2 = rangeMatch[2] ? parseInt(rangeMatch[2]) : null;
    
    // Use the first hour, or midpoint if range given
    const targetHour = hour2 ? Math.floor((hour1 + hour2) / 2) : hour1;
    
    // Check if context provides AM/PM hint (evening, tarde, noche, afternoon, morning)
    const hasEveningContext = /\b(evening|tarde|noche|tonight|esta\s+noche)\b/i.test(lowerMessage);
    const hasAfternoonContext = /\b(afternoon|mediodía|mediodia)\b/i.test(lowerMessage);
    const hasMorningContext = /\b(morning|mañana)\b/i.test(lowerMessage);
    
    // If we have time-of-day context, use it instead of asking
    if (hasEveningContext) {
      // Evening: assume PM, add 12 if hour is 1-11
      let hours = targetHour;
      if (hours >= 1 && hours <= 11) hours += 12;
      return { time: `${hours.toString().padStart(2, '0')}:00` };
    } else if (hasAfternoonContext && targetHour >= 1 && targetHour <= 5) {
      // Afternoon: 1-5 should be PM
      let hours = targetHour + 12;
      return { time: `${hours.toString().padStart(2, '0')}:00` };
    } else if (hasMorningContext && targetHour >= 6 && targetHour <= 12) {
      // Morning: 6-12 should be AM (12 stays as 12)
      return { time: `${targetHour.toString().padStart(2, '0')}:00` };
    }
    
    // If hour is 1-12 without AM/PM and no context, we need clarification
    if (targetHour >= 1 && targetHour <= 12) {
      return { 
        time: "NEEDS_CLARIFICATION",
        needsClarification: true,
        tempHour: targetHour.toString(),
        tempMinutes: "00"
      };
    }
  }
  
  // Check for single ambiguous hour (1-12 without AM/PM)
  // Patterns: "a las 5", "at 5", "las 5", just "5"
  const ambiguousPatterns = [
    /\b(?:at|a)\s+(?:las?\s+)?(\d{1,2})(?::(\d{2}))?\b/i,  // "a las 5", "at 5", "a 5", "at 6:30"
    /\blas?\s+(\d{1,2})(?::(\d{2}))?\b/i,                  // "las 5", "la 5", "las 6:30"
  ];
  
  for (const pattern of ambiguousPatterns) {
    const ambiguousMatch = message.match(pattern);
    if (ambiguousMatch) {
      const hours = parseInt(ambiguousMatch[1]);
      const minutes = ambiguousMatch[2] || "00";
      
      // Check for time-of-day context in message
      const hasEveningContext = /\b(evening|tarde|noche|tonight|esta\s+noche)\b/i.test(lowerMessage);
      const hasAfternoonContext = /\b(afternoon|mediodía|mediodia)\b/i.test(lowerMessage);
      const hasMorningContext = /\b(morning|mañana)\b/i.test(lowerMessage);
      
      // If we have clear time-of-day context, don't ask for AM/PM
      if (hasEveningContext && hours >= 1 && hours <= 11) {
        // Evening: add 12 to hours 1-11 to make PM
        const pmHours = hours + 12;
        return { time: `${pmHours.toString().padStart(2, '0')}:${minutes}` };
      } else if (hasAfternoonContext && hours >= 1 && hours <= 5) {
        // Afternoon: 1-5 should be PM
        const pmHours = hours + 12;
        return { time: `${pmHours.toString().padStart(2, '0')}:${minutes}` };
      } else if (hasMorningContext && hours >= 6 && hours <= 12) {
        // Morning: 6-12 stays as AM (12 becomes 12:00, not 00:00)
        return { time: `${hours.toString().padStart(2, '0')}:${minutes}` };
      }
      
      // No context found and hour is ambiguous (1-12), need clarification
      if (hours >= 1 && hours <= 12) {
        return {
          time: "NEEDS_CLARIFICATION",
          needsClarification: true,
          tempHour: hours.toString(),
          tempMinutes: minutes
        };
      }
    }
  }
  
  // Time expressions mapped to hours
  const timeExpressions = [
    { patterns: [/\b(al\s+)?medio\s*d[ií]a\b/i, /\b(al\s+)?medio\s*dia\b/i, /\bnoon\b/i, /\bmediod[ií]a\b/i, /\bmediodia\b/i], time: "12:00" },
    { patterns: [/\ben\s+la\s+ma[ñn]ana\b/i, /\ben\s+la\s+manana\b/i, /\bmorning\b/i], time: "10:00" },
    { patterns: [/\b(en|por)\s+la\s+tarde\b/i, /\bafternoon\b/i], time: "14:00" },
    { patterns: [/\b(en|por)\s+la\s+noche\b/i, /\bevening\b/i], time: "18:00" },
    { patterns: [/\bnight\b/i], time: "20:00" },
  ];
  
  for (const expr of timeExpressions) {
    if (expr.patterns.some(pattern => pattern.test(lowerMessage))) {
      return { time: expr.time };
    }
  }
  
  return { time: null };
}

// Helper: Extract location with flexible patterns
function extractLocation(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  const trimmedMessage = message.trim();
  
  // "Near me" patterns - expanded with more variations
  const nearMePatterns = [
    /\bcerca\s+de\s+(mi|aqu[ií]|casa|mi\s+casa)\b/i,
    /\b(en\s+)?mis\s+alrededores\b/i,
    /\ben\s+el\s+área\b/i,
    /\ben\s+la\s+zona\b/i,
    /\bnear\s+(me|here|my\s+location)\b/i,
    /\b(in\s+)?my\s+(area|surroundings|vicinity)\b/i,
    /\bmi\s+ubicaci[oó]n\b/i,
    /\bcurrent\s+location\b/i,
    /\baround\s+here\b/i,
  ];
  
  if (nearMePatterns.some(pattern => pattern.test(lowerMessage))) {
    return "REQUEST_GEOLOCATION";
  }
  
  // 1. Check for ZIP code (5 digits or 5+4 format)
  const zipMatch = trimmedMessage.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipMatch) {
    return zipMatch[1];
  }
  
  // 2. Check for street address (contains number and street name)
  if (/\d+\s+[A-Za-z]+/.test(trimmedMessage)) {
    // Extract address portion (before any extra context)
    const addressMatch = trimmedMessage.match(/^([\d\s\w,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)?[,\s]*(?:[A-Z]{2})?\s*\d{5}?)/i);
    if (addressMatch) {
      return addressMatch[1].trim();
    }
  }
  
  // 3. Explicit city patterns with state (most reliable)
  const cityPatterns = [
    /\b(?:in|en)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/i, // City, ST format
    /\b(?:in|en)\s+(San\s+[A-Z][a-z]+|New\s+[A-Z][a-z]+|Los\s+Angeles|Las\s+Vegas|Fort\s+Worth|El\s+Paso)\b/i,
  ];
  
  for (const pattern of cityPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // 4. Look for common city names (without state) - accept any reasonable city name
  // This allows flexibility for users to just say "Dallas" or "New York"
  const cityKeywords = [
    /\b(?:in|en)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i,
  ];
  
  for (const pattern of cityKeywords) {
    const match = message.match(pattern);
    if (match && match[1].length >= 3) {
      const cityName = match[1];
      // Avoid matching common non-city words
      const excludeWords = ['the', 'and', 'but', 'with', 'for', 'about', 'today', 'tomorrow', 'weekend'];
      if (!excludeWords.includes(cityName.toLowerCase())) {
        return cityName;
      }
    }
  }
  
  return null;
}

// Main extraction function
export function extractInitialInfo(message: string): Partial<PlanContext> {
  const context: Partial<PlanContext> = {};
  
  
  // Fix common typos first
  const correctedMessage = fixCommonTypos(message);
  if (correctedMessage !== message) {
  }
  
  
  // Extract in specific order - most specific first
  
  // 1. Extract event type (most important, sets context for everything else)
  const eventType = extractEventType(correctedMessage);
  if (eventType) {
    context.event = { type: eventType.type };
    
    // Auto-configure based on event type
    if (eventType.type === "date") {
      context.participants = {
        size: 2,
        isCouple: true,
        kids: 0,
        pets: false,
      };
    } else if (eventType.type === "family") {
      context.participants = {
        kids: 1,
        pets: false,
      };
    }
  } else {
  }
  
  // 2. Extract date
  const dateISO = extractDate(correctedMessage);
  if (dateISO) {
    context.event = {
      ...context.event,
      dateISO,
    };
  } else {
  }
  
  // 3. Extract time
  const timeResult = extractTime(correctedMessage);
  if (timeResult.time) {
    context.event = {
      ...context.event,
      startTime: timeResult.time,
    };
    
    // Store temporary hour/minutes for AM/PM clarification if needed
    if (timeResult.needsClarification) {
      context.event._tempHour = timeResult.tempHour;
      context.event._tempMinutes = timeResult.tempMinutes;
    }
  } else {
  }
  
  // 4. Extract location
  const location = extractLocation(correctedMessage);
  if (location) {
    // If it's a geolocation request, mark it specially
    if (location === "REQUEST_GEOLOCATION") {
      context.location = {
        text: location,
        radiusKm: 10,
      };
    } else {
      // It's a city name
      context.location = {
        text: location,
        radiusKm: 15, // Wider radius for city-level search
      };
    }
  } else {
  }
  
  // 5. Extract budget from initial message
  const lowerMessage = correctedMessage.toLowerCase();
  let budgetTier: BudgetTier | undefined;
  
  if (lowerMessage.includes("$$$$")) {
    budgetTier = "$$$$";
  } else if (lowerMessage.includes("$$$")) {
    budgetTier = "$$$";
  } else if (lowerMessage.includes("$$")) {
    budgetTier = "$$";
  } else if (lowerMessage.includes("$") && !lowerMessage.includes("$$")) {
    budgetTier = "$";
  } else if (lowerMessage.includes("economical") || lowerMessage.includes("económico") || 
             lowerMessage.includes("cheap") || lowerMessage.includes("barato")) {
    budgetTier = "$";
  } else if (lowerMessage.includes("no muy caro") || lowerMessage.includes("not too expensive") ||
             lowerMessage.includes("moderate") || lowerMessage.includes("moderado") || 
             lowerMessage.includes("reasonable") || lowerMessage.includes("affordable")) {
    budgetTier = "$$";
  } else if (lowerMessage.includes("upscale") || lowerMessage.includes("expensive") || 
             lowerMessage.includes("fancy") || lowerMessage.includes("caro") ||
             lowerMessage.includes("nice") || lowerMessage.includes("good money") ||
             lowerMessage.includes("willing to spend")) {
    budgetTier = "$$$";
  } else if (lowerMessage.includes("luxury") || lowerMessage.includes("lujo") || 
             lowerMessage.includes("high-end") || lowerMessage.includes("premium")) {
    budgetTier = "$$$$";
  }
  
  if (budgetTier) {
    context.budget = { tier: budgetTier };
  } else {
  }
  
  // 6. Extract mood (do this last since it might catch general words)
  const moods: string[] = [];
  
  // Check for mood keywords
  if (lowerMessage.includes("romantic") || lowerMessage.includes("romántic")) {
    moods.push("romantic");
  }
  if (lowerMessage.includes("calm") || lowerMessage.includes("tranquil") || lowerMessage.includes("quiet") || 
      lowerMessage.includes("peaceful") || lowerMessage.includes("tranquilo")) {
    moods.push("quiet");
  }
  if (lowerMessage.includes("fun") || lowerMessage.includes("lively") || lowerMessage.includes("energetic") || 
      lowerMessage.includes("party") || lowerMessage.includes("divertido") || lowerMessage.includes("animado")) {
    moods.push("lively");
  }
  if (lowerMessage.includes("fancy") || lowerMessage.includes("elegant") || lowerMessage.includes("upscale") || 
      lowerMessage.includes("classy") || lowerMessage.includes("elegante") || lowerMessage.includes("fino")) {
    moods.push("upscale");
  }
  if (lowerMessage.includes("casual") || lowerMessage.includes("relaxed") || 
      lowerMessage.includes("laid-back") || lowerMessage.includes("informal")) {
    moods.push("casual");
  }
  
  if (moods.length > 0) {
    context.preferences = {
      ...context.preferences,
      mood: moods,
    };
  } else {
  }
  
  // 7. Extract cuisine preferences
  const cuisines: string[] = [];
  
  const cuisineKeywords: Record<string, string[]> = {
    'mexican': ['mexican', 'mexicana', 'mexicano', 'tacos', 'burrito'],
    'italian': ['italian', 'italiana', 'italiano', 'pasta', 'pizza'],
    'chinese': ['chinese', 'china', 'chino'],
    'japanese': ['japanese', 'japan', 'japonés', 'sushi', 'ramen'],
    'thai': ['thai', 'tailandés'],
    'indian': ['indian', 'indio', 'curry'],
    'american': ['american', 'americana', 'burger', 'bbq', 'steak'],
    'french': ['french', 'francés', 'francesa'],
    'mediterranean': ['mediterranean', 'mediterránea'],
    'seafood': ['seafood', 'mariscos', 'fish', 'pescado'],
    'vegetarian': ['vegetarian', 'vegetariano', 'vegan', 'vegano'],
  };
  
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      cuisines.push(cuisine);
    }
  }
  
  if (cuisines.length > 0) {
    context.preferences = {
      ...context.preferences,
      cuisine: cuisines,
    };
  } else {
  }
  
  // 8. Extract duration
  let durationHours: number | undefined;
  
  if (lowerMessage.includes("half an hour") || lowerMessage.includes("media hora")) {
    durationHours = 0.5;
  } else if (lowerMessage.includes("an hour") || lowerMessage.includes("una hora")) {
    durationHours = 1;
  } else if (lowerMessage.includes("all day") || lowerMessage.includes("todo el día")) {
    durationHours = 8;
  } else {
    // Try to match decimal hours: "1.5 hours", "2 hours"
    const hourMatch = correctedMessage.match(/(\d+\.?\d*)\s*(hour|hora)/i);
    if (hourMatch) {
      durationHours = parseFloat(hourMatch[1]);
    } else {
      // Try to match minutes: "45 min", "30 minutes"
      const minMatch = correctedMessage.match(/(\d+)\s*(min|minute|minuto)/i);
      if (minMatch) {
        durationHours = parseInt(minMatch[1]) / 60;
      }
    }
  }
  
  if (durationHours && context.event?.startTime && context.event.startTime !== "NEEDS_CLARIFICATION") {
    // Calculate end time
    const [hours, minutes] = context.event.startTime.split(':').map(Number);
    const totalMinutes = (hours * 60 + minutes) + (durationHours * 60);
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = Math.round(totalMinutes % 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    
    context.event = {
      ...context.event,
      endTime,
    };
  } else if (durationHours) {
  } else {
  }
  
  // 9. Extract group size if not already set
  if (!context.participants?.size) {
    let groupSize: number | undefined;
    
    // Check for explicit number patterns first
    const numberMatch = correctedMessage.match(/(\d+)\s*(people|person|personas?|gente)/i);
    if (numberMatch) {
      groupSize = parseInt(numberMatch[1]);
    } else {
      // Check for "my girlfriend/boyfriend/wife/husband" patterns (implies 2 people)
      if (/(my|mi)\s*(girlfriend|boyfriend|wife|husband|novia|novio|esposa|esposo|pareja|partner)/i.test(lowerMessage)) {
        groupSize = 2;
      }
    }
    
    if (groupSize) {
      context.participants = {
        ...context.participants,
        size: groupSize,
      };
    }
  }
  
  return context;
}
