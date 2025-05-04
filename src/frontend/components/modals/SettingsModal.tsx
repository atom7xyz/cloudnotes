import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import { 
  SettingsIcon, 
  EyeIcon, 
  ShieldIcon,
  KeyIcon,
  BellIcon,
  GlobeIcon,
  HelpCircleIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  AtSignIcon,
  LockIcon,
  FileIcon,
  LogOutIcon,
  CheckIcon,
  InfoIcon,
  DownloadIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TabletIcon,
  LaptopIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  Volume2Icon,
  FileTextIcon,
  PencilIcon,
  MailIcon,
  Trash2Icon,
  CircleHelp
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Modal } from '../ui/modal';
import { AppLink } from '../ui/app-link';
import { toast } from 'sonner';
import correctAnswerSound from '../../assets/sounds/mixkit-correct-answer-tone-2870.wav';
import { Toaster } from '../ui/sonner';
import { useAppNavigate } from '@/lib/navigation';
import PINLockModal from './PINLockModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import ExportDataModal from './ExportDataModal';

// Toggle switch component with label
interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const ToggleItem: React.FC<ToggleProps> = ({ 
  label, 
  description, 
  checked, 
  onCheckedChange,
  disabled = false,
  icon
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors cursor-pointer select-none",
      disabled && "opacity-60"
    )}
    onClick={() => !disabled && onCheckedChange(!checked)}>
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="pt-0.5 text-muted-foreground">{icon}</div>}
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
        disabled={disabled}
        className="cursor-pointer"
      />
    </div>
  );
};

// Item with action button
interface ActionItemProps {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  actionLabel: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "destructive" | "secondary";
  disabled?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  label,
  description,
  actionLabel,
  onClick,
  href,
  variant = "outline",
  disabled = false
}) => {
  // Split description by newline character to handle line breaks
  const descriptionLines = description ? description.split('\n') : [];
  
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors select-none">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="pt-0.5 text-muted-foreground">{icon}</div>}
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {descriptionLines.length > 0 && (
            <div className="text-sm text-muted-foreground space-y-1">
              {descriptionLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      {href ? (
        <AppLink 
          href={href}
          className={cn(
            "inline-flex h-9 min-w-24 px-4 py-2 items-center justify-center gap-1.5 whitespace-nowrap rounded-md",
            "text-sm font-medium ring-offset-background transition-colors", 
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
            variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
            variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <ExternalLinkIcon size={14} />
          {actionLabel}
        </AppLink>
      ) : (
        <Button 
          variant={variant} 
          size="sm" 
          onClick={onClick}
          className={cn(
            "whitespace-nowrap min-w-24 flex items-center gap-1.5 justify-center",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          disabled={disabled}
        >
          {typeof actionLabel === 'string' && actionLabel === 'Open' && <ExternalLinkIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Report' && <AlertTriangleIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'View' && <EyeIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Change' && <PencilIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Export' && <DownloadIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Delete' && <Trash2Icon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Check' && <RefreshCwIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Set Up' && <KeyIcon size={14} />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Settings section
interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="select-none">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="bg-card rounded-lg border shadow-sm">
        {children}
      </div>
    </div>
  );
};

// Device item component
interface DeviceItemProps {
  icon: React.ReactNode;
  name: string;
  lastActive: string;
  isCurrent?: boolean;
  onLogout: () => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({
  icon,
  name,
  lastActive,
  isCurrent = false,
  onLogout
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-muted/30 rounded-md transition-colors select-none">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {isCurrent && (
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">Current</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Last active: {lastActive}</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onLogout}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
      >
        <LogOutIcon size={16} />
      </Button>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // Settings state
  const [activeTab, setActiveTab] = useState<string>("account");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinValue, setPinValue] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [systemLanguage, setSystemLanguage] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [documentUpdates, setDocumentUpdates] = useState(true);
  const [commentsAndMentions, setCommentsAndMentions] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [deviceToSignOut, setDeviceToSignOut] = useState<{ id: number, name: string, isCurrent?: boolean } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportInProgress, setExportInProgress] = useState(false);
  const [activeDevices, setActiveDevices] = useState([
    { id: 1, icon: <LaptopIcon size={16} />, name: "MacBook Pro", lastActive: "Now", isCurrent: true },
    { id: 2, icon: <SmartphoneIcon size={16} />, name: "iPhone 13", lastActive: "2 hours ago", isCurrent: false },
    { id: 3, icon: <TabletIcon size={16} />, name: "iPad Air", lastActive: "Yesterday", isCurrent: false }
  ]);
  
  // Import app navigation
  const appNavigate = useAppNavigate();
  
  // Audio reference for sound effects
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(correctAnswerSound);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play notification sound
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently handle error playing sound
      });
    }
  };

  // Function to show notification example
  const showNotificationExample = () => {
    if (notificationsEnabled) {
      toast("New Document Added", {
        description: "John Doe shared a document with you: 'Project Proposal.pdf'",
        action: {
          label: "View",
          onClick: () => {
            // Action when notification is clicked
          },
        },
        icon: <FileTextIcon size={16} />,
      });
      
      if (soundEnabled) {
        playSound();
      }
    }
  };

  // Function to demonstrate sound effect
  const demonstrateSound = () => {
    if (soundEnabled) {
      playSound();
      toast.success("Sound effect played", {
        description: "This is how notifications will sound when enabled",
      });
    } else {
      toast("Sound effects are disabled", {
        description: "Enable sound effects to hear notification sounds",
      });
    }
  };

  // Handle language selection
  const handleLanguageSelect = (langId: string) => {
    setSelectedLanguage(langId);
    if (systemLanguage) {
      setSystemLanguage(false);
    }
  };

  // Handle system language toggle
  const handleSystemLanguageToggle = (enabled: boolean) => {
    setSystemLanguage(enabled);
    // If enabling system language, reset the selected language to the system default
    if (enabled) {
      setSelectedLanguage("english"); // Assuming English is the system default
    }
  };

  // Handle check for updates
  const handleCheckForUpdates = () => {
    setUpdatesLoading(true);
    setUpdateStatus(null);
    setUpdateSuccess(false);
    
    // Simulate checking for updates with a 2 second delay
    setTimeout(() => {
      setUpdatesLoading(false);
      setUpdateStatus("You are running the latest version.");
      setUpdateSuccess(true);
    }, 2000);
  };

  // Handle sign out from other devices
  const handleSignOutAllDevices = () => {
    // Show confirmation modal for signing out all other devices
    setDeviceToSignOut({ id: -1, name: "all other devices", isCurrent: false });
    setShowSignOutModal(true);
  };

  // Handle sign out of a single device
  const handleDeviceLogout = (deviceId: number) => {
    const device = activeDevices.find(d => d.id === deviceId);
    if (device) {
      setDeviceToSignOut({ id: deviceId, name: device.name, isCurrent: device.isCurrent });
      setShowSignOutModal(true);
    }
  };

  // Confirm sign out of the device
  const confirmDeviceSignOut = () => {
    if (deviceToSignOut) {
      if (deviceToSignOut.id === -1) {
        // Sign out all other devices
        setActiveDevices(prevDevices => prevDevices.filter(device => device.isCurrent));
        toast.success("Signed out successfully", {
          description: "Signed out from all other devices",
        });
        
        if (soundEnabled) {
          playSound();
        }
      } else {
        // Sign out a single device
        setActiveDevices(prevDevices => prevDevices.filter(device => device.id !== deviceToSignOut.id));
        
        if (deviceToSignOut.isCurrent) {
          onClose();
          // Redirect to login page
          setTimeout(() => {
            appNavigate('/login');
          }, 300);
        } else {
          toast.success("Signed out successfully", {
            description: `Signed out from ${deviceToSignOut.name}`,
          });
          
          if (soundEnabled) {
            playSound();
          }
        }
      }
      
      setShowSignOutModal(false);
      setDeviceToSignOut(null);
    }
  };

  // Handle showing PIN modal
  const handleSetupPin = () => {
    setIsPinModalOpen(true);
  };

  // Handle saving PIN
  const handleSavePin = (pin: string | null) => {
    // Only update if pin is not null (we've removed "Turn Off PIN" option)
    if (pin !== null) {
      setPinValue(pin);
      setPinEnabled(true);
      
      toast.success("PIN set successfully", {
        description: "Your application is now protected with a PIN",
      });
      
      if (soundEnabled) {
        playSound();
      }
    }
  };

  // Handle opening external links
  const handleOpenHelp = () => {
    window.open('https://www.google.com', '_blank');
  };

  // Handle reporting issue via email
  const handleReportIssue = () => {
    window.location.href = 'mailto:support@cloudnotes.com?subject=Issue%20Report&body=I%20would%20like%20to%20report%20an%20issue%20with%20the%20CloudNotes%20application.';
  };
  
  // Handle viewing privacy policy
  const handleViewPrivacyPolicy = () => {
    onClose(); // Close the settings modal
    appNavigate('/privacy-policy');
  };

  // Handle viewing terms of service
  const handleViewTermsOfService = () => {
    onClose(); // Close the settings modal
    appNavigate('/tos');
  };

  // Handle notification toggle
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      toast.success("Notifications enabled", {
        description: "You will now receive notifications from the application",
      });
    } else {
      // Disable sound effects too if notifications are disabled
      setSoundEnabled(false);
      toast.info("Notifications disabled", {
        description: "You will no longer receive notifications from the application",
      });
    }
  };

  // Handle sound effects toggle
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (enabled && notificationsEnabled) {
      toast.success("Sound effects enabled", {
        description: "You will now hear sounds for notifications and actions",
      });
      // Play the sound to demonstrate
      playSound();
    }
  };

  // Function to get the current device name
  const getCurrentDeviceName = () => {
    try {
      return "Windows PC";
    } catch (error) {
      return "Windows Computer";
    }
  };

  // Update computer name in active devices
  useEffect(() => {
    setActiveDevices(prevDevices => 
      prevDevices.map(device => 
        device.isCurrent 
          ? { ...device, name: getCurrentDeviceName() }
          : device
      )
    );
  }, []);

  // Handle Export Data
  const handleExportData = () => {
    setShowExportModal(true);
  };
  
  // Handle Export Complete
  const handleExportComplete = () => {
    setExportInProgress(true);
    
    toast.success("Data export initiated", {
      description: "Your data will be sent to your email in 24-72 hours",
      icon: <MailIcon size={16} />,
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-medium">
            <SettingsIcon size={20} />
            <span>Settings</span>
          </div>
        }
        maxWidth="max-w-4xl"
        className="h-[calc(90vh-6rem)] flex flex-col"
        scrollBody={false}
      >
        <Tabs 
          defaultValue="account" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex flex-col h-full select-none"
        >
          <div className="border-b sticky top-0 bg-background z-10">
            <TabsList className="w-full justify-start p-1 h-auto bg-transparent">
              <TabsTrigger 
                value="account" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <UserIcon size={16} />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <EyeIcon size={16} />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <ShieldIcon size={16} />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <BellIcon size={16} />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="language" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <GlobeIcon size={16} />
                <span>Language</span>
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer"
              >
                <InfoIcon size={16} />
                <span>About</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            <TabsContent value="account" className="space-y-6 mt-0 data-[state=active]:block">
              <div className="flex items-center gap-4 pb-4">
                <Avatar className="h-16 w-16 cursor-pointer">
                  <img src="https://github.com/shadcn.png" alt="User Avatar" />
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">John Doe</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 px-2 py-1">
                    @johndoe
                  </Badge>
                </div>
                <Button 
                  variant="outline"
                  size="sm" 
                  className="ml-auto cursor-pointer"
                  onClick={() => {}}
                >
                  <ExternalLinkIcon size={14} className="mr-2" />
                  View Profile
                </Button>
              </div>

              <SettingsSection 
                title="Personal Information" 
                description="Manage your personal information"
              >
                <ActionItem
                  icon={<AtSignIcon size={18} />}
                  label="Email Address"
                  description="john.doe@example.com"
                  actionLabel="Change"
                  onClick={() => {}}
                />
                <Separator />
                <ActionItem
                  icon={<LockIcon size={18} />}
                  label="Password"
                  description="Last changed 30 days ago"
                  actionLabel="Change"
                  onClick={() => {}}
                />
              </SettingsSection>

              <SettingsSection 
                title="Account Management" 
                description="Manage your data and account"
              >
                <div className="relative">
                  <ActionItem
                    icon={<DownloadIcon size={18} />}
                    label="Export Data"
                    description="Download all your files and personal data"
                    actionLabel="Export"
                    onClick={handleExportData}
                    disabled={exportInProgress}
                  />
                  {exportInProgress && (
                    <div className="px-4 py-2 -mt-2 mb-1 bg-muted/20 rounded-b-md flex items-center justify-end">
                      <p className="text-sm text-muted-foreground justify-end">The data will be sent to your email in 24-72 hours</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="py-3 px-4">
                  <div className="flex items-start gap-3 mb-3">
                    <LogOutIcon size={18} className="text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Active Devices</div>
                      <p className="text-sm text-muted-foreground">Manage devices logged into your account</p>
                    </div>
                  </div>
                  <div className="ml-7 space-y-1.5">
                    {activeDevices.map((device) => (
                      <DeviceItem 
                        key={device.id}
                        icon={device.icon}
                        name={device.name}
                        lastActive={device.lastActive}
                        isCurrent={device.isCurrent}
                        onLogout={() => handleDeviceLogout(device.id)}
                      />
                    ))}
                    {activeDevices.length === 1 && (
                      <div className="text-sm text-muted-foreground mt-2">No other devices active</div>
                    )}
                  </div>
                  <div className="mt-3 ml-7">
                    {activeDevices.filter(d => !d.isCurrent).length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-center cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        onClick={handleSignOutAllDevices}
                      >
                        <LogOutIcon size={14} className="mr-2" />
                        Sign out from all other devices
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
                <ActionItem
                  icon={<Trash2Icon size={18} className="text-destructive" />}
                  label="Delete Account"
                  description="Permanently delete your account and all associated data"
                  actionLabel="Delete"
                  variant="destructive"
                  onClick={() => {}}
                />
              </SettingsSection>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Theme" 
                description="Customize the appearance of the application"
              >
                <div className="py-3 px-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={darkMode ? "outline" : "default"}
                      className={cn(
                        "h-[88px] flex flex-col gap-2 justify-center border-2 cursor-pointer",
                        !darkMode && "border-primary"
                      )}
                      onClick={() => setDarkMode(false)}
                    >
                      <SunIcon size={24} />
                      <span>Light</span>
                      {!darkMode && <span className="text-xs font-normal">Selected</span>}
                    </Button>
                    <Button 
                      variant={darkMode ? "default" : "outline"}
                      className={cn(
                        "h-[88px] flex flex-col gap-2 justify-center border-2 cursor-pointer",
                        darkMode && "border-primary"
                      )}
                      onClick={() => setDarkMode(true)}
                    >
                      <MoonIcon size={24} />
                      <span>Dark</span>
                      {darkMode && <span className="text-xs font-normal">Selected</span>}
                    </Button>
                  </div>
                </div>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Authentication" 
                description="Manage your login security"
              >
                <ToggleItem
                  label="Remember Login"
                  description="Stay logged in between sessions"
                  checked={rememberLogin}
                  onCheckedChange={setRememberLogin}
                  icon={<KeyIcon size={18} />}
                />
                <Separator />
                <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors select-none">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="pt-0.5 text-muted-foreground">
                      <LockIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">PIN Lock</div>
                      <p className="text-sm text-muted-foreground">
                        {pinEnabled 
                          ? "Secure access to the application with a PIN" 
                          : "Add an extra layer of security by setting up a PIN"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSetupPin}
                    className="whitespace-nowrap cursor-pointer min-w-24 flex items-center gap-1.5 justify-center"
                  >
                    {pinEnabled ? 
                      (<>
                        <PencilIcon size={14} />
                        Change
                      </>) : 
                      (<>
                        <KeyIcon size={14} />
                        Set Up
                      </>)
                    }
                  </Button>
                </div>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Notification Settings" 
                description="Control how you receive notifications"
              >
                {/* First container: Enable Notifications */}
                <div className="rounded-md">
                  <ToggleItem
                    label="In-App Notifications"
                    description="Receive notifications from the application"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationsToggle}
                    icon={<BellIcon size={18} />}
                  />
                  {/* Notification Example Preview */}
                  {notificationsEnabled && (
                    <div className="py-2 px-4 pl-12">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <CircleHelp size={16} className="text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">Test the notifications</span>
                            <p className="text-xs text-muted-foreground">See how notifications appear</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={showNotificationExample}
                          disabled={!notificationsEnabled}
                          className="cursor-pointer min-w-24 flex items-center gap-1.5 justify-center"
                        >
                          <EyeIcon size={14} />
                          <span>Preview</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Second container: Sound Effects */}
                <div className="rounded-md border-t">
                  <ToggleItem
                    label="Sound Effects"
                    description="Play sounds for notifications and actions"
                    checked={soundEnabled}
                    onCheckedChange={handleSoundToggle}
                    disabled={!notificationsEnabled}
                    icon={<Volume2Icon size={18} />}
                  />
                  {/* Sound Effect Preview */}
                  {soundEnabled && (
                    <div className="pb-2 px-4 pl-12">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <CircleHelp size={16} className="text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium">Test the sound of notifications</span>
                            <p className="text-xs text-muted-foreground">Hear notification sounds</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={demonstrateSound}
                          disabled={!soundEnabled}
                          className="cursor-pointer min-w-24 flex items-center gap-1.5 justify-center"
                        >
                          <Volume2Icon size={14} />
                          <span>Play</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SettingsSection>

              <SettingsSection 
                title="Email Notifications" 
                description="Control which emails you receive"
              >
                <ToggleItem
                  label="Document Updates"
                  description="Receive notifications about changes to your documents"
                  checked={documentUpdates}
                  onCheckedChange={setDocumentUpdates}
                  icon={<FileTextIcon size={18} />}
                />
                <Separator />
                <ToggleItem
                  label="Comments and Mentions"
                  description="Receive notifications when someone mentions you or comments on your documents"
                  checked={commentsAndMentions}
                  onCheckedChange={setCommentsAndMentions}
                  icon={<MessageSquareIcon size={18} />}
                />
                <Separator />
                <ToggleItem
                  label="Marketing Emails"
                  description="Receive promotional emails and feature updates"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                  icon={<MailIcon size={18} />}
                />
              </SettingsSection>
            </TabsContent>

            <TabsContent value="language" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Language Settings" 
                description="Choose your preferred language"
              >
                <div>
                  <ToggleItem
                    label="Use System Language"
                    description="Follow your device's language settings"
                    checked={systemLanguage}
                    onCheckedChange={handleSystemLanguageToggle}
                    icon={<GlobeIcon size={18} />}
                  />
                  <div className="space-y-3 p-4">
                    {[
                      { id: 'english', label: 'English' },
                      { id: 'spanish', label: 'Español' },
                      { id: 'french', label: 'Français' },
                      { id: 'german', label: 'Deutsch' },
                      { id: 'italian', label: 'Italiano' },
                      { id: 'japanese', label: '日本語' }
                    ].map((lang) => (
                      <div key={lang.id} 
                        className={cn(
                          "flex items-center justify-between py-2 px-3 rounded-md transition-colors cursor-pointer select-none",
                          selectedLanguage === lang.id ? "bg-primary/10" : "hover:bg-muted/50"
                        )}
                        onClick={() => handleLanguageSelect(lang.id)}
                      >
                        <span>{lang.label}</span>
                        {selectedLanguage === lang.id && (
                          <CheckIcon size={18} className="text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="about" className="space-y-6 mt-0 data-[state=active]:block">
              <div className="p-4 space-y-4 bg-card rounded-lg border shadow-sm">
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <h1 className="font-bigshot-one italic text-black text-4xl tracking-tight pb-2 select-none">CloudNotes</h1>
                  <p className="text-muted-foreground italic text-lg select-none">Your virtual oasis of knowledge</p>
                  <Badge variant="outline" className="mt-2 select-none">Version 1.0.0</Badge>
                </div>
                <Separator />
                <p className="text-sm text-center text-muted-foreground select-none">
                  © 2024 CloudNotes LLC. All rights reserved.
                </p>
              </div>

              <SettingsSection 
                title="Resources" 
                description="Get help and support"
                className="mt-8"
              >
                <ActionItem
                  icon={<HelpCircleIcon size={18} />}
                  label="Help Center"
                  description="Visit our help center for tutorials and guides"
                  actionLabel="Open"
                  onClick={handleOpenHelp}
                />
                <Separator />
                <ActionItem
                  icon={<AlertTriangleIcon size={18} />}
                  label="Report an Issue"
                  description="Let us know if something isn't working correctly"
                  actionLabel="Report"
                  onClick={handleReportIssue}
                />
                <Separator />
                <ActionItem
                  icon={<FileIcon size={18} />}
                  label="Terms of Service"
                  description="Read our terms of service agreement"
                  actionLabel="View"
                  onClick={handleViewTermsOfService}
                />
                <Separator />
                <ActionItem
                  icon={<ShieldIcon size={18} />}
                  label="Privacy Policy"
                  description="Learn how we handle your data"
                  actionLabel="View"
                  onClick={handleViewPrivacyPolicy}
                />
                <Separator />
                <div 
                  className={cn(
                    "flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors select-none",
                    updateSuccess && "update-success-animation"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="pt-0.5 text-muted-foreground">
                      <RefreshCwIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Check for Updates</div>
                      <p className={cn(
                        "text-sm",
                        updateSuccess ? "text-green-600" : "text-muted-foreground"
                      )}>
                        {updateStatus || "Make sure you're using the latest version"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCheckForUpdates}
                    className="whitespace-nowrap cursor-pointer min-w-24 flex items-center gap-1.5 justify-center"
                    disabled={updatesLoading}
                  >
                    {updatesLoading ? (
                      <div className="flex items-center gap-1.5">
                        <RefreshCwIcon size={14} className="animate-spin" />
                        Checking...
                      </div>
                    ) : (
                      <>
                        <RefreshCwIcon size={14} />
                        Check
                      </>
                    )}
                  </Button>
                </div>
              </SettingsSection>
            </TabsContent>
          </div>
        </Tabs>
      </Modal>

      <PINLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={pinValue}
        onSave={handleSavePin}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmDeviceSignOut}
        deviceName={deviceToSignOut?.name || ""}
        isCurrent={deviceToSignOut?.isCurrent || false}
      />

      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        email="john.doe@example.com"
        onExportComplete={handleExportComplete}
        notificationsEnabled={notificationsEnabled}
        playSound={playSound}
        soundEnabled={soundEnabled}
      />

      {/* Sonner Toast Container */}
      <Toaster theme="light" position="bottom-right" />
    </>
  );
} 