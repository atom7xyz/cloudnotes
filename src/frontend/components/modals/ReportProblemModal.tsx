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
          <span>Report a Problem</span>
        </div>
      }
      maxWidth="max-w-2xl"
      cancelButton={{
        text: "Cancel",
        disabled: isLoading
      }}
      actionButton={{
        text: "Send Report",
        onClick: handleReportProblem,
        disabled: !reportMessage.trim() || isLoading,
        loadingText: "Sending report...",
        icon: <SendIcon size={14} />
      }}
      isLoading={isLoading}
      showSuccess={showSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 text-lg font-medium select-none">
            <CheckCircleIcon size={18} className="text-green-600" />
            <span>Report Sent Successfully</span>
          </div>
        ),
        content: (
          <div className="space-y-6">
            {/* Success message */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-lg">
              <p className="text-sm text-green-800">
                Your report has been successfully sent to the document author 
                <strong> {document.author.firstName} {document.author.lastName}</strong>. 
                They will be notified about the issue you've identified.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>Details:</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• The author will receive a notification about your report</p>
                  <p>• They can review the issue and take appropriate action</p>
                  <p>• The document may be updated to fix the problem</p>
                </div>
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
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-lg">
            <p className="text-sm text-orange-800">
              Found an issue with this document? Let the author know so they can fix it. 
              Your report will be sent directly to <strong>{document.author.firstName} {document.author.lastName}</strong>.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="report-message" className="text-sm font-medium flex items-center gap-2">
                Describe the problem:
              </label>
              <Textarea
                ref={textareaRef}
                id="report-message"
                placeholder="Please describe the issue you found (e.g., broken links, formatting issues...)"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                disabled={isLoading}
                className="min-h-[140px] resize-none border-primary/20 focus:border-primary/40 bg-muted/20"
              />
              <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-orange-300/50">
                Be specific about the issue to help the author understand and fix the problem quickly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportProblemModal; 