import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type OtpFormValues, otpSchema } from "@/lib/validations/auth";
import { FormOTP } from "@/components/form-fields/FormOTP";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

export default function VerifyOTP() {
  const appNavigate = useAppNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = async (_values: OtpFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API request to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to reset password page
      appNavigate("/reset-password");
    } catch (error) {
      // Handle error if needed
      console.error('Failed to verify OTP:', error);
    } finally {
      setIsLoading(false);
    }
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
              className="flex items-center justify-left gap-1 font-medium text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <ArrowLeftIcon size={16} />
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
          submitLabel="Verify Code"
          loading={isLoading}
          loadingText="Verifying code..."
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