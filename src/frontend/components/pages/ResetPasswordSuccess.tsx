import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function ResetPasswordSuccess() {
  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes"
        description="La tua oasi virtuale di conoscenza"
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center space-y-6 p-4">
          {/* Success animation and icon */}
          <div className="relative">
            {/* Outer glow and animation */}
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-slow" />
            
            {/* Ping animation */}
            <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
            
            {/* Main circle */}
            <div className="relative rounded-full bg-green-50 p-5 border-2 border-green-100 shadow-lg">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
          </div>
          
          {/* Success message */}
          <div className="text-center space-y-3 max-w-[320px] mx-auto">
            <h3 className="text-xl font-bold text-foreground select-none">La tua password è stata reimpostata</h3>
            <p className="text-sm text-muted-foreground select-none">
              Ora puoi accedere al tuo account con la nuova password.
            </p>
          </div>
          
          {/* Action button */}
          <div className="w-full pt-4">
            <Button 
              asChild
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground w-full py-2.5 font-medium transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <AppLink 
                href="/login"
                className="no-underline select-none flex items-center justify-center h-full"
              >
                Torna al login
              </AppLink>
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
} 