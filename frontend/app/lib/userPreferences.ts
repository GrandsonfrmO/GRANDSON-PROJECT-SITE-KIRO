/**
 * User Preferences Manager
 * Manages user preferences with localStorage persistence
 */

export interface UserPreferences {
  viewMode: 'grid' | 'list';
  itemsPerPage: number;
  defaultSort: 'name' | 'price-asc' | 'price-desc' | 'newest';
  showOutOfStock: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  currency: 'GNF' | 'USD' | 'EUR';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  viewMode: 'grid',
  itemsPerPage: 12,
  defaultSort: 'newest',
  showOutOfStock: true,
  theme: 'auto',
  language: 'fr',
  currency: 'GNF',
};

const STORAGE_KEY = 'user_preferences';

class UserPreferencesManager {
  private preferences: UserPreferences;

  constructor() {
    this.preferences = this.load();
  }

  /**
   * Load preferences from localStorage
   */
  private load(): UserPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_PREFERENCES;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }

    return DEFAULT_PREFERENCES;
  }

  /**
   * Save preferences to localStorage
   */
  private save(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  /**
   * Get all preferences
   */
  getAll(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Get a specific preference
   */
  get<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }

  /**
   * Set a specific preference
   */
  set<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): void {
    this.preferences[key] = value;
    this.save();
  }

  /**
   * Update multiple preferences at once
   */
  update(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.save();
  }

  /**
   * Reset to default preferences
   */
  reset(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.save();
  }

  /**
   * Export preferences as JSON
   */
  export(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import preferences from JSON
   */
  import(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.preferences = { ...DEFAULT_PREFERENCES, ...parsed };
      this.save();
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }
}

// Singleton instance
export const userPreferences = new UserPreferencesManager();

/**
 * React hook for user preferences
 */
import { useState, useEffect } from 'react';

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(
    userPreferences.getAll()
  );

  useEffect(() => {
    // Listen for storage changes (sync across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newPrefs = JSON.parse(e.newValue);
          setPreferences({ ...DEFAULT_PREFERENCES, ...newPrefs });
        } catch (error) {
          console.warn('Failed to sync preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    userPreferences.set(key, value);
    setPreferences(userPreferences.getAll());
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    userPreferences.update(updates);
    setPreferences(userPreferences.getAll());
  };

  const resetPreferences = () => {
    userPreferences.reset();
    setPreferences(userPreferences.getAll());
  };

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
  };
}
