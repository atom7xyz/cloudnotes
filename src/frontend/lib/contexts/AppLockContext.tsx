import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AppLockContextType {
  isLocked: boolean;
  isPinSet: boolean;
  currentPin: string | null;
  lockApp: () => void;
  unlockApp: (enteredPin: string) => boolean;
  setPinCode: (pin: string | null) => void;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export const AppLockProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [currentPin, setCurrentPin] = useState<string | null>(null);

  // Check if PIN is set in local storage on initial load
  useEffect(() => {
    const storedPin = localStorage.getItem('app_pin');
    if (storedPin) {
      setCurrentPin(storedPin);
    }
  }, []);

  // Lock the application
  const lockApp = useCallback(() => {
    if (currentPin) {
      setIsLocked(true);
    }
  }, [currentPin]);

  // Unlock the application if the correct PIN is entered
  const unlockApp = useCallback((enteredPin: string): boolean => {
    if (enteredPin === currentPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [currentPin]);

  // Set or update the PIN code
  const setPinCode = useCallback((pin: string | null) => {
    setCurrentPin(pin);
    if (pin) {
      localStorage.setItem('app_pin', pin);
    } else {
      localStorage.removeItem('app_pin');
    }
  }, []);

  // Create keyboard shortcut for locking (CTRL+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        lockApp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lockApp]);

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        isPinSet: !!currentPin,
        currentPin,
        lockApp,
        unlockApp,
        setPinCode,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

// Hook to use the app lock context
export function useAppLock() {
  const context = useContext(AppLockContext);
  if (context === undefined) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
} 