import type React from 'react';
import { useState, useEffect } from 'react';
import { 
  HomeIcon, 
  BookmarkIcon, 
  SettingsIcon,
  UserIcon,
  FileTextIcon,
  ChevronRightIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { AppLink } from "../ui/app-link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import SettingsModal from '../modals/SettingsModal';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { mockService } from '../../lib/mocking/mockedData';
import { useAppNavigate } from '@/lib/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  hasDropdown?: boolean;
  dropdownContent?: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, active, onClick, title, hasDropdown, dropdownContent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const buttonContent = (
    <Button
      variant="ghost"
      onClick={hasDropdown ? () => setIsOpen(!isOpen) : onClick}
      size="icon"
      className={cn(
        "w-full flex flex-col items-center justify-center py-2 px-1 h-auto",
        "hover-primary-effect rounded-none transition-all duration-200",
        active ? "bg-sidebar-accent/70 text-sidebar-foreground font-semibold" : "text-sidebar-foreground"
      )}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[11px] font-medium select-none">{label}</span>
    </Button>
  );

  // If it has a dropdown, wrap in dropdown menu with click trigger
  if (hasDropdown && dropdownContent) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild className="w-full">
          <div>
            {buttonContent}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          side="right" 
          align="start" 
          className="ml-2 w-64"
        >
          {dropdownContent}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If there's an onClick handler, render just the button
  if (onClick) {
    return buttonContent;
  }

  // Otherwise use AppLink for navigation (remove title prop to avoid tooltips)
  return (
    <AppLink href={to} className="w-full block no-underline hover:no-underline" preventNavigation>
      {buttonContent}
    </AppLink>
  );
};

const LeftSidebar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSessionExpiredOpen, setIsSessionExpiredOpen] = useState(false);
  const appNavigate = useAppNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('LeftSidebar auth state:', { isAuthenticated, user: user?.email, isLoading });
  }, [isAuthenticated, user, isLoading]);
  
  // Get documents for dropdowns
  const allDocuments = mockService.getDocuments();
  const recentDocuments = allDocuments.slice(0, 5); // Mock recent files
  const savedDocuments = allDocuments.slice(0, 3); // Mock saved files
  
  const handleDocumentClick = (docId: string) => {
    appNavigate(`/document/${docId}`);
  };

  // Reader dropdown content
  const readerDropdownContent = (
    <>
      <DropdownMenuLabel>Recent Files</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {recentDocuments.length > 0 ? (
        recentDocuments.map((doc) => (
          <DropdownMenuItem 
            key={doc.id} 
            onClick={() => handleDocumentClick(doc.id)}
            className="cursor-pointer hover-primary-effect"
          >
            <div className="flex items-center gap-2 w-full">
              <FileTextIcon size={14} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{doc.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  by {doc.author.firstName} {doc.author.lastName}
                </div>
              </div>
              <ChevronRightIcon size={12} className="text-muted-foreground flex-shrink-0" />
            </div>
          </DropdownMenuItem>
        ))
      ) : (
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">No recent files</span>
        </DropdownMenuItem>
      )}
    </>
  );

  // Saved dropdown content
  const savedDropdownContent = (
    <>
      <DropdownMenuLabel>Saved Documents</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {savedDocuments.length > 0 ? (
        savedDocuments.map((doc) => (
          <DropdownMenuItem 
            key={doc.id} 
            onClick={() => handleDocumentClick(doc.id)}
            className="cursor-pointer hover-primary-effect"
          >
            <div className="flex items-center gap-2 w-full">
              <BookmarkIcon size={14} className="text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{doc.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  by {doc.author.firstName} {doc.author.lastName}
                </div>
              </div>
              <ChevronRightIcon size={12} className="text-muted-foreground flex-shrink-0" />
            </div>
          </DropdownMenuItem>
        ))
      ) : (
        <DropdownMenuItem disabled>
          <span className="text-muted-foreground">No saved documents</span>
        </DropdownMenuItem>
      )}
    </>
  );
  
  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[70px] h-full select-none">
        {/* Top Navigation Items - Only show if authenticated */}
        <div className="flex-grow flex flex-col items-center justify-center">
          {isAuthenticated && !isLoading ? (
            <>
              <NavItem icon={<HomeIcon size={32} />} label="HOME" to="/home" active />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={<FileTextIcon size={32} />} 
                label="RECENT" 
                to="/reader" 
                hasDropdown={true}
                dropdownContent={readerDropdownContent}
              />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={<BookmarkIcon size={32} />} 
                label="SAVED" 
                to="/saved" 
                hasDropdown={true}
                dropdownContent={savedDropdownContent}
              />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={
                  <Avatar className="h-6 w-6 border-2 border-sidebar">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                    <AvatarFallback>
                      <UserIcon size={14} />
                    </AvatarFallback>
                  </Avatar>
                } 
                label="PROFILE" 
                to="/profile" 
              />
            </>
          ) : null}
        </div>
        
        {/* Bottom Items - Settings (always available) */}
        <div className="flex flex-col items-center">
          <NavItem 
            icon={<SettingsIcon size={32} />} 
            label="SETTINGS" 
            to="/settings" 
            onClick={() => setIsSettingsOpen(true)} 
          />
        </div>
      </aside>
      
      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default LeftSidebar; 