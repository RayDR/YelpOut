/**
 * useSessionStorage Hook
 * Generic hook for session storage persistence
 */
"use client";
import { useState, useEffect, useCallback } from 'react';

export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from session storage:`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Save to session storage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to session storage:`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from session storage:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, isLoaded] as const;
};
