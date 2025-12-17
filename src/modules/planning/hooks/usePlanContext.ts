/**
 * usePlanContext Hook
 * Manages planning context state
 */

import { useState, useCallback } from 'react';
import { PlanContext } from '../types';

export const usePlanContext = (initialContext: PlanContext = {}) => {
  const [context, setContext] = useState<PlanContext>(initialContext);

  const updateContext = useCallback((updates: Partial<PlanContext>) => {
    setContext(prev => {
      const newContext = { ...prev, ...updates };
      
      // Merge nested objects
      if (updates.event) {
        newContext.event = { ...prev.event, ...updates.event };
      }
      if (updates.location) {
        newContext.location = { ...prev.location, ...updates.location };
      }
      if (updates.participants) {
        newContext.participants = { ...prev.participants, ...updates.participants };
      }
      if (updates.budget) {
        newContext.budget = { ...prev.budget, ...updates.budget };
      }
      if (updates.preferences) {
        newContext.preferences = { ...prev.preferences, ...updates.preferences };
      }
      
      return newContext;
    });
  }, []);

  const clearContext = useCallback(() => {
    setContext({});
  }, []);

  const hasContext = Object.keys(context).length > 0;

  return {
    context,
    updateContext,
    clearContext,
    hasContext,
  };
};
