import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterFormValues, registerSchema } from "@/lib/validations/auth";
import { FormInput } from "@/components/form-fields/FormInput";
import { FormCheckbox } from "@/components/form-fields/FormCheckbox";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { PasswordInput } from "@/components/form-fields/PasswordInput";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated, error, clearError } = useAuth();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
    mode: "onSubmit"
  });

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    const result = await register(values);
    
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
      console.log('Registration successful');
    } else {
      // Error is handled by the useAuth hook
      console.error('Registration failed:', result.message);
    }
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return (
      !values.firstName && 
      !values.lastName && 
      !values.email && 
      !values.password && 
      !values.confirmPassword && 
      !values.acceptTerms
    );
  };

  return (
    <AuthPageLayout>
      <div className="w-full max-w-lg">
        <AuthCard 
          title="CloudNotes" 
          description="Your virtual oasis of knowledge"
          subtitle="Register an Account"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              <AppLink href="/login">
                Already have an account? Login
              </AppLink>
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <AuthFormContainer
            form={form}
            onSubmit={onSubmit}
            bypassPaths={['/tos']}
            isFormEmpty={isFormEmpty}
            submitLabel="Register"
            disabled={!form.watch("acceptTerms")}
            loading={isLoading}
            loadingText="Creating account..."
          >
            {error && (
              <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
                {error.message}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name="firstName"
                label="First Name"
                placeholder="Bart"
                required
              />
              <FormInput
                form={form}
                name="lastName"
                label="Last Name"
                placeholder="Simpson"
                required
              />
            </div>
            
            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="bart@simpson.tv"
              autoComplete="email"
              required
            />
            
            <PasswordInput
              form={form}
              name="password"
              label="Password"
              autoComplete="new-password"
              required
            />
            
            <PasswordInput
              form={form}
              name="confirmPassword"
              label="Repeat Password"
              autoComplete="new-password"
              required
            />
            
            <FormCheckbox
              form={form}
              name="acceptTerms"
              label={
                <>
                  I've read and accept the{" "}
                  <AppLink href="/tos">
                    Terms of Service
                  </AppLink>
                </>
              }
            />
          </AuthFormContainer>
        </AuthCard>
      </div>
    </AuthPageLayout>
  );
} 