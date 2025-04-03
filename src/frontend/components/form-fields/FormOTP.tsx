import React, { useEffect, useRef, forwardRef, ForwardedRef, useState } from "react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";

// Simplified props without generics to avoid TypeScript errors
interface FormOTPProps {
  form: UseFormReturn<any>; // Accept any form type
  name: string; // Name of the form field
  label?: string; // Label for the field
  maxLength?: number; // Max length of the OTP (default: 6)
  className?: string; // Additional class names for the container
  disabled?: boolean; // Whether the field is disabled
  autoFocus?: boolean; // Whether to auto-focus the input when mounted
  preventAutoSubmit?: boolean; // Whether to prevent auto-submission
}

/**
 * A reusable form OTP input component that works with react-hook-form and shadcn/ui
 */
const FormOTP = forwardRef(function FormOTPComponent(
  props: FormOTPProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const {
    form,
    name,
    label,
    maxLength = 6,
    className = "",
    disabled = false,
    autoFocus = false,
    preventAutoSubmit = false,
  } = props;

  // Track if the input has just been reset to prevent immediate auto-submit
  const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
  
  // For PIN input (4 digits), we don't need separators
  const isPinInput = maxLength === 4;
  const internalRef = useRef<HTMLInputElement>(null);
  
  // Use the provided ref or fall back to internal ref
  const inputRef = ref || internalRef;
  
  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef && 'current' in inputRef && inputRef.current) {
      // Small delay to ensure the DOM is ready
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [autoFocus]);
  
  // Reset the form value when form state changes (e.g., form reset)
  useEffect(() => {
    const subscription = form.watch(() => {
      // This will run whenever any form field changes
      // Just to ensure we're in sync with form state
      
      // Check if the input was reset
      const value = form.getValues()[name] || "";
      if (value === "") {
        setWasRecentlyReset(true);
        // Clear the reset flag after a short delay
        setTimeout(() => {
          setWasRecentlyReset(false);
        }, 300);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, name]);

  // Effect to handle when maxLength is reached
  useEffect(() => {
    const value = form.watch(name) || "";
    if (value.length === maxLength) {
      // Submit the form if we're using an OTP/PIN with fixed length
      if (form.formState.isValid && !preventAutoSubmit && !wasRecentlyReset) {
        // Allow a small delay for validation to complete
        setTimeout(() => {
          if (form.formState.isValid && inputRef && 'current' in inputRef && inputRef.current) {
            const formElement = inputRef.current?.closest('form');
            if (formElement) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              formElement.dispatchEvent(submitEvent);
            }
          }
        }, 100);
      }
    }
  }, [form.watch(name), maxLength, form, name, inputRef, preventAutoSubmit, wasRecentlyReset]);

  // Method to programmatically focus the input
  const focusInput = () => {
    if (inputRef && 'current' in inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Expose the focus method via the ref
  useEffect(() => {
    if (typeof ref === 'object' && ref && 'current' in ref) {
      // Extend the ref with a focus method
      const originalRef = ref.current;
      
      if (originalRef) {
        // @ts-ignore - Adding custom property
        originalRef.focusInput = focusInput;
      }
    }
  }, [ref, focusInput]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && <FormLabel className="mb-1 select-none">{label}</FormLabel>}
          <FormControl>
            <InputOTP
              maxLength={maxLength}
              value={field.value || ""}
              onChange={value => {
                field.onChange(value);
                field.onBlur();
              }}
              disabled={disabled}
              containerClassName={cn(
                "justify-center gap-2",
                isPinInput && "gap-3" // More spacing between PIN digits
              )}
              ref={inputRef}
            >
              {isPinInput ? (
                // Special layout for PIN (4 digits) - no separators
                <InputOTPGroup>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <InputOTPSlot 
                      key={index}
                      index={index}
                      className="h-12 w-12 text-lg border-muted-foreground/40"
                    />
                  ))}
                </InputOTPGroup>
              ) : (
                // Default layout with separators (for 6-digit OTP)
                <InputOTPGroup>
                  {Array.from({ length: Math.ceil(maxLength / 3) }).map((_, groupIndex) => (
                    <React.Fragment key={groupIndex}>
                      <InputOTPGroup>
                        {Array.from({ length: 3 }).map((_, slotIndex) => {
                          const index = groupIndex * 3 + slotIndex;
                          return index < maxLength ? (
                            <InputOTPSlot 
                              key={index}
                              index={index}
                              className="h-12 w-12 text-lg border-muted-foreground/40"
                            />
                          ) : null;
                        })}
                      </InputOTPGroup>
                      {groupIndex < Math.ceil(maxLength / 3) - 1 && (
                        <InputOTPSeparator className="px-2" />
                      )}
                    </React.Fragment>
                  ))}
                </InputOTPGroup>
              )}
            </InputOTP>
          </FormControl>
          <FormMessage className="text-xs mt-16 text-center absolute w-full left-0" />
        </FormItem>
      )}
    />
  );
});

// Add displayName to the component
FormOTP.displayName = "FormOTP";

export default FormOTP;
export { FormOTP }; 