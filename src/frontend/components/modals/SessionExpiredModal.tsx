import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { AlertCircleIcon, LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from "../ui/modal";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionExpiredModal({ isOpen, onClose }: SessionExpiredModalProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    onClose();
    navigate('/login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircleIcon size={20} />
          <span>Session Expired</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="p-6">
        <Card className="p-6 space-y-6 border-none shadow-none bg-muted/50">
          <div className="space-y-4">
            <p className="text-base">
              Your session has expired due to inactivity. Please log in again to continue using CloudNotes.
            </p>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <LogOutIcon size={36} className="text-destructive" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              For security reasons, we automatically log you out after a period of inactivity.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 pt-2">
            <Button
              onClick={handleLogout}
              className="rounded-full cursor-pointer"
            >
              Log In Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="rounded-full cursor-pointer"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    </Modal>
  );
} 