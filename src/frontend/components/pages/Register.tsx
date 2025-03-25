import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { AuthCard } from "../auth/AuthCard";

import cloudsBackground from "../../assets/clouds3.jpg";

export default function Register() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fake the process
    console.log("Registration submitted");
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
          subtitle="Register an Account"
          footer={
            <p className="text-center text-sm text-muted-foreground w-full">
              <Link to="/login" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
              Already have an account? Login
              </Link>
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
                <Link to="/tos" className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                  Terms of Service
                </Link>
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
    </div>
  );
} 