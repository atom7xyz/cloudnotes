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
          <span>Esporta i tuoi dati</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Annulla",
        disabled: loading
      }}
      actionButton={{
        text: "Esporta",
        onClick: handleConfirm,
        disabled: loading,
        loadingText: "Elaborazione..."
      }}
      isLoading={loading}
      showSuccess={exportSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Richiesta di esportazione inviata</span>
          </div>
        ),
        content: (
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
              <p className="text-sm text-green-800">
                La tua richiesta di esportazione è stata inviata con successo ed è ora in elaborazione. 
                Un link di download sicuro verrà inviato a <strong>{email}</strong>.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Dettagli:</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Tutte le tue note e documenti saranno inclusi</p>
                  <p>• Formato di esportazione: File ZIP con cartelle organizzate</p>
                  <p>• Tempo di elaborazione: 24-72 ore</p>
                  <p>• Il link di download scade dopo 7 giorni</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-green-300/50">
                Se non ricevi l'email entro 72 ore, contatta il supporto per assistenza.
              </div>
            </div>
          </div>
        ),
        closeButtonText: "Fatto",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-600"
      }}
    >
      <div className="p-8 select-none">
        <div className="space-y-6">
          {/* Description */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
            <p className="text-sm text-blue-800">
              I tuoi dati verranno preparati e inviati come file scaricabile a <strong>{email}</strong>. 
              Questo include tutte le tue note, documenti e impostazioni.
            </p>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Dettagli:</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Tutte le tue note e documenti saranno inclusi</p>
                <p>• Formato di esportazione: File ZIP con cartelle organizzate</p>
                <p>• Tempo di elaborazione: 24-72 ore</p>
                <p>• Il link di download scade dopo 7 giorni</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-blue-300/50">
              Riceverai una notifica via email quando l'esportazione sarà pronta per il download.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 