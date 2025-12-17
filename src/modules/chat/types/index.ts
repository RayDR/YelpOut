/**
 * Chat Module Types
 * All interfaces and types related to chat functionality
 */

import { PlanContext } from "@/modules/planning/types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  translationKey?: string;
  timestamp: Date;
  // For dynamic messages that need to be re-translated
  isDynamic?: boolean;
  dynamicType?: 'welcome' | 'eventType' | 'location' | 'date' | 'time' | 'groupSize' | 'budget' | 'cuisine' | 'mood' | 'planGeneration';
  dynamicParams?: any; // Additional params needed for regeneration
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface ConversationStep {
  context: PlanContext;
  messages: Message[];
  chips?: string[];
  currentQuestion?: string | null;
}
