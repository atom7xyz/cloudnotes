import { Button } from "@/components/ui/button";
import { FormContainer } from "@/components/form-fields/FormContainer";
import type { ReactNode } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

interface AuthFormContainerProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  isFormEmpty?: () => boolean;
  unsavedMessage?: string;
  bypassPaths?: string[];
  submitLabel: string;
  children: ReactNode;
  disabled?: boolean;
}

/**
 * A standardized container for auth forms with consistent styling
 */
export function AuthFormContainer<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  isFormEmpty,
  unsavedMessage,
  bypassPaths = [],
  submitLabel,
  children,
  disabled = false
}: AuthFormContainerProps<TFieldValues>) {
  return (
    <FormContainer
      form={form}
      onSubmit={onSubmit}
      isFormEmpty={isFormEmpty}
      unsavedMessage={unsavedMessage}
      bypassPaths={bypassPaths}
      className="space-y-4"
    >
      {children}

      <Button
        type="submit"
        className="w-full rounded-full mt-4 cursor-pointer select-none"
        disabled={disabled}
      >
        {submitLabel}
      </Button>
    </FormContainer>
  );
}

export default AuthFormContainer; 