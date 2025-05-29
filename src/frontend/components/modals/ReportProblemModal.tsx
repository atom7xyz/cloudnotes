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
      title="Report a Problem"
      maxWidth="max-w-2xl"
    >
      <div className="p-8 select-none">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangleIcon size={24} className="text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold">Report a Problem</h2>
              <p className="text-sm text-muted-foreground">
                Document: "{document.title}"
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
            <p className="text-sm text-muted-foreground">
              Found an issue with this document? Let the author know so they can fix it. 
              Your report will be sent directly to <strong>{document.author.firstName} {document.author.lastName}</strong>.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="report-message" className="text-sm font-medium">
                Describe the problem:
              </label>
              <Textarea
                id="report-message"
                placeholder="Please describe the issue you found (e.g., broken links, incorrect information, formatting problems, accessibility issues, etc.)"
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="min-h-[120px] resize-none border-primary/20 focus:border-primary/40"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about the issue to help the author understand and fix the problem.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="hover-primary-effect"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReportProblem}
                disabled={!reportMessage.trim()}
                className="gap-2 hover-primary-effect"
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