import { useState, useCallback } from 'react';
import {
  BookmarkIcon,
  Share2Icon,
  StarIcon,
  MessageSquareIcon,
  ClockIcon,
  EyeIcon,
  ExternalLinkIcon,
  Mail as MailIcon
} from 'lucide-react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaTelegram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { AppLink } from '../ui/app-link';
import { cn } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import type { MockDocument } from '../../lib/mocking/mocked';

interface DocumentViewProps {
  isOpen: boolean;
  onClose: () => void;
  document: MockDocument | null;
  isBookmarked: (docId: string) => boolean;
  toggleBookmark: (docId: string) => void;
  formatDate: (date: Date) => string;
  renderThumbnail: (thumbnailData: string, title: string) => React.ReactNode;
  maxWidth?: string;
}

const DocumentView = ({
  isOpen,
  onClose,
  document,
  isBookmarked,
  toggleBookmark,
  formatDate,
  renderThumbnail,
  maxWidth = "max-w-4xl"
}: DocumentViewProps) => {
  if (!document) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Document View"
      maxWidth={maxWidth}
    >
      <div className="p-6 select-none">
        <div className="flex gap-8">
          {/* Left side - Document image and action buttons */}
          <div className="flex flex-col items-center">
            <div className="w-56 h-64 rounded-md overflow-hidden bg-muted/30 mb-4">
              {renderThumbnail(document.file.thumbnail, document.title)}
            </div>
            
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={cn("h-10 w-10", isBookmarked(document.id) && "bg-primary/10 border-primary text-primary")}
                      onClick={() => toggleBookmark(document.id)}
                    >
                      <BookmarkIcon size={20} className={isBookmarked(document.id) ? "fill-primary" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isBookmarked(document.id) ? "Remove bookmark" : "Add to bookmarks"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10">
                          <Share2Icon size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Share</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Share via</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <FaFacebook className="mr-2 h-4 w-4 flex-shrink-0 text-[#1877F2]" />
                    <span>Facebook</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <FaTwitter className="mr-2 h-4 w-4 flex-shrink-0 text-[#1DA1F2]" />
                    <span>X / Twitter</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <FaTelegram className="mr-2 h-4 w-4 flex-shrink-0 text-[#0088CC]" />
                    <span>Telegram</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <FaWhatsapp className="mr-2 h-4 w-4 flex-shrink-0 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <MailIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
                    <span>Email</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Right side - Document details */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-3">{document.title}</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ClockIcon size={14} />
                <span>{formatDate(document.file.uploadedAt)}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <StarIcon size={14} className="text-yellow-500" />
                      <span>{document.rating.rating.toFixed(1)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Rating</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquareIcon size={14} />
                      <span>{document.comments.length}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Comments</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <img src={document.author.avatar} alt={document.author.username} />
              </Avatar>
              <span className="text-sm">{document.author.username}</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-5">
              {document.file.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground border-primary/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <p className="text-muted-foreground mb-8">
              {document.description}
            </p>
            
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{document.file.type.toUpperCase()}</span>
                
                <div className="flex items-center gap-1">
                  <EyeIcon size={14} />
                  <span>{document.file.viewCount.toLocaleString()} views</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <BookmarkIcon size={14} />
                  <span>{document.file.downloadCount} bookmarks</span>
                </div>
              </div>
              
              <Button className="gap-2 rounded-full cursor-pointer" asChild>
                <AppLink href={`/reader/${document.id}`} preventNavigation className="hover:no-underline">
                  <ExternalLinkIcon size={16} />
                  Open Document
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