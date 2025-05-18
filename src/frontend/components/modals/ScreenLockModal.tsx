import { useRef, useState, useEffect, type FC } from 'react';
import { LockIcon, MailIcon, RefreshCwIcon, CheckCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { Button } from '../ui/button';
import FormOTP from '../form-fields/FormOTP';
import { Avatar } from '../ui/avatar';
import { useAppLock } from '@/lib/contexts/AppLockContext';
import { Modal } from '../ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// PIN validation schema - completely hiding validation messages
const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, { message: '' }).or(z.string().length(0)),
});

type PinFormValues = z.infer<typeof pinSchema>;

const ScreenLockModal: FC = () => {
  const { isLocked, unlockApp } = useAppLock();
  const [attempts, setAttempts] = useState(0);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);
  
  const form = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema),
    mode: 'onSubmit',
    defaultValues: {
      pin: '',
    },
  });

  // Watch for pin changes to clear error message when user starts typing
  useEffect(() => {
    const subscription = form.watch((value) => {
      // If the pin input changes and there's an error, clear it
      if (value.pin && form.formState.errors.pin) {
        form.clearErrors('pin');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset the recovery modal state when closed
  const handleCloseRecoveryModal = () => {
    setShowForgotPinModal(false);
    // Reset the recovery state after a delay to avoid visual glitches
    setTimeout(() => {
      setRecoveryEmailSent(false);
    }, 300);
  };

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

  // Get user's email (in a real app, this would come from user data)
  const userEmail = 'bart@simpson.tv';
  const obscuredEmail = getObscuredEmail(userEmail);

  // Handle sending recovery email
  const handleSendRecoveryEmail = () => {
    setLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      setLoading(false);
      setRecoveryEmailSent(true);
      
      // Show a toast notification
      toast.success('Recovery email sent', {
        description: 'Please check your inbox for PIN reset instructions',
      });
    }, 2000);
  };

  // Focus the input when the modal is shown
  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        if (pinInputRef.current) {
          if ('focusInput' in pinInputRef.current) {
            // @ts-ignore - Custom method on the FormOTP component
            pinInputRef.current.focusInput();
          } else {
            pinInputRef.current.focus();
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  // Reset form and error when modal is closed
  useEffect(() => {
    if (!isLocked) {
      form.reset({ pin: '' });
      form.clearErrors();
      setAttempts(0);
    }
  }, [isLocked, form]);

  const handleUnlock = (data: PinFormValues) => {
    const success = unlockApp(data.pin);
    
    if (success) {
      form.reset({ pin: '' });
      form.clearErrors();
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      form.setError("pin", {
        type: "manual",
        message: "Incorrect PIN. Please try again.",
      });
      form.setValue('pin', '');
      
      // Refocus the input after showing error
      setTimeout(() => {
        if (pinInputRef.current) {
          if ('focusInput' in pinInputRef.current) {
            // @ts-ignore - Custom method
            pinInputRef.current.focusInput();
          } else {
            pinInputRef.current.focus();
          }
        }
      }, 100);
    }
  };

  if (!isLocked) return null;

  // Get current PIN value
  const currentPinValue = form.watch('pin') || '';
  const isPinComplete = currentPinValue.length === 4;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md p-6 rounded-xl bg-card border shadow-lg">
          <div className="space-y-6">
            {/* Lock icon and header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LockIcon size={36} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold select-none">Screen Locked</h2>
                <p className="text-muted-foreground mt-1 select-none">Enter your PIN to unlock</p>
              </div>
            </div>

            {/* User avatar */}
            <div className="flex justify-center">
              <Avatar className="h-16 w-16">
                <img src="https://github.com/shadcn.png" alt="User Avatar" />
              </Avatar>
            </div>

            {/* PIN entry form */}
            <form onSubmit={form.handleSubmit(handleUnlock)}>
              <Form {...form}>
                <div className="space-y-4">
                  <FormOTP
                    form={form}
                    name="pin"
                    maxLength={4}
                    ref={pinInputRef}
                    autoFocus={true}
                  />

                  <Button 
                    type="submit" 
                    className="w-full rounded-full h-10 font-medium mt-2 cursor-pointer"
                    disabled={!isPinComplete}
                  >
                    <span className="select-none">Unlock</span>
                  </Button>
                </div>
              </Form>
            </form>

            {/* Forgot PIN link */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowForgotPinModal(true)}
                className={cn(
                  "font-medium text-sm text-primary hover:underline",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer"
                )}
              >
                Forgot your PIN?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot PIN Request Modal */}
      <Modal
        isOpen={showForgotPinModal && !recoveryEmailSent}
        onClose={handleCloseRecoveryModal}
        title={
          <div className="flex items-center gap-2 select-none">
            <MailIcon size={20} />
            <span>PIN Recovery</span>
          </div>
        }
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={handleCloseRecoveryModal}
              className="rounded-full cursor-pointer"
              disabled={loading}
            >
              <span className="select-none">Cancel</span>
            </Button>
            <Button 
              onClick={handleSendRecoveryEmail}
              className="rounded-full cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-1">
                    <RefreshCwIcon size={14} />
                  </span>
                  <span className="select-none">Processing...</span>
                </>
              ) : (
                <span className="select-none">Send Recovery Email</span>
              )}
            </Button>
          </div>
        }
      >
        <div className="p-6 select-none">
          <div className="p-6 space-y-6 bg-muted/50 rounded-lg">
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
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                Click the "Send Recovery Email" button below to receive instructions for resetting your PIN.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Email Sent Success Modal */}
      <Modal
        isOpen={showForgotPinModal && recoveryEmailSent}
        onClose={handleCloseRecoveryModal}
        title={
          <div className="flex items-center gap-2 select-none">
            <CheckCircleIcon size={20} className="text-green-600" />
            <span>Email Sent Successfully</span>
          </div>
        }
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end">
            <Button 
              onClick={handleCloseRecoveryModal}
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
              <h3 className="text-lg font-medium text-center">Email Sent Successfully</h3>
              <p className="text-base text-center">
                A PIN recovery link has been sent to:
              </p>
              <p className="text-center font-medium">{obscuredEmail}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700 text-center">
                Please check your inbox and follow the instructions to reset your PIN.
                If you don't receive the email within a few minutes, please check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ScreenLockModal; 