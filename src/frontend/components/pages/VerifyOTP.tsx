import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { AuthCard } from "../auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../ui/input-otp";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }
    
    // In a real implementation, this would verify the OTP with the server
    // For now, we'll just redirect to the reset password page
    // We could pass the verified token in the URL in a real app
    navigate("/reset-password");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
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
          subtitle="Verify Your Identity"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              <Link to="/forgot-password" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                Didn't receive a code? Request again
              </Link>
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit verification code to your email.
              Enter the code below to continue.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP 
                maxLength={6}
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  setError(null);
                }}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="rounded-md w-12 h-12 border-foreground/50" />
                  <InputOTPSlot index={1} className="rounded-md w-12 h-12 border-foreground/50" />
                  <InputOTPSlot index={2} className="rounded-md w-12 h-12 border-foreground/50" />
                </InputOTPGroup>
                <InputOTPSeparator className="px-2" />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="rounded-md w-12 h-12 border-foreground/50" />
                  <InputOTPSlot index={4} className="rounded-md w-12 h-12 border-foreground/50" />
                  <InputOTPSlot index={5} className="rounded-md w-12 h-12 border-foreground/50" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-lg mt-4"
              disabled={otp.length !== 6}
            >
              Verify & Continue
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
} 