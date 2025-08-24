import type React from 'react';
import { useState, useEffect } from 'react';
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
  BookmarkIcon,
  InfoIcon,
  DownloadIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  LaptopIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  Volume2Icon,
  FileTextIcon,
  PencilIcon,
  MailIcon,
  Trash2Icon,
  CircleHelp,
  Check
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Modal } from '../ui/modal';
import { AppLink } from '../ui/app-link';
import { toast } from '@/lib/utils/toast';
import { Toaster } from '../ui/sonner';
import { useAppNavigate } from '@/lib/navigation';
import PINLockModal from './PINLockModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import ExportDataModal from './ExportDataModal';
import { useAppLock } from '@/lib/contexts/AppLockContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Card, CardContent } from '../ui/card';
import { playSound, setSoundEnabled as setGlobalSoundEnabled } from '@/lib/utils/sound';
import { useAuth } from '@/lib/hooks/useAuth';

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
      "flex items-center justify-between py-3 px-4 hover-primary-effect rounded-md cursor-pointer select-none",
      disabled && "opacity-60"
    )}
    onClick={() => !disabled && onCheckedChange(!checked)}
    onKeyDown={(e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        onCheckedChange(!checked);
      }
    }}
    tabIndex={disabled ? -1 : 0}
    role="switch"
    aria-checked={checked}>
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
  description?: React.ReactNode;
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
  // Only split description if it's a string
  const descriptionLines = typeof description === 'string' && description ? description.split('\n') : [];
  
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-md transition-colors select-none">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="pt-0.5 text-muted-foreground">{icon}</div>}
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {typeof description === 'string' && descriptionLines.length > 0 ? (
            <div className="text-sm text-muted-foreground space-y-1">
              {descriptionLines.map((line, i) => (
                <p key={`desc-line-${i}-${line.substring(0, 10)}`}>{line}</p>
              ))}
            </div>
          ) : (
            description && <div className="text-sm">{description}</div>
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
            variant === "default" && "bg-primary text-primary-foreground hover-primary-effect",
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
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            actionLabel === "Delete" ? "" : "hover-primary-effect"
          )}
          disabled={disabled}
        >
          {typeof actionLabel === 'string' && actionLabel === 'Apri' && <ExternalLinkIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Segnala' && <AlertTriangleIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Visualizza' && <EyeIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Modifica' && <PencilIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Esporta' && <DownloadIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Elimina' && <Trash2Icon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Verifica' && <RefreshCwIcon size={14} />}
          {typeof actionLabel === 'string' && actionLabel === 'Imposta' && <KeyIcon size={14} />}
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
    <div className="flex items-center justify-between py-2 px-4 rounded-md transition-colors select-none">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {isCurrent && (
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">Attuale</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Ultimo accesso: {lastActive}</p>
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
  activeTab?: string;
}

export default function SettingsModal({ isOpen, onClose, activeTab = "account" }: SettingsModalProps) {
  // Auth hook
  const { isAuthenticated, user, logout } = useAuth();
  
  // Settings state
  const [activeTabState, setActiveTabState] = useState<string>(activeTab);
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [systemLanguage, setSystemLanguage] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("italian");
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
    { id: 1, icon: <LaptopIcon size={16} />, name: "PC Windows", lastActive: "Ora", isCurrent: true },
    { id: 2, icon: <LaptopIcon size={16} />, name: "PC Linux", lastActive: "Ieri", isCurrent: false }
  ]);
  
  // App lock context
  const { isPinSet, currentPin, setPinCode, lockApp } = useAppLock();
  
  // Import app navigation
  const appNavigate = useAppNavigate();

  // Adjust default tab based on authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      // If not authenticated, default to "about" tab which doesn't require auth
      if (activeTabState === "account" || activeTabState === "security" || activeTabState === "notifications") {
        setActiveTabState("about");
      }
    } else {
      // If authenticated and activeTab prop is provided, use it
      if (activeTab) {
        setActiveTabState(activeTab);
      }
    }
  }, [isAuthenticated, activeTab]);

  // Function to demonstrate sound effect
  const demonstrateSound = () => {
    if (soundEnabled) {
      playSound();
      toast.success("Effetto sonoro riprodotto", {
        description: "Così suoneranno le notifiche quando abilitate",
      });
    } else {
      toast.success("Gli effetti sonori sono disabilitati", {
        description: "Abilita gli effetti sonori per sentire i suoni delle notifiche",
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
      setSelectedLanguage("italian"); // Assuming Italian is the system default
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
      setUpdateStatus("Stai utilizzando l'ultima versione.");
      setUpdateSuccess(true);
    }, 2000);
  };

  // Handle sign out from other devices
  const handleSignOutAllDevices = () => {
    // Show confirmation modal for signing out all other devices
    setDeviceToSignOut({ id: -1, name: "tutti gli altri dispositivi", isCurrent: false });
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
  const confirmDeviceSignOut = async () => {
    if (deviceToSignOut) {
      if (deviceToSignOut.id === -1) {
        // Sign out all other devices
        setActiveDevices(prevDevices => prevDevices.filter(device => device.isCurrent));
        toast.success("Disconnesso con successo", {
          description: "Disconnesso da tutti gli altri dispositivi",
        });
      } else {
        // Sign out a single device
        if (deviceToSignOut.isCurrent) {
          // This is the current device - perform actual logout
          try {
            const result = await logout();
            if (result.success) {
              onClose();
              toast.success("Disconnesso con successo", {
                description: "Sei stato disconnesso",
              });
              // Navigate to login page after a short delay
              setTimeout(() => {
                appNavigate('/login');
                // Force a page refresh to ensure all components are reinitialized
                setTimeout(() => {
                  window.location.reload();
                }, 50);
              }, 300);
            } else {
              toast.error("Disconnessione fallita", {
                description: result.message || "Si è verificato un errore durante la disconnessione",
              });
            }
          } catch (error) {
            console.error('Logout error:', error);
            toast.error("Disconnessione fallita", {
              description: "Si è verificato un errore imprevisto",
            });
          }
        } else {
          // Sign out another device (simulate)
          setActiveDevices(prevDevices => prevDevices.filter(device => device.id !== deviceToSignOut.id));
          toast.success("Disconnesso con successo", {
            description: `Disconnesso da ${deviceToSignOut.name}`,
          });
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
      setPinCode(pin);
      
      toast.success("PIN impostato con successo", {
        description: "La tua applicazione è ora protetta con un PIN",
      });
      
      playSound();
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
      toast.success("Notifiche abilitate", {
        description: "Riceverai ora le notifiche dall'applicazione",
      });
    } else {
      // Disable sound effects too if notifications are disabled
      setSoundEnabled(false);
      toast.info("Notifiche disabilitate", {
        description: "Non riceverai più notifiche dall'applicazione",
      });
    }
  };

  // Handle sound effects toggle
  const handleSoundToggle = (enabled: boolean) => {
    setGlobalSoundEnabled(enabled); // Update global sound manager
    setSoundEnabled(enabled); // Update local state for UI
    if (enabled && notificationsEnabled) {
      toast.success("Effetti sonori abilitati", {
        description: "Sentirai ora i suoni per notifiche e azioni",
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
    
    toast.success("Avvio esportazione dati", {
      description: "I tuoi dati verranno inviati alla tua email in 24-72 ore",
      icon: <MailIcon size={16} />,
    });
  };

  // Sync global sound manager with local state
  useEffect(() => {
    setGlobalSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Get user email for display
  const userEmail = user?.email || "Non connesso";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-medium">
            <SettingsIcon size={20} />
            <span>Impostazioni</span>
          </div>
        }
        maxWidth="max-w-4xl"
        className="h-[calc(90vh-6rem)] flex flex-col"
        scrollBody={false}
      >
        <Tabs 
          defaultValue={activeTabState} 
          value={activeTabState} 
          onValueChange={setActiveTabState}
          className="flex flex-col h-full select-none"
        >
          <div className="border-b sticky top-0 bg-background z-10">
            <TabsList className="w-full justify-start p-1 h-auto bg-transparent">
              {isAuthenticated && (
                <>
                  <TabsTrigger 
                    value="account" 
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
                  >
                    <UserIcon size={16} />
                    <span>Account</span>
                  </TabsTrigger>
                  
                  <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                </>
              )}
              
              <TabsTrigger 
                value="appearance" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
              >
                <EyeIcon size={16} />
                <span>Aspetto</span>
              </TabsTrigger>
              
              <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
              
              {isAuthenticated && (
                <>
                  <TabsTrigger 
                    value="security" 
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
                  >
                    <ShieldIcon size={16} />
                    <span>Sicurezza</span>
                  </TabsTrigger>
                  
                  <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                  
                  <TabsTrigger 
                    value="notifications" 
                    className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
                  >
                    <BellIcon size={16} />
                    <span>Notifiche</span>
                  </TabsTrigger>
                  
                  <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                </>
              )}
              
              <TabsTrigger 
                value="language" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
              >
                <GlobeIcon size={16} />
                <span>Lingua</span>
              </TabsTrigger>
              
              <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
              
              <TabsTrigger 
                value="about" 
                className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary cursor-pointer mx-1"
              >
                <InfoIcon size={16} />
                <span>Info</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            {isAuthenticated && (
              <TabsContent value="account" className="space-y-6 mt-0 data-[state=active]:block">
                <SettingsSection 
                  title="Informazioni Personali" 
                  description="Gestisci le tue informazioni personali"
                >
                  <ActionItem
                    icon={<AtSignIcon size={18} />}
                    label="Indirizzo Email"
                    description={userEmail}
                    actionLabel="Modifica"
                    onClick={() => {}}
                  />
                  <Separator />
                  <ActionItem
                    icon={<LockIcon size={18} />}
                    label="Password"
                    description="Modificata l'ultima volta 30 giorni fa"
                    actionLabel="Modifica"
                    onClick={() => {}}
                  />
                </SettingsSection>

                <SettingsSection 
                  title="Gestione Account" 
                  description="Gestisci i tuoi dati e il tuo account"
                >
                  <div className="relative">
                    <ActionItem
                      icon={<DownloadIcon size={18} />}
                      label="Esporta Dati"
                      description="Scarica tutti i tuoi file e dati personali"
                      actionLabel="Esporta"
                      onClick={handleExportData}
                      disabled={exportInProgress}
                    />
                    {exportInProgress && (
                      <div className="px-4 py-2 -mt-2 mb-1 rounded-b-md flex items-center justify-end">
                        <p className="text-sm text-muted-foreground justify-end">I dati verranno inviati alla tua email in 24-72 ore</p>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="py-3 px-4">
                    <div className="flex items-start gap-3 mb-3">
                      <LogOutIcon size={18} className="text-muted-foreground mt-1" />
                      <div>
                        <div className="font-medium">Dispositivi Collegati</div>
                        <p className="text-sm text-muted-foreground">Gestisci i dispositivi collegati al tuo account</p>
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
                        <div className="text-sm text-muted-foreground mt-2">Nessun altro dispositivo attivo</div>
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
                          Disconnetti da tutti gli altri dispositivi
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <ActionItem
                    icon={<Trash2Icon size={18} className="text-destructive" />}
                    label="Elimina Account"
                    description="Elimina definitivamente il tuo account e tutti i dati associati"
                    actionLabel="Elimina"
                    variant="destructive"
                    onClick={() => {}}
                  />
                </SettingsSection>
              </TabsContent>
            )}

            <TabsContent value="appearance" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Tema" 
                description="Personalizza l'aspetto dell'applicazione"
              >
                <div className="py-3 px-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={theme === 'dark' ? "outline" : "default"}
                      className={cn(
                        "h-[88px] flex flex-col gap-2 justify-center border-2 cursor-pointer",
                        theme !== 'dark' && "border-primary"
                      )}
                      onClick={() => setTheme('light')}
                    >
                      <SunIcon size={24} />
                      <span>Chiaro</span>
                      {theme !== 'dark' && <span className="text-xs italic font-normal">Selezionato</span>}
                    </Button>
                    <Button 
                      variant={theme === 'dark' ? "default" : "outline"}
                      className={cn(
                        "h-[88px] flex flex-col gap-2 justify-center border-2 cursor-pointer",
                        theme === 'dark' && "border-primary"
                      )}
                      onClick={() => setTheme('dark')}
                    >
                      <MoonIcon size={24} />
                      <span>Scuro</span>
                      {theme === 'dark' && <span className="text-xs italic font-normal">Selezionato</span>}
                    </Button>
                  </div>
                </div>
              </SettingsSection>
            </TabsContent>

            {isAuthenticated && (
              <>
                <TabsContent value="security" className="space-y-6 mt-0 data-[state=active]:block">
                  <SettingsSection 
                    title="Autenticazione" 
                    description="Gestisci la sicurezza del tuo accesso"
                  >
                    <ToggleItem
                      label="Ricorda Accesso"
                      description="Rimani connesso tra le sessioni"
                      checked={rememberLogin}
                      onCheckedChange={setRememberLogin}
                      icon={<KeyIcon size={18} />}
                    />
                    <Separator />
                    <div className="flex items-center justify-between py-3 px-4 rounded-md select-none">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="pt-0.5 text-muted-foreground">
                          <LockIcon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Blocco PIN</div>
                          <p className="text-sm text-muted-foreground">
                            {isPinSet 
                              ? "Proteggi l'accesso all'applicazione con un PIN" 
                              : "Aggiungi un livello extra di sicurezza impostando un PIN"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSetupPin}
                        className="whitespace-nowrap cursor-pointer min-w-24 flex items-center gap-1.5 justify-center hover-primary-effect"
                      >
                        {isPinSet ? 
                          (<>
                            <PencilIcon size={14} />
                            Modifica
                          </>) : 
                          (<>
                            <KeyIcon size={14} />
                            Configura
                          </>)
                        }
                      </Button>
                    </div>
                    {isPinSet && (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between py-3 px-4 rounded-md transition-colors select-none">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="pt-0.5 text-muted-foreground">
                              <ShieldIcon size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Blocca Schermo</div>
                              <p className="text-sm text-muted-foreground">
                                Blocca manualmente l'applicazione
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => {
                              // First close the modal
                              onClose();
                              // Then lock the app after a short delay
                              setTimeout(() => {
                                lockApp();
                              }, 300);
                            }}
                            className="whitespace-nowrap cursor-pointer min-w-24 flex items-center gap-1.5 justify-center"
                          >
                            <LockIcon size={14} />
                            <span className="select-none">Blocca Ora</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </SettingsSection>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 mt-0 data-[state=active]:block">
                  <SettingsSection 
                    title="Impostazioni Notifiche" 
                    description="Controlla come ricevi le notifiche"
                  >
                    {/* First container: Enable Notifications */}
                    <div className="rounded-md">
                      <ToggleItem
                        label="Notifiche In-App"
                        description="Ricevi notifiche dall'applicazione"
                        checked={notificationsEnabled}
                        onCheckedChange={handleNotificationsToggle}
                        icon={<BellIcon size={18} />}
                      />
                    </div>
                    
                    {/* Second container: Sound Effects */}
                    <div className="rounded-md border-t">
                      <ToggleItem
                        label="Effetti Sonori"
                        description="Riproduci suoni per notifiche e azioni"
                        checked={soundEnabled}
                        onCheckedChange={handleSoundToggle}
                        disabled={!notificationsEnabled}
                        icon={<Volume2Icon size={18} />}
                      >
                      </ToggleItem>
                      {/* Sound Effect Preview */}
                      {soundEnabled && (
                        <div className="pb-2 px-4 pl-12">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2 items-center">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <CircleHelp size={16} className="text-primary" />
                              </div>
                              <div>
                                <span className="text-sm font-medium">Testa il suono delle notifiche</span>
                                <p className="text-xs text-muted-foreground">Ascolta i suoni delle notifiche</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={demonstrateSound}
                              disabled={!soundEnabled}
                              className="cursor-pointer min-w-24 flex items-center gap-1.5 justify-center hover-primary-effect"
                            >
                              <Volume2Icon size={14} />
                              <span>Riproduci</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </SettingsSection>

                  <SettingsSection 
                    title="Notifiche Email" 
                    description="Controlla quali email ricevi"
                  >
                    <ToggleItem
                      label="Aggiornamenti Documenti"
                      description="Ricevi notifiche sui cambiamenti ai tuoi documenti"
                      checked={documentUpdates}
                      onCheckedChange={setDocumentUpdates}
                      icon={<FileTextIcon size={18} />}
                    />
                    <Separator />
                    <ToggleItem
                      label="Commenti e Menzioni"
                      description="Ricevi notifiche quando qualcuno ti menziona o commenta i tuoi documenti"
                      checked={commentsAndMentions}
                      onCheckedChange={setCommentsAndMentions}
                      icon={<MessageSquareIcon size={18} />}
                    />
                    <Separator />
                    <ToggleItem
                      label="Email di Marketing"
                      description="Ricevi email promozionali e aggiornamenti sulle funzionalità"
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                      icon={<MailIcon size={18} />}
                    />
                  </SettingsSection>
                </TabsContent>
              </>
            )}

            <TabsContent value="language" className="space-y-6 mt-0 data-[state=active]:block">
              <SettingsSection 
                title="Impostazioni Lingua" 
                description="Scegli la tua lingua preferita"
              >
                <div>
                  <ToggleItem
                    label="Usa Lingua del Sistema"
                    description="Segui le impostazioni della lingua del tuo dispositivo"
                    checked={systemLanguage}
                    onCheckedChange={handleSystemLanguageToggle}
                    icon={<GlobeIcon size={18} />}
                  />
                  <div className="space-y-2 p-4">
                    {[
                      { id: 'english', label: 'English' },
                      { id: 'spanish', label: 'Español' },
                      { id: 'french', label: 'Français' },
                      { id: 'german', label: 'Deutsch' },
                      { id: 'italian', label: 'Italiano' },
                      { id: 'japanese', label: '日本語' }
                    ].map((lang) => (
                      <button 
                        key={lang.id}
                        type="button" 
                        className={cn(
                          "flex items-center justify-between w-full py-2 px-3 rounded-md transition-colors cursor-pointer select-none text-left",
                          selectedLanguage === lang.id ? "bg-primary/10" : "hover-primary-effect"
                        )}
                        onClick={() => handleLanguageSelect(lang.id)}
                        aria-pressed={selectedLanguage === lang.id}
                      >
                        <span>{lang.label}</span>
                        {selectedLanguage === lang.id && (
                          <Check size={18} className="text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </SettingsSection>
            </TabsContent>

            <TabsContent value="about" className="space-y-6 mt-0 data-[state=active]:block">
              <div className="p-4 space-y-4 bg-card rounded-lg border shadow-sm">
                <div className="flex flex-col items-center justify-center text-center py-4">
                  <h1 className="font-bigshot-one italic text-primary text-4xl tracking-tight pb-2 select-none">CloudNotes</h1>
                  <p className="text-muted-foreground italic text-lg select-none">La tua oasi virtuale di conoscenza</p>
                  <Badge variant="outline" className="mt-2 select-none">Versione 1.0.0</Badge>
                </div>
                <Separator />
                <p className="text-sm text-center text-muted-foreground select-none">
                  © 2024 CloudNotes LLC. Tutti i diritti riservati.
                </p>
              </div>

              <SettingsSection 
                title="Risorse" 
                description="Ottieni aiuto e supporto"
                className="mt-8"
              >
                <ActionItem
                  icon={<HelpCircleIcon size={18} />}
                  label="Centro Assistenza"
                  description="Visita il nostro centro assistenza per tutorial e guide"
                  actionLabel="Apri"
                  onClick={handleOpenHelp}
                />
                <Separator />
                <ActionItem
                  icon={<AlertTriangleIcon size={18} />}
                  label="Segnala un Problema"
                  description="Facci sapere se qualcosa non funziona correttamente"
                  actionLabel="Segnala"
                  onClick={handleReportIssue}
                />
                <Separator />
                <ActionItem
                  icon={<FileIcon size={18} />}
                  label="Termini di Servizio"
                  description="Leggi il nostro accordo sui termini di servizio"
                  actionLabel="Visualizza"
                  onClick={handleViewTermsOfService}
                />
                <Separator />
                <ActionItem
                  icon={<ShieldIcon size={18} />}
                  label="Informativa sulla Privacy"
                  description="Scopri come gestiamo i tuoi dati"
                  actionLabel="Visualizza"
                  onClick={handleViewPrivacyPolicy}
                />
                <Separator />
                <ActionItem
                  icon={<RefreshCwIcon size={18} />}
                  label="Verifica Aggiornamenti"
                  description={
                    <p className={cn(
                      updateSuccess ? "text-green-500" : "text-muted-foreground"
                    )}>
                      {updateStatus || "Assicurati di utilizzare l'ultima versione"}
                    </p>
                  }
                  actionLabel={
                    updatesLoading ? (
                      <div className="flex items-center gap-1.5">
                        <RefreshCwIcon size={14} className="animate-spin" />
                        Verifica...
                      </div>
                    ) : (
                      "Verifica"
                    )
                  }
                  onClick={handleCheckForUpdates}
                  disabled={updatesLoading}
                  variant="outline"
                />
              </SettingsSection>
            </TabsContent>
          </div>
        </Tabs>
      </Modal>

      <PINLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={currentPin}
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
        email={userEmail}
        onExportComplete={handleExportComplete}
        notificationsEnabled={notificationsEnabled}
      />

      {/* Sonner Toast Container */}
      <Toaster theme="light" position="bottom-right" />
    </>
  );
} 