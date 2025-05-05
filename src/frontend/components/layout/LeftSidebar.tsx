import type React from 'react';
import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  BookmarkIcon, 
  MoreHorizontalIcon,
  SettingsIcon,
  BugIcon,
  UserIcon,
  BellIcon,
  FileTextIcon,
  LoaderIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { AppLink } from "../ui/app-link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SettingsModal from '../modals/SettingsModal';
import SessionExpiredModal from '../modals/SessionExpiredModal';
import { toggleDevTools } from '@/lib/utils';
import { triggerLoadingScreen } from '@/App';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active, onClick, title }) => {
  const buttonContent = (
    <Button
      variant="ghost"
      onClick={onClick}
      size="icon"
      className={cn(
        "w-full flex flex-col items-center justify-center py-2 px-1 h-auto",
        "hover:bg-primary/10 rounded-none transition-all duration-200",
        active ? "bg-sidebar-accent/70 text-sidebar-foreground font-semibold" : "text-sidebar-foreground"
      )}
      title={title || label}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[11px] font-medium select-none">{label}</span>
    </Button>
  );

  // If there's an onClick handler, render just the button
  if (onClick) {
    return buttonContent;
  }

  // Otherwise use AppLink for navigation
  return (
    <AppLink href={to} className="w-full block hover:no-underline" preventNavigation title={title}>
      {buttonContent}
    </AppLink>
  );
};

// User status options
type UserStatus = 'online' | 'away' | 'busy' | 'offline';

const LeftSidebar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [userStatus, _setUserStatus] = useState<UserStatus>('online');
  
  // Check if we're in development mode
  useEffect(() => {
    // Check if we're in development mode
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);
  
  // Status color mapping
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  // Handler for the "Show Loading Screen" button
  const handleShowLoadingScreen = () => {
    triggerLoadingScreen();
  };
  
  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[70px] h-full select-none">
        {/* Top Navigation Items - Centered */}
        <div className="flex-grow flex flex-col items-center justify-center">
          <NavItem icon={<HomeIcon size={32} />} label="HOME" to="/home" active />
          <NavItem icon={<FileTextIcon size={32} />} label="READER" to="/reader" />
          <NavItem icon={<BookmarkIcon size={32} />} label="SAVED" to="/saved" />
          <NavItem icon={<BellIcon size={32} />} label="NOTICE" to="/notifications" />
          <NavItem icon={<MoreHorizontalIcon size={32} />} label="MORE" to="/more" />
          
          {/* Loading screen trigger button */}
          <NavItem 
            icon={<LoaderIcon size={32} className="text-blue-500" />} 
            label="SPLASH" 
            to="#" 
            onClick={handleShowLoadingScreen}
            title="Show loading splash screen" 
          />
          
          {/* Debug tools - only shown in development mode */}
          {isDev && (
            <NavItem 
              icon={<BugIcon size={28} className="text-yellow-600" />} 
              label="DEBUG" 
              to="#" 
              onClick={() => toggleDevTools()}
            />
          )}
        </div>
        
        {/* Bottom Items - Settings and Profile */}
        <div className="flex flex-col items-center">
          <NavItem 
            icon={<SettingsIcon size={32} />} 
            label="SETTINGS" 
            to="/settings" 
            onClick={() => setIsSettingsOpen(true)} 
          />
          <AppLink href="/profile" className="w-full block hover:no-underline" preventNavigation>
            <div className="w-full flex flex-col items-center justify-center py-3 px-1 hover:bg-primary/10 rounded-none transition-all duration-200 cursor-pointer text-sidebar-foreground">
              <div className="relative mb-1">
                <Avatar className="h-8 w-8 border-2 border-sidebar">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                  <AvatarFallback>
                    <UserIcon size={18} />
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar ${statusColors[userStatus]}`} />
              </div>
              <span className="text-[11px] font-medium select-none">PROFILE</span>
            </div>
          </AppLink>
        </div>
      </aside>
      
      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <SessionExpiredModal
        isOpen={isSessionExpiredOpen}
        onClose={() => setIsSessionExpiredOpen(false)}
      />
    </>
  );
};

export default LeftSidebar; 