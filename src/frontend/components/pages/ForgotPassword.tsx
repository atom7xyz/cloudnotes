import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../auth/AuthCard";
import UnsavedChangesModal from "../modals/UnsavedChangesModal";
import cloudsBackground from "../../assets/clouds3.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsDirty(e.target.value !== '');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Reset dirty state on submission
    setIsDirty(false);
    
    // Fake the process
    navigate("/verify-otp");
  };

  // Handle navigation away with Link component
  const handleNavigateClick = (path: string) => {
    if (isDirty) {
      setTargetPath(path);
      setIsModalOpen(true);
      return false;
    }
    return true;
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
          subtitle="Reset Your Password"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              {isDirty ? (
                <span 
                  className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
                  onClick={() => handleNavigateClick('/login')}
                >
                  Remember your password? Login
                </span>
              ) : (
                <Link to="/login" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                  Remember your password? Login
                </Link>
              )}
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
                value={email}
                onChange={handleInputChange}
                placeholder="example@example.com" 
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Send Verification Code
            </Button>
          </form>
        </AuthCard>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPath={targetPath}
        message="You have started the password reset process. If you leave now, your progress will be lost."
      />
    </div>
  );
} 