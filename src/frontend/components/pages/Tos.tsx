import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import cloudsBackground from "../../assets/clouds3.jpg";
import { PrinterIcon } from "lucide-react";
import PrintModal from "../modals/PrintModal";
import { AppLink } from "@/components/ui/app-link";

// Section type definition
interface TosSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function Tos() {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  
  const lastUpdated = "May 10, 2024";
  
  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      
      // Clear any existing highlights first
      Object.values(sectionRefs.current).forEach(ref => {
        if (ref) {
          ref.classList.remove("bg-primary/[0.06]");
        }
      });
      
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
  
  const sections: TosSection[] = [
    {
      id: "legal-terms",
      title: "Agreement to Our Legal Terms",
      content: (
        <div className="space-y-4">
          <p>
            We are CloudNotes LLC ("Company," "we," "us," "our"), a company registered in Italy at Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125.
          </p>
          <p>
            We operate the website <strong>cloudnotes.com</strong> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
          </p>
          <p>
            This application aims to help students of all ages find their own study methods using various integrated technological tools.
          </p>
          <p>
            You can contact us by phone at <AppLink href="tel:+39000000000" external>+39 000 000 000</AppLink>, email at <AppLink href="mailto:contact@cloudnotes.com" external>contact@cloudnotes.com</AppLink>, or by mail to Pescheria del Porto di Cagliari, Cagliari, Cagliari 09125, Italy.
          </p>
          <p>
            These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and CloudNotes LLC, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms.{" "}
            <strong>
              IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </strong>
          </p>
          <p>
            Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby explicitly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms from time to time. We will alert you about any changes by updating the "Last updated" date, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. Your continued use of the Services after any such changes have been posted will signify your acceptance of the revised Legal Terms.
          </p>
          <p>
            All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, a parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms before using the Services.
          </p>
          <p>We recommend that you print a copy of these Legal Terms for your records.</p>
        </div>
      ),
    },
    {
      id: "our-services",
      title: "Our Services",
      content: (
        <div className="space-y-4">
          <p>
            The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to registration requirements. Those who access the Services from other locations do so at their own initiative and are solely responsible for compliance with local laws.
          </p>
          <p>
            The Services are not tailored to comply with specific industry regulations (such as HIPAA or FISMA); if your interactions must meet such standards, you may not use the Services. Additionally, you may not use the Services in a manner that would violate the Gramm-Leach-Bliley Act (GLBA).
          </p>
        </div>
      ),
    },
    {
      id: "intellectual-property-rights",
      title: "Intellectual Property Rights",
      content: (
        <div className="space-y-4">
          <h3><strong>Our Intellectual Property</strong></h3>
          <p>
            We are the owner or licensee of all intellectual property rights in the Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics (collectively, the "Content"), as well the trademarks, service marks, and logos (the "Marks").
          </p>
          <p>
            Our Content and Marks are protected by copyright, trademark, and other intellectual property laws and treaties worldwide.
          </p>
          <p>
            The Content and Marks are provided "AS IS" for your personal, non-commercial use or internal business purposes only.
          </p>
          <h3><strong>Your Use of Our Services</strong></h3>
          <p>
            Subject to your compliance with these Legal Terms (including the "Prohibited Activities" section below), we grant you a non-exclusive, non-transferable, revocable license to:
          </p>
          <ol className="pl-4">
            <li>- Access the Services;</li>
            <li>- Download or print a copy of any portion of the Content that you have legally accessed.</li>
          </ol>
          <p>
            This license is solely for your personal, non-commercial use. Any other use of the Services, Content, or Marks without our explicit written permission is prohibited.
          </p>
          <p>
            If you wish to use the Services, Content, or Marks in any other way, please contact us at <a href="mailto:contact@cloudnotes.com">contact@cloudnotes.com</a>.
          </p>
          <p>
            We reserve all rights not expressly granted herein. Any breach of these Intellectual Property Rights will constitute a material breach of these Legal Terms and result in immediate termination of your right to use the Services.
          </p>
        </div>
      ),
    },
    {
      id: "user-representations",
      title: "User Representations",
      content: (
        <div className="space-y-4">
          <p>By using the Services, you represent and warrant that:</p>
          <ol className="pl-4">
            <li>- All registration information will be true, accurate, current, and complete;</li>
            <li>- You will maintain and update this information as necessary;</li>
            <li>- You have the legal capacity to enter into these Legal Terms;</li>
            <li>- You are not a minor, or if you are, you have obtained parental permission;</li>
            <li>- You will not use automated means (like bots or scripts) to access the Services;</li>
            <li>- You will not use the Services for any illegal or unauthorized purpose; and</li>
            <li>- Your use of the Services complies with all applicable laws and regulations.</li>
          </ol>
          <p>
            If any information is untrue or incomplete, we reserve the right to suspend or terminate your account.
          </p>
        </div>
      ),
    },
    {
      id: "prohibited-activities",
      title: "Prohibited Activities",
      content: (
        <div className="space-y-4">
          <p>
            You may only use the Services for their intended purpose. The Services may not be used for any commercial endeavors unless expressly approved by us.
          </p>
          <p>
            You may not:
          </p>
          <ol>
            <li>- Systematically retrieve data to create a database or directory without our written permission;</li>
            <li>- Trick, defraud, or mislead us or other users (for example, by trying to obtain sensitive account information);</li>
            <li>- Circumvent, disable, or interfere with security features of the Services;</li>
            <li>- Disparage, tarnish, or harm the Services or CloudNotes LLC;</li>
            <li>- Use information from the Services to harass, abuse, or harm anyone;</li>
            <li>- Misuse our support services or submit false abuse reports;</li>
            <li>- Use the Services in violation of any applicable law or regulation;</li>
            <li>- Engage in unauthorized framing or linking to the Services;</li>
            <li>- Upload or transmit viruses, Trojan horses, or malicious materials that disrupt the Services;</li>
            <li>- Use automated tools (such as bots or scrapers) to access the Services;</li>
            <li>- Remove or alter any copyright or proprietary notices from the Content;</li>
            <li>- Impersonate another user or use someone else's username;</li>
            <li>- Upload materials that serve as hidden data collection mechanisms (e.g., web bugs or cookies);</li>
            <li>- Interfere with, disrupt, or impose an undue burden on the Services;</li>
            <li>- Harass, intimidate, or threaten any of our employees or agents;</li>
            <li>- Attempt to bypass access restrictions on any portion of the Services;</li>
            <li>- Copy or adapt our software (including Flash, PHP, HTML, or JavaScript) without permission;</li>
            <li>- Reverse engineer, decompile, or disassemble any part of the Services, except as permitted by law;</li>
            <li>- Deploy automated systems to access the Services without authorization;</li>
            <li>- Use purchasing agents to make transactions on the Services;</li>
            <li>- Collect users' personal data for unsolicited emails or create accounts under false pretenses;</li>
            <li>- Use the Services to compete with us or for revenue-generating enterprises;</li>
            <li>- Sell or transfer your profile data;</li>
            <li>- Use the Services to advertise or offer goods and services.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "term-and-termination",
      title: "Term and Termination",
      content: (
        <div className="space-y-4">
          <p>
            These Legal Terms remain in full effect while you use the Services.{" "}
            <strong>
              Without limiting other provisions, we reserve the right to deny access (including blocking IP addresses) at our sole discretion and without notice for any breach of these terms or applicable law.
            </strong>
          </p>
          <p>
            If we terminate or suspend your account, you may not register a new account under your name, a fake or borrowed name, or on behalf of a third party. We also reserve the right to pursue legal action, including civil, criminal, and injunctive relief.
          </p>
        </div>
      ),
    },
    {
      id: "governing-law",
      title: "Governing Law",
      content: (
        <div className="space-y-4">
          <p>
            These Legal Terms are governed by the laws of Italy, excluding the United Nations Convention on Contracts for the International Sale of Goods. If you reside in the EU as a consumer, you may have additional rights under your national laws. Both CloudNotes LLC and you agree to submit to the non-exclusive jurisdiction of the courts in Sardegna.
          </p>
        </div>
      ),
    },
    {
      id: "disclaimer",
      title: "Disclaimer",
      content: (
        <div className="space-y-4">
          <p>
            The Services are provided on an "as-is" and "as-available" basis. Your use is at your own risk. To the fullest extent allowed by law, we disclaim all warranties, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee the accuracy or completeness of the Services' content and are not liable for any errors, damages, or interruptions arising from its use. Please exercise caution with any third-party products or services referenced herein.
          </p>
        </div>
      ),
    },
    {
      id: "limitations-of-liability",
      title: "Limitations of Liability",
      content: (
        <div className="space-y-4">
          <p>
            In no event will we, our directors, employees, or agents be liable for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages (including lost profits, revenue, or data) arising from your use of the Services, even if we have been advised of the possibility of such damages. Our total liability to you shall be limited to the amount you have paid us, if any, subject to applicable law.
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
            To resolve any complaint or to obtain further information regarding the Services, please contact us at:
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
              Email: <AppLink href="mailto:contact@cloudnotes.com" external>contact@cloudnotes.com</AppLink>
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
              <h2 className="text-2xl sm:text-3xl font-bold select-none">Terms of Service</h2>
              <p className="text-sm text-black mt-1 select-none">Last updated: {lastUpdated}</p>
            </div>
            <Button 
              variant="default" 
              className="rounded-full flex items-center gap-2 !px-8 cursor-pointer select-none"
              onClick={() => setIsPrintModalOpen(true)}
              aria-label="Print Terms of Service"
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
                          className={cn(
                            "tos-nav-link w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-start",
                            "hover:bg-primary/10 hover:text-primary cursor-pointer",
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
        title="CloudNotes Terms of Service"
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
