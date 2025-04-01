import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/validations/auth";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";

export default function ForgotPassword() {
  const appNavigate = useAppNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = (values: ForgotPasswordFormValues) => {
    // Navigate to verify OTP page
    console.log("Forgot password submitted", values);
    appNavigate("/verify-otp");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.email;
  };

  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes"
        description="Your virtual oasis of knowledge"
        subtitle="Forgot Password"
        footer={
          <div className="flex justify-between w-full text-sm">
            <AppLink 
              href="/login"
            >
              Back to Login
            </AppLink>
          </div>
        }
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="mb-6">
          <p className="text-sm text-muted-foreground -mt-1 text-center select-none">
            Enter your email address and we'll send you a code to reset your password.
          </p>
        </div>
        
        <AuthFormContainer
          form={form}
          onSubmit={onSubmit}
          isFormEmpty={isFormEmpty}
          unsavedMessage="You have unsaved changes in the forgot password form. If you leave, your information will be lost."
          submitLabel="Send Reset Code"
        >
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
            autoComplete="email"
            required
          />
        </AuthFormContainer>
      </AuthCard>
    </AuthPageLayout>
  );
} 