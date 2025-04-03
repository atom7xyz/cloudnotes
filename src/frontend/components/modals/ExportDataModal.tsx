import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { DownloadIcon, MailIcon, RefreshCwIcon } from "lucide-react";
import { Card } from "../ui/card";
import { useState } from "react";
import { toast } from 'sonner';

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

  const handleConfirm = () => {
    setLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoading(false);
      onClose();
      onExportComplete();

      // Show notification if enabled
      if (notificationsEnabled) {
        toast.success("Data export started", {
          description: "Your data will be delivered to your email in 24-72 hours.",
          icon: <MailIcon size={16} />,
        });
        
        // Play sound if both notifications and sound are enabled
        if (soundEnabled && playSound) {
          playSound();
        }
      }
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
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
      <div className="p-6">
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
  );
} 