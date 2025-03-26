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
      footer={
        <div className="flex justify-end items-center">
          <Button 
            onClick={handleLogout}
            className="rounded-full flex items-center gap-2 !px-8 cursor-pointer"
            variant="destructive"
          >
            Log In Again
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <Card className="p-6 space-y-6 border-none shadow-none bg-muted/50">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <LogOutIcon size={28} className="text-destructive" />
              </div>
            </div>
            
            <p className="text-base text-center">
              Your session has expired due to inactivity. Please log in again to continue using CloudNotes.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                For security reasons, we automatically log you out after a period of inactivity.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
} 