import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthCard } from "../auth/AuthCard";
import UnsavedChangesModal from "../modals/UnsavedChangesModal";
import cloudsBackground from "../../assets/clouds3.jpg";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { password, confirmPassword } = formData;
    
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    // Reset dirty state on submission
    setIsDirty(false);
    
    // Fake the process
    navigate("/reset-password-success");
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

  // Handle browser back button or navigation attempts
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
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
          subtitle="Set New Password"
          className="rounded-3xl border-none shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!passwordsMatch && (
              <Alert variant="destructive" className="mb-4 border-red-500">
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
                value={formData.password}
                onChange={handleInputChange}
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Reset Password
            </Button>
          </form>
        </AuthCard>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPath={targetPath}
        message="You haven't completed your password reset. If you leave now, you'll need to start over."
      />
    </div>
  );
} 