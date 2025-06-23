import { useState, useCallback } from 'react';
import { MailIcon, CheckCircleIcon } from 'lucide-react';
import { Modal } from '../ui/modal';
import { toast } from 'sonner';
import { playSound } from '@/lib/utils/sound';

interface PinRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const PinRecoveryModal = ({
  isOpen,
  onClose,
  userEmail,
}: PinRecoveryModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Function to obscure email for privacy
  const getObscuredEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email; // In case email format is invalid
    
    // Obscure the username part, showing first 2 and last 2 characters
    let obscuredUsername = '';
    if (username.length <= 4) {
      // For very short usernames, just show first character and last character
      obscuredUsername = `${username.charAt(0)}**${username.charAt(username.length - 1)}`;
    } else {
      // For longer usernames, show first 2 and last 2 characters
      obscuredUsername = `${username.substring(0, 2)}${new Array(username.length - 4).fill('*').join('')}${username.substring(username.length - 2)}`;
    }
    
    // Keep the domain part visible
    return `${obscuredUsername}@${domain}`;
  };

  const obscuredEmail = getObscuredEmail(userEmail);

  // Handle sending recovery email with loading animation
  const handleSendRecoveryEmail = useCallback(() => {
    setIsLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      
      // Show a toast notification
      toast.success('Email di recupero inviata', {
        description: 'Controlla la tua casella di posta per le istruzioni per reimpostare il tuo PIN',
      });

      playSound();
    }, 2000);
  }, []);

  // Handle modal close and reset form
  const handleClose = useCallback(() => {
    setIsLoading(false);
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  // Handle success modal close
  const handleSuccessClose = useCallback(() => {
    setIsLoading(false);
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 select-none">
          <MailIcon size={20} />
          <span>Recupero PIN</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Annulla",
        disabled: isLoading
      }}
      actionButton={{
        text: "Invia Email di Recupero",
        onClick: handleSendRecoveryEmail,
        disabled: isLoading,
        loadingText: "Invio in corso..."
      }}
      isLoading={isLoading}
      showSuccess={showSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Email Inviata con Successo</span>
          </div>
        ),
        content: (
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
              <p className="text-sm text-green-800">
                Un link di recupero PIN è stato inviato con successo a <strong>{obscuredEmail}</strong>. 
                Controlla la tua casella di posta e segui le istruzioni per reimpostare il tuo PIN.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Dettagli:</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Segui le istruzioni nell'email per reimpostare il tuo PIN</p>
                    <p>• Il link è valido per le prossime 24 ore</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-blue-300/50">
                Se non ricevi l'email entro pochi minuti, controlla la cartella spam o prova a inviare un'altra email di recupero.
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
              Hai dimenticato il tuo PIN? Invieremo un link di recupero sicuro al tuo indirizzo email registrato 
              così potrai reimpostarlo in sicurezza.
            </p>
          </div>

          {/* Information */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Dettagli:</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Indirizzo email: {obscuredEmail}</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-blue-300/50">
              Invieremo un link sicuro al tuo indirizzo email registrato per reimpostare il tuo PIN. 
              Assicurati di controllare la cartella spam se non lo vedi nella posta in arrivo.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PinRecoveryModal; 