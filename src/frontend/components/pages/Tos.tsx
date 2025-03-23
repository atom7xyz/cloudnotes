import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export default function Tos() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold">CloudNotes - Terms of Service</h1>
          <p className="text-muted-foreground">Your virtual oasis of knowledge</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="text-muted-foreground mb-4">
            Welcome to CloudNotes. By using our service, you agree to these Terms of Service.
            Please read them carefully.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">2. Privacy</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use,
            and protect your information when you use our service.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-muted-foreground mb-4">
            You are responsible for maintaining the security of your account and password.
            CloudNotes cannot and will not be liable for any loss or damage from your failure
            to comply with this security obligation.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">4. Content</h2>
          <p className="text-muted-foreground mb-4">
            You retain ownership of any content that you upload to CloudNotes. By uploading
            content, you grant us a license to use it for providing the service.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">5. Termination</h2>
          <p className="text-muted-foreground mb-4">
            We may terminate or suspend your account at any time for any reason without notice.
          </p>
        </div>
        
        <div className="flex justify-center mt-8 space-x-4">
          <Button asChild variant="outline">
            <Link to="/register">Back to Registration</Link>
          </Button>
          <Button asChild>
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 