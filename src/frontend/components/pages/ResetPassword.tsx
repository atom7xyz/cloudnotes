import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAppNavigate } from "@/lib/navigation";
import cloudsBackground from "../../assets/clouds3.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordFormValues, resetPasswordSchema } from "@/lib/validations/auth";
import { FormContainer } from "@/components/form-fields/FormContainer";
import { FormInput } from "@/components/form-fields/FormInput";

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
  const onSubmit = (values: ResetPasswordFormValues) => {
    // Navigate to success page
    appNavigate("/reset-password-success");
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.password && !values.confirmPassword;
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
          subtitle="Reset Password"
          className="rounded-3xl border-none shadow-2xl"
        >
          <FormContainer 
            form={form} 
            onSubmit={onSubmit}
            isFormEmpty={isFormEmpty}
            unsavedMessage="You have unsaved changes in the password reset form. If you leave, your information will be lost."
            className="space-y-4"
          >
            <FormInput
              form={form}
              name="password"
              label="New Password"
              type="password"
              autoComplete="new-password"
              required
            />
            
            <FormInput
              form={form}
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              required
            />
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Reset Password
            </Button>
          </FormContainer>
        </AuthCard>
      </div>
    </div>
  );
} 