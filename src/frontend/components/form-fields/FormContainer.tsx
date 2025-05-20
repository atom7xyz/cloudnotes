import React, { type ReactNode } from "react";
import { Form } from "@/components/ui/form";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useFormNavigation } from "@/lib/hooks/useFormNavigation";

interface FormContainerProps<TFieldValues extends FieldValues> {
  children: ReactNode;
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  bypassPaths?: string[];
  isFormEmpty?: () => boolean;
  className?: string;
  noValidate?: boolean;
}

export function FormContainer<TFieldValues extends FieldValues>({
  children,
  form,
  onSubmit,
  bypassPaths = [],
  isFormEmpty,
  className = "",
  noValidate = true,
}: FormContainerProps<TFieldValues>) {
  useFormNavigation({
    bypassPaths,
    isFormEmpty,
  });

  // Update the dirty state when the form state changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      // Only mark as dirty if there are actual changes
      if (form.formState.isDirty) {
        form.formState.isDirty;
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Custom form submission handler that prevents default behavior
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Trigger form validation and submission
    form.handleSubmit((data: TFieldValues) => {
      // At this point, if we have the data, the form is valid
      onSubmit(data);
    })(event);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className={className} noValidate={noValidate}>
          {children}
        </form>
      </Form>
    </>
  );
}

export default FormContainer; 