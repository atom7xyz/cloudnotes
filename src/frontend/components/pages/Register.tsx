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
import { useFormPersistence } from "@/lib/hooks/useFormPersistence";

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

  // Initialize form persistence hook
  const { saveFormData, clearFormData } = useFormPersistence({
    form,
    excludeFields: ['password', 'confirmPassword'], // Exclude passwords from persistence
    storageKey: 'register-form-data'
  });

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Custom handler for ToS link that saves form data
  const handleTosLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Save form data before navigating to ToS
    saveFormData();
    
    // Set a flag to indicate we're coming from register
    sessionStorage.setItem('register-form-data_from_tos', 'true');
    
    // Navigate to ToS
    navigate('/tos');
  };

  // Custom handler for login link that clears form data
  const handleLoginLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Clear any saved form data when going to login
    clearFormData();
    
    // Navigate to login
    navigate('/login');
  };
  
  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    const result = await register(values);
    
    if (result.success) {
      // Clear saved form data on successful registration
      clearFormData();
      
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
          description="La tua oasi virtuale di conoscenza"
          subtitle="Registra un account"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              <span 
                onClick={handleLoginLinkClick}
                className="font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer"
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleLoginLinkClick(e as any);
                  }
                }}
              >
                Hai già un account? Accedi
              </span>
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <AuthFormContainer
            form={form}
            onSubmit={onSubmit}
            bypassPaths={['/tos']}
            isFormEmpty={isFormEmpty}
            submitLabel="Registrati"
            disabled={!form.watch("acceptTerms")}
            loading={isLoading}
            loadingText="Creazione account..."
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
                label="Nome"
                placeholder="Bart"
                required
              />
              <FormInput
                form={form}
                name="lastName"
                label="Cognome"
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
              label="Ripeti password"
              autoComplete="new-password"
              required
            />
            
            <FormCheckbox
              form={form}
              name="acceptTerms"
              label={
                <>
                  Ho letto e accetto i{" "}
                  <span 
                    onClick={handleTosLinkClick}
                    className="font-medium text-primary underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer"
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleTosLinkClick(e as any);
                      }
                    }}
                  >
                    Termini di servizio
                  </span>
                </>
              }
            />
          </AuthFormContainer>
        </AuthCard>
      </div>
    </AuthPageLayout>
  );
} 