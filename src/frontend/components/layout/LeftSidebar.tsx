import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
import type { MockDocument, MockUser } from '../../lib/mocking/mocked';

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
          className="ml-2 w-64 max-h-80 overflow-y-auto"
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
  const [recentDocuments, setRecentDocuments] = useState<MockDocument[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<MockDocument[]>([]);
  const [currentMockUser, setCurrentMockUser] = useState<MockUser | null>(null);
  const appNavigate = useAppNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('LeftSidebar auth state:', { isAuthenticated, user: user?.email, isLoading });
  }, [isAuthenticated, user, isLoading]);
  
  // Get the current mock user based on authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      // For now, we'll use bartsimpson as the default mock user
      // In a real app, you'd match by user.id or user.email
      const mockUser = mockService.getUsers().find(u => u.username === 'bartsimpson');
      setCurrentMockUser(mockUser || null);
    } else {
      setCurrentMockUser(null);
    }
  }, [isAuthenticated, user]);

  // Calculate recent documents based on view history simulation
  const getRecentDocuments = useMemo(() => {
    if (!currentMockUser) return [];
    
    const allDocuments = mockService.getDocuments();
    
    // Simulate recent documents by sorting all documents by a "last viewed" algorithm
    // In a real app, this would come from user's view history
    const recentDocs = allDocuments.filter((a => a.id !== "mock-file-react-for-beginners" && !a.title.includes("Enterprise")))
      .map(doc => {
        // Create a simulated "last viewed" timestamp based on document properties
        // Use document ID and current user ID to create consistent but varied timestamps
        const seed = doc.id.charCodeAt(0) + doc.id.charCodeAt(doc.id.length - 1) + 
                    currentMockUser.id.charCodeAt(0);
        const hoursAgo = (seed % 168) + 1; // 1-168 hours ago (1 week)
        const lastViewed = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        
        return {
          ...doc,
          lastViewed
        };
      })
      .sort((a, b) => b.lastViewed.getTime() - a.lastViewed.getTime())
      .slice(0, 10); // Get top 10 most recent
    
    return recentDocs;
  }, [currentMockUser]);

  // Get saved documents from user's bookmarks
  const getSavedDocuments = useMemo(() => {
    if (!currentMockUser) return [];
    
    // Get user's bookmarked documents
    const bookmarks = mockService.getBookmarksForUser(currentMockUser.id);
    const savedDocs = bookmarks
      .map(bookmark => bookmark.document)
      .sort((a, b) => new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime());
    
    return savedDocs;
  }, [currentMockUser]);

  // Update state when computed values change
  useEffect(() => {
    setRecentDocuments(getRecentDocuments);
  }, [getRecentDocuments]);

  useEffect(() => {
    setSavedDocuments(getSavedDocuments);
  }, [getSavedDocuments]);
  
  const handleDocumentClick = (docId: string) => {
    appNavigate(`/document/${docId}`);
  };

  // Format relative time for recent documents
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ora';
    if (diffInHours === 1) return '1 ora fa';
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ieri';
    if (diffInDays < 7) return `${diffInDays} giorni fa`;
    
    return date.toLocaleDateString();
  };

  // Reader dropdown content
  const readerDropdownContent = (
    <>
      <DropdownMenuLabel>Documenti Recenti</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="max-h-64 overflow-y-auto">
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
                    di {doc.author.firstName} {doc.author.lastName} • {formatRelativeTime((doc as any).lastViewed)}
                  </div>
                </div>
                <ChevronRightIcon size={12} className="text-muted-foreground flex-shrink-0" />
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Nessun file recente</span>
          </DropdownMenuItem>
        )}
      </div>
    </>
  );

  // Saved dropdown content
  const savedDropdownContent = (
    <>
      <DropdownMenuLabel>Documenti Salvati</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="max-h-64 overflow-y-auto">
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
                    di {doc.author.firstName} {doc.author.lastName}
                  </div>
                </div>
                <ChevronRightIcon size={12} className="text-muted-foreground flex-shrink-0" />
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Nessun documento salvato</span>
          </DropdownMenuItem>
        )}
      </div>
    </>
  );
  
  return (
    <>
      <aside className="flex flex-col bg-sidebar text-sidebar-foreground w-[70px] h-full select-none">
        {/* Top Navigation Items - Only show if authenticated */}
        <div className="flex-grow flex flex-col items-center justify-center">
          {isAuthenticated && !isLoading ? (
            <>
              <NavItem icon={<HomeIcon size={32} />} label="Home" to="/home" active />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={<FileTextIcon size={32} />} 
                label="Recenti" 
                to="/reader" 
                hasDropdown={true}
                dropdownContent={readerDropdownContent}
              />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={<BookmarkIcon size={32} />} 
                label="Salvati" 
                to="/saved" 
                hasDropdown={true}
                dropdownContent={savedDropdownContent}
              />
              <Separator className="w-full my-2" />
              <NavItem 
                icon={
                  <Avatar className="h-6 w-6 border-2 border-sidebar">
                    <AvatarImage src="https://github.com/shadcn.png" alt="Avatar utente" />
                    <AvatarFallback>
                      <UserIcon size={14} />
                    </AvatarFallback>
                  </Avatar>
                } 
                label="Profilo" 
                to="/profile" 
              />
            </>
          ) : null}
        </div>
        
        {/* Bottom Items - Settings (always available) */}
        <div className="flex flex-col items-center">
          <NavItem 
            icon={<SettingsIcon size={32} />} 
            label="Impostazioni" 
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