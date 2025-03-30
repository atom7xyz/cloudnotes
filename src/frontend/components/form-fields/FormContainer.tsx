import React, { ReactNode } from "react";
import { Form } from "@/components/ui/form";
import UnsavedChangesModal from "@/components/modals/UnsavedChangesModal";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useFormNavigation } from "@/lib/hooks/useFormNavigation";

interface FormContainerProps<TFieldValues extends FieldValues> {
  children: ReactNode;
  form: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  bypassPaths?: string[];
  isFormEmpty?: () => boolean;
  unsavedMessage?: string;
  className?: string;
}

/**
 * A container for forms that handles unsaved changes modals and navigation
 */
export function FormContainer<TFieldValues extends FieldValues>({
  children,
  form,
  onSubmit,
  bypassPaths = [],
  isFormEmpty,
  unsavedMessage,
  className = "",
}: FormContainerProps<TFieldValues>) {
  const {
    isDirty,
    isModalOpen,
    targetPath,
    confirmNavigation,
    cancelNavigation,
    unsavedMessage: defaultUnsavedMessage,
  } = useFormNavigation({
    bypassPaths,
    isFormEmpty,
    unsavedMessage,
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

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      </Form>

      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={cancelNavigation}
        targetPath={targetPath}
        message={unsavedMessage || defaultUnsavedMessage}
      />
    </>
  );
}

export default FormContainer; 