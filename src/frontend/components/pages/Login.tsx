import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { PasswordInput } from "@/components/form-fields/PasswordInput";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, error, clearError } = useAuth();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: "onSubmit"
  });

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    const result = await login(values);
    
    if (result.success) {
      // Add a small delay to ensure all components update their auth state
      // before navigation occurs
      setTimeout(() => {
        navigate('/home');
        // Force a page refresh to ensure all components are reinitialized
        setTimeout(() => {
          window.location.reload();
        }, 50);
      }, 100);
      console.log('Login successful');
    } else {
      // Error is handled by the useAuth hook
      console.error('Login failed:', result.message);
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
          submitLabel="Login"
          loading={isLoading}
          loadingText="Signing in..."
        >
          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
              {error.message}
            </div>
          )}
          
          <FormInput
            form={form}
            name="email"
            label="Email"
            type="email"
            placeholder="bart@simpson.tv"
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