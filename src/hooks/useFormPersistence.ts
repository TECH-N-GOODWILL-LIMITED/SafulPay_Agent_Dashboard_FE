import { useEffect, useRef, useCallback } from "react";

interface FormPersistenceOptions {
  storageKey: string;
  autoClearTimeout?: number; // in minutes
  debounceMs?: number;
}

interface FormData {
  [key: string]: unknown;
}

export const useFormPersistence = <T extends FormData>(
  formData: T,
  options: FormPersistenceOptions
) => {
  const { storageKey, autoClearTimeout = 30, debounceMs = 500 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load saved form data from localStorage
  const loadSavedData = useCallback((): Partial<T> => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const timestamp = parsed.timestamp;
        const now = Date.now();

        // Check if data is still valid (not expired)
        if (timestamp && now - timestamp < autoClearTimeout * 60 * 1000) {
          return parsed.data;
        } else {
          // Clear expired data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.warn("Failed to load saved form data:", error);
    }
    return {};
  }, [storageKey, autoClearTimeout]);

  // Save form data to localStorage with debouncing
  const saveFormData = (data: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const dataToSave = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.warn("Failed to save form data:", error);
      }
    }, debounceMs);
  };

  // Clear saved form data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear saved form data:", error);
    }
  }, [storageKey]);

  // Auto-clear saved data after timeout
  const startAutoClearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      clearSavedData();
    }, autoClearTimeout * 60 * 1000);
  };

  // Save form data when it changes
  useEffect(() => {
    // Only save if form has data (not empty)
    const hasData = Object.values(formData).some(
      (value) => value !== undefined && value !== null && value !== ""
    );

    if (hasData) {
      saveFormData(formData);
      startAutoClearTimer();
    }
  }, [formData, autoClearTimeout, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadSavedData,
    clearSavedData,
    startAutoClearTimer,
  };
};
