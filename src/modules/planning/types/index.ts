/**
 * Planning Module Types
 * All interfaces and types related to planning functionality
 */

export type BudgetTier = "$" | "$$" | "$$$" | "$$$$" | "NA";
export type BlockType = "activity" | "familyActivity" | "restaurant" | "romanticDinner" | "lunch" | "dinner" | "dessert" | "coffee" | "after";

export interface NextStep {
  question: string;
  chips?: string[];
  fieldToComplete: keyof PlanContext | string;
  type?: "text" | "location" | "date" | "time" | "number";
}

export interface PlanContext {
  event?: {
    type?: string;
    freeDescription?: string;
    dateISO?: string;
    startTime?: string;
    endTime?: string;
    _tempHour?: string;
    _tempMinutes?: string;
  };
  location?: {
    text?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  };
  participants?: {
    size?: number;
    sizeRange?: string;
    isCouple?: boolean;
    adults?: number;
    kids?: number;
    pets?: boolean;
    hasKids?: boolean;
    hasPets?: boolean;
  };
  budget?: {
    tier?: BudgetTier;
    perPersonUSD?: number;
  };
  preferences?: {
    mood?: string[];
    activities?: string[];
    cuisine?: string[];
    dislikes?: string[];
    diets?: string[];
    indoorOutdoor?: "indoor" | "outdoor" | "mix";
  };
  selection?: {
    activityId?: string;
    restaurantId?: string;
    dessertId?: string;
  };
}

export interface Place {
  id: string;
  name: string;
  categories: string[];
  rating?: number;
  price?: string;
  distanceMeters?: number;
  address?: string;
  url?: string;
  phone?: string;
  photos?: string[];
  reviewCount?: number;
  why?: string;
}

export interface PlanBlock {
  id: string; // Unique identifier for this block
  type: BlockType;
  label: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  options: Place[];
  selected?: string; // ID of selected option
  skipped?: boolean; // Whether this block was skipped
  isLoading?: boolean; // Whether still searching for options
  hasError?: boolean; // Whether search failed or returned no results
}

export interface ConversationHistory {
  context: PlanContext;
  chips?: string[];
  timestamp: Date;
}
