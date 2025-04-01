import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpFormValues, otpSchema } from "@/lib/validations/auth";
import { FormOTP } from "@/components/form-fields/FormOTP";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";

export default function VerifyOTP() {
  const appNavigate = useAppNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = (values: OtpFormValues) => {
    // Navigate to reset password page
    appNavigate("/reset-password");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.otp;
  };

  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes"
        description="Your virtual oasis of knowledge"
        subtitle="Verification"
        footer={
          <p className="text-center text-sm text-muted-foreground w-full">
            <AppLink 
              href="/forgot-password"
              className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              Didn't receive a code? Request again
            </AppLink>
          </p>
        }
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="mb-6">
          <p className="text-sm text-muted-foreground -mt-1 text-center select-none">
            We've sent a 6-digit verification code to your email.
            Enter the code below to continue.
          </p>
        </div>
        
        <AuthFormContainer
          form={form}
          onSubmit={onSubmit}
          isFormEmpty={isFormEmpty}
          unsavedMessage="You have unsaved changes in the OTP verification form. If you leave, your information will be lost."
          submitLabel="Verify Code"
        >
          <FormOTP
            form={form}
            name="otp"
            label=""
            maxLength={6}
          />
        </AuthFormContainer>
      </AuthCard>
    </AuthPageLayout>
  );
} 