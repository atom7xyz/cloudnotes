import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { AuthCard } from "../auth/AuthCard";
import UnsavedChangesModal from "../modals/UnsavedChangesModal";

import cloudsBackground from "../../assets/clouds3.jpg";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    console.log("Registration submitted", formData);
  };

  // Handle navigation away with Link component
  const handleNavigateClick = (path: string) => {
    if (isDirty || acceptedTerms) {
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
          subtitle="Register an Account"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              {isDirty ? (
                <span 
                  className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
                  onClick={() => handleNavigateClick('/login')}
                >
                  Already have an account? Login
                </span>
              ) : (
                <Link to="/login" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                  Already have an account? Login
                </Link>
              )}
            </p>
          }
          className="rounded-3xl border-none shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John" 
                  required 
                  className="rounded-lg border-foreground/50" 
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe" 
                  required 
                  className="rounded-lg border-foreground/50" 
                  aria-required="true"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email" 
                placeholder="john.doe@example.com" 
                required 
                className="rounded-lg border-foreground/50" 
                aria-required="true"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                type="password" 
                required 
                className="rounded-lg border-foreground/50" 
                aria-required="true"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Repeat Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                type="password" 
                required 
                className="rounded-lg border-foreground/50" 
                aria-required="true"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => {
                  setAcceptedTerms(checked as boolean);
                  setIsDirty(true);
                }}
                className="border-foreground/50 cursor-pointer"
              />
              <label
                htmlFor="terms"
                className={cn(
                  "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                  !acceptedTerms && "text-muted-foreground"
                )}
              >
                I've read and accept the{" "}
                {isDirty ? (
                  <span
                    className="font-medium text-primary hover:underline focus:outline-none cursor-pointer"
                    onClick={() => handleNavigateClick('/tos')}
                  >
                    Terms of Service
                  </span>
                ) : (
                  <Link to="/tos" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                    Terms of Service
                  </Link>
                )}
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full mt-4 cursor-pointer" 
              disabled={!acceptedTerms}
              aria-disabled={!acceptedTerms}
            >
              Register
            </Button>
          </form>
        </AuthCard>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetPath={targetPath}
        message="You have unsaved changes in the registration form. If you leave, your information will be lost."
      />
    </div>
  );
} 