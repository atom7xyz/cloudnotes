import { toast as sonnerToast } from 'sonner';
import { ReactNode } from 'react';

interface ToastOptions {
  description?: string;
  icon?: ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const createToastWithStyle = (type: 'success' | 'error' | 'warning' | 'info') => {
  const borderColors = {
    success: {
      border: '1px solid rgb(34, 197, 94)',
      borderLeft: '4px solid rgb(34, 197, 94)'
    },
    error: {
      border: '1px solid rgb(239, 68, 68)',
      borderLeft: '4px solid rgb(239, 68, 68)'
    },
    warning: {
      border: '1px solid rgb(251, 146, 60)',
      borderLeft: '4px solid rgb(251, 146, 60)'
    },
    info: {
      border: '1px solid rgb(59, 130, 246)',
      borderLeft: '4px solid rgb(59, 130, 246)'
    }
  };

  return (message: string, options?: ToastOptions) => {
    return sonnerToast[type](message, {
      ...options,
      style: {
        ...borderColors[type]
      }
    });
  };
};

export const toast = {
  success: createToastWithStyle('success'),
  error: createToastWithStyle('error'),
  warning: createToastWithStyle('warning'),
  info: createToastWithStyle('info')
}; 