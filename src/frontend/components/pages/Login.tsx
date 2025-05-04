import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { PasswordInput } from "@/components/form-fields/PasswordInput";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: "onSubmit"
  });
  
  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success, navigate to dashboard
      navigate('/');
    } catch (error) {
      // Handle login error
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.email && !values.password;
  };

  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes" 
        description="Your virtual oasis of knowledge"
        subtitle="Login to Your Account"
        footer={
          <p className="text-center text-sm text-muted-foreground w-full">
            <AppLink href="/register">
              Don't have an account? Register
            </AppLink>
          </p>
        }
        className="rounded-3xl border-none shadow-2xl"
      >
        <AuthFormContainer
          form={form}
          onSubmit={onSubmit}
          bypassPaths={['/forgot-password']}
          isFormEmpty={isFormEmpty}
          unsavedMessage="You have unsaved changes in the login form. If you leave, your information will be lost."
          submitLabel="Login"
        >
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="example@example.com"
            autoComplete="email"
            required
          />
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none">
                Password
              </label>
              <AppLink 
                href="/forgot-password" 
                className="text-sm select-none"
              >
                Forgot password?
              </AppLink>
            </div>
            <PasswordInput
              form={form}
              name="password"
              autoComplete="current-password"
              required
            />
          </div>
        </AuthFormContainer>
      </AuthCard>
    </AuthPageLayout>
  );
} 