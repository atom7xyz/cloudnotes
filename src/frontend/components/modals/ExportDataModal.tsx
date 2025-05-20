import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { DownloadIcon, MailIcon, RefreshCwIcon, CheckCircleIcon } from "lucide-react";
import { Card } from "../ui/card";
import { useState } from "react";

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

  const handleConfirm = () => {
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
  };

  const handleCloseAll = () => {
    onClose();
    // Reset the export success state after a delay to avoid visual glitches
    setTimeout(() => {
      setExportSuccess(false);
    }, 300);
    onExportComplete();
  };

  return (
    <>
      {/* Export Request Modal */}
      <Modal
        isOpen={isOpen && !exportSuccess}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <DownloadIcon size={20} />
            <span>Export Your Data</span>
          </div>
        }
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end items-center gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-full cursor-pointer"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              className="rounded-full cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-1">
                    <RefreshCwIcon size={14} />
                  </span>
                  Processing...
                </>
              ) : (
                "Export"
              )}
            </Button>
          </div>
        }
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700 text-center">
                  Data exports can take 24-72 hours to process.
                  You'll receive a download link via email when your data is ready.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Modal>

      {/* Export Success Modal */}
      <Modal
        isOpen={isOpen && exportSuccess}
        onClose={handleCloseAll}
        title={
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Export Request Submitted</span>
          </div>
        }
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end">
            <Button 
              onClick={handleCloseAll}
              className="rounded-full cursor-pointer"
            >
              <span className="select-none">Close</span>
            </Button>
          </div>
        }
      >
        <div className="p-6 select-none">
          <div className="p-6 space-y-6 bg-muted/50 rounded-lg">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon size={28} className="text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-center">Export Request Submitted</h3>
              <p className="text-base text-center">
                Your export request has been successfully submitted. A download link will be sent to:
              </p>
              <p className="text-center font-medium">{email}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                Please check your inbox in the next 24-72 hours. If you don't receive 
                the email, please check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
} 