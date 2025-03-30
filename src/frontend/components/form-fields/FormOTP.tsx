import React from "react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from "@/components/ui/input-otp";

interface FormOTPProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>; // The form instance
  name: TName; // Name of the form field
  label?: string; // Label for the field
  maxLength?: number; // Max length of the OTP (default: 6)
  className?: string; // Additional class names for the container
  disabled?: boolean; // Whether the field is disabled
}

/**
 * A reusable form OTP input component that works with react-hook-form and shadcn/ui
 */
export function FormOTP<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  maxLength = 6,
  className = "",
  disabled = false,
}: FormOTPProps<TFieldValues, TName>) {
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
              onChange={value => field.onChange(value)}
              disabled={disabled}
              containerClassName="justify-center gap-2"
            >
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
            </InputOTP>
          </FormControl>
          <FormMessage className="text-xs mt-1 text-center" />
        </FormItem>
      )}
    />
  );
}

export default FormOTP; 