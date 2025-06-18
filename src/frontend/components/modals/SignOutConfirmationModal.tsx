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
        <span>Disconnesso con Successo</span>
      </div>
    ),
    content: (
      <div className="space-y-6">
        {/* Success message */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
          <p className="text-sm text-green-800">
            Sei stato disconnesso con successo da <strong>{deviceName}</strong>. 
            {isCurrent ? " La tua sessione è stata terminata." : " La sessione remota è stata terminata."}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Dettagli:</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• {isCurrent ? "Dovrai effettuare nuovamente il login per continuare" : "L'utente dovrà effettuare nuovamente il login su quel dispositivo"}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    closeButtonText: "Fatto",
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
          <span>Conferma Disconnessione</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Annulla",
        disabled: loading
      }}
      actionButton={{
        text: "Disconnetti",
        onClick: handleConfirm,
        variant: "destructive",
        disabled: loading,
        loadingText: "Disconnessione...",
        icon: <LogOutIcon size={16} />
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
              Stai per disconnetterti da <strong>{deviceName}</strong>.
            </p>
          </div>

          {/* Next steps */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Dettagli:</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Dispositivo: {deviceName}</p>
                <p>• Tipo di sessione: {isCurrent ? "Dispositivo corrente" : "Dispositivo remoto"}</p>
                <p>• Impatto: {isCurrent ? "Sarai disconnesso immediatamente" : "La sessione remota sarà terminata"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
} 