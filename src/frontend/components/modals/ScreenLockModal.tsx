import { useRef, useState, useEffect, type FC } from 'react';
import { LockIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '../ui/form';
import { Button } from '../ui/button';
import FormOTP from '../form-fields/FormOTP';
import { Avatar } from '../ui/avatar';
import { useAppLock } from '@/lib/contexts/AppLockContext';
import { cn } from '@/lib/utils';
import PinRecoveryModal from './PinRecoveryModal';

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

  // Get user's email (in a real app, this would come from user data)
  const userEmail = 'bart@simpson.tv';

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

      {/* PIN Recovery Modal */}
      <PinRecoveryModal
        isOpen={showForgotPinModal}
        onClose={() => setShowForgotPinModal(false)}
        userEmail={userEmail}
      />
    </>
  );
};

export default ScreenLockModal; 