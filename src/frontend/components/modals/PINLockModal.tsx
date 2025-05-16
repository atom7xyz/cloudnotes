import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import FormOTP from "../form-fields/FormOTP";
import type React from "react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import { LockIcon } from "lucide-react";

// Define the props for the PINLockModal component
export interface PINLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string | null;
  onSave: (pin: string | null) => void;
}

// PIN validation schema - with empty validation message
const pinDigitSchema = z.string().regex(/^\d{4}$/, { message: '' });

// Schema for verifying existing PIN
const verifyPinSchema = z.object({
  pin: pinDigitSchema,
});

// Schema for creating new PIN
const createPinSchema = z.object({
  pin: pinDigitSchema,
});

// Schema for confirming PIN matches
const confirmPinSchema = (createdPin: string) => 
  z.object({
    pin: pinDigitSchema
      .refine((val) => val === createdPin, {
        message: "PINs do not match. Please try again.",
      }),
  });

// Define the possible stages for the PIN lock process
type PINLockStage = "verify" | "create" | "confirm";

// Define the PINLockModal component
const PINLockModal: React.FC<PINLockModalProps> = ({
  isOpen,
  onClose,
  currentPin,
  onSave,
}) => {
  // Track the current stage of the PIN lock process
  const [stage, setStage] = useState<PINLockStage>(
    currentPin ? "verify" : "create"
  );
  
  // Store the created PIN temporarily for confirmation
  const [createdPin, setCreatedPin] = useState<string>("");

  // Flag to prevent auto-submission after going back from confirm
  const [preventAutoSubmit, setPreventAutoSubmit] = useState(false);

  // Form for verifying existing PIN
  const verifyForm = useForm({
    resolver: zodResolver(verifyPinSchema),
    mode: "onSubmit",
    defaultValues: {
      pin: "",
    },
  });

  // Form for creating new PIN
  const createForm = useForm({
    resolver: zodResolver(createPinSchema),
    mode: "onSubmit",
    defaultValues: {
      pin: "",
    },
  });

  // Form for confirming new PIN
  const confirmForm = useForm({
    resolver: zodResolver(confirmPinSchema(createdPin)),
    mode: "onSubmit",
    defaultValues: {
      pin: "",
    },
  });

  // Create refs for form OTP inputs
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  
  // Create refs for the submit buttons
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Get current PIN values for each form to check if they're complete
  const currentVerifyPin = verifyForm.watch('pin') || '';
  const isVerifyPinComplete = currentVerifyPin.length === 4;
  
  const currentCreatePin = createForm.watch('pin') || '';
  const isCreatePinComplete = currentCreatePin.length === 4;
  
  const currentConfirmPin = confirmForm.watch('pin') || '';
  const isConfirmPinComplete = currentConfirmPin.length === 4;

  // Helper to get whether the submit button should be disabled based on current stage
  const isSubmitDisabled = () => {
    switch (stage) {
      case "verify":
        return !isVerifyPinComplete;
      case "create":
        return !isCreatePinComplete;
      case "confirm":
        return !isConfirmPinComplete;
      default:
        return true;
    }
  };

  // Helper to get the active input ref based on current stage
  const getActiveInputRef = () => {
    switch (stage) {
      case "verify":
        return verifyInputRef;
      case "create":
        return createInputRef;
      case "confirm":
        return confirmInputRef;
      default:
        return createInputRef;
    }
  };

  // Focus the input when stage changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const activeRef = getActiveInputRef();
        if (activeRef.current) {
          // Use the focusInput method if available, otherwise use regular focus
          if ('focusInput' in activeRef.current) {
            // @ts-ignore - Using custom method
            activeRef.current.focusInput();
          } else {
            activeRef.current.focus();
          }
        }
      }, 100); // Small delay to ensure the modal is visible
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, stage]);

  // Reset forms when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset to correct initial stage
      setStage(currentPin ? "verify" : "create");
      // Clear the created PIN to prevent auto-advancing
      setCreatedPin("");
      // Reset all forms and clear errors
      verifyForm.reset({ pin: "" });
      verifyForm.clearErrors();
      createForm.reset({ pin: "" });
      createForm.clearErrors();
      confirmForm.reset({ pin: "" });
      confirmForm.clearErrors();
      // Reset the auto-submit prevention flag
      setPreventAutoSubmit(false);
    } else {
      // Reset all forms when modal closes
      verifyForm.reset({ pin: "" });
      verifyForm.clearErrors();
      createForm.reset({ pin: "" });
      createForm.clearErrors();
      confirmForm.reset({ pin: "" });
      confirmForm.clearErrors();
      setCreatedPin("");
      setPreventAutoSubmit(false);
    }
  }, [isOpen, currentPin]);

  // Update confirm form validation when createdPin changes
  useEffect(() => {
    if (stage === "confirm" && createdPin) {
      confirmForm.setValue("pin", "");
      confirmForm.clearErrors();
    }
  }, [createdPin, stage]);

  // Handle PIN verification submission
  const handleVerify = useCallback((data: { pin: string }) => {
    // Check if the entered PIN matches the current PIN
    if (data.pin === currentPin) {
      // Move to the create stage for changing PIN
      setStage("create");
      createForm.reset({ pin: "" });
      // Clear any previous createdPin value
      setCreatedPin("");
      // Reset the auto-submit prevention flag
      setPreventAutoSubmit(false);
    } else {
      // PIN doesn't match - show error
      verifyForm.setError("pin", {
        type: "manual",
        message: "Incorrect PIN. Please try again.",
      });
      
      // Clear the input for a new attempt and focus it
      setTimeout(() => {
        verifyForm.setValue("pin", "");
        if (verifyInputRef.current) {
          if ('focusInput' in verifyInputRef.current) {
            // @ts-ignore - Using custom method
            verifyInputRef.current.focusInput();
          } else {
            verifyInputRef.current.focus();
          }
        }
      }, 100);
    }
  }, [currentPin, verifyForm, createForm]);

  // Handle PIN creation submission
  const handleCreate = useCallback((data: { pin: string }) => {
    // Store the created PIN and move to the confirm stage
    setCreatedPin(data.pin);
    setStage("confirm");
  }, []);

  // Reset forms when going back from confirm to create stage
  const handleBackFromConfirm = () => {
    // Save the current PIN to use with the next stage
    const currentCreatePin = createForm.getValues().pin;
    // Store this PIN for later
    setCreatedPin(""); // Clear to avoid automatic advancing
    // Move back to create stage
    setStage("create");
    // Prevent auto-submission when going back
    setPreventAutoSubmit(true);
    // Preserve the PIN value in the form
    createForm.reset({ pin: currentCreatePin });
    createForm.clearErrors();
    confirmForm.clearErrors();
    
    // Focus the input after a short delay
    setTimeout(() => {
      if (createInputRef.current) {
        if ('focusInput' in createInputRef.current) {
          // @ts-ignore - Using custom method
          createInputRef.current.focusInput();
        } else {
          createInputRef.current.focus();
        }
      }
    }, 100);
  };

  // Handle PIN confirmation submission
  const handleConfirm = useCallback((data: { pin: string }) => {
    // If PINs match, save the new PIN
    if (data.pin === createdPin) {
      onSave(data.pin);
      onClose();
    } else {
      // PINs don't match - show error
      confirmForm.setError("pin", {
        type: "manual",
        message: "PINs do not match. Please try again.",
      });
      
      // Clear the input for a new attempt and focus it
      setTimeout(() => {
        confirmForm.setValue("pin", "");
        if (confirmInputRef.current) {
          if ('focusInput' in confirmInputRef.current) {
            // @ts-ignore - Using custom method
            confirmInputRef.current.focusInput();
          } else {
            confirmInputRef.current.focus();
          }
        }
      }, 100);
    }
  }, [createdPin, onSave, onClose, confirmForm]);

  // Handle form submission based on current stage
  const handleSubmit = () => {
    switch (stage) {
      case "verify":
        verifyForm.handleSubmit(handleVerify)();
        break;
      case "create":
        createForm.handleSubmit(handleCreate)();
        break;
      case "confirm":
        confirmForm.handleSubmit(handleConfirm)();
        break;
      default:
        break;
    }
  };

  // Define the title based on the current stage
  const title = () => {
    switch (stage) {
      case "verify":
        return "Enter your PIN";
      case "create":
        return currentPin ? "Create a new PIN" : "Create a PIN";
      case "confirm":
        return "Confirm your PIN";
      default:
        return "PIN Lock";
    }
  };

  // Define the description based on the current stage
  const description = () => {
    switch (stage) {
      case "verify":
        return "Please enter your PIN to continue";
      case "create":
        return "Create a new 4-digit PIN";
      case "confirm":
        return "Enter your PIN again to confirm";
      default:
        return "";
    }
  };

  // Define the submit button text based on the current stage
  const buttonText = () => {
    switch (stage) {
      case "verify":
        return "Continue";
      case "create":
        return "Continue";
      case "confirm":
        return "Confirm";
      default:
        return "Submit";
    }
  };

  // Handle keyboard events (e.g., pressing Enter to submit)
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (submitBtnRef.current) {
        submitBtnRef.current.click();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 select-none">
          <LockIcon size={18} />
          <span>PIN Lock</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="p-4 space-y-4 overflow-hidden" onKeyDown={handleKeyDown}>
        <div className="text-center space-y-2 select-none">
          <h3 className="text-lg font-semibold">{title()}</h3>
          <p className="text-sm text-muted-foreground">{description()}</p>
        </div>

        <div className="py-4 min-h-[120px]">
          {stage === "verify" && (
            <form onSubmit={(e) => {
              e.preventDefault();
              verifyForm.handleSubmit(handleVerify)();
            }}>
              <Form {...verifyForm}>
                <FormOTP 
                  form={verifyForm}
                  name="pin"
                  maxLength={4}
                  ref={verifyInputRef}
                  autoFocus={true}
                />
              </Form>
            </form>
          )}

          {stage === "create" && (
            <form onSubmit={(e) => {
              e.preventDefault();
              createForm.handleSubmit(handleCreate)();
            }}>
              <Form {...createForm}>
                <FormOTP 
                  form={createForm}
                  name="pin"
                  maxLength={4}
                  ref={createInputRef}
                  autoFocus={true}
                  preventAutoSubmit={preventAutoSubmit}
                />
              </Form>
            </form>
          )}

          {stage === "confirm" && (
            <form onSubmit={(e) => {
              e.preventDefault();
              confirmForm.handleSubmit(handleConfirm)();
            }}>
              <Form {...confirmForm}>
                <FormOTP 
                  form={confirmForm}
                  name="pin"
                  maxLength={4}
                  ref={confirmInputRef}
                  autoFocus={true}
                />
              </Form>
            </form>
          )}
        </div>

        <div className="flex justify-center items-center pt-2">
          {stage === "confirm" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackFromConfirm}
              className="w-1/3 mr-2 rounded-full cursor-pointer"
            >
              <span className="select-none">Back</span>
            </Button>
          )}
          
          <Button 
            type="button" 
            onClick={handleSubmit}
            className={`${stage === "confirm" ? "w-2/3" : "w-full"} rounded-full h-10 font-medium transition-all cursor-pointer`}
            ref={submitBtnRef}
            disabled={isSubmitDisabled()}
          >
            <span className="select-none">{buttonText()}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PINLockModal; 