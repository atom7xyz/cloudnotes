import { useState, useCallback } from 'react';
import {
  AlertTriangleIcon,
  XIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
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
  title = "Unsaved Changes",
  description,
  actionType = 'close'
}: UnsavedChangesModalProps) {
  const [loading, setLoading] = useState(false);

  const actionTexts = {
    close: {
      warning: "You have unsaved changes. If you close now, your changes will be lost.",
      button: "Discard Changes"
    },
    navigate: {
      warning: "You have unsaved changes. If you navigate away now, your changes will be lost.",
      button: "Discard Changes"
    },
    reset: {
      warning: "You have unsaved changes. If you reset now, your changes will be lost.",
      button: "Reset Form"
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

          <Separator />

          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
              className="flex-1 hover-primary-effect rounded-full cursor-pointer"
            >
              Keep Editing
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-full cursor-pointer"
            >
              {loading ? 'Discarding...' : currentTexts.button}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 