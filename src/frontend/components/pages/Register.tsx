import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterFormValues, registerSchema } from "@/lib/validations/auth";
import { FormContainer } from "@/components/form-fields/FormContainer";
import { FormInput } from "@/components/form-fields/FormInput";
import { FormCheckbox } from "@/components/form-fields/FormCheckbox";
import { AppLink } from "@/components/ui/app-link";

// Create a key for storing form data in localStorage
const FORM_STORAGE_KEY = "cloudnotes-register-form";

export default function Register() {
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
  const onSubmit = (values: RegisterFormValues) => {
    // Clear form data from localStorage on successful submission
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Fake the process
    console.log("Registration submitted", values);
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
      <div className="relative z-20 w-full max-w-lg">
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
          <FormContainer 
            form={form} 
            onSubmit={onSubmit}
            bypassPaths={['/tos']}
            isFormEmpty={isFormEmpty}
            unsavedMessage="You have unsaved changes in the registration form. If you leave, your information will be lost."
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                form={form}
                name="firstName"
                label="First Name"
                placeholder="John"
                required
              />
              <FormInput
                form={form}
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                required
              />
            </div>
            
            <FormInput
              form={form}
              name="email"
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              autoComplete="email"
              required
            />
            
            <FormInput
              form={form}
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
            />
            
            <FormInput
              form={form}
              name="confirmPassword"
              label="Repeat Password"
              type="password"
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
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer" 
              disabled={!form.watch("acceptTerms")}
              aria-disabled={!form.watch("acceptTerms")}
            >
              Register
            </Button>
          </FormContainer>
        </AuthCard>
      </div>
    </div>
  );
} 