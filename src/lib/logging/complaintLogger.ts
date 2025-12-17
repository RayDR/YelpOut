/**
 * Complaint Logging System
 * Logs user complaints and feedback for system improvement
 */

import { Message } from "@/modules/chat/types";
import { PlanContext } from "@/modules/planning/types";

export interface ComplaintLog {
  timestamp: Date;
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  complaintText: string;
  fullConversation: Message[];
  context: Partial<PlanContext>;
  userLanguage: string;
  userAgent: string;
}

/**
 * Log a complaint to the system
 */
export async function logComplaint(
  severity: 'low' | 'medium' | 'high',
  complaintText: string,
  conversation: Message[],
  context: Partial<PlanContext>,
  language: string
): Promise<void> {
  const complaintLog: ComplaintLog = {
    timestamp: new Date(),
    sessionId: generateSessionId(),
    severity,
    complaintText,
    fullConversation: conversation,
    context,
    userLanguage: language,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  try {
    // Send to logging endpoint
    await fetch('/api/log/complaint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintLog),
    });

  } catch (error) {
    console.error('[ComplaintLog] Failed to log complaint:', error);
  }
}

/**
 * Log an error for email notification
 */
export async function logError(
  errorType: 'api_error' | 'system_loop' | 'unhandled_exception',
  errorMessage: string,
  errorStack?: string,
  additionalInfo?: any
): Promise<void> {
  const errorLog = {
    timestamp: new Date(),
    errorType,
    errorMessage,
    errorStack,
    additionalInfo,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  try {
    // Send to error logging endpoint (will trigger email)
    await fetch('/api/log/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog),
    });

    console.error('[ErrorLog] Logged error:', errorType);
  } catch (error) {
    console.error('[ErrorLog] Failed to log error:', error);
  }
}

/**
 * Detect if system is in a loop
 */
export function detectLoop(messages: Message[]): boolean {
  if (messages.length < 6) return false;

  // Check last 6 messages for repetitive patterns
  const lastSixMessages = messages.slice(-6);
  
  // Count assistant messages asking the same question
  const questionCounts: { [key: string]: number } = {};
  
  lastSixMessages
    .filter(m => m.role === 'assistant')
    .forEach(m => {
      const key = m.translationKey || m.content.substring(0, 50);
      questionCounts[key] = (questionCounts[key] || 0) + 1;
    });

  // If same question asked 3+ times, it's a loop
  const maxCount = Math.max(...Object.values(questionCounts));
  if (maxCount >= 3) {
    logError('system_loop', 'System detected in conversation loop', undefined, {
      lastSixMessages: lastSixMessages.map(m => ({
        role: m.role,
        content: m.content.substring(0, 100),
        translationKey: m.translationKey
      }))
    });
    return true;
  }

  return false;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
