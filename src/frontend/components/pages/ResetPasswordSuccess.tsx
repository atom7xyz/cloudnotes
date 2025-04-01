import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";

export default function ResetPasswordSuccess() {
  return (
    <AuthPageLayout>
      <AuthCard 
        title="CloudNotes"
        description="Your virtual oasis of knowledge"
        className="rounded-3xl border-none shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center space-y-6 p-4">
          {/* Success animation and icon */}
          <div className="relative">
            {/* Outer glow and animation */}
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-slow"></div>
            
            {/* Ping animation */}
            <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping"></div>
            
            {/* Main circle */}
            <div className="relative rounded-full bg-green-50 p-5 border-2 border-green-100 shadow-lg">
              <CheckCircle className="h-14 w-14 text-green-600" />
            </div>
          </div>
          
          {/* Success message */}
          <div className="text-center space-y-3 max-w-[320px] mx-auto">
            <h3 className="text-xl font-bold text-foreground select-none">Your password has been reset</h3>
            <p className="text-sm text-muted-foreground select-none">
              You can now log in to your account with your new password.
            </p>
          </div>
          
          {/* Action button */}
          <div className="w-full pt-4">
            <Button 
              asChild
              className="rounded-full bg-[#071833] hover:bg-[#071833]/90 text-white w-full py-2 font-medium cursor-pointer"
            >
              <AppLink 
                href="/login"
                className="hover:no-underline select-none flex items-center justify-center"
              >
                Back to Login
              </AppLink>
            </Button>
          </div>
        </div>
      </AuthCard>
    </AuthPageLayout>
  );
} 