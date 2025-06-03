import { Modal } from "../ui/modal";
import { LogOutIcon, CheckCircleIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { playSound } from "@/lib/utils/sound";
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
  const [loading, setLoading] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoading(false);
      setSignOutSuccess(true);
      
      // Don't call onConfirm here - let the user close the success modal manually
      playSound();
    }, 2000);
  }, []);

  const handleClose = useCallback(() => {
    setLoading(false);
    setSignOutSuccess(false);
    onClose();
  }, [onClose]);

  const handleSuccessClose = useCallback(() => {
    setLoading(false);
    setSignOutSuccess(false);
    onClose();
    // Only call onConfirm when the user manually closes the success modal
    onConfirm();
  }, [onClose, onConfirm]);

  const successConfig = useMemo(() => ({
    title: (
      <div className="flex items-center gap-2 select-none">
        <CheckCircleIcon size={20} className="text-green-600" />
        <span>Signed Out Successfully</span>
      </div>
    ),
    content: (
      <div className="space-y-6">
        {/* Success message */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
          <p className="text-sm text-green-800">
            You have been successfully signed out from <strong>{deviceName}</strong>. 
            {isCurrent ? " Your session has been terminated." : " The remote session has been terminated."}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Details:</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {isCurrent ? "You'll need to log in again to continue" : "User will need to log in again on that device"}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    closeButtonText: "Done",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600"
  }), [deviceName, isCurrent]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <LogOutIcon size={20} className="text-destructive" />
          <span>Sign Out Confirmation</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Cancel",
        disabled: loading
      }}
      actionButton={{
        text: "Sign Out",
        onClick: handleConfirm,
        variant: "destructive",
        disabled: loading,
        loadingText: "Signing out..."
      }}
      isLoading={loading}
      showSuccess={signOutSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={successConfig}
    >
      <div className="p-8 select-none">
        <div className="space-y-6">
          {/* Warning */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg">
            <p className="text-sm text-amber-800">
              You are about to sign out from <strong>{deviceName}</strong>.
            </p>
          </div>

          {/* Next steps */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Details:</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Device: {deviceName}</p>
                <p>• Session type: {isCurrent ? "Current device" : "Remote device"}</p>
                <p>• Impact: {isCurrent ? "You'll be logged out immediately" : "Remote session will be terminated"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 