import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { PasswordInput } from "@/components/form-fields/PasswordInput";
import { useState } from "react";

export default function ResetPassword() {
  const appNavigate = useAppNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
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
  const onSubmit = async (_values: ResetPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API request to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to success page
      appNavigate("/reset-password-success");
    } catch (error) {
      // Handle error if needed
      console.error('Failed to reset password:', error);
    } finally {
      setIsLoading(false);
    }
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
          submitLabel="Reset Password"
          loading={isLoading}
          loadingText="Resetting password..."
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