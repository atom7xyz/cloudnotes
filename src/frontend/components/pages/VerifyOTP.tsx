import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAppNavigate } from "@/lib/navigation";
import cloudsBackground from "../../assets/clouds3.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OtpFormValues, otpSchema } from "@/lib/validations/auth";
import { FormContainer } from "@/components/form-fields/FormContainer";
import { FormOTP } from "@/components/form-fields/FormOTP";
import { AppLink } from "@/components/ui/app-link";

// Create a key for storing form data in localStorage
const FORM_STORAGE_KEY = "cloudnotes-otp-form";

export default function VerifyOTP() {
  const appNavigate = useAppNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  // Load saved form values from localStorage
  useEffect(() => {
    const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        form.reset(parsedForm);
      } catch (error) {
        // If parsing fails, clear the localStorage
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
  }, [form]);
  
  // Save form values to localStorage whenever they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Handle form submission
  const onSubmit = (values: OtpFormValues) => {
    // Clear form data from localStorage on successful submission
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Navigate to reset password page
    appNavigate("/reset-password");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.otp;
  };

  return (
    <div className="relative h-[calc(100vh-3rem)] flex items-center justify-center p-4">
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${cloudsBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      
      {/* Gray overlay */}
      <div className="absolute inset-0 z-10 bg-black/15" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-20 w-full max-w-md">
        <AuthCard 
          title="CloudNotes"
          description="Your virtual oasis of knowledge"
          subtitle="Verify OTP"
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
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit verification code to your email.
              Enter the code below to continue.
            </p>
          </div>
          
          <FormContainer 
            form={form} 
            onSubmit={onSubmit}
            isFormEmpty={isFormEmpty}
            unsavedMessage="You have unsaved changes in the OTP verification form. If you leave, your information will be lost."
            className="space-y-4"
          >
            <FormOTP
              form={form}
              name="otp"
              label="Verification Code"
              maxLength={6}
            />
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Verify Code
            </Button>
          </FormContainer>
        </AuthCard>
      </div>
    </div>
  );
} 