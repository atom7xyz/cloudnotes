import { Modal } from "../ui/modal";
import { DownloadIcon, MailIcon, CheckCircleIcon } from "lucide-react";
import { Card } from "../ui/card";
import { useState, useCallback } from "react";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onExportComplete: () => void;
  notificationsEnabled: boolean;
  playSound?: () => void;
  soundEnabled?: boolean;
}

export default function ExportDataModal({ 
  isOpen, 
  onClose, 
  email,
  onExportComplete,
  notificationsEnabled,
  playSound,
  soundEnabled = false
}: ExportDataModalProps) {
  const [loading, setLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoading(false);
      setExportSuccess(true);
      
      // Play sound if both notifications and sound are enabled
      if (notificationsEnabled && soundEnabled && playSound) {
        playSound();
      }
    }, 2000);
  }, [notificationsEnabled, soundEnabled, playSound]);

  const handleClose = useCallback(() => {
    setLoading(false);
    setExportSuccess(false);
    onClose();
  }, [onClose]);

  const handleSuccessClose = useCallback(() => {
    setLoading(false);
    setExportSuccess(false);
    onClose();
    onExportComplete();
  }, [onClose, onExportComplete]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <DownloadIcon size={20} />
          <span>Export Your Data</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Cancel",
        disabled: loading
      }}
      actionButton={{
        text: "Export",
        onClick: handleConfirm,
        disabled: loading,
        loadingText: "Processing..."
      }}
      isLoading={loading}
      showSuccess={exportSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Export Request Submitted</span>
          </div>
        ),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-center">Export Request Submitted</h3>
              <p className="text-base text-center">
                Your export request has been successfully submitted. A download link will be sent to:
              </p>
              <p className="text-center font-medium">{email}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>What happens next?</strong> Please check your inbox in the next 24-72 hours. If you don't receive 
                the email, please check your spam folder or contact support.
              </p>
            </div>
          </div>
        ),
        closeButtonText: "Done",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-600"
      }}
    >
      <div className="p-6 select-none">
        <Card className="p-6 space-y-6 border-none shadow-none bg-muted/50">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <MailIcon size={28} className="text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-center">Data Export Request</h3>
              <p className="text-base text-center">
                Your data will be prepared and sent to:
              </p>
              <p className="text-center font-medium">{email}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                Data exports can take 24-72 hours to process.
                You'll receive a download link via email when your data is ready.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
} 