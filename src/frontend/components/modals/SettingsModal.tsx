import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { 
  XIcon, 
  MonitorIcon, 
  EyeIcon, 
  ShieldIcon,
  KeyIcon,
  BellIcon,
  GlobeIcon,
  HelpCircleIcon
} from 'lucide-react';

// Section type definition
interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<string>("general");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Settings sections
  const sections: SettingsSection[] = [
    {
      id: "general",
      title: "General",
      icon: <MonitorIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">General Settings</h3>
          <p className="text-muted-foreground">Configure the general behavior of the application.</p>
          <Card className="p-4">
            <p>General settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <EyeIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Appearance</h3>
          <p className="text-muted-foreground">Customize the look and feel of the application.</p>
          <Card className="p-4">
            <p>Appearance settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "security",
      title: "Security",
      icon: <ShieldIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Security</h3>
          <p className="text-muted-foreground">Control security and privacy settings.</p>
          <Card className="p-4">
            <p>Security settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "account",
      title: "Account",
      icon: <KeyIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account</h3>
          <p className="text-muted-foreground">Manage your account settings.</p>
          <Card className="p-4">
            <p>Account settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <BellIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-muted-foreground">Configure your notification preferences.</p>
          <Card className="p-4">
            <p>Notification settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "language",
      title: "Language",
      icon: <GlobeIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Language</h3>
          <p className="text-muted-foreground">Choose your preferred language.</p>
          <Card className="p-4">
            <p>Language settings content will go here.</p>
          </Card>
        </div>
      )
    },
    {
      id: "about",
      title: "About",
      icon: <HelpCircleIcon size={18} />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">About CloudNotes</h3>
          <p className="text-muted-foreground">Information about the application and version.</p>
          <Card className="p-4">
            <div className="space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> 2024.05.20</p>
              <p><strong>License:</strong> Proprietary</p>
              <p>© 2024 CloudNotes LLC. All rights reserved.</p>
            </div>
          </Card>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button 
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={onClose}
          >
            <XIcon size={18} />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex h-[calc(80vh-4rem)] max-h-[600px]">
          {/* Left sidebar */}
          <div className="w-[220px] border-r">
            <ScrollArea className="h-full py-2">
              {sections.map((section, index) => (
                <div key={section.id} className="px-2">
                  {index > 0 && <Separator className="my-2" />}
                  <button
                    className={cn(
                      "w-full text-left py-2 px-3 rounded-md text-sm transition-colors flex items-center gap-3",
                      "hover:bg-primary/10 hover:text-primary cursor-pointer",
                      activeSection === section.id 
                        ? "text-primary font-medium bg-primary/5" 
                        : "text-foreground"
                    )}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                </div>
              ))}
            </ScrollArea>
          </div>
          
          {/* Right content area */}
          <div className="flex-1 overflow-y-auto p-6">
            <ScrollArea className="h-full">
              {sections.find(section => section.id === activeSection)?.content}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 