import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>; // The form instance
  name: TName; // Name of the form field
  label: React.ReactNode; // Label for the checkbox (can include JSX)
  className?: string; // Additional class names for the container
  disabled?: boolean; // Whether the field is disabled
  labelClassName?: string; // Additional class names for the label
}

/**
 * A reusable form checkbox component that works with react-hook-form and shadcn/ui
 */
export function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  className = "",
  disabled = false,
  labelClassName = "",
}: FormCheckboxProps<TFieldValues, TName>) {
  // Function to toggle the checkbox value
  const toggleCheckbox = (newValue?: boolean) => {
    if (!disabled) {
      const value = newValue !== undefined ? newValue : !form.getValues(name);
      form.setValue(name, value as any, { shouldDirty: true });
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-center", className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="border-muted-foreground/40 cursor-pointer"
              id={field.name}
            />
          </FormControl>
          <div className="grid gap-1">
            <label
              htmlFor={field.name}
              className={cn(
                "text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer",
                !field.value && "text-muted-foreground",
                labelClassName
              )}
            >
              {label}
            </label>
            <FormMessage className="text-xs" />
          </div>
        </FormItem>
      )}
    />
  );
}

export default FormCheckbox; 