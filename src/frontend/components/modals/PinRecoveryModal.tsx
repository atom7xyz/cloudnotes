import { useState, useCallback } from 'react';
import { MailIcon, CheckCircleIcon } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Card } from '../ui/card';
import { toast } from 'sonner';

interface PinRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const PinRecoveryModal = ({
  isOpen,
  onClose,
  userEmail
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
      toast.success('Recovery email sent', {
        description: 'Please check your inbox for PIN reset instructions',
      });
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
          <span>PIN Recovery</span>
        </div>
      }
      maxWidth="max-w-md"
      cancelButton={{
        text: "Cancel",
        disabled: isLoading
      }}
      actionButton={{
        text: "Send Recovery Email",
        onClick: handleSendRecoveryEmail,
        disabled: isLoading,
        loadingText: "Sending..."
      }}
      isLoading={isLoading}
      showSuccess={showSuccess}
      onSuccessClose={handleSuccessClose}
      successConfig={{
        title: (
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Email Sent Successfully</span>
          </div>
        ),
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-center">Email Sent Successfully</h3>
              <p className="text-base text-center">
                A PIN recovery link has been sent to:
              </p>
              <p className="text-center font-medium">{obscuredEmail}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>What happens next?</strong> Please check your inbox and follow the instructions to reset your PIN.
                If you don't receive the email within a few minutes, please check your spam folder.
              </p>
            </div>
          </div>
        ),
        closeButtonText: "Done",
        iconBgColor: "bg-green-100",
        iconColor: "text-green-600"
      }}
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
              <h3 className="text-lg font-medium text-center">PIN Recovery Request</h3>
              <p className="text-base text-center">
                We'll send a PIN recovery link to your registered email:
              </p>
              <p className="text-center font-medium">{obscuredEmail}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                Click the "Send Recovery Email" button below to receive instructions for resetting your PIN.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default PinRecoveryModal; 