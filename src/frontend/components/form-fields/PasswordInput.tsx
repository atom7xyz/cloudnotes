import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>; // The form instance
  name: TName; // Name of the form field
  label?: string; // Label for the field
  placeholder?: string; // Placeholder text
  className?: string; // Additional class names for the input
  autoComplete?: string; // Autocomplete attribute
  required?: boolean; // Whether the field is required
  disabled?: boolean; // Whether the field is disabled
  description?: string; // Optional description text
}

/**
 * A password input component with visibility toggle
 * Works with react-hook-form and shadcn/ui
 */
export function PasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  placeholder,
  className = "",
  autoComplete,
  required = false,
  disabled = false,
  description
}: PasswordInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1">
          {label && <FormLabel className="select-none">{label}</FormLabel>}
          {description && (
            <p className="text-sm text-muted-foreground -mt-2 mb-0 select-none">{description}</p>
          )}
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={cn("rounded-lg border-muted-foreground/40 pr-10", className)}
                autoComplete={autoComplete}
                required={false}
                disabled={disabled}
                aria-required={required}
              />
            </FormControl>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{showPassword ? "Hide password" : "Show password"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormMessage className="text-xs -mt-2 select-none" />
        </FormItem>
      )}
    />
  );
}

export default PasswordInput; 