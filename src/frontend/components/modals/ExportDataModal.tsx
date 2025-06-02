import { Modal } from "../ui/modal";
import { DownloadIcon, CheckCircleIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { playSound } from "@/lib/utils/sound";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onExportComplete: () => void;
  notificationsEnabled: boolean;
}

export default function ExportDataModal({ 
  isOpen, 
  onClose, 
  email,
  onExportComplete,
  notificationsEnabled
}: ExportDataModalProps) {
  const [loading, setLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoading(false);
      setExportSuccess(true);
      
      // Play sound if notifications are enabled
      if (notificationsEnabled) {
        playSound();
      }
    }, 2000);
  }, [notificationsEnabled]);

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
          <DownloadIcon size={20} className="text-blue-500" />
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
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
              <p className="text-sm text-green-800">
                Your export request has been successfully submitted and is now being processed. 
                A secure download link will be sent to <strong>{email}</strong>.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Details:</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• All your notes and documents will be included</p>
                  <p>• Export format: ZIP file with organized folders</p>
                  <p>• Processing time: 24-72 hours</p>
                  <p>• Download link expires after 7 days</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-green-300/50">
                If you don't receive the email within 72 hours, please contact support for assistance.
              </div>
            </div>
          </div>
        ),
        closeButtonText: "Done",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-600"
      }}
    >
      <div className="p-8 select-none">
        <div className="space-y-6">
          {/* Description */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
            <p className="text-sm text-blue-800">
              Your data will be prepared and sent as a downloadable file to <strong>{email}</strong>. 
              This includes all your notes, documents, and settings.
            </p>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Details:</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• All your notes and documents will be included</p>
                <p>• Export format: ZIP file with organized folders</p>
                <p>• Processing time: 24-72 hours</p>
                <p>• Download link expires after 7 days</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-blue-300/50">
              You'll receive an email notification when your export is ready for download.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 