import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send an OTP to the user's email
    // For now, we'll just redirect to the OTP verification page
    navigate("/verify-otp");
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
          subtitle="Reset Your Password"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              <Link to="/login" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                Remember your password? Login
              </Link>
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground">
              Enter your email address below and we'll send you a 6-digit verification code to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@example.com" 
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-lg mt-4"
            >
              Send Verification Code
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
} 