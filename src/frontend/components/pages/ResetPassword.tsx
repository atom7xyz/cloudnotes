import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { PasswordInput } from "@/components/form-fields/PasswordInput";

export default function ResetPassword() {
  const appNavigate = useAppNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = (_values: ResetPasswordFormValues) => {
    // Navigate to success page
    appNavigate("/reset-password-success");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.password && !values.confirmPassword;
  };

  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes"
        description="Your virtual oasis of knowledge"
        subtitle="Reset Password"
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="mb-6">
          <p className="text-sm text-muted-foreground -mt-1 text-center select-none">
            Create a new password for your account. Make sure it's secure and different from your previous password.
          </p>
        </div>
        
        <AuthFormContainer
          form={form}
          onSubmit={onSubmit}
          isFormEmpty={isFormEmpty}
          unsavedMessage="You have unsaved changes in the password reset form. If you leave, your information will be lost."
          submitLabel="Reset Password"
        >
          <PasswordInput
            form={form}
            name="password"
            label="New Password"
            autoComplete="new-password"
            required
            description="Password must be at least 8 characters"
          />
          
          <PasswordInput
            form={form}
            name="confirmPassword"
            label="Confirm New Password"
            autoComplete="new-password"
            required
          />
        </AuthFormContainer>
      </AuthCard>
    </AuthPageLayout>
  );
} 