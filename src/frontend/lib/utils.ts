import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Toggle Developer Tools in Electron
 * This will only work in the Electron environment, not in browser
 */
export function toggleDevTools() {
  if (window.electron) {
    if (typeof window.electron.toggleDevTools === 'function') {
      return window.electron.toggleDevTools().catch(err => {
        console.error('Error toggling DevTools:', err);
        return false;
      });
    }

    console.warn('toggleDevTools function not found in electron API');
    return false;
  }
  
  console.warn('DevTools toggling is only available in Electron environment');
  return false;
}

/**
 * Enhanced debounce function with immediate option and proper TypeScript typing
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @param immediate If true, trigger the function on the leading edge instead of the trailing edge
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number = 0;
  
  return function(this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const context = this;
    
    // Store the latest args
    lastArgs = args;
    
    // Update last call time
    lastCallTime = time;
    
    const later = () => {
      const timeSinceLastCall = Date.now() - lastCallTime;
      
      // If there's been sufficient time since the last call, execute the function
      if (timeSinceLastCall >= wait) {
        timeout = null;
        if (!immediate && lastArgs) {
          func.apply(context, lastArgs);
          lastArgs = null;
        }
      } else {
        // Otherwise reschedule the execution
        timeout = setTimeout(later, wait - timeSinceLastCall);
      }
    };
    
    // Execute immediately if requested and not already in a timeout
    const callNow = immediate && !timeout;
    
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    
    if (callNow) {
      func.apply(context, args);
      lastArgs = null;
    }
  };
}

/**
 * Throttle function to limit how often a function can be called
 * Always executes the latest call after the wait period
 * @param func The function to throttle
 * @param wait The minimum time between function calls in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastExecTime: number = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const context = this;
    
    // Store the latest args
    lastArgs = args;
    
    // If enough time has passed since the last execution, call immediately
    if (time - lastExecTime >= wait) {
      lastExecTime = time;
      func.apply(context, args);
      lastArgs = null;
    } else if (!timeout) {
      // Schedule a call with the most recent args after the wait period
      timeout = setTimeout(() => {
        timeout = null;
        lastExecTime = Date.now();
        if (lastArgs) {
          func.apply(context, lastArgs);
          lastArgs = null;
        }
      }, wait - (time - lastExecTime));
    }
  };
}

/**
 * Format date to relative time
 * @param date The date to format
 * @returns The relative time string
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Oggi';
  if (diffInDays === 1) return 'Ieri';
  
  if (diffInDays < 7) {
    const days = diffInDays;
    return `${days} giorni fa`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    if (weeks === 1) return '1 settimana fa';
    return `${weeks} settimane fa`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    if (months === 1) return '1 mese fa';
    return `${months} mesi fa`;
  }

  const years = Math.floor(diffInDays / 365);
  if (years === 1) return '1 anno fa';
  return `${years} anni fa`;
}