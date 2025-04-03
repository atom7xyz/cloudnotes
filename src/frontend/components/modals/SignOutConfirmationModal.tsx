import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { LogOutIcon } from "lucide-react";
import { Card } from "../ui/card";

interface SignOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deviceName: string;
  isCurrent?: boolean;
}

export default function SignOutConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  deviceName,
  isCurrent = false
}: SignOutConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-destructive">
          <LogOutIcon size={20} />
          <span>Sign Out Confirmation</span>
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
            onClick={onConfirm}
            className="rounded-full flex items-center gap-2 !px-8 cursor-pointer"
            variant="destructive"
          >
            Sign Out
          </Button>
        </div>
      }
    >
      <div className="p-6 select-none">
        <Card className="p-6 space-y-6 border-none shadow-none">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <LogOutIcon size={28} className="text-destructive" />
              </div>
            </div>
            
            <p className="text-base text-center">
              Are you sure you want to sign out from <span className="font-medium">{deviceName}</span>?
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 text-center">
                {isCurrent 
                  ? "Signing out will terminate your current session and you will need to log in again to access your account."
                  : "Signing out will terminate the session and you will need to log in again to access your account on that device."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
} 