import { Input } from "@/components/ui/input";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import type { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>; // The form instance
  name: TName; // Name of the form field
  label?: string; // Label for the field
  placeholder?: string; // Placeholder text
  type?: string; // Input type (text, email, password, etc.)
  className?: string; // Additional class names for the input
  autoComplete?: string; // Autocomplete attribute
  required?: boolean; // Whether the field is required
  disabled?: boolean; // Whether the field is disabled
  description?: string; // Optional description text
}

/**
 * A reusable form input component that works with react-hook-form and shadcn/ui
 */
export function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  placeholder,
  type = "text",
  className = "",
  autoComplete,
  required = false,
  disabled = false,
  description
}: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label && <FormLabel className="select-none">{label}</FormLabel>}
          {description && (
            <p className="text-sm text-muted-foreground -mt-1 mb-1 select-none">{description}</p>
          )}
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className={cn("rounded-lg border-muted-foreground/40", className)}
              autoComplete={autoComplete}
              required={false}
              disabled={disabled}
              aria-required={required}
            />
          </FormControl>
          <FormMessage className="text-xs -mt-2 select-none" />
        </FormItem>
      )}
    />
  );
}

export default FormInput; 