import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthCard } from "../auth/AuthCard";
import cloudsBackground from "../../assets/clouds3.jpg";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    // In a real implementation, this would send the new password to the server
    // For now, we'll just redirect to the success page
    navigate("/reset-password-success");
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
          subtitle="Set New Password"
          className="rounded-3xl border-none shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!passwordsMatch && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Passwords do not match. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password"
                name="password"
                type="password" 
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password" 
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-lg mt-4"
            >
              Reset Password
            </Button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
} 