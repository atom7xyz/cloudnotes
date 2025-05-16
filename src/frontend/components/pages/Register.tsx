import { useState } from "react";
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

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  
  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On success, navigate to login or verification page
      navigate('/login');
    } catch (error) {
      // Handle registration error
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            unsavedMessage="You have unsaved changes in the registration form. If you leave, your information will be lost."
            submitLabel="Register"
            disabled={!form.watch("acceptTerms")}
          >
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
              placeholder="bart.simpson@example.com"
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