import type React from 'react';
import { useEffect, useState, type CSSProperties } from 'react'
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  RotateCwIcon, 
  MinusIcon, 
  SquareIcon,
  MaximizeIcon, 
  XIcon,
  SearchIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import SearchModal from '../modals/SearchModal';
import SettingsModal from '../modals/SettingsModal';
import Notifications, { type NotificationItem } from './Notifications';
import { cn } from '@/lib/utils';
import { goBack, goForward, reloadPage, getElectronAPI } from '@/lib/navigation';

// No need to redeclare the Window interface as it's already defined in types.d.ts

// Custom CSS properties for Electron window drag regions
interface ElectronCSSProperties extends CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

// Navigation Button component for reuse
interface NavButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon,
  title,
  onClick,
  disabled = false
}) => (
  <Button 
    variant="ghost"
    size="icon"
    className={cn(
      "p-1 h-8 w-8 rounded-full transition-all duration-200",
      disabled 
        ? "opacity-50 cursor-default" 
        : "hover-primary-effect"
    )}
    title={title}
    disabled={disabled}
    onClick={onClick}
  >
    {icon}
  </Button>
);

const TopNavbar: React.FC = () => {
  // State for navigation and window controls
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true); // Default to true as we maximize on startup
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<string>("account");
  
  // Mock notifications data (in a real app, this would come from a database or API)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Document shared',
      message: 'Jane Simpson shared "Project Budget.pdf" with you',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      type: 'share'
    },
    {
      id: '2',
      title: 'New comment',
      message: 'Alex commented on "Meeting Notes.pdf": "Great summary, thanks!"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      type: 'comment'
    },
    {
      id: '3',
      title: 'Document updated',
      message: 'Marketing Plan.docx has been updated with new revisions',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      isRead: true,
      type: 'document'
    }
  ]);

  // CSS style objects
  const dragRegion: ElectronCSSProperties = { WebkitAppRegion: 'drag' };
  const noDragRegion: ElectronCSSProperties = { WebkitAppRegion: 'no-drag' };

  // Request a navigation state update when the path changes
  useEffect(() => {
    const api = getElectronAPI();
    if (api?.requestNavigationStateUpdate) {
      api.requestNavigationStateUpdate();
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;

    // Set up listeners for navigation state changes
    const unsubscribeNavigation = api.onNavigationStateChange?.(
      (canGoBack, canGoForward) => {
        setCanGoBack(canGoBack);
        setCanGoForward(canGoForward);
      }
    );

    // Set up listeners for window maximize state changes
    const unsubscribeMaximize = api.onMaximizeChange?.(
      (isMaximized) => {
        setIsMaximized(isMaximized);
      }
    );

    // Request initial navigation state
    api.requestNavigationStateUpdate();

    // Clean up listeners on component unmount
    return () => {
      unsubscribeNavigation?.();
      unsubscribeMaximize?.();
    };
  }, []);

  // Set up keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Navigation handlers with optimized state updates
  const handleGoBack = () => {
    if (!canGoBack) return;
    
    // Immediately update UI for responsiveness
    setCanGoBack(false);
    
    // Perform the navigation
    goBack();
    
    // Request update after navigation
    requestAnimationFrame(() => {
      const api = getElectronAPI();
      api?.requestNavigationStateUpdate();
    });
  };

  const handleGoForward = () => {
    if (!canGoForward) return;
    
    // Immediately update UI for responsiveness
    setCanGoForward(false);
    
    // Perform the navigation
    goForward();
    
    // Request update after navigation
    requestAnimationFrame(() => {
      const api = getElectronAPI();
      api?.requestNavigationStateUpdate();
    });
  };

  const handleReload = () => {
    reloadPage();
  };

  // Window control handlers
  const handleMinimize = () => {
    const api = getElectronAPI();
    api?.minimize();
  };

  const handleMaximize = () => {
    const api = getElectronAPI();
    api?.maximize();
  };

  const handleClose = () => {
    const api = getElectronAPI();
    api?.close();
  };

  // Search modal handlers
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  // Settings modal handlers
  const openSettingsModal = (tab = "account") => {
    setSettingsActiveTab(tab);
    setIsSettingsModalOpen(true);
  };
  const closeSettingsModal = () => setIsSettingsModalOpen(false);
  
  // Notifications handlers
  const getUnreadNotificationsCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };
  
  const handleOpenNotificationSettings = () => {
    openSettingsModal("notifications");
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      isRead: true
    })));
  };
  
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark the notification as read
    setNotifications(notifications.map(n => 
      n.id === notification.id 
        ? { ...n, isRead: true }
        : n
    ));
    
    // Handle specific action based on notification type (could navigate to a page, etc.)
    console.log('Notification clicked:', notification);
  };

  return (
    <>
      <header className="flex h-12 bg-sidebar text-sidebar-foreground items-center justify-between select-none" style={dragRegion}>
        {/* Logo on the left side */}
        <div className="w-[120px] flex items-center justify-start pl-4">
          <h1 className="font-bigshot-one italic text-primary text-3xl tracking-tight">CN</h1>
        </div>

        {/* Middle section - Navigation and Search */}
        <div className="flex items-center space-x-2 flex-1 justify-center">
          <div className="flex items-center space-x-1 mr-2" style={noDragRegion}>
            <NavButton 
              icon={<ArrowLeftIcon size={16} />}
              title="Go back"
              onClick={handleGoBack}
              disabled={!canGoBack}
            />
            
            <NavButton 
              icon={<ArrowRightIcon size={16} />}
              title="Go forward"
              onClick={handleGoForward}
              disabled={!canGoForward}
            />
            
            <NavButton 
              icon={<RotateCwIcon size={16} />}
              title="Reload"
              onClick={handleReload}
            />
          </div>
          
          <div className="relative w-1/4 max-w-md" style={noDragRegion}>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-0 flex items-center justify-center pointer-events-none">
              <Badge variant="secondary" className="text-[10px] bg-muted border-0 shadow-none">CTRL + F</Badge>
            </div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/70 transition-all duration-200 group-hover:scale-[1.02]">
              <SearchIcon size={16} className="transition-all duration-200 group-hover:text-sidebar-ring" />
            </div>
            <div className="group">
              <Input
                type="text"
                placeholder="Search"
                className={cn(
                  "h-8 w-full rounded-full py-1.5 pl-10 pr-16 text-sm transition-all duration-200 cursor-pointer z-10 relative",
                  "border border-muted-foreground/40",
                  "focus:ring-2 focus:ring-sidebar-ring focus:border-sidebar-ring",
                  "placeholder-sidebar-foreground/60",
                  "hover:border-sidebar-ring hover-primary-effect"
                )}
                onClick={openSearchModal}
                readOnly
              />
            </div>
          </div>
          
          {/* Notifications */}
          <div className="ml-2" style={noDragRegion}>
            <Notifications 
              unreadCount={getUnreadNotificationsCount()}
              notifications={notifications}
              onOpenSettings={handleOpenNotificationSettings}
              onMarkAllAsRead={handleMarkAllAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>

        {/* Right section - Window controls */}
        <div className="flex items-center h-full w-[150px]" style={noDragRegion}>
          <Button 
            onClick={handleMinimize}
            variant="ghost"
            size="icon"
            className="h-12 w-[50px] rounded-none hover-primary-effect transition-all duration-200"
            title="Minimize"
          >
            <MinusIcon size={16} />
          </Button>
          
          <Button 
            onClick={handleMaximize}
            variant="ghost"
            size="icon"
            className="h-12 w-[50px] rounded-none hover-primary-effect transition-all duration-200" 
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <SquareIcon size={16} /> : <MaximizeIcon size={16} />}
          </Button>
          
          <Button 
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="h-12 w-[50px] rounded-none hover:bg-destructive hover:text-white transition-all duration-200"
            title="Close"
          >
            <XIcon size={16} />
          </Button>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={closeSearchModal} 
      />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        activeTab={settingsActiveTab}
      />
    </>
  );
};

export default TopNavbar; 