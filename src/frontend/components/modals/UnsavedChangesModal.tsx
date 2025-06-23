import { useState, useCallback } from 'react';
import {
  AlertTriangleIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Separator } from '../ui/separator';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  actionType?: 'close' | 'navigate' | 'reset';
}

export default function UnsavedChangesModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Modifiche non salvate",
  description,
  actionType = 'close'
}: UnsavedChangesModalProps) {
  const [loading, setLoading] = useState(false);

  const actionTexts = {
    close: {
      warning: "Hai modifiche non salvate. Se chiudi ora, le tue modifiche andranno perse.",
      button: "Scarta modifiche"
    },
    navigate: {
      warning: "Hai modifiche non salvate. Se navighi via ora, le tue modifiche andranno perse.",
      button: "Scarta modifiche"
    },
    reset: {
      warning: "Hai modifiche non salvate. Se resetti ora, le tue modifiche andranno perse.",
      button: "Resetta modulo"
    }
  };

  const currentTexts = actionTexts[actionType];

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setLoading(false);
    onConfirm();
  }, [onConfirm]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [onClose, loading]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={title}
      maxWidth="max-w-md"
      cancelButton={{
        text: "Continua a modificare",
        disabled: loading
      }}
      actionButton={{
        text: currentTexts.button,
        onClick: handleConfirm,
        variant: "destructive",
        disabled: loading,
        loadingText: "Scartando...",
        icon: <AlertTriangleIcon size={16} />
      }}
      isLoading={loading}
    >
      <div className="p-8 select-none">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center">
            <AlertTriangleIcon size={32} className="text-red-600" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {description || currentTexts.warning}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
} 