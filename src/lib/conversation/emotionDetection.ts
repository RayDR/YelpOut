/**
 * Emotion and Command Detection System
 * Detects user emotions, modification requests, restart commands, and complaints
 */

import { Language } from "@/lib/i18n/translations";

export type EmotionType = 'positive' | 'negative' | 'grateful' | 'apologetic' | 'neutral';
export type CommandType = 'restart' | 'modify_time' | 'modify_date' | 'modify_event' | 'modify_location' | 'modify_budget' | 'none';

interface EmotionResponse {
  detected: boolean;
  emotion: EmotionType;
  response: string;
}

interface CommandResponse {
  detected: boolean;
  command: CommandType;
  value?: string; // The new value extracted (e.g., "7pm", "tomorrow", "birthday")
}

interface ComplaintResponse {
  isComplaint: boolean;
  severity: 'low' | 'medium' | 'high';
  text: string;
}

// Emotion keywords
const emotionKeywords = {
  positive: {
    en: ['love', 'excellent', 'amazing', 'perfect', 'great', 'awesome', 'wonderful', 'fantastic', 'brilliant', 'outstanding'],
    es: ['encanta', 'excelente', 'increíble', 'perfecto', 'genial', 'maravilloso', 'fantástico', 'brillante', 'magnífico']
  },
  negative: {
    en: ['hate', 'dislike', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'poor', 'disappointing', 'not good', 'don\'t like'],
    es: ['odio', 'no me gusta', 'malo', 'terrible', 'horrible', 'pésimo', 'peor', 'decepcionante', 'no está bueno']
  },
  grateful: {
    en: ['thank', 'thanks', 'appreciate', 'grateful', 'thx', 'ty', 'tysm'],
    es: ['gracias', 'agradezco', 'agradecido', 'grax', 'grcs']
  },
  apologetic: {
    en: ['sorry', 'apologize', 'my bad', 'excuse me', 'pardon'],
    es: ['perdón', 'disculpa', 'lo siento', 'perdona', 'disculpe']
  }
};

// Restart command keywords
const restartKeywords = {
  en: [
    'start over', 'restart', 'begin again', 'start again', 'reset', 'new plan', 
    'from scratch', 'start fresh', 'clear everything', 'forget all'
  ],
  es: [
    'empezar de nuevo', 'reiniciar', 'comenzar de nuevo', 'volver a empezar', 
    'resetear', 'nuevo plan', 'desde cero', 'empezar desde el principio', 
    'borrar todo', 'olvidar todo'
  ]
};

// Modification command patterns
const modificationPatterns = {
  time: {
    en: [
      /change.*(time|hour).*(to|@|at)\s*(\S+)/i,
      /make.*(time|hour).*(to|@|at)\s*(\S+)/i,
      /set.*(time|hour).*(to|@|at)\s*(\S+)/i,
      /modify.*(time|hour).*(to|@|at)\s*(\S+)/i,
      /(time|hour).*(to|@|at)\s*(\S+)/i
    ],
    es: [
      /cambia?.*(hora|tiempo).*(a|para)\s*(\S+)/i,
      /modifica?.*(hora|tiempo).*(a|para)\s*(\S+)/i,
      /pon.*(hora|tiempo).*(a|en)\s*(\S+)/i,
      /(hora|tiempo).*(a|para)\s*(\S+)/i
    ]
  },
  date: {
    en: [
      /change.*(date|day).*(to|for)\s*(\S+)/i,
      /make.*(date|day).*(to|for)\s*(\S+)/i,
      /set.*(date|day).*(to|for)\s*(\S+)/i,
      /modify.*(date|day).*(to|for)\s*(\S+)/i
    ],
    es: [
      /cambia?.*(fecha|día).*(a|para|al)\s*(\S+)/i,
      /modifica?.*(fecha|día).*(a|para|al)\s*(\S+)/i,
      /pon.*(fecha|día).*(a|en|para)\s*(\S+)/i
    ]
  },
  event: {
    en: [
      /change.*(event|type|occasion).*(to)\s*(\S+)/i,
      /make.*it.*(a|an)\s*(\S+)/i,
      /change.*to.*(a|an)\s*(\S+)\s*(event|occasion)/i
    ],
    es: [
      /cambia?.*(evento|tipo|ocasión).*(a|para)\s*(\S+)/i,
      /hazlo.*(un|una)\s*(\S+)/i,
      /cambiar.*a.*(un|una)\s*(\S+)/i
    ]
  },
  location: {
    en: [
      /change.*(location|place|city).*(to)\s*(.+)/i,
      /move.*to\s*(.+)/i,
      /(location|place).*(to)\s*(.+)/i
    ],
    es: [
      /cambia?.*(ubicación|lugar|ciudad).*(a|para)\s*(.+)/i,
      /mueve.*a\s*(.+)/i,
      /(ubicación|lugar).*(a|para)\s*(.+)/i
    ]
  },
  budget: {
    en: [
      /change.*(budget|price).*(to)\s*(\S+)/i,
      /make.*it.*(cheaper|expensive|affordable)/i,
      /(budget|price).*(to)\s*(\S+)/i
    ],
    es: [
      /cambia?.*(presupuesto|precio).*(a)\s*(\S+)/i,
      /hazlo.*(más barato|más caro|económico)/i,
      /(presupuesto|precio).*(a)\s*(\S+)/i
    ]
  }
};

// Complaint keywords and patterns
const complaintKeywords = {
  high: {
    en: ['useless', 'garbage', 'trash', 'waste of time', 'doesn\'t work', 'broken', 'stupid'],
    es: ['inútil', 'basura', 'pérdida de tiempo', 'no funciona', 'roto', 'estúpido', 'porquería']
  },
  medium: {
    en: ['disappointed', 'frustrating', 'annoying', 'confusing', 'complicated', 'slow', 'buggy'],
    es: ['decepcionado', 'frustrante', 'molesto', 'confuso', 'complicado', 'lento', 'con errores']
  },
  low: {
    en: ['not great', 'could be better', 'not ideal', 'not what I expected', 'meh'],
    es: ['no está genial', 'podría ser mejor', 'no es ideal', 'no es lo que esperaba', 'regular']
  }
};

// Emotion responses
const emotionResponses = {
  positive: {
    en: "I'm so glad you're enjoying it! 🎉 Let me know if there's anything else I can help you with!",
    es: "¡Me alegra mucho que te esté gustando! 🎉 ¡Déjame saber si hay algo más en lo que pueda ayudarte!"
  },
  negative: {
    en: "I'm sorry to hear that. Your feedback helps me improve! 💙 Can you tell me more about what's not working for you?",
    es: "Lamento escuchar eso. ¡Tu feedback me ayuda a mejorar! 💙 ¿Puedes contarme más sobre qué no está funcionando para ti?"
  },
  grateful: {
    en: "You're very welcome! Happy to help! 😊",
    es: "¡De nada! ¡Feliz de ayudar! 😊"
  },
  apologetic: {
    en: "No worries at all! We all make mistakes. Let's continue! 🙂",
    es: "¡No te preocupes! Todos cometemos errores. ¡Sigamos! 🙂"
  }
};

/**
 * Detect emotion in user message
 */
export function detectEmotion(message: string, language: Language): EmotionResponse {
  const lowerMessage = message.toLowerCase();
  
  // Check each emotion type
  for (const [emotionType, keywords] of Object.entries(emotionKeywords)) {
    const typeKeywords = keywords[language] || [];
    const hasMatch = typeKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    
    if (hasMatch) {
      return {
        detected: true,
        emotion: emotionType as EmotionType,
        response: emotionResponses[emotionType as keyof typeof emotionResponses][language]
      };
    }
  }
  
  return {
    detected: false,
    emotion: 'neutral',
    response: ''
  };
}

/**
 * Detect restart command
 */
export function detectRestart(message: string, language: Language): boolean {
  const lowerMessage = message.toLowerCase();
  const keywords = restartKeywords[language] || [];
  
  return keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

/**
 * Detect modification command
 */
export function detectModification(message: string, language: Language): CommandResponse {
  const lowerMessage = message.toLowerCase();
  
  // Check each modification type
  for (const [modType, patterns] of Object.entries(modificationPatterns)) {
    const typePatterns = patterns[language] || [];
    
    for (const pattern of typePatterns) {
      const match = lowerMessage.match(pattern);
      if (match) {
        // Extract the value (last capture group)
        const value = match[match.length - 1]?.trim();
        return {
          detected: true,
          command: `modify_${modType}` as CommandType,
          value
        };
      }
    }
  }
  
  return {
    detected: false,
    command: 'none'
  };
}

/**
 * Detect complaint in user message
 */
export function detectComplaint(message: string, language: Language): ComplaintResponse {
  const lowerMessage = message.toLowerCase();
  
  // Check high severity first
  for (const [severity, keywords] of Object.entries(complaintKeywords)) {
    const typeKeywords = keywords[language] || [];
    const hasMatch = typeKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
    
    if (hasMatch) {
      return {
        isComplaint: true,
        severity: severity as 'low' | 'medium' | 'high',
        text: message
      };
    }
  }
  
  // Check if message contains negative emotion without specific complaint keyword
  const negativeEmotion = detectEmotion(message, language);
  if (negativeEmotion.detected && negativeEmotion.emotion === 'negative') {
    return {
      isComplaint: true,
      severity: 'low',
      text: message
    };
  }
  
  return {
    isComplaint: false,
    severity: 'low',
    text: ''
  };
}

/**
 * Get complaint apology response
 */
export function getComplaintResponse(language: Language): string {
  const responses = {
    en: `I'm truly sorry you had a negative experience. 😔

Your feedback is incredibly valuable! I'm still learning and improving every day. I've logged your feedback to help make the experience better for everyone.

Is there anything specific I can help you with right now to improve your experience? 💙`,
    es: `Lamento mucho que hayas tenido una experiencia negativa. 😔

¡Tu feedback es increíblemente valioso! Todavía estoy aprendiendo y mejorando cada día. He registrado tus comentarios para ayudar a mejorar la experiencia para todos.

¿Hay algo específico en lo que pueda ayudarte ahora mismo para mejorar tu experiencia? 💙`
  };
  
  return responses[language];
}

/**
 * Get restart confirmation response
 */
export function getRestartResponse(language: Language): string {
  const responses = {
    en: "Sure! Let's start fresh. What would you like to plan? 🎉",
    es: "¡Claro! Empecemos de nuevo. ¿Qué te gustaría planear? 🎉"
  };
  
  return responses[language];
}

/**
 * Get modification confirmation response
 */
export function getModificationResponse(command: CommandType, value: string | undefined, language: Language): string {
  const templates: Record<string, { en: string; es: string }> = {
    modify_time: {
      en: `Got it! Changing the time to ${value}. Let me update your plan...`,
      es: `¡Entendido! Cambiando la hora a ${value}. Déjame actualizar tu plan...`
    },
    modify_date: {
      en: `Perfect! Updating the date to ${value}. One moment...`,
      es: `¡Perfecto! Actualizando la fecha a ${value}. Un momento...`
    },
    modify_event: {
      en: `Sure! Changing the event type to ${value}. Updating recommendations...`,
      es: `¡Claro! Cambiando el tipo de evento a ${value}. Actualizando recomendaciones...`
    },
    modify_location: {
      en: `Alright! Moving to ${value}. Searching for places there...`,
      es: `¡Muy bien! Cambiando a ${value}. Buscando lugares allí...`
    },
    modify_budget: {
      en: `Understood! Adjusting budget to ${value}. Updating options...`,
      es: `¡Entendido! Ajustando presupuesto a ${value}. Actualizando opciones...`
    }
  };
  
  return templates[command]?.[language] || '';
}
