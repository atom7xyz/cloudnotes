import React, { useEffect } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  fullScreen?: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  message = "Loading, please wait...",
  fullScreen = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md px-8">
          {/* Simple loading spinner */}
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
          </div>
          
          {/* Loading message */}
          <p className="text-xl font-medium text-center">{message}</p>
          
          {/* Simple progress bar */}
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-background rounded-lg shadow-lg p-6 flex flex-col items-center justify-center gap-4 max-w-sm border border-border">
        {/* Simple loading spinner */}
        <div className="relative w-5 h-5">
          <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading message */}
        <p className="text-center">{message}</p>
        
        {/* Simple progress bar */}
        <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal; 