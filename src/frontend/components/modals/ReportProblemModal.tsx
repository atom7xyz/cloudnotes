import { useState, useCallback } from 'react';
import {
  AlertTriangleIcon,
  SendIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';

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

  // Handle report problem submission
  const handleReportProblem = useCallback(() => {
    if (!reportMessage.trim()) return;

    toast.success("Report sent", {
      description: "Your report has been sent to the document author",
      icon: <AlertTriangleIcon size={16} />,
    });
    
    setReportMessage('');
    onClose();
  }, [reportMessage, onClose]);

  // Handle modal close and reset form
  const handleClose = useCallback(() => {
    setReportMessage('');
    onClose();
  }, [onClose]);

  if (!document) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium select-none">
          <AlertTriangleIcon size={18} />
          <span>Report a Problem</span>
        </div>
      }
      maxWidth="max-w-2xl"
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
                <AlertTriangleIcon size={14} className="text-orange-500" />
                Describe the problem:
              </label>
              <Textarea
                id="report-message"
                placeholder="Please describe the issue you found (e.g., broken links, formatting problems...)"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="min-h-[140px] resize-none border-primary/20 focus:border-primary/40 bg-muted/20"
              />
              <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md border-l-4 border-orange-300/50">
                Be specific about the issue to help the author understand and fix the problem quickly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-muted/20">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="hover-primary-effect rounded-full cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReportProblem}
                disabled={!reportMessage.trim()}
                className="gap-2 rounded-full cursor-pointer shadow-md"
              >
                <SendIcon size={14} />
                Send Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportProblemModal; 