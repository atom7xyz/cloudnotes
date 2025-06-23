import { useAppNavigate } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/validations/auth";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

export default function ForgotPassword() {
  const appNavigate = useAppNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API request to send reset code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to verify OTP page
      appNavigate("/verify-otp");
    } catch (error) {
      // Handle error
      setError('Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        description="La tua oasi virtuale di conoscenza"
        subtitle="Password dimenticata"
        footer={
          <div className="flex justify-between w-full text-sm">
            <AppLink 
              href="/login"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <ArrowLeftIcon size={16} />
              Torna al login
            </AppLink>
          </div>
        }
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="mb-6">
          <p className="text-sm text-muted-foreground -mt-1 text-center select-none">
            Inserisci il tuo indirizzo email e ti invieremo un codice per reimpostare la password.
          </p>
        </div>
        
        <AuthFormContainer
          form={form}
          onSubmit={onSubmit}
          isFormEmpty={isFormEmpty}
          submitLabel="Invia codice di reset"
          loading={isLoading}
          loadingText="Invio codice di reset..."
        >
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="bart@simpson.tv"
            autoComplete="email"
            required
          />
        </AuthFormContainer>
      </AuthCard>
    </AuthPageLayout>
  );
} 