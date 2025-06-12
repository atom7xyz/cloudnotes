import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { UseFormReturn, FieldValues } from 'react-hook-form';

interface FormPersistenceOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  excludeFields?: (keyof T)[];
  storageKey: string;
}

/**
 * Custom hook for persisting form state across navigation
 * Specifically designed for Register <-> ToS navigation flow
 */
export function useFormPersistence<T extends FieldValues>({
  form,
  excludeFields = [],
  storageKey
}: FormPersistenceOptions<T>) {
  const location = useLocation();
  const isInitialMount = useRef(true);

  // Save form data to sessionStorage (excluding specified fields)
  const saveFormData = () => {
    const formData = form.getValues();
    const dataToSave: Partial<T> = {};
    
    // Exclude specified fields (like passwords)
    Object.keys(formData).forEach(key => {
      if (!excludeFields.includes(key as keyof T)) {
        dataToSave[key as keyof T] = formData[key];
      }
    });
    
    sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  // Restore form data from sessionStorage
  const restoreFormData = () => {
    const savedData = sessionStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Reset form with saved data
        form.reset(parsedData);
        
        // Clear the saved data after restoring
        sessionStorage.removeItem(storageKey);
        
        return true;
      } catch (error) {
        console.error('Error restoring form data:', error);
        sessionStorage.removeItem(storageKey);
      }
    }
    return false;
  };

  // Clear saved form data
  const clearFormData = () => {
    sessionStorage.removeItem(storageKey);
  };

  // Check if we have saved data
  const hasSavedData = () => {
    return sessionStorage.getItem(storageKey) !== null;
  };

  // Handle restoration on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      // Only restore if coming from /tos (check referrer or session storage flag)
      const referrer = document.referrer;
      const fromTos = referrer.includes('/tos') || sessionStorage.getItem(`${storageKey}_from_tos`) === 'true';
      
      if (fromTos && location.pathname === '/register') {
        restoreFormData();
        // Clear the flag
        sessionStorage.removeItem(`${storageKey}_from_tos`);
      }
      
      isInitialMount.current = false;
    }
  }, []);

  return {
    saveFormData,
    restoreFormData,
    clearFormData,
    hasSavedData
  };
} 