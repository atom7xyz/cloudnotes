import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  BookmarkIcon, 
  ActivityIcon, 
  MoreHorizontalIcon,
  SettingsIcon,
  UserIcon,
  LayoutIcon,
} from 'lucide-react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import SettingsModal from '../modals/SettingsModal';
import SessionExpiredModal from '../modals/SessionExpiredModal';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active, onClick }) => {
  const content = (
    <Button
      variant="ghost"
      onClick={onClick}
      size="icon"
      className={cn(
        "w-full flex flex-col items-center justify-center py-2 px-1 h-auto",
        "hover:bg-primary/10 hover:text-primary rounded-none transition-all duration-200",
        active ? "bg-sidebar-accent/70 text-sidebar-foreground font-semibold" : "text-sidebar-foreground"
      )}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[11px] font-medium">{label}</span>
    </Button>
  );

  return onClick ? (
    content
  ) : (
    <Link to={to} className="w-full">
      {content}
    </Link>
  );
};

const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState(false);
  
  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[70px] h-full select-none">
        {/* Logo at the very top */}
        <div className="flex justify-center items-center border-b border-sidebar-border/30">
          <h1 className="font-bigshot-one italic text-black text-3xl tracking-tight py-1.5">CN</h1>
        </div>
        
        {/* Top Navigation Items - Centered */}
        <div className="flex-grow flex flex-col items-center justify-center">
          <NavItem icon={<HomeIcon size={32} />} label="HOME" to="/home" active />
          <NavItem icon={<BookmarkIcon size={32} />} label="SAVED" to="/saved" />
          <NavItem icon={<ActivityIcon size={32} />} label="ACTIVITY" to="/activity" />
          <NavItem icon={<MoreHorizontalIcon size={32} />} label="MORE" to="/more" />
        </div>
        
        {/* Demo Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-full border-t border-sidebar-border/30 my-2"></div>
          <NavItem 
            icon={<LayoutIcon size={28} />} 
            label="DEMOS" 
            to="/demos" 
          />
        </div>
        
        {/* Bottom Items - Settings and Profile */}
        <div className="flex flex-col items-center mb-2">
          <NavItem 
            icon={<SettingsIcon size={32} />} 
            label="SETTINGS" 
            to="/settings" 
            onClick={() => setIsSettingsOpen(true)} 
          />
          <NavItem 
            icon={<UserIcon size={32} className="text-sidebar-foreground" />}
            label="PROFILE" 
            to="/profile"
          />
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