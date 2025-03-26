import { useNavigate } from 'react-router-dom';
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { AlertTriangleIcon } from "lucide-react";
import { Card } from "../ui/card";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPath: string;
  message?: string;
}

export default function UnsavedChangesModal({ 
  isOpen, 
  onClose, 
  targetPath,
  message = "You have unsaved changes in the form. Are you sure you want to leave this page? Your changes will be lost."
}: UnsavedChangesModalProps) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onClose();
    navigate(targetPath);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangleIcon size={20} />
          <span>Unsaved Changes</span>
        </div>
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="rounded-full flex items-center gap-2 !px-8 cursor-pointer"
            variant="destructive"
          >
            Leave Page
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <Card className="p-6 space-y-6 border-none shadow-none bg-muted/50">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangleIcon size={28} className="text-destructive" />
              </div>
            </div>
            
            <p className="text-base text-center">
              {message}
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 text-center">
                Click "Leave Page" to continue without saving, or "Cancel" to stay on this page.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
} 