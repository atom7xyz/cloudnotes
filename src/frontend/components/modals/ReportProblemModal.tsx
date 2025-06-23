import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AlertTriangleIcon,
  SendIcon,
  CheckCircleIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Textarea } from '../ui/textarea';
import type { MockDocument } from '../../lib/mocking/mocked';
import { mockService } from '../../lib/mocking/mockedData';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: MockDocument | null;
}

const ReportProblemModal = ({
  isOpen,
  onClose,
  document
}: ReportProblemModalProps) => {
  const [reportMessage, setReportMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea when modal opens
  useEffect(() => {
    if (isOpen && !isLoading && !showSuccess) {
      // Use a small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, showSuccess]);

  // Handle report problem submission with loading animation
  const handleReportProblem = useCallback(() => {
    if (!reportMessage.trim() || !document) return;

    setIsLoading(true);
    
    // Simulate API call with loading delay
    setTimeout(() => {
      // Add the report to the mock service
      const reportData = {
        content: reportMessage.trim(),
        timestamp: new Date(),
        status: 'pending' as const
      };
      
      mockService.addReport(reportData, 'current-user', document.id);
      
      setIsLoading(false);
      setShowSuccess(true);
    }, 2000); // 2 second loading simulation
  }, [reportMessage, document]);

  // Handle modal close and reset form
  const handleClose = useCallback(() => {
    setReportMessage('');
    setIsLoading(false);
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  // Handle success modal close
  const handleSuccessClose = useCallback(() => {
    setReportMessage('');
    setIsLoading(false);
    setShowSuccess(false);
    onClose();
  }, [onClose]);

  if (!document) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium select-none">
          <AlertTriangleIcon size={18} className="text-orange-500" />
          <span>Segnala un problema</span>
        </div>
      }
      maxWidth="max-w-2xl"
      cancelButton={{
        text: "Annulla",
        disabled: isLoading
      }}
      actionButton={{
                  text: "Invia segnalazione",
        onClick: handleReportProblem,
        disabled: !reportMessage.trim() || isLoading,
        loadingText: "Invio segnalazione...",
        icon: <SendIcon size={16} />
      }}
      isLoading={isLoading}
      showSuccess={showSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 text-lg font-medium select-none">
            <CheckCircleIcon size={18} className="text-green-600" />
            <span>Segnalazione inviata con successo</span>
          </div>
        ),
        content: (
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
              <p className="text-sm text-green-800">
                La tua segnalazione è stata inviata con successo all'autore del documento 
                <strong> {document.author.firstName} {document.author.lastName}</strong>. 
                Sarà notificato riguardo al problema che hai identificato.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Dettagli:</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• L'autore riceverà una notifica riguardo alla tua segnalazione</p>
                  <p>• Potrà esaminare il problema e prendere le misure appropriate</p>
                  <p>• Il documento potrebbe essere aggiornato per risolvere il problema</p>
                </div>
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
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-lg">
            <p className="text-sm text-orange-800">
              Hai trovato un problema con questo documento? Fallo sapere all'autore così può risolverlo. 
              La tua segnalazione sarà inviata direttamente a <strong>{document.author.firstName} {document.author.lastName}</strong>.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="report-message" className="text-sm font-medium flex items-center gap-2">
                Descrivi il problema:
              </label>
              <Textarea
                ref={textareaRef}
                id="report-message"
                placeholder="Descrivi il problema che hai trovato (es. link non funzionanti, problemi di formattazione...)"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                disabled={isLoading}
                className="min-h-[140px] resize-none border-primary/20 focus:border-primary/40 bg-muted/20"
              />
              <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-orange-300/50">
                Sii specifico riguardo al problema per aiutare l'autore a comprendere e risolvere rapidamente il problema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportProblemModal; 