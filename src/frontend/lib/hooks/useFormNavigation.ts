import { useState, useCallback } from 'react';
import { useAppNavigate } from '@/lib/navigation';

interface UseFormNavigationOptions {
  /**
   * Paths that should bypass the unsaved changes confirmation dialog
   */
  bypassPaths?: string[];
  
  /**
   * Function to determine if the form is empty
   */
  isFormEmpty?: () => boolean;
  
  /**
   * Custom message for the unsaved changes dialog
   */
  unsavedMessage?: string;
}

/**
 * Custom hook for managing form navigation and unsaved changes
 */
export function useFormNavigation({ 
  bypassPaths = [], 
  isFormEmpty = () => false,
  unsavedMessage = "You have unsaved changes. If you leave, your information will be lost."
}: UseFormNavigationOptions = {}) {
  const appNavigate = useAppNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  // Handle navigation with unsaved changes check
  const handleNavigate = useCallback((path: string) => {
    // Allow direct navigation to bypass paths
    if (bypassPaths.includes(path)) {
      appNavigate(path);
      return true;
    }
    
    // If form is empty, allow navigation without warning
    if (isFormEmpty()) {
      setIsDirty(false);
      appNavigate(path);
      return true;
    }
    
    // If form has unsaved changes, show confirmation dialog
    if (isDirty) {
      setTargetPath(path);
      setIsModalOpen(true);
      return false;
    }
    
    // Default case: navigate directly
    appNavigate(path);
    return true;
  }, [appNavigate, bypassPaths, isDirty, isFormEmpty]);

  // Function to confirm navigation (from modal)
  const confirmNavigation = useCallback(() => {
    if (targetPath) {
      appNavigate(targetPath);
      setIsModalOpen(false);
    }
  }, [appNavigate, targetPath]);

  // Cancel navigation
  const cancelNavigation = useCallback(() => {
    setIsModalOpen(false);
    setTargetPath('');
  }, []);

  return {
    isDirty,
    setIsDirty,
    isModalOpen,
    setIsModalOpen,
    targetPath,
    handleNavigate,
    confirmNavigation,
    cancelNavigation,
    unsavedMessage
  };
}

export default useFormNavigation; 