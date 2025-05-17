"use client";

import { useState, useEffect, useCallback } from "react";

function useLocalStorage(storageKey: string) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      setValue(item ? JSON.parse(item) : null);
    } catch (error) {
      console.warn(`Error reading localStorage key “${storageKey}”:`, error);
      setValue(null);
    }
  }, [storageKey]);

  const updateValue = useCallback(
    (newValue: string | null) => {
      try {
        setValue(newValue);
        if (newValue === null) {
          window.localStorage.removeItem(storageKey);
        } else {
          window.localStorage.setItem(storageKey, JSON.stringify(newValue));
        }
      } catch (error) {
        console.warn(
          `Error writing to localStorage key “${storageKey}”:`,
          error
        );
      }
    },
    [storageKey]
  );

  return [value, updateValue] as const;
}

export default useLocalStorage;
