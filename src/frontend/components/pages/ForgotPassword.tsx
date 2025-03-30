import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAppNavigate } from "@/lib/navigation";
import cloudsBackground from "../../assets/clouds3.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/validations/auth";
import { FormContainer } from "@/components/form-fields/FormContainer";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";

// Create a key for storing form data in localStorage
const FORM_STORAGE_KEY = "cloudnotes-forgot-password-form";

export default function ForgotPassword() {
  const appNavigate = useAppNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
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
    const subscription = form.watch((values) => {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Handle form submission
  const onSubmit = (values: ForgotPasswordFormValues) => {
    // Clear form data from localStorage on successful submission
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Navigate to verify OTP page
    appNavigate("/verify-otp");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.email;
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
          <FormContainer 
            form={form} 
            onSubmit={onSubmit}
            isFormEmpty={isFormEmpty}
            unsavedMessage="You have unsaved changes in the forgot password form. If you leave, your information will be lost."
            className="space-y-4"
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
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Send Reset Code
            </Button>
          </FormContainer>
        </AuthCard>
      </div>
    </div>
  );
} 