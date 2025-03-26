import { useNavigate } from 'react-router-dom';
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { AlertTriangleIcon } from "lucide-react";

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
  message = "You have unsaved changes that will be lost if you leave this page."
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
      {/* Redesigned Content Section */}
      <div className="px-6 py-8">
        <div className="flex justify-center mb-5">
          <div className="w-[72px] h-[72px] bg-red-50 rounded-full flex items-center justify-center">
            <AlertTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <p className="text-center text-base mb-3">
          {message}
        </p>
        
        <p className="text-sm text-muted-foreground text-center">
          Click "Leave Page" to continue without saving, or "Cancel" to stay on this page.
        </p>
      </div>
    </Modal>
  );
} 