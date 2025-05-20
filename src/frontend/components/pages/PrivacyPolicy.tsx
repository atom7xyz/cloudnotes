import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import cloudsBackground from "../../assets/clouds3.jpg";
import { PrinterIcon } from "lucide-react";
import PrintModal from "../modals/PrintModal";
import { AppLink } from "@/components/ui/app-link";

// Section type definition
interface PrivacySection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicy() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const lastUpdated = "May 15, 2024";
  
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      
      // Clear any existing highlights first
      for (const ref of Object.values(sectionRefs.current)) {
        if (ref) {
          ref.classList.remove("bg-primary/[0.06]");
        }
      }
      
      // Set new active section and highlight
      setActiveSection(sectionId);
      section.classList.add("bg-primary/[0.06]");
      
      // Clear highlight and active section after 2 seconds
      setTimeout(() => {
        if (section) {
          section.classList.remove("bg-primary/[0.06]");
          setActiveSection("");
        }
      }, 2000);
    }
  };
  
  const sections: PrivacySection[] = [
    {
      id: "introduction",
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <p>
            At CloudNotes LLC ("we," "us," "our"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </p>
          <p>
            We operate the website <strong>cloudnotes.com</strong> (the "Site"), as well as any other related products and services that refer or link to this privacy policy (collectively, the "Services").
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with our policies and practices, please do not use our Services. By accessing or using our Services, you agree to this privacy policy.
          </p>
          <p>
            You can contact us with questions or concerns about our privacy practices by email at <AppLink href="mailto:privacy@cloudnotes.com" external>privacy@cloudnotes.com</AppLink>, by phone at <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>, or by mail at Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125, Italy.
          </p>
        </div>
      ),
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      content: (
        <div className="space-y-4">
          <p>
            We collect several types of information from and about users of our Services, including:
          </p>
          <h3><strong>Personal Data</strong></h3>
          <p>
            We may collect personal information that you voluntarily provide when using our Services, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact information (such as name, email address, phone number)</li>
            <li>Account credentials (such as usernames and passwords)</li>
            <li>Profile information (such as profile pictures and educational background)</li>
            <li>Content you upload to our Services (such as notes, documents, and comments)</li>
            <li>Payment information when you make purchases (processed by our payment providers)</li>
            <li>Feedback and correspondence (such as support requests or survey responses)</li>
          </ul>
          
          <h3><strong>Automatically Collected Information</strong></h3>
          <p>
            When you use our Services, we may automatically collect certain information about your device and how you interact with our Services:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Device information (such as IP address, browser type, operating system)</li>
            <li>Usage data (such as pages visited, features used, time spent on the site)</li>
            <li>Location data (such as general geographic location based on IP address)</li>
            <li>Cookies and similar tracking technologies (as described in our Cookie Policy)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      content: (
        <div className="space-y-4">
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Providing, maintaining, and improving our Services</li>
            <li>Creating and managing your account</li>
            <li>Processing transactions and sending related information</li>
            <li>Responding to your requests and providing customer support</li>
            <li>Sending administrative messages, updates, and security alerts</li>
            <li>Sending promotional communications if you have opted in to receive them</li>
            <li>Personalizing your experience with our Services</li>
            <li>Analyzing usage patterns to improve our Services</li>
            <li>Protecting our Services and users from fraudulent, harmful, or illegal activity</li>
            <li>Complying with legal obligations</li>
          </ul>
          
          <p>
            We process your personal information only when we have a valid legal basis to do so, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your consent</li>
            <li>Performance of a contract with you</li>
            <li>Compliance with a legal obligation</li>
            <li>Protection of your vital interests or those of another person</li>
            <li>Our legitimate interests (which we balance against your rights and interests)</li>
          </ul>
        </div>
      ),
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      content: (
        <div className="space-y-4">
          <p>
            We may share your information in the following situations:
          </p>
          <h3><strong>Third-Party Service Providers</strong></h3>
          <p>
            We may share your information with third-party vendors, service providers, contractors, or agents who perform services on our behalf, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cloud hosting and infrastructure providers</li>
            <li>Payment processors</li>
            <li>Analytics providers</li>
            <li>Customer support services</li>
            <li>Email service providers</li>
          </ul>
          <p>
            These third parties are only permitted to use your personal information to provide services to us and are required to maintain the confidentiality and security of your information.
          </p>
          
          <h3><strong>Business Transfers</strong></h3>
          <p>
            If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or use of your personal information.
          </p>
          
          <h3><strong>Legal Requirements</strong></h3>
          <p>
            We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
          </p>
          
          <h3><strong>Protection of Rights</strong></h3>
          <p>
            We may disclose your information when we believe disclosure is necessary to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Protect our rights, property, or safety</li>
            <li>Protect the rights, property, or safety of our users or others</li>
            <li>Investigate fraud, security, or technical issues</li>
            <li>Enforce our terms of service</li>
          </ul>
          
          <h3><strong>With Your Consent</strong></h3>
          <p>
            We may share your information with third parties when you have given us your consent to do so.
          </p>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "Data Security",
      content: (
        <div className="space-y-4">
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
          <p>
            We limit access to your personal information to employees, agents, contractors, and other third parties who have a business need to know. They are subject to confidentiality obligations and may only process your personal information on our instructions.
          </p>
          <p>
            In the event of a data breach that affects your personal information, we will notify you and the relevant authorities as required by applicable law.
          </p>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      content: (
        <div className="space-y-4">
          <p>
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access:</strong> You may request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You may request that we correct any incomplete or inaccurate information we hold about you.</li>
            <li><strong>Deletion:</strong> You may request that we delete your personal information in certain circumstances.</li>
            <li><strong>Restriction:</strong> You may request that we restrict the processing of your personal information in certain circumstances.</li>
            <li><strong>Portability:</strong> You may request to receive a copy of your personal information in a structured, commonly used, and machine-readable format.</li>
            <li><strong>Objection:</strong> You may object to the processing of your personal information in certain circumstances.</li>
            <li><strong>Withdraw Consent:</strong> If we rely on your consent to process your personal information, you have the right to withdraw that consent at any time.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the contact information provided at the beginning of this policy. We may need to verify your identity before responding to your request.
          </p>
          <p>
            Please note that some of these rights may be limited or not applicable in certain jurisdictions or under certain circumstances.
          </p>
        </div>
      ),
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      content: (
        <div className="space-y-4">
          <p>
            We may store and process your information in the European Union and other countries where we or our service providers operate. These countries may have data protection laws that are different from those in your country.
          </p>
          <p>
            When we transfer your personal information to countries outside the European Economic Area (EEA), we ensure that appropriate safeguards are in place to protect your information, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Transferring to countries that have been recognized as providing an adequate level of legal protection</li>
            <li>Implementing standard contractual clauses approved by the European Commission</li>
            <li>Using other legally approved transfer mechanisms</li>
          </ul>
        </div>
      ),
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      content: (
        <div className="space-y-4">
          <p>
            Our Services are not directed to children under 16 years of age. We do not knowingly collect personal information from children under 16. If we learn that we have collected personal information from a child under 16 without parental consent, we will take steps to delete that information as soon as possible.
          </p>
          <p>
            If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us so that we can take appropriate action.
          </p>
        </div>
      ),
    },
    {
      id: "policy-changes",
      title: "Changes to This Privacy Policy",
      content: (
        <div className="space-y-4">
          <p>
            We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new privacy policy on this page and updating the "Last Updated" date.
          </p>
          <p>
            We encourage you to review this privacy policy periodically for any changes. Your continued use of our Services after any changes to this privacy policy constitutes your acceptance of the updated policy.
          </p>
        </div>
      ),
    },
    {
      id: "contact-us",
      title: "Contact Us",
      content: (
        <div className="space-y-4">
          <p>
            If you have any questions or concerns about this privacy policy or our privacy practices, please contact us at:
          </p>
          <div className="contact-info select-none">
            <p>CloudNotes LLC</p>
            <p>Pescheria del Porto di Cagliari</p>
            <p>Cagliari, Cagliari 09125</p>
            <p>Italy</p>
            <p>
              Phone: <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>
            </p>
            <p>
              Email: <AppLink href="mailto:privacy@cloudnotes.com" external>privacy@cloudnotes.com</AppLink>
            </p>
          </div>
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
      
      {/* Main content */}
      <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold select-none">Privacy Policy</h2>
              <p className="text-sm text-black mt-1 select-none">Last updated: {lastUpdated}</p>
            </div>
            <Button 
              className="h-9 px-3 rounded-full bg-background text-foreground gap-1.5 shadow-sm border hover:bg-primary/5 hover:border-primary/20 transition-colors"
              onClick={() => setIsPrintModalOpen(true)}
            >
              <PrinterIcon className="size-4" />
              Print
            </Button>
          </div>
          
          {/* Flex container for sidebar and content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar navigation */}
            <aside className="lg:w-1/5 xl:w-3/10">
              <div className="lg:sticky lg:top-8">
                <nav className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 select-none">
                  <h3 className="text-lg font-semibold mb-4 text-black">Navigation</h3>
                  <div className="space-y-1 custom-scrollbar">
                    {sections.map((section, index) => (
                      <div key={section.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <button
                          type="button"
                          className={cn(
                            "tos-nav-link w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-start",
                            "hover:bg-primary/5 hover:border-primary/20 hover:text-primary cursor-pointer",
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
                        activeSection === section.id ? "bg-primary/[0.06]" : ""
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
        title="Privacy Policy"
        lastUpdated={lastUpdated}
      />
    </div>
  );
} 