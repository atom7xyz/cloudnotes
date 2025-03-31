import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { FormContainer } from "@/components/form-fields/FormContainer";
import { FormInput } from "@/components/form-fields/FormInput";
import { AppLink } from "@/components/ui/app-link";

export default function Login() {
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
  const onSubmit = (values: LoginFormValues) => {
    // Fake the process
    console.log("Login submitted", values);
  };
  
  // Check if form is empty
  const isFormEmpty = () => {
    const values = form.getValues();
    return !values.email && !values.password;
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
          <FormContainer 
            form={form} 
            onSubmit={onSubmit}
            bypassPaths={['/forgot-password']}
            isFormEmpty={isFormEmpty}
            unsavedMessage="You have unsaved changes in the login form. If you leave, your information will be lost."
            className="space-y-4"
            noValidate
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
            
            <div className="space-y-2 relative">
              <div className="flex items-center justify-between mb-1">
                <label 
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none ${form.formState.errors.password ? 'text-destructive' : ''}`} 
                  htmlFor="password"
                >
                  Password
                </label>
                <AppLink 
                  href="/forgot-password" 
                  className="text-sm"
                >
                  Forgot password?
                </AppLink>
              </div>
              <FormInput
                form={form}
                name="password"
                type="password"
                autoComplete="current-password"
                label=""
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Login
            </Button>
          </FormContainer>
        </AuthCard>
      </div>
    </div>
  );
} 