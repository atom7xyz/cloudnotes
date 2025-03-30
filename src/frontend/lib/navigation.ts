import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Type definition for the Electron API
 */
interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  navigate: (url: string) => void;
  requestNavigationStateUpdate: () => void;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
  onNavigationStateChange: (callback: (canGoBack: boolean, canGoForward: boolean) => void) => () => void;
}

/**
 * Navigation utility functions that work with Electron
 * By using these functions instead of direct React Router navigation,
 * we ensure that browser history is properly maintained in Electron
 */

/**
 * Checks if the app is running in Electron
 */
export const isElectron = (): boolean => {
  return window?.electron !== undefined;
};

/**
 * Gets the Electron API with proper type casting
 */
export const getElectronAPI = (): ElectronAPI | undefined => {
  return window.electron as ElectronAPI | undefined;
};

/**
 * Navigate to a URL using Electron's API or fall back to React Router
 * @param url The URL to navigate to
 */
export const navigateTo = (url: string): void => {
  if (isElectron()) {
    // If we have the Electron API available, use it for navigation
    const api = getElectronAPI();
    api?.navigate(url);
  } else {
    // For non-Electron environments (like development in browser),
    // we can use window.location directly
    window.location.href = url;
  }
};

/**
 * A hook that returns a function to navigate using Electron or React Router
 * This should be used in React components instead of the useNavigate hook
 */
export const useAppNavigate = () => {
  const navigate = useNavigate();
  
  return useCallback((to: string) => {
    const isInternalLink = to.startsWith('/');
    
    if (isInternalLink) {
      // Handle internal navigation
      if (isElectron()) {
        const fullUrl = window.location.origin + "/ext/cloudnotes" + to;
        const api = getElectronAPI();
        api?.navigate(fullUrl);
      } else {
        navigate(to);
      }
      
      // After navigating, request an update of the navigation state
      // This ensures the back/forward buttons are properly updated
      setTimeout(() => {
        const api = getElectronAPI();
        api?.requestNavigationStateUpdate();
      }, 50);
    } else {
      // Handle external navigation
      window.open(to, '_blank', 'noopener,noreferrer');
    }
  }, [navigate]);
};

/**
 * Go back in history
 */
export const goBack = (): void => {
  if (isElectron()) {
    const api = getElectronAPI();
    api?.goBack();
  } else {
    window.history.back();
  }
};

/**
 * Go forward in history
 */
export const goForward = (): void => {
  if (isElectron()) {
    const api = getElectronAPI();
    api?.goForward();
  } else {
    window.history.forward();
  }
};

/**
 * Reload the current page
 */
export const reloadPage = (): void => {
  if (isElectron()) {
    const api = getElectronAPI();
    api?.reload();
  } else {
    window.location.reload();
  }
}; 