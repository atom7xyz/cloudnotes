import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import { 
  XIcon, 
  SettingsIcon, 
  EyeIcon, 
  ShieldIcon,
  KeyIcon,
  BellIcon,
  GlobeIcon,
  HelpCircleIcon,
  SunIcon,
  MoonIcon,
  MousePointerIcon,
  BellOffIcon,
  UserIcon,
  AtSignIcon,
  LockIcon,
  FileIcon,
  LogOutIcon,
  CheckIcon,
  RadioIcon,
  InfoIcon,
  DownloadIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  LaptopIcon
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Modal } from '../ui/modal';

// Toggle switch component with label
interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleItem: React.FC<ToggleProps> = ({ 
  label, 
  description, 
  checked, 
  onCheckedChange,
  disabled = false
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors cursor-pointer select-none",
      disabled && "opacity-60"
    )}
    onClick={() => !disabled && onCheckedChange(!checked)}>
      <div className="flex-1 pr-4">
        <div className="font-medium">{label}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
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
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary";
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  label,
  description,
  actionLabel,
  onClick,
  variant = "outline"
}) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 rounded-md transition-colors select-none">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="pt-0.5 text-muted-foreground">{icon}</div>}
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Button 
        variant={variant} 
        size="sm" 
        onClick={onClick}
        className="whitespace-nowrap cursor-pointer"
      >
        {actionLabel}
      </Button>
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
  const [largeCursor, setLargeCursor] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [systemLanguage, setSystemLanguage] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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

  return (
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
              <ActionItem
                icon={<DownloadIcon size={18} />}
                label="Export Data"
                description="Download all your files and personal data"
                actionLabel="Export"
                onClick={() => {}}
              />
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
                  <DeviceItem 
                    icon={<LaptopIcon size={16} />}
                    name="MacBook Pro"
                    lastActive="Now"
                    isCurrent={true}
                    onLogout={() => {}}
                  />
                  <DeviceItem 
                    icon={<SmartphoneIcon size={16} />}
                    name="iPhone 13"
                    lastActive="2 hours ago"
                    onLogout={() => {}}
                  />
                  <DeviceItem 
                    icon={<TabletIcon size={16} />}
                    name="iPad Air"
                    lastActive="Yesterday"
                    onLogout={() => {}}
                  />
                </div>
                <div className="mt-3 ml-7">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {}}
                  >
                    <LogOutIcon size={14} className="mr-2" />
                    Sign out from all devices
                  </Button>
                </div>
              </div>
              <Separator />
              <ActionItem
                icon={<AlertTriangleIcon size={18} className="text-destructive" />}
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

            <SettingsSection 
              title="Display Options" 
              description="Customize how content is displayed"
            >
              <ToggleItem
                label="Large Cursor"
                description="Use a larger cursor for better visibility"
                checked={largeCursor}
                onCheckedChange={setLargeCursor}
              />
            </SettingsSection>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-0 data-[state=active]:block">
            <SettingsSection 
              title="Authentication" 
              description="Manage your login security"
            >
              <ToggleItem
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account by requiring a verification code"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
              <Separator />
              <ToggleItem
                label="Remember Login"
                description="Stay logged in between sessions"
                checked={rememberLogin}
                onCheckedChange={setRememberLogin}
              />
            </SettingsSection>

            <SettingsSection 
              title="Privacy" 
              description="Manage how your data is used and displayed"
            >
              <ToggleItem
                label="Privacy Mode"
                description="Hide sensitive information throughout the interface, including documents, user data, and account details"
                checked={privacyMode}
                onCheckedChange={setPrivacyMode}
              />
            </SettingsSection>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0 data-[state=active]:block">
            <SettingsSection 
              title="Notification Settings" 
              description="Control how you receive notifications"
            >
              <ToggleItem
                label="Enable Notifications"
                description="Receive notifications from the application"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <Separator />
              <ToggleItem
                label="Sound Effects"
                description="Play sounds for notifications and actions"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                disabled={!notificationsEnabled}
              />
            </SettingsSection>

            <SettingsSection 
              title="Email Notifications" 
              description="Control which emails you receive"
            >
              <ToggleItem
                label="Document Updates"
                description="Receive notifications about changes to your documents"
                checked={true}
                onCheckedChange={() => {}}
                disabled={!notificationsEnabled}
              />
              <Separator />
              <ToggleItem
                label="Comments and Mentions"
                description="Receive notifications when someone mentions you or comments on your documents"
                checked={true}
                onCheckedChange={() => {}}
                disabled={!notificationsEnabled}
              />
              <Separator />
              <ToggleItem
                label="Marketing Emails"
                description="Receive promotional emails and feature updates"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </SettingsSection>
          </TabsContent>

          <TabsContent value="language" className="space-y-6 mt-0 data-[state=active]:block">
            <SettingsSection 
              title="Language Settings" 
              description="Choose your preferred language"
            >
              <div className="p-4 space-y-4">
                <ToggleItem
                  label="Use System Language"
                  description="Follow your device's language settings"
                  checked={systemLanguage}
                  onCheckedChange={handleSystemLanguageToggle}
                />
                <Separator />
                <div className="space-y-3">
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
                onClick={() => {}}
              />
              <Separator />
              <ActionItem
                icon={<AlertTriangleIcon size={18} />}
                label="Report an Issue"
                description="Let us know if something isn't working correctly"
                actionLabel="Report"
                onClick={() => {}}
              />
              <Separator />
              <ActionItem
                icon={<FileIcon size={18} />}
                label="Terms of Service"
                description="Read our terms of service agreement"
                actionLabel="View"
                onClick={() => {}}
              />
              <Separator />
              <ActionItem
                icon={<ShieldIcon size={18} />}
                label="Privacy Policy"
                description="Learn how we handle your data"
                actionLabel="View"
                onClick={() => {}}
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
                  className="whitespace-nowrap cursor-pointer"
                  disabled={updatesLoading}
                >
                  {updatesLoading ? (
                    <div className="flex items-center">
                      <RefreshCwIcon size={14} className="animate-spin mr-1" />
                      Checking...
                    </div>
                  ) : "Check"}
                </Button>
              </div>
            </SettingsSection>
          </TabsContent>
        </div>
      </Tabs>
    </Modal>
  );
} 