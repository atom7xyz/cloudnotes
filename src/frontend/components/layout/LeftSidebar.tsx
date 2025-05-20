import type React from 'react';
import { useState } from 'react';
import { 
  HomeIcon, 
  BookmarkIcon, 
  SettingsIcon,
  UserIcon,
  FileTextIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { AppLink } from "../ui/app-link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SettingsModal from '../modals/SettingsModal';
import SessionExpiredModal from '../modals/SessionExpiredModal';
import { Separator } from '../ui/separator';

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
        "hover-primary-effect rounded-none transition-all duration-200",
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
  const [userStatus, _setUserStatus] = useState<UserStatus>('online');
  
  // Status color mapping
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };
  
  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[70px] h-full select-none">
        {/* Top Navigation Items - Centered */}
        <div className="flex-grow flex flex-col items-center justify-center">
          <NavItem icon={<HomeIcon size={32} />} label="HOME" to="/home" active />
          <Separator className="w-full my-2" />
          <NavItem icon={<FileTextIcon size={32} />} label="READER" to="/reader" />
          <Separator className="w-full my-2" />
          <NavItem icon={<BookmarkIcon size={32} />} label="SAVED" to="/saved" />
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
            <div className="w-full flex flex-col items-center justify-center py-3 px-1 hover-primary-effect rounded-none transition-all duration-200 text-sidebar-foreground cursor-default">
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