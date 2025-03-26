import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { AuthCard } from "../auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";
import { CheckCircle2 } from "lucide-react";

export default function ResetPasswordSuccess() {
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
          subtitle="Password Reset Successfully"
          className="rounded-3xl border-none shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center space-y-5 text-center p-4">
            <div className="rounded-full bg-green-500/10 p-3 text-green-700 relative">
              <CheckCircle2 className="h-10 w-10" />
              <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ping"></span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Success!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <div className="pt-4 w-full flex flex-col items-center space-y-4">
              <Button 
                asChild
                className="rounded-full bg-[#071833] hover:bg-[#071833]/90 text-white px-8 py-2 font-medium cursor-pointer"
              >
                <Link to="/login">
                  Go to Login
                </Link>
              </Button>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  );
} 