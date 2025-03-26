import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../auth/AuthCard";
import UnsavedChangesModal from "../modals/UnsavedChangesModal";
import cloudsBackground from "../../assets/clouds3.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Reset dirty state on submission
    setIsDirty(false);
    
    // Fake the process
    console.log("Login submitted", formData);
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
          subtitle="Login to Your Account"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              {isDirty ? (
                <span 
                  className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
                  onClick={() => handleNavigateClick('/register')}
                >
                  Don't have an account? Register
                </span>
              ) : (
                <Link 
                  to="/register" 
                  className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                >
                  Don't have an account? Register
                </Link>
              )}
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@example.com" 
                className="rounded-lg border-foreground/50"
                aria-required="true"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isDirty ? (
                  <span 
                    className="text-sm text-primary hover:underline focus:outline-none cursor-pointer"
                    onClick={() => handleNavigateClick('/forgot-password')}
                  >
                    Forgot password?
                  </span>
                ) : (
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
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
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer"
            >
              Login
            </Button>
          </form>
        </AuthCard>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPath={targetPath}
        message="You have unsaved changes in the login form. If you leave, your information will be lost."
      />
    </div>
  );
} 