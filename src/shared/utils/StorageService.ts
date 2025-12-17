/**
 * Storage Service
 * Handles session and local storage operations
 */

export class StorageService {
  private static readonly STORAGE_KEYS = {
    CONTEXT: 'yelpout-context',
    MESSAGES: 'yelpout-messages',
    HISTORY: 'yelpout-history',
    SHOW_STARTERS: 'yelpout-show-starters',
  };

  /**
   * Save data to session storage
   */
  static saveToSession<T>(key: keyof typeof StorageService.STORAGE_KEYS, data: T): void {
    try {
      sessionStorage.setItem(
        StorageService.STORAGE_KEYS[key],
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(`Error saving ${key} to session:`, error);
    }
  }

  /**
   * Load data from session storage
   */
  static loadFromSession<T>(key: keyof typeof StorageService.STORAGE_KEYS): T | null {
    try {
      const item = sessionStorage.getItem(StorageService.STORAGE_KEYS[key]);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error loading ${key} from session:`, error);
      return null;
    }
  }

  /**
   * Remove data from session storage
   */
  static removeFromSession(key: keyof typeof StorageService.STORAGE_KEYS): void {
    try {
      sessionStorage.removeItem(StorageService.STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Error removing ${key} from session:`, error);
    }
  }

  /**
   * Clear all app data from session storage
   */
  static clearAll(): void {
    Object.values(StorageService.STORAGE_KEYS).forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing ${key}:`, error);
      }
    });
  }
}
