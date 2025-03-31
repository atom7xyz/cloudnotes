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
    } else {
      console.warn('toggleDevTools function not found in electron API');
      return false;
    }
  } else {
    console.warn('DevTools toggling is only available in Electron environment');
    return false;
  }
}

/**
 * Debounce function to limit how often a function can be called
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}
