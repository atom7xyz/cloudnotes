import { useCallback } from 'react';
import {
  Share2Icon,
  StarIcon,
  MessageSquareIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  LinkIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  TagIcon
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { AppLink } from '../ui/app-link';
import { Separator } from '../ui/separator';
import { cn, formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';

interface DocumentViewProps {
  isOpen: boolean;
  onClose: () => void;
  document: MockDocument | null;
  isBookmarked: (docId: string) => boolean;
  toggleBookmark: (docId: string) => void;
  formatDate: (date: Date) => string;
  renderThumbnail: (thumbnailData: string, title: string) => React.ReactNode;
  maxWidth?: string;
  onCloseAllModals?: () => void;
}

const DocumentView = ({
  isOpen,
  onClose,
  document,
  isBookmarked,
  toggleBookmark,
  formatDate,
  renderThumbnail,
  maxWidth = "max-w-6xl",
  onCloseAllModals
}: DocumentViewProps) => {
  const appNavigate = useAppNavigate();

  // Handle save toggle with toast notification
  const handleBookmarkToggle = useCallback(() => {
    if (!document) return;
    const wasBookmarked = isBookmarked(document.id);
    toggleBookmark(document.id);
    
    // Removed toast notification - parent component handles it
  }, [document, isBookmarked, toggleBookmark]);

  // Handle opening document page and closing all modals
  const handleOpenDocumentPage = useCallback(() => {
    // Close all modals if callback is provided
    if (onCloseAllModals) {
      onCloseAllModals();
    }
  }, [onCloseAllModals]);

  // Handle view profile click
  const handleViewProfileClick = useCallback(() => {
    if (!document) return;
    // Check if it's the current user's document
    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
    
    if (document.author.username === currentUsername) {
      // Navigate to own profile page
      appNavigate('/profile');
    } else {
      // Navigate to other user's profile
      appNavigate(`/profile/${document.author.username}`);
    }
    
    // Close all modals after navigation
    if (onCloseAllModals) {
      onCloseAllModals();
    }
  }, [appNavigate, document, onCloseAllModals]);

  // Handle author click
  const handleAuthorClick = useCallback(() => {
    if (!document) return;
    // Navigate to author's profile
    appNavigate(`/profile/${document.author.username}`);
    
    // Close all modals after navigation
    if (onCloseAllModals) {
      onCloseAllModals();
    }
  }, [appNavigate, document, onCloseAllModals]);

  // Function to copy document link to clipboard (only custom handler we keep)
  const handleCopyDocumentLink = useCallback(async () => {
    if (!document) return;
    try {
      const documentUrl = `${window.location.origin}/reader/${document.id}`;
      await navigator.clipboard.writeText(documentUrl);

      toast.success("Link copied to clipboard", {
        description: "You can now paste it anywhere",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [document]);

  const relativeDateFormatted = useCallback((date: Date): string => {
    return formatRelativeDate(date);
  }, [formatRelativeDate]);

  if (!document) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Document View"
      maxWidth={maxWidth}
    >
      <div className="p-8 select-none">
        <div className="flex gap-10">
          {/* Left side - Enhanced Document image and action buttons */}
          <div className="flex flex-col items-center">
            <div className="w-64 h-80 rounded-lg overflow-hidden bg-muted/30 mb-6 shadow-md border border-primary/10">
              {renderThumbnail(document.file.thumbnail, document.title)}
            </div>
            
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={cn(
                        "h-12 w-12 transition-all duration-200 hover-primary-effect", 
                        isBookmarked(document.id) && "bg-primary/10 border-primary text-primary scale-105"
                      )}
                      onClick={handleBookmarkToggle}
                    >
                      <BookmarkIcon size={20} className={isBookmarked(document.id) ? "fill-primary" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isBookmarked(document.id) ? "Remove from saved" : "Add to saved"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ShareLinksDropdown
                        triggerText=""
                        triggerIcon={<Share2Icon size={20} />}
                        triggerClassName="h-12 w-12 hover-primary-effect"
                        onCopyLink={handleCopyDocumentLink}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Share document</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Right side - Enhanced Document details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-3xl font-bold leading-tight pr-4">{document.title}</h2>
            </div>

            {/* Enhanced Stats Row */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon size={16} className="text-primary" />
                <span className="font-medium">Published:</span>
                <span className="text-muted-foreground">{formatDate(document.file.uploadedAt)}</span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center gap-2 text-sm">
                <StarIcon size={16} className="text-yellow-500" />
                <span className="font-medium">{document.rating.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">rating</span>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
                
              <div className="flex items-center gap-2 text-sm">
                <BookmarkIcon size={16} className="text-primary" />
                <span className="font-medium">{document.file.downloadCount}</span>
                <span className="text-muted-foreground">saved</span>
              </div>

              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center gap-2 text-sm">
                <MessageSquareIcon size={16} />
                <span className="font-medium">{document.comments.length}</span>
                <span className="text-muted-foreground">comments</span>
              </div>
            </div>
            
            {/* Enhanced Author Section */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <img src={document.author.avatar} alt={document.author.username} />
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{document.author.firstName} {document.author.lastName}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Author
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{document.author.username}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 hover-primary-effect cursor-pointer" onClick={handleViewProfileClick}>
                <UserIcon size={14} />
                View Profile
              </Button>
            </div>
            
            {/* Enhanced Tags Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TagIcon size={16} className="text-primary" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {document.file.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Enhanced Description */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileTextIcon size={18} className="text-primary" />
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-4 rounded-lg border-l-4 border-primary/30">
                {document.description}
              </p>
            </div>
            
            {/* Enhanced Bottom Stats and CTA */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">{document.file.type.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Last edited: {relativeDateFormatted(document.file.uploadedAt)}</span>
                </div>
              </div>
              
              <Button className="gap-2 rounded-full cursor-pointer shadow-md" size="lg" asChild>
                <AppLink href={`/document/${document.id}`} preventNavigation className="no-underline hover:no-underline" onClick={handleOpenDocumentPage}>
                  <ExternalLinkIcon size={18} />
                  Open Document Page
                </AppLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentView; 