"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiArrowLeft } from "react-icons/fi";

// Modular imports
import { useAppStore, useToast } from "@/shared";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Header } from "@/shared";
import { 
  MessageList, 
  Composer, 
  Chips, 
  StarterCards,
  Message,
  ConversationStep,
  DatePicker
} from "@/modules/chat";
import ParticipantCheckboxes from "@/modules/chat/components/ParticipantCheckboxes";
import HelpFAQ from "@/modules/chat/components/HelpFAQ";
import { 
  ContextPillsEditable, 
  ItineraryView,
  PlanContext,
  PlanBlock,
  PlanningService,
  Place
} from "@/modules/planning";
import { deriveBlocks } from "@/lib/planner/deriveBlocks";
import { getNextQuestion, hasAllRequiredInfo, parseUserResponse, getQuestionChips, QuestionKey, extractInitialInfo, validateTimeForToday, CONVERSATION_FLOW, detectChangeRequest, isLocationValid, getLocationClarification } from "@/lib/conversation/flow";
import { getCityFromCoordinates, getNearbyCities } from "@/lib/geo/reverseGeocode";
import { 
  getWelcomeMessage, 
  getEventTypeResponse, 
  getLocationResponse, 
  getDateResponse, 
  getTimeResponse, 
  getGroupSizeResponse, 
  getBudgetResponse, 
  getCuisineResponse, 
  getMoodResponse,
  getPlanGenerationResponse,
  getTimeOfDay
} from "@/lib/messages/dynamicResponses";

// Session storage keys
const STORAGE_KEYS = {
  CONTEXT: 'yelpout-context',
  MESSAGES: 'yelpout-messages',
  HISTORY: 'yelpout-history',
  SHOW_STARTERS: 'yelpout-show-starters',
  ITINERARY_SENT: 'yelpout-itinerary-sent',
};

export default function Home() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { showToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [context, setContext] = useState<PlanContext>({});
  const [planBlocks, setPlanBlocks] = useState<PlanBlock[]>([]);
  const [showPlan, setShowPlan] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [viewingAlternatives, setViewingAlternatives] = useState<Record<string, boolean>>({});
  const [conversationHistory, setConversationHistory] = useState<ConversationStep[]>([]);
  const [currentChips, setCurrentChips] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionKey | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showParticipantCheckboxes, setShowParticipantCheckboxes] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(true);
  const [helpUsedOnce, setHelpUsedOnce] = useState(false);
  const [lastSwap, setLastSwap] = useState<{
    blockId: string;
    index: number;
    previousOption: Place;
  } | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [showStarters, setShowStarters] = useState(true);

  // Set mounted state, load from sessionStorage, and generate welcome if needed
  useEffect(() => {
    setMounted(true);
    
    // Check if itinerary was sent - if so, clear everything and start fresh
    const itinerarySent = sessionStorage.getItem(STORAGE_KEYS.ITINERARY_SENT);
    if (itinerarySent === 'true') {
      // Clear all session storage
      Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
      
      // Generate welcome message for fresh start
      const welcomeText = getWelcomeMessage(language);
      setMessages([{
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
        isDynamic: true,
        dynamicType: 'welcome',
      }]);
      return;
    }
    
    // First try to load from sessionStorage
    const savedContext = sessionStorage.getItem(STORAGE_KEYS.CONTEXT);
    const savedMessages = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
    const savedHistory = sessionStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedShowStarters = sessionStorage.getItem(STORAGE_KEYS.SHOW_STARTERS);

    if (savedContext) {
      setContext(JSON.parse(savedContext));
    }
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setMessages(parsed.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })));
    } else {
      // Only generate welcome message if no saved messages
      const welcomeText = getWelcomeMessage(language);
      setMessages([{
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
        isDynamic: true,
        dynamicType: 'welcome',
      }]);
    }
    if (savedHistory) {
      setConversationHistory(JSON.parse(savedHistory));
    }
    if (savedShowStarters !== null) {
      setShowStarters(JSON.parse(savedShowStarters));
    }
  }, []);

  // Hide help button after 2 assistant questions or after using it once
  useEffect(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    // Count messages that are actual questions (not welcome, not dynamic responses)
    const questionMessages = assistantMessages.filter(m => 
      !m.id.startsWith('welcome') && 
      (m.translationKey || m.content.includes('?'))
    );
    
    if (questionMessages.length >= 2 || helpUsedOnce) {
      setShowHelpButton(false);
    }
  }, [messages, helpUsedOnce]);
  
  // Request geolocation after first assistant question (after welcome)
  useEffect(() => {
    if (!mounted) return;
    
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    // Request location after first real question (not just welcome)
    const hasFirstQuestion = assistantMessages.some(m => 
      !m.id.startsWith('welcome') && 
      (m.translationKey || m.content.includes('?'))
    );
    
    // Only request once, and only if we haven't already fetched it
    if (hasFirstQuestion && !userCity && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const city = getCityFromCoordinates(latitude, longitude);
          setUserCity(city);
          setUserCoords({ lat: latitude, lng: longitude });
        },
        (error) => {
          // Silent fail - user declined or not available
        },
        { timeout: 5000, maximumAge: 300000 } // 5 min cache
      );
    }
  }, [mounted, messages, userCity]);
  
  // Re-translate dynamic messages when language changes
  useEffect(() => {
    if (!mounted || messages.length === 0) return;
    
    setMessages(prevMessages => 
      prevMessages.map(msg => {
        if (!msg.isDynamic || !msg.dynamicType) return msg;
        
        // Regenerate dynamic message in new language
        let newContent = msg.content;
        
        switch (msg.dynamicType) {
          case 'welcome':
            newContent = getWelcomeMessage(language);
            break;
          case 'eventType':
            if (msg.dynamicParams?.eventType) {
              newContent = getEventTypeResponse(msg.dynamicParams.eventType, language);
            }
            break;
          case 'location':
            newContent = getLocationResponse(language);
            break;
          case 'date':
            if (msg.dynamicParams?.dateType) {
              newContent = getDateResponse(msg.dynamicParams.dateType, language);
            }
            break;
          case 'time':
            if (msg.dynamicParams?.timeSlot) {
              newContent = getTimeResponse(msg.dynamicParams.timeSlot, language);
            }
            break;
          case 'groupSize':
            if (msg.dynamicParams?.size) {
              // Get event type from context for proper 2-person messaging
              const eventType = context.event?.type;
              newContent = getGroupSizeResponse(msg.dynamicParams.size, language, eventType);
            }
            break;
          case 'budget':
            if (msg.dynamicParams?.type) {
              newContent = getBudgetResponse(msg.dynamicParams.type, language);
            }
            break;
          case 'cuisine':
            newContent = getCuisineResponse(language);
            break;
          case 'mood':
            newContent = getMoodResponse(language);
            break;
          case 'planGeneration':
            newContent = getPlanGenerationResponse(language);
            break;
        }
        
        return { ...msg, content: newContent };
      })
    );
  }, [language]);

  // Note: Geolocation removed - only request on user interaction to avoid violation

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    if (!mounted || messages.length <= 1) return;
    
    sessionStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify(context));
    sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    sessionStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(conversationHistory));
    sessionStorage.setItem(STORAGE_KEYS.SHOW_STARTERS, JSON.stringify(showStarters));
  }, [mounted, context, messages, conversationHistory, showStarters]);

  // Translate chip keys to text dynamically based on current language
  const translateChip = (key: string): string => {
    // Don't translate if it contains special characters, commas, or $ symbols
    // These are likely literal values (city names, prices, times like "10:00 AM", etc)
    if (key.includes(',') || key.includes('$') || key.match(/\d+:\d+/)) {
      return key;
    }
    
    // Translate if it starts with known translation prefixes
    if (key.startsWith('chips.') || key.startsWith('mood.') || 
        key.startsWith('cuisine.') || key.startsWith('context.')) {
      const translated = t(key);
      // Return translated text if it's different from the key, otherwise return key
      return translated !== key ? translated : key;
    }
    
    // Return as-is for other cases
    return key;
  };

  const handleContextUpdate = (updates: Partial<PlanContext>) => {
    const newContext = { ...context, ...updates };
    
    // Merge nested objects properly
    if (updates.event) {
      newContext.event = { ...context.event, ...updates.event };
    }
    if (updates.location) {
      newContext.location = { ...context.location, ...updates.location };
    }
    if (updates.participants) {
      newContext.participants = { ...context.participants, ...updates.participants };
    }
    if (updates.budget) {
      newContext.budget = { ...context.budget, ...updates.budget };
    }
    if (updates.preferences) {
      newContext.preferences = { ...context.preferences, ...updates.preferences };
    }

    setContext(newContext);
  };

  const saveConversationStep = (chips?: string[]) => {
    const step: ConversationStep = {
      context: { ...context },
      messages: [...messages],
      chips: chips || currentChips,
      currentQuestion: currentQuestion,
    };
    setConversationHistory([...conversationHistory, step]);
  };

  const handleGoBack = () => {
    if (conversationHistory.length > 0) {
      const previousStep = conversationHistory[conversationHistory.length - 1];
      setContext(previousStep.context);
      setMessages(previousStep.messages);
      if (previousStep.chips) {
        setCurrentChips(previousStep.chips);
      }
      // Restore current question
      if (previousStep.currentQuestion !== undefined) {
        setCurrentQuestion(previousStep.currentQuestion as any);
      }
      setConversationHistory(conversationHistory.slice(0, -1));
      
      // If going back to initial state (only welcome message), show starters
      if (previousStep.messages.length <= 1) {
        setShowStarters(true);
        setCurrentQuestion(null);
      }
    }
  };

  const handleStarterSelect = (eventType: string) => {
    saveConversationStep();
    setShowStarters(false);
    
    // Extract all possible info from the message
    const initialContext = extractInitialInfo(eventType);
    
    handleContextUpdate(initialContext);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: eventType,
      timestamp: new Date(),
    };
    
    // Get first question (location or next appropriate question)
    const nextQuestion = getNextQuestion(initialContext);
    
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion.key);
      setCurrentChips(getQuestionChips(nextQuestion, initialContext));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: nextQuestion.key,
        translationKey: nextQuestion.translationKey,
        timestamp: new Date(),
      };
      
      setMessages([...messages, userMessage, assistantMessage]);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // Detect "go back" command in multiple languages
    const goBackKeywords = [
      /\b(go back|back|volver|atr[aá]s|regresa|regresar)\b/i,
    ];
    
    const isGoBackRequest = goBackKeywords.some(pattern => pattern.test(message.trim()));
    
    if (isGoBackRequest && conversationHistory.length > 0) {
      // Execute go back
      handleGoBack();
      return; // Don't process as regular message
    }
    
    // Detect help keywords in multiple languages and variations
    const helpKeywords = [
      // English
      /\b(help|how does this work|how do i use|how to use|what do i do|instructions|guide|tutorial|how it works)\b/i,
      // Spanish
      /\b(ayuda|como funciona|c[oó]mo funciona|como usar|c[oó]mo usar|qu[eé] hago|instrucciones|gu[ií]a|tutorial|ayudame|ay[uú]dame)\b/i,
    ];
    
    const isHelpRequest = helpKeywords.some(pattern => pattern.test(message));
    
    if (isHelpRequest) {
      // Open help modal
      setShowHelp(true);
      setHelpUsedOnce(true);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage]);
      
      // Add helpful response
      const helpResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: language === 'en' 
          ? "I've opened the help guide for you! You'll find answers to common questions about how to use YelpOut." 
          : "¡He abierto la guía de ayuda para ti! Encontrarás respuestas a preguntas comunes sobre cómo usar YelpOut.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, helpResponse]);
      
      return; // Don't process as regular message
    }
    
    saveConversationStep();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setIsLoadingResponse(true);
    
    // Hide starter cards and clear chips after message
    if (showStarters) {
      setShowStarters(false);
    }
    setCurrentChips([]);
    
    // Parse user response and update context
    setTimeout(() => {
      let updatedContext = { ...context };
      
      // Check if this is the first user message (only welcome message exists)
      const isFirstMessage = messages.length === 1 && messages[0].id.startsWith("welcome");
      
      // FIRST: Check if user is trying to change an existing value
      if (!isFirstMessage && context.event) {
        const changeRequest = detectChangeRequest(message, context);
        if (changeRequest.field && Object.keys(changeRequest.updates).length > 0) {
          
          // Apply the changes
          const changedContext = { ...context, ...changeRequest.updates };
          setContext(changedContext);
          handleContextUpdate(changeRequest.updates);
          
          // Show confirmation message
          const fieldNames: Record<QuestionKey, { en: string; es: string }> = {
            startTime: { en: 'time', es: 'hora' },
            date: { en: 'date', es: 'fecha' },
            location: { en: 'location', es: 'ubicación' },
            clarifyLocation: { en: 'location', es: 'ubicación' },
            budget: { en: 'budget', es: 'presupuesto' },
            duration: { en: 'duration', es: 'duración' },
            eventType: { en: 'event type', es: 'tipo de evento' },
            groupSize: { en: 'group size', es: 'tamaño del grupo' },
            groupType: { en: 'group type', es: 'tipo de grupo' },
            hasPets: { en: 'pets', es: 'mascotas' },
            cuisine: { en: 'cuisine', es: 'cocina' },
            mood: { en: 'mood', es: 'ambiente' },
            clarifyAmPm: { en: 'time', es: 'hora' },
            refine: { en: 'preferences', es: 'preferencias' },
          };
          
          const fieldName = fieldNames[changeRequest.field]?.[language] || changeRequest.field;
          const confirmMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: language === 'en' 
              ? `Got it! I've updated the ${fieldName}.`
              : `¡Entendido! He actualizado la ${fieldName}.`,
            timestamp: new Date(),
          };
          
          setMessages((prev: Message[]) => [...prev, confirmMessage]);
          
          // Continue with current question or next question
          const nextQuestion = getNextQuestion(changedContext);
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion.key);
            const chips = getQuestionChips(nextQuestion, changedContext);
            setCurrentChips(chips);
            
            const assistantMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: nextQuestion.key,
              translationKey: nextQuestion.translationKey,
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, assistantMessage]);
          } else {
            // No more questions, check if we should regenerate the plan
            if (planBlocks.length > 0) {
              // User changed something after plan was generated, ask if they want to regenerate
              const regenerateMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: language === 'en'
                  ? "Would you like me to regenerate your plan with this change?"
                  : "¿Quieres que regenere tu plan con este cambio?",
                timestamp: new Date(),
              };
              setMessages((prev: Message[]) => [...prev, regenerateMessage]);
              setCurrentChips(language === 'en' 
                ? ["Yes, regenerate", "No, keep current plan"]
                : ["Sí, regenerar", "No, mantener plan actual"]
              );
            } else {
              handlePlanReady();
            }
          }
          
          setIsLoadingResponse(false);
          return;
        }
      }
      
      if (currentQuestion && !isFirstMessage) {
        const updates = parseUserResponse(message, currentQuestion, context);
        
        // Check if user changed event type mid-conversation
        if (currentQuestion !== "eventType" && updates.event?.type && updates.event.type !== context.event?.type) {
          
          // Apply the event type change but preserve groupSize if already set
          const updatedContextWithType = { 
            ...context, 
            event: {
              ...context.event,
              ...updates.event,
            },
            participants: {
              ...updates.participants,
              // Preserve groupSize if already collected
              size: context.participants?.size || updates.participants?.size,
            }
          };
          
          setContext(updatedContextWithType);
          handleContextUpdate({
            event: updatedContextWithType.event,
            participants: updatedContextWithType.participants,
          });
          
          // Add a confirmation message about the event type change
          const confirmMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Entiendo, cambio de plan a ${updates.event.type}`,
            timestamp: new Date(),
          };
          
          setMessages((prev: Message[]) => [...prev, confirmMessage]);
          
          // Get next question based on updated context
          const nextQuestion = getNextQuestion(updatedContextWithType);
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion.key);
            const chips = getQuestionChips(nextQuestion, updatedContextWithType);
            setCurrentChips(chips);
            
            const assistantMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: "assistant",
              content: nextQuestion.key,
              translationKey: nextQuestion.translationKey,
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, assistantMessage]);
          } else {
            // No more questions, generate plan
            handlePlanReady();
          }
          
          setIsLoadingResponse(false);
          return;
        }
        
        // Handle geolocation request from location question
        if (currentQuestion === "location" && updates.location?.text === "REQUEST_GEOLOCATION") {
          // If we already have user's city from pre-fetch, use it directly
          if (userCity && userCoords) {
            const geoLocation = {
              text: userCity,
              lat: userCoords.lat,
              lng: userCoords.lng,
              radiusKm: 10,
            };
            
            const geoUpdates = { ...updates, location: geoLocation };
            const geoUpdatedContext = { ...context, ...geoUpdates };
            setContext(geoUpdatedContext);
            handleContextUpdate(geoUpdates);
            
            const locationMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: language === 'en' 
                ? `Using your location: ${userCity}`
                : `Usando tu ubicación: ${userCity}`,
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, locationMessage]);
            
            // Continue with next question
            const nextQuestion = getNextQuestion(geoUpdatedContext);
            if (nextQuestion) {
              setCurrentQuestion(nextQuestion.key);
              let chips = getQuestionChips(nextQuestion, geoUpdatedContext);
              
              // Override location chips if needed
              if (nextQuestion.key === "location" && userCity) {
                const nearbyCities = getNearbyCities(userCity);
                chips = ["chips.useLocation", ...nearbyCities];
              }
              
              setCurrentChips(chips);
              
              const assistantMessage: Message = {
                id: (Date.now() + 2).toString(),
                role: "assistant",
                content: nextQuestion.key,
                translationKey: nextQuestion.translationKey,
                timestamp: new Date(),
              };
              
              setMessages((prev: Message[]) => [...prev, assistantMessage]);
            }
            
            setIsLoadingResponse(false);
            return;
          }
          
          // Otherwise, request permissions now
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const cityName = getCityFromCoordinates(latitude, longitude);
                
                const geoLocation = {
                  text: cityName,
                  lat: latitude,
                  lng: longitude,
                  radiusKm: 10,
                };
                
                // Save for future use
                setUserCity(cityName);
                setUserCoords({ lat: latitude, lng: longitude });
                
                const geoUpdates = { ...updates, location: geoLocation };
                const geoUpdatedContext = { ...context, ...geoUpdates };
                setContext(geoUpdatedContext);
                handleContextUpdate(geoUpdates);
                
                const locationMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: language === 'en'
                    ? `Using your location: ${cityName}`
                    : `Usando tu ubicación: ${cityName}`,
                  timestamp: new Date(),
                };
                
                setMessages((prev: Message[]) => [...prev, locationMessage]);
                
                // Continue with next question
                const nextQuestion = getNextQuestion(geoUpdatedContext);
                if (nextQuestion) {
                  setCurrentQuestion(nextQuestion.key);
                  let chips = getQuestionChips(nextQuestion, geoUpdatedContext);
                  
                  // Override location chips if needed  
                  if (nextQuestion.key === "location" && cityName) {
                    const nearbyCities = getNearbyCities(cityName);
                    chips = ["chips.useLocation", ...nearbyCities];
                  }
                  
                  setCurrentChips(chips);
                  
                  const assistantMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: nextQuestion.key,
                    translationKey: nextQuestion.translationKey,
                    timestamp: new Date(),
                  };
                  
                  setMessages((prev: Message[]) => [...prev, assistantMessage]);
                }
                
                setIsLoadingResponse(false);
              },
              (error) => {
                console.error('Geolocation error:', error);
                const fallbackLocation = { text: "Dallas, TX", radiusKm: 25 };
                const fallbackUpdates = { ...updates, location: fallbackLocation };
                const fallbackContext = { ...context, ...fallbackUpdates };
                setContext(fallbackContext);
                handleContextUpdate(fallbackUpdates);
                
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: "No pude acceder a tu ubicación. Usando Dallas, TX como predeterminado.",
                  timestamp: new Date(),
                };
                
                setMessages((prev: Message[]) => [...prev, errorMessage]);
                
                // Continue with next question
                const nextQuestion = getNextQuestion(fallbackContext);
                if (nextQuestion) {
                  setCurrentQuestion(nextQuestion.key);
                  let chips = getQuestionChips(nextQuestion, fallbackContext);
                  
                  // Use Dallas nearby cities for fallback
                  if (nextQuestion.key === "location") {
                    chips = ["chips.useLocation", "Dallas, TX", "Plano, TX", "Frisco, TX"];
                  }
                  
                  setCurrentChips(chips);
                  
                  const assistantMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    role: "assistant",
                    content: nextQuestion.key,
                    translationKey: nextQuestion.translationKey,
                    timestamp: new Date(),
                  };
                  
                  setMessages((prev: Message[]) => [...prev, assistantMessage]);
                }
                
                setIsLoadingResponse(false);
              }
            );
            return;
          } else {
            // Browser doesn't support geolocation
            const fallbackLocation = { text: "Dallas, TX", radiusKm: 25 };
            updates.location = fallbackLocation;
          }
        }
        
        updatedContext = { ...context, ...updates };
        handleContextUpdate(updates);
        
        // Check if location needs clarification (missing state/ZIP)
        if (currentQuestion === "location" && updates.location?.text && updates.location.text !== "REQUEST_GEOLOCATION") {
          if (!isLocationValid(updates.location.text)) {
            // Location needs clarification - ask for state or ZIP
            setCurrentQuestion("clarifyLocation");
            
            // Smart state suggestions based on detected city
            const cityLower = updates.location.text.toLowerCase();
            let stateChips = ["TX", "CA", "NY", "FL", "IL"]; // Default
            
            // Major cities mapping
            const cityToState: Record<string, string[]> = {
              'chicago': ["IL", "TX", "CA", "NY", "FL"],
              'dallas': ["TX", "CA", "NY", "FL", "IL"],
              'houston': ["TX", "CA", "NY", "FL", "IL"],
              'austin': ["TX", "CA", "NY", "FL", "IL"],
              'san antonio': ["TX", "CA", "NY", "FL", "IL"],
              'los angeles': ["CA", "TX", "NY", "FL", "IL"],
              'san francisco': ["CA", "TX", "NY", "FL", "IL"],
              'san diego': ["CA", "TX", "NY", "FL", "IL"],
              'new york': ["NY", "CA", "TX", "FL", "IL"],
              'miami': ["FL", "CA", "TX", "NY", "IL"],
              'orlando': ["FL", "CA", "TX", "NY", "IL"],
              'seattle': ["WA", "CA", "TX", "NY", "FL"],
              'portland': ["OR", "ME", "CA", "TX", "NY"],
              'denver': ["CO", "CA", "TX", "NY", "FL"],
              'phoenix': ["AZ", "CA", "TX", "NY", "FL"],
              'atlanta': ["GA", "CA", "TX", "NY", "FL"],
              'boston': ["MA", "CA", "TX", "NY", "FL"],
            };
            
            // Check if city matches a known city
            for (const [city, states] of Object.entries(cityToState)) {
              if (cityLower.includes(city)) {
                stateChips = states;
                break;
              }
            }
            
            setCurrentChips(stateChips);
            
            // Store the incomplete city name temporarily
            const tempLocation = {
              ...updates.location,
              _tempCity: updates.location.text,
            };
            setContext({ ...context, location: tempLocation });
            
            const clarificationMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: getLocationClarification(updates.location.text, language),
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, clarificationMessage]);
            setIsLoadingResponse(false);
            return;
          }
        }
        
        // Add emotional response based on what was just updated
        let emotionalResponse: string | null = null;
        let emotionalResponseType: Message['dynamicType'] | undefined;
        let emotionalResponseParams: any = {};
        
        if (currentQuestion === "eventType" && updates.event?.type) {
          emotionalResponse = getEventTypeResponse(updates.event.type, language);
          emotionalResponseType = 'eventType';
          emotionalResponseParams = { eventType: updates.event.type };
        } else if (currentQuestion === "location" && updates.location?.text) {
          emotionalResponse = getLocationResponse(language);
          emotionalResponseType = 'location';
        } else if (currentQuestion === "date" && updates.event?.dateISO) {
          // Add T00:00:00 to ensure proper local date parsing
          const date = new Date(updates.event.dateISO + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to midnight for accurate comparison
          
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const dateOnly = new Date(date);
          dateOnly.setHours(0, 0, 0, 0);
          
          const dayOfWeek = date.getDay();
          
          let dateType: 'today' | 'tomorrow' | 'future' | 'weekend';
          if (dateOnly.getTime() === today.getTime()) {
            dateType = 'today';
          } else if (dateOnly.getTime() === tomorrow.getTime()) {
            dateType = 'tomorrow';
          } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            dateType = 'weekend';
          } else {
            dateType = 'future';
          }
          
          emotionalResponse = getDateResponse(dateType, language);
          emotionalResponseType = 'date';
          emotionalResponseParams = { dateType };
        } else if (currentQuestion === "startTime" && updates.event?.startTime) {
          const hour = parseInt(updates.event.startTime.split(':')[0]);
          let timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
          if (hour >= 6 && hour < 12) timeSlot = 'morning';
          else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
          else if (hour >= 18 && hour < 22) timeSlot = 'evening';
          else timeSlot = 'night';
          emotionalResponse = getTimeResponse(timeSlot, language);
          emotionalResponseType = 'time';
          emotionalResponseParams = { timeSlot };
        } else if (currentQuestion === "groupSize" && updates.participants?.size) {
          const size = updates.participants.size;
          let groupType: 'solo' | 'couple' | 'small' | 'medium' | 'large';
          if (size === 1) groupType = 'solo';
          else if (size === 2) groupType = 'couple';
          else if (size <= 4) groupType = 'small';
          else if (size <= 8) groupType = 'medium';
          else groupType = 'large';
          // Pass event type for contextual 2-person messages
          const eventType = updatedContext.event?.type;
          emotionalResponse = getGroupSizeResponse(groupType, language, eventType);
          emotionalResponseType = 'groupSize';
          emotionalResponseParams = { size: groupType };
          
          // After groupSize, show participant checkboxes instead of continuing
          if (emotionalResponse) {
            const emotionalMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: emotionalResponse,
              timestamp: new Date(),
              isDynamic: true,
              dynamicType: emotionalResponseType,
              dynamicParams: emotionalResponseParams,
            };
            setMessages((prev: Message[]) => [...prev, emotionalMessage]);
          }
          
          setShowParticipantCheckboxes(true);
          setIsLoadingResponse(false);
          return;
        } else if (currentQuestion === "budget" && updates.budget?.tier) {
          const budgetType = updates.budget.tier === 'NA' ? 'flexible' : 'specific';
          emotionalResponse = getBudgetResponse(budgetType, language);
          emotionalResponseType = 'budget';
          emotionalResponseParams = { type: budgetType };
        } else if (currentQuestion === "cuisine" && updates.preferences?.cuisine) {
          emotionalResponse = getCuisineResponse(language);
          emotionalResponseType = 'cuisine';
        } else if (currentQuestion === "mood" && updates.preferences?.mood) {
          emotionalResponse = getMoodResponse(language);
          emotionalResponseType = 'mood';
        }
        
        // Check if we need AM/PM clarification
        if (currentQuestion === "startTime" && updatedContext.event?.startTime === "NEEDS_CLARIFICATION") {
          // Ask for AM/PM clarification
          setCurrentQuestion("clarifyAmPm");
          setCurrentChips(["chips.am", "chips.pm"]);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "clarifyAmPm",
            translationKey: "questions.clarifyAmPm",
            timestamp: new Date(),
          };
          
          setMessages((prev: Message[]) => [...prev, assistantMessage]);
          setIsLoadingResponse(false);
          return;
        }
        
        // Check if we have all required info
        if (hasAllRequiredInfo(updatedContext)) {
          
          // Show emotional response if we have one (only if not refining)
          if (emotionalResponse && !isRefining) {
            const emotionalMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: emotionalResponse,
              timestamp: new Date(),
              isDynamic: true,
              dynamicType: emotionalResponseType,
              dynamicParams: emotionalResponseParams,
            };
            setMessages((prev: Message[]) => [...prev, emotionalMessage]);
          }
          
          // If we're refining, regenerate plan immediately
          if (isRefining) {
            setCurrentChips([]);
            setCurrentQuestion(null);
            setIsLoadingResponse(false);
            setIsRefining(false);
            handlePlanReady();
            return;
          }
          
          const completeMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: getPlanGenerationResponse(language),
            timestamp: new Date(),
            isDynamic: true,
            dynamicType: 'planGeneration',
          };
          
          setMessages((prev: Message[]) => [...prev, completeMessage]);
          setCurrentChips([]);
          setIsLoadingResponse(false);
          
          // Generate plan
          handlePlanReady();
          return;
        }
        
        // Ask next question
        const nextQuestion = getNextQuestion(updatedContext);
        
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion.key);
          let chips = getQuestionChips(nextQuestion, updatedContext);
          
          // Override location chips with user's nearby cities if available
          if (nextQuestion.key === "location" && userCity) {
            const nearbyCities = getNearbyCities(userCity);
            chips = ["chips.useLocation", ...nearbyCities];
          }
          
          setCurrentChips(chips);
          
          const messagesArr: Message[] = [];
          
          // Add emotional response ONLY if it matches the next question context
          // Avoid showing emotional responses that ask about different info
          const shouldShowEmotional = emotionalResponse && (
            // Show event type response only if asking about location next
            (emotionalResponseType === 'eventType' && nextQuestion.key === 'location') ||
            // Show location response only if asking about location
            (emotionalResponseType === 'location' && nextQuestion.key === 'location') ||
            // Show date response only if asking about date
            (emotionalResponseType === 'date' && nextQuestion.key === 'date') ||
            // Show time response only if asking about time
            (emotionalResponseType === 'time' && nextQuestion.key === 'startTime') ||
            // Show groupSize response only if asking about groupSize
            (emotionalResponseType === 'groupSize' && nextQuestion.key === 'groupSize') ||
            // Show budget response only if asking about budget
            (emotionalResponseType === 'budget' && nextQuestion.key === 'budget') ||
            // Show cuisine response only if asking about cuisine
            (emotionalResponseType === 'cuisine' && nextQuestion.key === 'cuisine') ||
            // Show mood response only if asking about mood
            (emotionalResponseType === 'mood' && nextQuestion.key === 'mood')
          );
          
          if (shouldShowEmotional && emotionalResponse) {
            messagesArr.push({
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: emotionalResponse,
              timestamp: new Date(),
              isDynamic: true,
              dynamicType: emotionalResponseType,
              dynamicParams: emotionalResponseParams,
            });
            // Don't add formal question - emotional response already asks
          } else {
            // Only add formal question if no emotional response
            messagesArr.push({
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: nextQuestion.key,
              translationKey: nextQuestion.translationKey,
              timestamp: new Date(),
            });
          }
          
          setMessages((prev: Message[]) => [...prev, ...messagesArr]);
        }
        
        setIsLoadingResponse(false);
        
      } else {
        // This is the first message - extract all possible info
        const extractedInfo = extractInitialInfo(message);
        
        // Handle geolocation request
        if (extractedInfo.location?.text === "REQUEST_GEOLOCATION") {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const cityName = getCityFromCoordinates(latitude, longitude);

                const geoLocation = {
                  text: cityName,
                  lat: latitude,
                  lng: longitude,
                  radiusKm: 10,
                };
                
                // Save for future use
                setUserCity(cityName);
                setUserCoords({ lat: latitude, lng: longitude });
                
                const geoUpdatedContext = {
                  ...context,
                  ...extractedInfo,
                  location: geoLocation,
                };
                setContext(geoUpdatedContext);
                
                const locationMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: language === 'en'
                    ? `Using your location: ${cityName}`
                    : `Usando tu ubicación: ${cityName}`,
                  timestamp: new Date(),
                };
                
                setMessages((prev: Message[]) => [...prev, locationMessage]);
                
                // Continue with extracted info
                proceedWithExtractedInfo({ ...extractedInfo, location: geoLocation });
              },
              (error) => {
                console.error('Geolocation error:', error);
                // Fallback to default location
                const fallbackLocation = { text: "Dallas, TX", radiusKm: 25 };
                const fallbackContext = {
                  ...context,
                  ...extractedInfo,
                  location: fallbackLocation,
                };
                setContext(fallbackContext);
                
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: "Couldn't access your location. Using Dallas, TX as default.",
                  timestamp: new Date(),
                };
                
                setMessages((prev: Message[]) => [...prev, errorMessage]);
                proceedWithExtractedInfo({ ...extractedInfo, location: fallbackLocation });
              }
            );
            setIsLoadingResponse(false);
            return;
          } else {
            // Browser doesn't support geolocation
            const fallbackLocation = { text: "Dallas, TX", radiusKm: 25 };
            extractedInfo.location = fallbackLocation;
          }
        }
        
        proceedWithExtractedInfo(extractedInfo);
      }
      
      function proceedWithExtractedInfo(extractedInfo: any) {
        const updatedContext = { ...context, ...extractedInfo };
        handleContextUpdate(extractedInfo);
        
        // Check if location needs clarification (missing state/ZIP)
        if (extractedInfo.location?.text && extractedInfo.location.text !== "REQUEST_GEOLOCATION") {
          if (!isLocationValid(extractedInfo.location.text)) {
            // Location needs clarification - ask for state or ZIP
            setCurrentQuestion("clarifyLocation");
            
            // Smart state suggestions based on detected city
            const cityLower = extractedInfo.location.text.toLowerCase();
            let stateChips = ["TX", "CA", "NY", "FL", "IL"]; // Default
            
            // Major cities mapping
            const cityToState: Record<string, string[]> = {
              'chicago': ["IL", "TX", "CA", "NY", "FL"],
              'dallas': ["TX", "CA", "NY", "FL", "IL"],
              'houston': ["TX", "CA", "NY", "FL", "IL"],
              'austin': ["TX", "CA", "NY", "FL", "IL"],
              'san antonio': ["TX", "CA", "NY", "FL", "IL"],
              'los angeles': ["CA", "TX", "NY", "FL", "IL"],
              'san francisco': ["CA", "TX", "NY", "FL", "IL"],
              'san diego': ["CA", "TX", "NY", "FL", "IL"],
              'new york': ["NY", "CA", "TX", "FL", "IL"],
              'miami': ["FL", "CA", "TX", "NY", "IL"],
              'orlando': ["FL", "CA", "TX", "NY", "IL"],
              'seattle': ["WA", "CA", "TX", "NY", "FL"],
              'portland': ["OR", "ME", "CA", "TX", "NY"],
              'denver': ["CO", "CA", "TX", "NY", "FL"],
              'phoenix': ["AZ", "CA", "TX", "NY", "FL"],
              'atlanta': ["GA", "CA", "TX", "NY", "FL"],
              'boston': ["MA", "CA", "TX", "NY", "FL"],
            };
            
            // Check if city matches a known city
            for (const [city, states] of Object.entries(cityToState)) {
              if (cityLower.includes(city)) {
                stateChips = states;
                break;
              }
            }
            
            setCurrentChips(stateChips);
            
            // Store the incomplete city name temporarily
            const tempLocation = {
              ...extractedInfo.location,
              _tempCity: extractedInfo.location.text,
            };
            setContext({ ...context, ...extractedInfo, location: tempLocation });
            
            const clarificationMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: getLocationClarification(extractedInfo.location.text, language),
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, clarificationMessage]);
            setIsLoadingResponse(false);
            return;
          }
        }
        
        // Add emotional response based on what was extracted
        let emotionalResponse: string | null = null;
        let emotionalResponseType: Message['dynamicType'] | undefined;
        let emotionalResponseParams: any = {};
        
        if (extractedInfo.event?.type) {
          emotionalResponse = getEventTypeResponse(extractedInfo.event.type, language);
          emotionalResponseType = 'eventType';
          emotionalResponseParams = { eventType: extractedInfo.event.type };
        } else if (extractedInfo.location?.text && extractedInfo.location.text !== "REQUEST_GEOLOCATION") {
          emotionalResponse = getLocationResponse(language);
          emotionalResponseType = 'location';
        }
        
        // Check if extracted time needs AM/PM clarification
        if (extractedInfo.event?.startTime === "NEEDS_CLARIFICATION") {
          setCurrentQuestion("clarifyAmPm");
          setCurrentChips(["chips.am", "chips.pm"]);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "clarifyAmPm",
            translationKey: "questions.clarifyAmPm",
            timestamp: new Date(),
          };
          
          setMessages((prev: Message[]) => [...prev, assistantMessage]);
          setIsLoadingResponse(false);
          return;
        }
        
        // Validate time for today
        if (extractedInfo.event?.date && extractedInfo.event?.startTime) {
          const isValid = validateTimeForToday(extractedInfo.event.date, extractedInfo.event.startTime);
          if (!isValid) {
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "The time you selected is in the past. Please choose a future time.",
              timestamp: new Date(),
            };
            
            setMessages((prev: Message[]) => [...prev, errorMessage]);
            setCurrentQuestion("startTime");
            const startTimeQuestion = CONVERSATION_FLOW.find(q => q.key === "startTime");
            if (startTimeQuestion) {
              setCurrentChips(getQuestionChips(startTimeQuestion, updatedContext));
            }
            setIsLoadingResponse(false);
            return;
          }
        }
        
        // Check if we have all required info
        if (hasAllRequiredInfo(updatedContext)) {
          // Show emotional response if we have one
          if (emotionalResponse) {
            const emotionalMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: emotionalResponse,
              timestamp: new Date(),
              isDynamic: true,
              dynamicType: emotionalResponseType,
              dynamicParams: emotionalResponseParams,
            };
            setMessages((prev: Message[]) => [...prev, emotionalMessage]);
          }
          
          const completeMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: getPlanGenerationResponse(language),
            timestamp: new Date(),
            isDynamic: true,
            dynamicType: 'planGeneration',
          };
          
          setMessages((prev: Message[]) => [...prev, completeMessage]);
          setCurrentChips([]);
          setIsLoadingResponse(false);
          
          // Generate plan
          handlePlanReady();
          return;
        }
        
        // Ask next question
        const nextQuestion = getNextQuestion(updatedContext);
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion.key);
          let chips = getQuestionChips(nextQuestion, updatedContext);
          
          // Override location chips with user's nearby cities if available
          if (nextQuestion.key === "location" && userCity) {
            const nearbyCities = getNearbyCities(userCity);
            chips = ["chips.useLocation", ...nearbyCities];
          }
          
          setCurrentChips(chips);
          
          const messagesArr: Message[] = [];
          
          // Add emotional response ONLY if it matches the next question context
          // Avoid showing emotional responses that ask about info we already have
          const shouldShowEmotional = emotionalResponse && (
            // Show event type response only if we're still asking about related info early in conversation
            (emotionalResponseType === 'eventType' && !updatedContext.location?.text) ||
            // Show location response only if we're asking about location
            (emotionalResponseType === 'location' && nextQuestion.key === 'location')
          );
          
          if (shouldShowEmotional && emotionalResponse) {
            messagesArr.push({
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: emotionalResponse,
              timestamp: new Date(),
              isDynamic: true,
              dynamicType: emotionalResponseType,
              dynamicParams: emotionalResponseParams,
            });
            // Don't add formal question - emotional response already asks
          } else {
            // Only add formal question if no emotional response
            messagesArr.push({
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: nextQuestion.key,
              translationKey: nextQuestion.translationKey,
              timestamp: new Date(),
            });
          }
          
setMessages((prev: Message[]) => [...prev, ...messagesArr]);
        }
        
        setIsLoadingResponse(false);
      }
    }, 500);
  };

  const handleChipSelect = (chip: string) => {
    
    // Check if "Choose date" chip was clicked
    if (chip === "chips.chooseDate") {
      setShowDatePicker(true);
      return;
    }
    
    saveConversationStep();
    
    // For "Now" chip, send the translated word instead of time
    if (chip === "chips.now") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Send "Now" or "Ahora" as the message for display
      const nowText = t('chips.now');
      
      // Add user message with display text
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: nowText, // Show "Now" or "Ahora"
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, userMessage]);
      
      // Process with actual time behind the scenes
      setIsLoadingResponse(true);
      setTimeout(() => {
        const updates = parseUserResponse(timeString, currentQuestion!, context);
        const updatedContext = { ...context, ...updates };
        setContext(updatedContext);
        handleContextUpdate(updates);
        
        // Continue with next question
        const nextQuestion = getNextQuestion(updatedContext);
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion.key);
          const chips = getQuestionChips(nextQuestion, updatedContext);
          setCurrentChips(chips);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: nextQuestion.key,
            translationKey: nextQuestion.translationKey,
            timestamp: new Date(),
          };
          setMessages((prev: Message[]) => [...prev, assistantMessage]);
        }
        setIsLoadingResponse(false);
      }, 300);
      
      return;
    }
    
    // For date chips (today, tomorrow, weekend), send the key itself
    // The parser in flow.ts expects "today", "tomorrow", "weekend" keywords
    if (chip === "chips.today" || chip === "chips.tomorrow" || chip === "chips.weekend") {
      const dateKeyword = chip.replace('chips.', ''); // "today", "tomorrow", "weekend"
      handleSendMessage(dateKeyword);
      setCurrentChips([]);
      return;
    }
    
    // For refine chips, set the corresponding question and chips
    if (currentQuestion === "refine") {
      const refineMap: { [key: string]: { question: QuestionKey, chips: string[] } } = {
        "chips.refineLocation": {
          question: "location",
          chips: userCity ? [`chips.useLocation`, userCity] : ["chips.useLocation"]
        },
        "chips.refineDate": {
          question: "date",
          chips: ["chips.today", "chips.tomorrow", "chips.chooseDate"]
        },
        "chips.refineTime": {
          question: "startTime",
          chips: [] // Will be populated by getChips
        },
        "chips.refineGroup": {
          question: "groupSize",
          chips: ["chips.justMe", "chips.couple", "chips.small", "chips.medium", "chips.large"]
        },
        "chips.refineBudget": {
          question: "budget",
          chips: ["chips.economical", "chips.moderate", "chips.upscale", "chips.luxury", "chips.noPreference"]
        },
        "chips.refineCuisine": {
          question: "cuisine",
          chips: [] // Will be populated by getChips
        },
        "chips.refineMood": {
          question: "mood",
          chips: [] // Will be populated by getChips
        },
        "chips.refineDuration": {
          question: "duration",
          chips: ["chips.hours2", "chips.hours4", "chips.hours6", "chips.allDay"]
        }
      };
      
      const refineConfig = refineMap[chip];
      if (refineConfig) {
        setCurrentQuestion(refineConfig.question);
        // Get chips from flow or use provided ones
        if (refineConfig.chips.length === 0) {
          const questionObj = CONVERSATION_FLOW.find(q => q.key === refineConfig.question);
          if (questionObj) {
            const flowChips = getQuestionChips(questionObj, context);
            setCurrentChips(flowChips);
          } else {
            setCurrentChips([]);
          }
        } else {
          setCurrentChips(refineConfig.chips);
        }
        return;
      }
    }
    
    // For eventType chips, send the internal value keyword instead of translated text
    if (currentQuestion === "eventType") {
      const eventTypeMap: { [key: string]: string } = {
        "chips.date": "date",
        "chips.celebration": "celebration",
        "chips.friendsOuting": "friends",
        "chips.graduation": "graduation",
        "chips.businessMeal": "business",
        "chips.familyTime": "family"
      };
      const eventKeyword = eventTypeMap[chip];
      if (eventKeyword) {
        handleSendMessage(eventKeyword);
        setCurrentChips([]);
        return;
      }
    }
    
    // For all other chips, translate to display text
    // This includes location chips like "Plano, TX", "Dallas, TX"
    // which should NOT be translated (they're already literal values)
    const displayText = translateChip(chip);
    handleSendMessage(displayText);
    // Clear all chips after selection
    setCurrentChips([]);
  };
  
  const handleParticipantCheckboxes = (hasKids: boolean, hasPets: boolean) => {
    // Close checkboxes
    setShowParticipantCheckboxes(false);
    
    // Update context with kids/pets info
    const updates: Partial<PlanContext> = {
      participants: {
        ...context.participants,
        hasKids,
        hasPets,
      }
    };
    
    const updatedContext = { ...context, ...updates };
    setContext(updatedContext);
    handleContextUpdate(updates);
    
    // Add a subtle confirmation message if they selected any
    if (hasKids || hasPets) {
      const confirmationParts = [];
      if (hasKids) confirmationParts.push(t('participants.withKids'));
      if (hasPets) confirmationParts.push(t('participants.withPets'));
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: confirmationParts.join(', '),
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, userMessage]);
    }
    
    // Continue with next question
    setIsLoadingResponse(true);
    setTimeout(() => {
      const nextQuestion = getNextQuestion(updatedContext);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion.key);
        const chips = getQuestionChips(nextQuestion, updatedContext);
        setCurrentChips(chips);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: nextQuestion.key,
          translationKey: nextQuestion.translationKey,
          timestamp: new Date(),
        };
        setMessages((prev: Message[]) => [...prev, assistantMessage]);
      } else if (hasAllRequiredInfo(updatedContext)) {
        // No more questions, generate plan
        handlePlanReady();
      }
      setIsLoadingResponse(false);
    }, 300);
  };
  
  const handleDateSelect = (dateISO: string) => {
    
    // Close the DatePicker immediately
    setShowDatePicker(false);
    
    // Format date for display (more readable than ISO)
    const date = new Date(dateISO + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', options);
    
    // Create user message with readable format
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: formattedDate, // Show formatted date to user
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);
    setCurrentChips([]);
    
    // But send ISO format to parser for accurate processing
    setTimeout(() => {
      // Ensure currentQuestion is valid
      if (!currentQuestion) {
        console.error('[handleDateSelect] No current question set');
        setIsLoadingResponse(false);
        return;
      }
      
      const updates = parseUserResponse(dateISO, currentQuestion, context);
      
      const updatedContext = { ...context, ...updates };
      handleContextUpdate(updates);
      
      // Add emotional response for date selection
      const dateObj = new Date(dateISO + 'T00:00:00');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfWeek = dateObj.getDay();
      
      let dateType: 'today' | 'tomorrow' | 'future' | 'weekend';
      if (dateObj.toDateString() === today.toDateString()) {
        dateType = 'today';
      } else if (dateObj.toDateString() === tomorrow.toDateString()) {
        dateType = 'tomorrow';
      } else if (dayOfWeek === 0 || dayOfWeek === 6) {
        dateType = 'weekend';
      } else {
        dateType = 'future';
      }
      
      const emotionalResponse = getDateResponse(dateType, language);
      
      if (emotionalResponse) {
        const emotionalMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: emotionalResponse,
          timestamp: new Date(),
          isDynamic: true,
          dynamicType: 'date',
          dynamicParams: { dateType },
        };
        setMessages(prev => [...prev, emotionalMessage]);
      }
      
      // Move to next question
      const nextQuestion = getNextQuestion(updatedContext);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion.key);
        setCurrentChips(getQuestionChips(nextQuestion, updatedContext));
        
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: nextQuestion.key,
          translationKey: nextQuestion.translationKey,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      setIsLoadingResponse(false);
    }, 300);
  };

  const handleEditContext = (key: string) => {
    saveConversationStep();
    
    // Clear the relevant context field
    let newContext = { ...context };
    let shouldReask = true;
    
    switch (key) {
      case "event":
        // When removing event type, show starter cards again
        newContext = { event: undefined };
        setShowStarters(true);
        shouldReask = false;
        break;
      case "location":
        newContext = { ...newContext, location: undefined };
        break;
      case "date":
        if (newContext.event) {
          newContext.event = { ...newContext.event, dateISO: undefined };
        }
        break;
      case "time":
        if (newContext.event) {
          newContext.event = { ...newContext.event, startTime: undefined, endTime: undefined };
        }
        break;
      case "group":
      case "groupSize":
      case "groupType":
        newContext = { ...newContext, participants: undefined };
        break;
      case "budget":
        // For optional fields, set to "no preference" instead of re-asking
        newContext = { 
          ...newContext, 
          budget: { tier: "NA" } 
        };
        shouldReask = false;
        break;
      case "cuisine":
        if (newContext.preferences) {
          newContext.preferences = { ...newContext.preferences, cuisine: [] };
        }
        break;
      case "mood":
        // For optional fields, set to "no preference" instead of re-asking
        newContext = { 
          ...newContext, 
          preferences: { 
            ...newContext.preferences, 
            mood: ["any"] 
          } 
        };
        shouldReask = false;
        break;
    }
    
    setContext(newContext);
    
    // Only ask the question again if it's a required field
    if (shouldReask) {
      const nextQuestion = getNextQuestion(newContext);
      
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion.key);
        setCurrentChips(getQuestionChips(nextQuestion, newContext));
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: nextQuestion.key,
          translationKey: nextQuestion.translationKey,
          timestamp: new Date(),
        };
        
        setMessages([...messages, assistantMessage]);
      }
    }
  };

  const handleRestart = () => {
    // Clear session storage (only on client)
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
    }
    
    // Reset ALL states to initial values
    setContext({});
    setPlanBlocks([]);
    setShowPlan(false);
    setShowStarters(true);
    setConversationHistory([]);
    setCurrentChips([]);
    setCurrentQuestion(null);
    setIsLoadingResponse(false); // Critical: clear loading state
    setIsLoadingPlan(false);
    setShowDatePicker(false);
    setViewingAlternatives({});
    setShowHelpButton(true); // Reset help button visibility
    setHelpUsedOnce(false); // Reset help usage flag
    
    // Generate fresh welcome message
    const welcomeText = getWelcomeMessage(language);
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: welcomeText,
        timestamp: new Date(),
        isDynamic: true,
        dynamicType: 'welcome',
      },
    ]);
  };

  const handleItinerarySent = () => {
    // Set flag to clear session on next page load
    sessionStorage.setItem(STORAGE_KEYS.ITINERARY_SENT, 'true');
    // User can continue editing current session, but on reload everything will be cleared
  };

  // Handle showing/regenerating plan from chat message
  const handleShowPlanFromMessage = () => {
    // If plan blocks exist, just show them
    if (planBlocks.length > 0) {
      setShowPlan(true);
    } else {
      // Otherwise regenerate the plan
      handlePlanReady();
    }
  };

  // Helper to format plan context for email
  const getPlanContextForEmail = () => {
    const eventType = context.event?.type;
    const location = context.location?.text || userCity || undefined;
    const date = context.event?.dateISO 
      ? new Date(context.event.dateISO).toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : undefined;
    
    let groupSize = '';
    if (context.participants?.size) {
      groupSize = context.participants.size.toString();
      if (context.participants.kids && context.participants.kids > 0) {
        groupSize += ' (con niños)';
      }
    }

    const startTime = context.event?.startTime || '12:00';

    return { eventType, location, date, groupSize, startTime };
  };

  const handlePlanReady = async () => {
    setIsLoadingPlan(true);
    
    const blocks = deriveBlocks(context);
    
    // Mark all blocks as loading initially
    const loadingBlocks = blocks.map(block => ({
      ...block,
      isLoading: true,
      hasError: false,
      options: []
    }));
    
    setPlanBlocks(loadingBlocks);
    setShowPlan(true);
    
    // Fetch recommendations for each block
    const blocksWithRecommendations = await Promise.all(
      blocks.map(async (block) => {
        try {
          const response = await fetch("/api/yelp/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context: {
                ...context,
                event: {
                  ...context.event,
                  // Override with block-specific times
                  startTime: block.startTime,
                  endTime: block.endTime,
                }
              },
              blockType: block.type,
              language: language,
              limit: 3,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const options = data.places || [];
            return {
              ...block,
              options,
              isLoading: false,
              hasError: options.length === 0, // Mark as error if no results
            };
          } else {
            console.error(`Error response for ${block.type}:`, response.status);
            return {
              ...block,
              options: [],
              isLoading: false,
              hasError: true,
            };
          }
        } catch (error) {
          console.error(`Error fetching recommendations for ${block.type}:`, error);
          return {
            ...block,
            options: [],
            isLoading: false,
            hasError: true,
          };
        }
      })
    );

    setPlanBlocks(blocksWithRecommendations);
    setIsLoadingPlan(false);
  };

  // Helper function to reload options for blocks with updated times
  const reloadBlockOptions = async (blocks: PlanBlock[]) => {
    // Mark blocks as loading
    const loadingBlocks = blocks.map(block => ({
      ...block,
      isLoading: true,
    }));
    setPlanBlocks(loadingBlocks);

    // Fetch new recommendations for each block with updated times
    const updatedBlocks = await Promise.all(
      blocks.map(async (block) => {
        try {
          const response = await fetch("/api/yelp/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context: {
                ...context,
                event: {
                  ...context.event,
                  // Use block-specific times
                  startTime: block.startTime,
                  endTime: block.endTime,
                }
              },
              blockType: block.type,
              language: language,
              limit: 3,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const options = data.places || [];
            return {
              ...block,
              options,
              isLoading: false,
              hasError: options.length === 0,
            };
          } else {
            return {
              ...block,
              isLoading: false,
              hasError: true,
            };
          }
        } catch (error) {
          console.error(`Error reloading options for ${block.type}:`, error);
          return {
            ...block,
            isLoading: false,
            hasError: true,
          };
        }
      })
    );

    setPlanBlocks(updatedBlocks);
  };

  const handleReorder = (newBlocks: PlanBlock[]) => {
    // First update the blocks with new times
    setPlanBlocks(newBlocks);
    
    // Then reload options with the new times
    reloadBlockOptions(newBlocks);
  };

  const handleUndoSwap = () => {
    if (!lastSwap) return;
    
    const { blockId, index, previousOption } = lastSwap;
    
    // Restore the previous option
    const restoredBlocks = planBlocks.map((block: PlanBlock) => {
      if (block.id === blockId) {
        const updatedOptions = [...block.options];
        updatedOptions[index] = previousOption;
        return {
          ...block,
          options: updatedOptions
        };
      }
      return block;
    });
    
    setPlanBlocks(restoredBlocks);
    setLastSwap(null);
    
    showToast(
      language === 'en'
        ? 'Change reverted successfully'
        : 'Cambio revertido exitosamente',
      'success',
      2000
    );
  };
  
  const handleResetAlternatives = async (blockId: string) => {
    try {
      const blockToUpdate = planBlocks.find(b => b.id === blockId);
      if (!blockToUpdate) return;
      
      // Fetch fresh alternatives without any exclusions
      const response = await fetch("/api/yelp/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          blockType: blockToUpdate.type,
          blockId: blockToUpdate.id,
          excludeIds: [], // No exclusions - get all options again
          limit: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternatives');
      }

      const data = await response.json();
      const newOptions = data.recommendations || [];
      
      if (newOptions.length > 0) {
        const refreshedBlocks = planBlocks.map((block: PlanBlock) => {
          if (block.id === blockId) {
            return {
              ...block,
              options: newOptions
            };
          }
          return block;
        });
        setPlanBlocks(refreshedBlocks);
        
        showToast(
          language === 'en'
            ? 'Alternatives refreshed successfully'
            : 'Alternativas actualizadas exitosamente',
          'success',
          2000
        );
      }
    } catch (error) {
      console.error('[handleResetAlternatives] Error:', error);
      showToast(
        language === 'en'
          ? 'Failed to refresh alternatives'
          : 'Error al actualizar alternativas',
        'error',
        3000
      );
    }
  };

  const handleSwap = async (blockId: string, currentIndex: number) => {
    // Mark this specific option as swapping
    const updatedBlocks = planBlocks.map((block: PlanBlock) => {
      if (block.id === blockId) {
        return {
          ...block,
          options: block.options.map((opt, idx) => ({
            ...opt,
            isSwapping: idx === currentIndex
          }))
        };
      }
      return block;
    });
    setPlanBlocks(updatedBlocks);
    
    // Fetch a new alternative for this specific option
    try {
      const blockToUpdate = planBlocks.find(b => b.id === blockId);
      if (!blockToUpdate) return;
      
      // Get already shown IDs to exclude
      const excludeIds = blockToUpdate.options.map(opt => opt.id);
      
      const response = await fetch("/api/yelp/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          blockType: blockToUpdate.type,
          blockId: blockToUpdate.id,
          excludeIds, // Exclude already shown options
          limit: 1, // Only fetch one new option
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternative');
      }

      const data = await response.json();
      const newOptions = data.recommendations || [];
      
      if (newOptions.length > 0) {
        // Save previous option for undo
        const previousOption = blockToUpdate.options[currentIndex];
        setLastSwap({
          blockId,
          index: currentIndex,
          previousOption
        });
        
        // Auto-clear undo after 5 seconds
        setTimeout(() => {
          setLastSwap(prev => {
            if (prev?.blockId === blockId && prev?.index === currentIndex) {
              return null;
            }
            return prev;
          });
        }, 5000);
        
        // Replace the specific option at currentIndex with the new one
        const finalBlocks = planBlocks.map((block: PlanBlock) => {
          if (block.id === blockId) {
            const updatedOptions = [...block.options];
            updatedOptions[currentIndex] = newOptions[0];
            return {
              ...block,
              options: updatedOptions
            };
          }
          return block;
        });
        setPlanBlocks(finalBlocks);
      } else {
        // No more alternatives available - show toast with reset option
        showToast(
          language === 'en' 
            ? "No more alternatives available. Try resetting to see all options again."
            : "No hay más alternativas disponibles. Intenta resetear para ver todas las opciones nuevamente.",
          'warning',
          5000
        );
        
        // Remove swapping state
        const finalBlocks = planBlocks.map((block: PlanBlock) => {
          if (block.id === blockId) {
            return {
              ...block,
              options: block.options.map(opt => ({ ...opt, isSwapping: false }))
            };
          }
          return block;
        });
        setPlanBlocks(finalBlocks);
      }
    } catch (error) {
      console.error('[handleSwap] Error fetching alternative:', error);
      
      // Show error toast
      showToast(
        language === 'en'
          ? 'Failed to load alternatives. Please try again.'
          : 'Error al cargar alternativas. Intenta de nuevo.',
        'error',
        3000
      );
      
      // Remove swapping state on error
      const finalBlocks = planBlocks.map((block: PlanBlock) => {
        if (block.id === blockId) {
          return {
            ...block,
            options: block.options.map(opt => ({ ...opt, isSwapping: false }))
          };
        }
        return block;
      });
      setPlanBlocks(finalBlocks);
    }
  };

  const handleSelect = (blockId: string, placeId: string) => {
    const updatedBlocks = planBlocks.map((block: PlanBlock) => {
      if (block.id === blockId) {
        return {
          ...block,
          selected: placeId,
        };
      }
      return block;
    });
    
    setPlanBlocks(updatedBlocks);
  };

  const handleRefine = () => {
    setShowPlan(false);
    setIsRefining(true);
    // Add assistant message prompting for changes
    const refineMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "What would you like to change about your plan?",
      translationKey: "chat.refinePrompt",
      timestamp: new Date(),
    };
    setMessages([...messages, refineMessage]);
    
    // Show refine chips for all filters (except eventType)
    const refineChips = [
      "chips.refineLocation",
      "chips.refineDate",
      "chips.refineTime",
      "chips.refineGroup",
      "chips.refineBudget",
      "chips.refineCuisine",
      "chips.refineMood",
      "chips.refineDuration"
    ];
    setCurrentChips(refineChips);
    setCurrentQuestion("refine");
  };

  const handleCancelRefine = () => {
    setIsRefining(false);
    setCurrentQuestion(null);
    setCurrentChips([]);
    setShowPlan(true);
  };

  const handleShowPlan = () => {
    setShowPlan(true);
  };

  const handleSkip = (blockId: string) => {
    setPlanBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? { ...block, skipped: !block.skipped, selected: block.skipped ? block.selected : undefined }
          : block
      )
    );
  };

  const handleViewAlternatives = (blockId: string) => {
    setViewingAlternatives(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <Header 
        showHelpButton={showHelpButton} 
        onShowHelp={() => {
          setShowHelp(true);
          setHelpUsedOnce(true);
        }} 
      />

      {/* Context Pills - Always visible when there's context */}
      <AnimatePresence>
        {Object.keys(context).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ContextPillsEditable
              context={context}
              onEdit={handleEditContext}
              onRemove={handleEditContext}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Section - Style ChatGPT */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col h-[calc(100vh-250px)]">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {conversationHistory.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleGoBack}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title={t("chat.goBack") || "Atrás"}
                    >
                      <FiArrowLeft className="w-5 h-5" />
                    </motion.button>
                  )}
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    <span className="text-red-600 dark:text-red-500">Yelp</span>
                    <span className="text-gray-800 dark:text-white">Out</span>
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Cancel Refine Button */}
                  {isRefining && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelRefine}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                    >
                      {t("chat.cancelRefine")}
                    </motion.button>
                  )}
                  {/* View Plan Button - Show when plan exists but is hidden */}
                  {planBlocks.length > 0 && !showPlan && !isRefining && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShowPlan}
                      className="px-3 py-1.5 text-sm bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors font-medium"
                    >
                      {t("chat.viewPlan")}
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRestart}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={t("chat.restart")}
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-hidden">
                <MessageList
                  messages={messages}
                  isLoading={isLoadingResponse}
                  currentChips={currentChips}
                  onChipSelect={handleChipSelect}
                  showStarters={showStarters}
                  onStarterSelect={handleStarterSelect}
                  onShowPlan={handleShowPlanFromMessage}
                  showHelpButton={showHelpButton}
                  onShowHelp={() => {
                    setShowHelp(true);
                    setHelpUsedOnce(true);
                  }}
                />
              </div>

              {/* Composer */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <Composer onSend={handleSendMessage} disabled={isLoadingResponse} />
              </div>
            </div>
          </div>

          {/* Plan/Starter Section */}
          <div className="hidden lg:block lg:col-span-1">
            {showStarters ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
              >
                <StarterCards onSelect={handleStarterSelect} />
              </motion.div>
            ) : isLoadingPlan ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block rounded-full h-16 w-16 border-4 border-primary-600 dark:border-primary-400 border-t-transparent mb-4"
                />
                <p className="text-gray-600 dark:text-gray-300">
                  {t("plan.searching")}
                </p>
              </motion.div>
            ) : showPlan ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-h-[calc(100vh-250px)] overflow-y-auto"
              >
                <ItineraryView
                  blocks={planBlocks}
                  onSwap={handleSwap}
                  onSelect={handleSelect}
                  onRefine={handleRefine}
                  onReorder={handleReorder}
                  onUndoSwap={handleUndoSwap}
                  onResetAlternatives={handleResetAlternatives}
                  lastSwap={lastSwap}
                  viewingAlternatives={viewingAlternatives}
                  onViewAlternatives={handleViewAlternatives}
                  onItinerarySent={handleItinerarySent}
                  onSkip={handleSkip}
                  planContext={getPlanContextForEmail()}
                />
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Plan Overlay */}
      <AnimatePresence>
        {showPlan && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Plan</h2>
              <button
                onClick={() => setShowPlan(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <ItineraryView
                blocks={planBlocks}
                onSwap={handleSwap}
                onSelect={handleSelect}
                onRefine={handleRefine}
                onReorder={handleReorder}
                viewingAlternatives={viewingAlternatives}
                onViewAlternatives={handleViewAlternatives}
                onItinerarySent={handleItinerarySent}
                onSkip={handleSkip}
                planContext={getPlanContextForEmail()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Date Picker Modal */}
      <AnimatePresence>
        {showDatePicker && (
          <DatePicker
            onSelectDate={handleDateSelect}
            onClose={() => setShowDatePicker(false)}
            language={language}
          />
        )}
      </AnimatePresence>
      
      {/* Participant Checkboxes */}
      <AnimatePresence>
        {showParticipantCheckboxes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowParticipantCheckboxes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <ParticipantCheckboxes onSubmit={handleParticipantCheckboxes} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help/FAQ Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
            >
              <HelpFAQ onClose={() => setShowHelp(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
