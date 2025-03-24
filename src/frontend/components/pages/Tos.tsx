import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import cloudsBackground from "../../assets/clouds3.jpg";
import { PrinterIcon } from "lucide-react";

// Section type definition
interface TosSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

// Modal component for print preview
function PrintModal({ isOpen, onClose, sections }: { 
  isOpen: boolean; 
  onClose: () => void; 
  sections: TosSection[] 
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Print Preview</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button>
              <PrinterIcon className="size-4" />
              Print
            </Button>
          </div>
        </div>
        
        <div className="p-8 print:p-0">
          <div className="print:max-w-none mx-auto print:mx-0 mb-6">
            <h1 className="text-3xl font-bold mb-1">CloudNotes Terms of Service</h1>
            <p className="text-sm text-black mb-6">Last updated: May 10, 2024</p>
            
            {sections.map((section, index) => (
              <div key={section.id} className="mb-8">
                <h2 className="text-xl font-semibold mb-3">
                  {index + 1}. {section.title}
                </h2>
                <div className="text-black">
                  {section.content}
                </div>
                {index < sections.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tos() {
  // References for sections to enable smooth scrolling
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  
  // Active section tracking
  const [activeSection, setActiveSection] = useState<string>("introduction");
  
  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  // Last updated date
  const lastUpdated = "May 10, 2024";
  
  // Function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      
      // Update active section
      setActiveSection(sectionId);
      
      // Highlight the section content temporarily
      section.classList.add("bg-primary/5");
      setTimeout(() => {
        section.classList.remove("bg-primary/5");
      }, 1500);
    }
  };
  
  // Terms of Service sections
  const sections: TosSection[] = [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to CloudNotes. By accessing our service, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>
          <p>
            CloudNotes provides a platform for users to store, manage, and share their notes and files in a secure cloud environment.
            These terms govern your use of our website, applications, and services.
          </p>
        </div>
      ),
    },
    {
      id: "account",
      title: "Account Terms",
      content: (
        <div className="space-y-4">
          <p>
            You are responsible for maintaining the security of your account and password. The company cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
          </p>
          <p>
            You are responsible for all content posted and activity that occurs under your account. You may not use the Service for any illegal or unauthorized purpose.
          </p>
          <p>
            You must be a human. Accounts registered by "bots" or other automated methods are not permitted.
          </p>
        </div>
      ),
    },
    {
      id: "payment",
      title: "Payment Terms",
      content: (
        <div className="space-y-4">
          <p>
            The Service is offered with both free and paid subscription plans. By selecting a paid subscription, you agree to pay the monthly or annual subscription fees indicated for that service.
          </p>
          <p>
            Payments will be charged on the day you sign up for a paid subscription and will cover the use of that service for the period indicated. Subscription fees are not refundable.
          </p>
          <p>
            If we are unsuccessful in charging your payment method and have not received payment within 14 days, we may terminate your access to the paid services.
          </p>
        </div>
      ),
    },
    {
      id: "cancellation",
      title: "Cancellation and Termination",
      content: (
        <div className="space-y-4">
          <p>
            You are solely responsible for properly canceling your account. You can cancel your account at any time by going to account settings and clicking on the "Cancel Account" button.
          </p>
          <p>
            All of your content will be immediately deleted from the Service upon cancellation. This information cannot be recovered once it has been deleted.
          </p>
          <p>
            CloudNotes, in its sole discretion, has the right to suspend or terminate your account and refuse any and all current or future use of the Service for any reason at any time.
          </p>
        </div>
      ),
    },
    {
      id: "modifications",
      title: "Modifications to the Service",
      content: (
        <div className="space-y-4">
          <p>
            CloudNotes reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.
          </p>
          <p>
            CloudNotes shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
          </p>
        </div>
      ),
    },
    {
      id: "copyright",
      title: "Copyright and Content Ownership",
      content: (
        <div className="space-y-4">
          <p>
            We claim no intellectual property rights over the material you provide to the Service. Your materials uploaded remain yours.
          </p>
          <p>
            CloudNotes does not pre-screen content, but reserves the right (but not the obligation) in their sole discretion to refuse or remove any content that is available via the Service.
          </p>
          <p>
            The look and feel of the Service is copyright©CloudNotes. All rights reserved. You may not duplicate, copy, or reuse any portion of the HTML/CSS, JavaScript, or visual design elements or concepts without express written permission from CloudNotes.
          </p>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy and Data Protection",
      content: (
        <div className="space-y-4">
          <p>
            CloudNotes takes the privacy of its users seriously. Please refer to our Privacy Policy for information on how we collect, use, and disclose information from our users.
          </p>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.
          </p>
        </div>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer of Warranties",
      content: (
        <div className="space-y-4">
          <p>
            Your use of the service is at your sole risk. The service is provided on an "as is" and "as available" basis without any warranty or condition, express, implied or statutory.
          </p>
          <p>
            CloudNotes does not warrant that the service will be uninterrupted, timely, secure, or error-free. CloudNotes does not warrant that the results that may be obtained from the use of the service will be accurate or reliable.
          </p>
          <p>
            You understand that CloudNotes uses third-party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run the Service.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground">
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
      <div className="absolute inset-0 z-0 bg-black/15" aria-hidden="true" />
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm py-4">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold italic font-bigshot-one text-foreground">
            CloudNotes
          </h1>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Terms of Service</h2>
              <p className="text-sm text-black mt-1">Last updated: {lastUpdated}</p>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={() => setIsPrintModalOpen(true)}
              aria-label="Print Terms of Service"
            >
              <PrinterIcon className="size-5" />
            </Button>
          </div>
          
          {/* Flex container for sidebar and content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar navigation */}
            <aside className="lg:w-1/5 xl:w-3/10">
              <div className="lg:sticky lg:top-8">
                <nav className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4">
                  <h3 className="text-lg font-semibold mb-4 text-black">Navigation</h3>
                  <div className="space-y-1 custom-scrollbar">
                    {sections.map((section, index) => (
                      <div key={section.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <button
                          className={cn(
                            "tos-nav-link w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-start",
                            "hover:bg-primary/10 hover:text-primary",
                            activeSection === section.id 
                              ? "text-primary font-medium bg-primary/5" 
                              : "text-black"
                          )}
                          onClick={() => scrollToSection(section.id)}
                          data-section={section.id}
                          aria-current={activeSection === section.id ? "true" : "false"}
                        >
                          <span className="text-primary font-semibold min-w-6 mr-2">{index + 1}.</span>
                          <span>{section.title}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </nav>
              </div>
            </aside>
            
            {/* Main content */}
            <div className="lg:w-4/5 xl:w-5/6">
              <div className="prose prose-slate max-w-none">
                {sections.map((section, index) => (
                  <div key={section.id}>
                    <section 
                      id={section.id}
                      ref={(el) => {
                        sectionRefs.current[section.id] = el;
                      }}
                      className={cn(
                        "scroll-mt-24 transition-colors duration-500 rounded-lg p-4",
                        activeSection === section.id ? "bg-primary/[0.03]" : ""
                      )}
                      aria-labelledby={`heading-${section.id}`}
                    >
                      <h3 
                        id={`heading-${section.id}`}
                        className="text-xl font-semibold mb-4 text-black flex items-center"
                      >
                        <span className="inline-block mr-2 text-primary font-bold">{index + 1}.</span> {section.title}
                      </h3>
                      <div className="text-black leading-relaxed">
                        {section.content}
                      </div>
                    </section>
                    
                    {index < sections.length - 1 && (
                      <Separator className="my-8 md:my-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Print modal */}
      <PrintModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sections={sections}
      />
    </div>
  );
}
