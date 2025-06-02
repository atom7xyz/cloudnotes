import type React from 'react';
import { useState, useEffect, useCallback, type KeyboardEvent, useRef, useMemo, memo } from 'react'
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Clock, 
  Star, 
  MessageSquare, 
  FileIcon,
  X,
  BookmarkIcon,
  HelpCircle,
  Compass,
  FolderHeart,
  CalendarIcon,
  HistoryIcon
} from 'lucide-react';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockUser, MockBookmark } from '../../lib/mocking/mocked';
import { debounce, throttle } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import DocumentView from './DocumentView';
import { Button } from '../ui/button';

// Import placeholder images
import placeholder1 from '../../assets/placeholders/placeholder (1).png';
import placeholder7 from '../../assets/placeholders/placeholder (7).png';
import placeholder8 from '../../assets/placeholders/placeholder (8).png';
import placeholder9 from '../../assets/placeholders/placeholder (9).png';
import placeholder10 from '../../assets/placeholders/placeholder (10).png';
import placeholder11 from '../../assets/placeholders/placeholder (11).png';
import placeholder12 from '../../assets/placeholders/placeholder (12).png';
import placeholder13 from '../../assets/placeholders/placeholder (13).png';
import placeholder14 from '../../assets/placeholders/placeholder (14).png';
import placeholder15 from '../../assets/placeholders/placeholder (15).png';
import placeholder16 from '../../assets/placeholders/placeholder (16).png';
import placeholder17 from '../../assets/placeholders/placeholder (17).png';
import placeholder18 from '../../assets/placeholders/placeholder (18).png';
import placeholder19 from '../../assets/placeholders/placeholder (19).png';
import placeholder20 from '../../assets/placeholders/placeholder (20).png';
import placeholder21 from '../../assets/placeholders/placeholder (21).png';

// Pool placeholder images once rather than for each component
const placeholderImages = [
  placeholder1, placeholder7, placeholder8, placeholder9, placeholder10, 
  placeholder11, placeholder12, placeholder13, placeholder14, placeholder15, 
  placeholder16, placeholder17, placeholder18, placeholder19, placeholder20, 
  placeholder21
];

// Moved to outside component to prevent recreation
const fileTypeTags = ['pdf', 'word', 'txt', 'powerpoint', 'epub'];

// Memoized date formatter to avoid recreation
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

// Format the date to a user-friendly string
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

// Extract any tag currently being typed - moved outside component
const extractCurrentTag = (input: string): string | null => {
  const match = input.match(/@(\w*)$/);
  return match ? match[1] : null;
};

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Document skeleton for loading state - moved outside to prevent recreation
const DocumentSkeleton = memo(() => (
  <Card className="p-4 mb-3 mt-6">
    <div className="flex items-start gap-3">
      <Skeleton className="h-16 w-16 rounded-md bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
      <div className="flex-grow space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-5 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-5 w-32 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-12 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-12 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-3 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-3 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-3 w-16 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  </Card>
));
DocumentSkeleton.displayName = 'DocumentSkeleton';

// User skeleton for loading state - moved outside
const UserSkeleton = memo(() => (
  <Card className="p-4 mb-3 mt-6">
    <div className="flex items-start gap-3">
      <Skeleton className="h-12 w-12 rounded-full bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
      <div className="flex-grow space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-5 w-24 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
        <Skeleton className="h-4 w-full bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
          <Skeleton className="h-4 w-40 bg-muted-foreground/30 animate-[pulse_0.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  </Card>
));
UserSkeleton.displayName = 'UserSkeleton';

// Get document placeholder - optimized to be more efficient
const getDocumentPlaceholder = (docId: string) => {
  // Use the document ID to generate a consistent index
  const charSum = docId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charSum % placeholderImages.length;
  return placeholderImages[index];
};

// Function to render thumbnail from color:text format
const renderThumbnail = (thumbnailData: string, title: string) => {
  // Parse the thumbnail format "color:text"
  const [color, text] = thumbnailData.split(':');
  
  return (
    <div 
      style={{ backgroundColor: color }} 
      className="w-full h-full flex items-center justify-center"
    >
      <span className="text-white font-medium text-center px-2 text-xs">
        {decodeURIComponent(text || title)}
      </span>
    </div>
  );
};

// Mock document search results adapter function 
// Converts new MockDocument format to match the structure expected by DocumentItem
const adaptDocumentForDisplay = (doc: MockDocument) => {
  return {
    id: doc.id,
    name: doc.title,
    uploadDate: doc.file.uploadedAt,
    rating: doc.rating.rating,
    commentCount: doc.comments.length,
    uploaderUsername: doc.author.username,
    uploaderAvatar: doc.author.avatar,
    thumbnailUrl: doc.file.thumbnail,
    fileType: doc.file.type,
    fileSize: doc.file.size,
    viewCount: doc.file.viewCount,
    downloadCount: doc.file.downloadCount,
    tags: doc.file.tags,
    visibility: doc.file.visibility
  };
};

// Calculate last opened time (in a real app this would come from user session data)
const getLastOpenedTime = (doc: MockDocument): string => {
  // For demo purposes, generate a random time within the last 7 days
  // Use document ID as a seed to ensure consistent results
  const seed = doc.id.charCodeAt(0) + doc.id.charCodeAt(doc.id.length - 1);
  const randomHours = Math.floor((seed % 150) + 1); // 1-150 hours, using doc ID as seed
  
  const now = new Date();
  const lastOpened = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
  
  // Format the relative time
  const diffInHours = Math.floor((now.getTime() - lastOpened.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays} days ago`;
};

// Document item component - optimized with proper memoization
const DocumentItem = memo(({ document, selectedTags, handleTagClick, navigateToDocument, navigateToUserProfile, navigateToReviews, navigateToComments, bookmarkResults, toggleBookmark }: { 
  document: MockDocument;
  selectedTags: string[];
  handleTagClick: (tag: string) => void;
  navigateToDocument: (id: string) => void;
  navigateToUserProfile: (username: string) => void;
  navigateToReviews: (id: string) => void;
  navigateToComments: (id: string) => void;
  bookmarkResults: MockDocument[];
  toggleBookmark: (docId: string) => void;
}) => {
  // Adapt the document to the display format
  const displayDoc = useMemo(() => adaptDocumentForDisplay(document), [document]);
  
  // Check if the document is saved (in a real app, this would use actual user data)
  const isBookmarked = useMemo(() => 
    bookmarkResults.some(bookmark => bookmark.id === document.id), 
    [document.id, bookmarkResults]
  );
  
  // Memoize expensive parts 
  const documentPlaceholder = useMemo(() => 
    getDocumentPlaceholder(document.id), 
    [document.id]
  );

  const formattedDate = useMemo(() => 
    formatDate(displayDoc.uploadDate), 
    [displayDoc.uploadDate]
  );

  // Get file icon based on file type
  const fileIcon = useMemo(() => {
    const fileTypeLower = displayDoc.fileType.toLowerCase();
    const isSelected = selectedTags.includes(fileTypeLower);
    
    const handleFileTypeClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering document click
      handleTagClick(fileTypeLower);
    };
    
    const getBadgeStyles = () => {
      const baseStyles = "h-7 cursor-pointer transition-colors ";
      
      if (isSelected) {
        // Selected state styling
        switch (fileTypeLower) {
          case 'pdf':
            return `${baseStyles}bg-red-200 text-red-800 border-red-300 hover:bg-red-300`;
          case 'word':
            return `${baseStyles}bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300`;
          case 'powerpoint':
            return `${baseStyles}bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300`;
          case 'txt':
            return `${baseStyles}bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300`;
          case 'epub':
            return `${baseStyles}bg-green-200 text-green-800 border-green-300 hover:bg-green-300`;
          default:
            return `${baseStyles}bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300`;
        }
      }
      
      // Normal state styling
      switch (fileTypeLower) {
        case 'pdf':
          return `${baseStyles}bg-red-50 text-red-700 border-red-200 hover:bg-red-100`;
        case 'word':
          return `${baseStyles}bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100`;
        case 'powerpoint':
          return `${baseStyles}bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100`;
        case 'txt':
          return `${baseStyles}bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100`;
        case 'epub':
          return `${baseStyles}bg-green-50 text-green-700 border-green-200 hover:bg-green-100`;
        default:
          return `${baseStyles}bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100`;
      }
    };
    
    return (
      <Badge 
        variant="outline" 
        className={getBadgeStyles()}
        onClick={handleFileTypeClick}
      >
        {displayDoc.fileType.toUpperCase()}
      </Badge>
    );
  }, [displayDoc.fileType, selectedTags, handleTagClick]);
  
  // Memoize the rendered tags to prevent unnecessary re-renders
  const renderedTags = useMemo(() => {
    if (displayDoc.tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1.5 max-w-[400px]">
        {displayDoc.tags.slice(0, 4).map((tag: string) => {
          // Check if it's a file type tag - unlikely but let's handle it anyway
          const isFileType = fileTypeTags.includes(tag);
          let tagStyles = "text-xs px-2 py-1 cursor-pointer border transition-colors ";
          
          if (selectedTags.includes(tag)) {
            // Selected styles 
            if (isFileType) {
              // File type specific styling for selected tags
              switch (tag) {
                case 'pdf':
                  tagStyles += "bg-red-200 text-red-800 border-red-300 hover:bg-red-300";
                  break;
                case 'word':
                  tagStyles += "bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300";
                  break;
                case 'powerpoint':
                  tagStyles += "bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300";
                  break;
                case 'txt':
                  tagStyles += "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
                  break;
                case 'epub':
                  tagStyles += "bg-green-200 text-green-800 border-green-300 hover:bg-green-300";
                  break;
                default:
                  tagStyles += "bg-primary/80 text-primary-foreground border-primary hover:bg-primary";
              }
            } else {
              // Regular selected tag
              tagStyles += "bg-primary/80 text-primary-foreground border-primary hover:bg-primary";
            }
          } else {
            // Unselected styles
            tagStyles += "bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30 hover:bg-primary/15";
          }
          
          return (
            <Badge 
              key={tag} 
              variant="secondary"
              className={tagStyles}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          );
        })}
        {displayDoc.tags.length > 4 && (
          <Badge 
            variant="outline"
            className="text-xs px-2 py-1 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted transition-colors"
          >
            +{displayDoc.tags.length - 4}
          </Badge>
        )}
      </div>
    );
  }, [displayDoc.tags, selectedTags, handleTagClick]);
  
  return (
    <Card className="p-5 mb-4 transition-all duration-200 select-none shadow-sm border border-primary/10">
      <div className="flex items-start gap-4">
        <button 
          className="flex-shrink-0 w-28 h-36 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative shadow-md border border-primary/10 hover:shadow-lg transition-all duration-200"
          onClick={() => navigateToDocument(document.id)}
          aria-label={`Open ${displayDoc.name}`}
          type="button"
        >
          {renderThumbnail(displayDoc.thumbnailUrl, displayDoc.name)}
        </button>
        
        <div className="flex-grow min-w-0 flex flex-col justify-between h-36">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <button
                className="font-semibold text-base truncate cursor-pointer hover:text-primary text-left bg-transparent border-0 p-0 transition-colors flex-1"
                onClick={() => navigateToDocument(document.id)}
                type="button"
              >
                {displayDoc.name}
              </button>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 cursor-pointer hover:bg-primary/10 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering document click
                    toggleBookmark(document.id);
                  }}
                >
                  <BookmarkIcon 
                    size={16} 
                    className={isBookmarked 
                      ? "fill-primary text-primary" 
                      : "hover:text-primary hover:fill-primary/30"
                    } 
                  />
                </Button>
                {fileIcon}
              </div>
            </div>
            
            {/* Enhanced Author Section */}
            <div className="flex items-center gap-2 bg-muted/20 rounded-lg">
              <Avatar 
                className="h-6 w-6 cursor-pointer border border-primary/20"
                onClick={() => navigateToUserProfile(displayDoc.uploaderUsername)}
              >
                <img src={displayDoc.uploaderAvatar} alt={displayDoc.uploaderUsername} />
              </Avatar>
              <div className="flex flex-col">
                <button
                  className="text-sm font-medium cursor-pointer hover:text-primary bg-transparent border-0 p-0 text-left transition-colors"
                  onClick={() => navigateToUserProfile(displayDoc.uploaderUsername)}
                  type="button"
                >
                  {document.author.firstName} {document.author.lastName}
                </button>
                <span className="text-xs text-muted-foreground">@{displayDoc.uploaderUsername}</span>
              </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <HistoryIcon size={16} />
                <span className="font-medium">Last opened:</span>
                <span className="text-muted-foreground">{getLastOpenedTime(document)}</span>
              </div>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star size={14} className="text-yellow-500" />
                    <span className="font-medium">{displayDoc.rating.toFixed(1)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Rating</TooltipContent>
              </Tooltip>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookmarkIcon size={14} className="text-primary" />
                    <span className="font-medium">{displayDoc.downloadCount.toLocaleString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Saved</TooltipContent>
              </Tooltip>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare size={14} className="text-primary" />
                    <span className="font-medium">{displayDoc.commentCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Comments</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* Enhanced Bottom Section */}
          <div className="flex justify-between items-center mt-auto pt-3">
            {renderedTags}
          </div>
        </div>
      </div>
    </Card>
  );
});
DocumentItem.displayName = 'DocumentItem';

// User item component with improved performance
const UserItem = memo(({ 
  user, 
  navigateToUserProfile, 
  navigateToUserUploads 
}: { 
  user: MockUser;
  navigateToUserProfile: (username: string) => void;
  navigateToUserUploads: (userId: string) => void;
}) => {
  // Calculate number of public documents
  const publicDocumentsCount = useMemo(() => 
    user.documents.filter(doc => doc.file.visibility === 'public').length,
    [user.documents]
  );

  // Calculate join date (using a mock date for demo)
  const joinDate = useMemo(() => {
    // In a real app, this would come from user.joinedAt or similar
    const mockJoinDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return formatDate(mockJoinDate);
  }, []);
  
  return (
    <Card className="p-4 mb-3 transition-all duration-200 select-none shadow-sm border border-primary/10">
      <div className="flex items-start gap-3">
        <button 
          className="flex-shrink-0 w-14 h-14 relative rounded-full overflow-hidden cursor-pointer shadow-md border border-primary/20 hover:shadow-lg hover:border-primary/30 transition-all duration-200 mr-1"
          onClick={() => navigateToUserProfile(user.username)}
          aria-label={`View ${user.username}'s profile`}
          type="button"
        >
          <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
        </button>
        
        <div className="flex-grow min-w-0 flex flex-col justify-between min-h-[80px]">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <button 
                  className="font-semibold text-base cursor-pointer hover:text-primary text-left bg-transparent border-0 p-0 transition-colors"
                  onClick={() => navigateToUserProfile(user.username)}
                  type="button"
                >
                  {user.firstName} {user.lastName}
                </button>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">{user.bio}</p>
          </div>
          
          {/* Enhanced Stats Section */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-muted/20">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <CalendarIcon size={12} />
                <span className="font-medium">Joined:</span>
                <span className="text-muted-foreground">{joinDate}</span>
              </div>
              
              {publicDocumentsCount > 0 && (
                <>
                  <div className="h-3 w-px bg-muted-foreground/20" />
                  
                  <button
                    className="flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-primary bg-transparent border-0 p-0 transition-colors"
                    onClick={() => navigateToUserUploads(user.id)}
                    type="button"
                  >
                    <FileIcon size={12} />
                    <span className="font-medium">{publicDocumentsCount}</span>
                    <span>document{publicDocumentsCount !== 1 ? 's' : ''}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
UserItem.displayName = 'UserItem';

// Optimized search input component with proper memoization
const SearchInput = memo(({ 
  inputValue, 
  selectedTags, 
  currentTag, 
  handleSearchInputChange, 
  handleKeyPress, 
  handleRemoveTagFromInput,
  handleSuggestionClick,
  inputRef,
  searchContainerRef,
  fileTypeTags,
  onClearAll
}: {
  inputValue: string;
  selectedTags: string[];
  currentTag: string | null;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveTagFromInput: (tag: string) => void;
  handleSuggestionClick: (suggestedTag: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  fileTypeTags: string[];
  onClearAll: () => void;
}) => {
  const shouldWrapInput = selectedTags.length > 2;
  
  // Get tag suggestions efficiently with a useMemo
  const tagSuggestions = useMemo(() => {
    if (!currentTag) return [];
    
    // Return file type tags that match the current partial tag
    return fileTypeTags.filter(tag => 
      tag.toLowerCase().startsWith(currentTag.toLowerCase())
    );
  }, [currentTag, fileTypeTags]);
  
  // Sort tags to have file types first, then other tags
  const sortedTags = useMemo(() => {
    return [...selectedTags].sort((a, b) => {
      const aIsFileType = fileTypeTags.includes(a);
      const bIsFileType = fileTypeTags.includes(b);
      
      if (aIsFileType && !bIsFileType) return -1;
      if (!aIsFileType && bIsFileType) return 1;
      return a.localeCompare(b); // alphabetical within their groups
    });
  }, [selectedTags, fileTypeTags]);
  
  // Check if there's any content to clear
  const hasContent = inputValue.trim() || selectedTags.length > 0;
  
  return (
    <div className="mb-6">
      <div className="relative mb-2">
        <div 
          ref={searchContainerRef}
          className="pl-10 pr-12 py-2 rounded-full border border-muted-foreground/40 bg-background flex flex-wrap items-center gap-2 relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none z-10" size={18} />
          {selectedTags.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${shouldWrapInput ? 'w-full mb-1.5' : ''}`}>
              {sortedTags.map(tag => {
                // Get file type specific styling for file type tags
                let tagStyles = "px-2 py-1 gap-1 h-6 cursor-pointer select-none";
                
                if (fileTypeTags.includes(tag)) {
                  // Apply file type specific styling
                  switch (tag) {
                    case 'pdf':
                      tagStyles += " bg-red-200 text-red-800 border-red-300 hover:bg-red-300";
                      break;
                    case 'word':
                      tagStyles += " bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300";
                      break;
                    case 'powerpoint':
                      tagStyles += " bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300";
                      break;
                    case 'txt':
                      tagStyles += " bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
                      break;
                    case 'epub':
                      tagStyles += " bg-green-200 text-green-800 border-green-300 hover:bg-green-300";
                      break;
                    default:
                      tagStyles += " bg-accent text-accent-foreground border-accent-foreground/30";
                  }
                } else {
                  // Regular tag styling
                  tagStyles += " bg-primary/80 text-primary-foreground hover:bg-primary";
                }
                
                return (
                  <Badge 
                    key={tag} 
                    className={tagStyles}
                    onClick={() => handleRemoveTagFromInput(tag)}
                  >
                    {tag}
                    <X size={14} className="ml-1 select-none" />
                  </Badge>
                );
              })}
            </div>
          )}
          <div className={`flex-1 ${shouldWrapInput ? 'w-full' : 'min-w-[180px]'}`}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              placeholder={
                currentTag 
                  ? "Press Enter or Space to complete tag..." 
                  : "Search for documents, users, or use @tag..."
              }
              className="border-none shadow-none focus-visible:ring-0 pl-0 h-auto p-0 w-full"
              autoFocus
            />
          </div>
          
          {/* Clear All Button */}
          {hasContent && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover-primary-effect z-10"
              onClick={onClearAll}
              title="Clear all"
            >
              <X size={14} />
            </Button>
          )}
          
          {tagSuggestions.length > 0 && (
            <div className="w-full mt-1 flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1 select-none">Suggestions:</span>
              {tagSuggestions.map(tag => (
                <Badge 
                  key={tag}
                  variant="outline"
                  className="text-xs px-1.5 py-0 cursor-pointer bg-muted/30 hover:bg-muted select-none"
                  onClick={() => handleSuggestionClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
SearchInput.displayName = 'SearchInput';

const SearchModal: React.FC<SearchModalProps> = memo(({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'saved' | 'user' | 'discover'>('recent');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [documentResults, setDocumentResults] = useState<MockDocument[]>([]);
  const [userResults, setUserResults] = useState<MockUser[]>([]);
  const [bookmarkResults, setBookmarkResults] = useState<MockDocument[]>([]);
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<MockDocument[]>([]);
  const [filteredRecentDocuments, setFilteredRecentDocuments] = useState<MockDocument[]>([]);
  // Add state to preserve original data
  const [originalBookmarkResults, setOriginalBookmarkResults] = useState<MockDocument[]>([]);
  const [originalUserDocuments, setOriginalUserDocuments] = useState<MockDocument[]>([]);
  const [originalRecentDocuments, setOriginalRecentDocuments] = useState<MockDocument[]>([]);
  const [recentSearches] = useState<string[]>(mockService.getRecentSearches());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  // Add a ref to track the latest search request
  const latestSearchRequestRef = useRef<number>(0);
  // Store the last text query (without tags) for user search persistence
  const lastTextQueryRef = useRef<string>('');
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Load initial data when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Create async function to handle data loading
      const loadInitialData = async () => {
        try {
          // In a real app, these would be actual API calls
          const [docs, users, currentUser] = await Promise.all([
            mockService.getDocuments(),
            mockService.getUsers(),
            // Get the current user (bartsimpson for demo purposes)
            Promise.resolve(mockService.getUsers().find(user => user.username === "bartsimpson"))
          ]);
          
          // Load recent documents (last 10 documents sorted by date)
          const allDocs = await mockService.getDocuments();
          const sortedDocs = allDocs.sort((a, b) => 
            new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime()
          );
          const recentDocs = sortedDocs.slice(0, 10);
          setRecentDocuments(recentDocs);
          setOriginalRecentDocuments(recentDocs); // Store original data
          
          // Set user documents if there's a current user
          if (currentUser) {
            try {
              const [userDocsData, bookmarksData] = await Promise.all([
                mockService.getDocumentsForUser(currentUser.id),
                mockService.getBookmarksForUser(currentUser.id)
              ]);
              setUserDocuments(userDocsData);
              setOriginalUserDocuments(userDocsData); // Store original data
              const bookmarkedDocs = bookmarksData.map((bookmark: MockBookmark) => bookmark.document);
              setBookmarkResults(bookmarkedDocs);
              setOriginalBookmarkResults(bookmarkedDocs); // Store original data
            } catch (error) {
              console.error('Error loading user data:', error);
            }
          }
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      };
      
      // Execute the async function
      loadInitialData();
    }
  }, [isOpen]);

  // Initialize filtered recent documents when recent documents change
  useEffect(() => {
    setFilteredRecentDocuments(recentDocuments);
  }, [recentDocuments]);

  // Function to perform a search and apply tag filters - optimized with useCallback
  const performSearch = useCallback(async (query: string, tags: string[]) => {
    // Generate a unique ID for this search request
    const currentRequestId = Date.now();
    latestSearchRequestRef.current = currentRequestId;
    
    // Set loading state at the beginning of the search
    setIsLoading(true);
    setSearchCompleted(false);

    try {
      // If there's no query and no tags, restore original data and don't perform search
      if (!query.trim() && tags.length === 0) {
        setDocumentResults([]);
        setUserResults([]);
        // Restore original data instead of clearing
        setBookmarkResults(originalBookmarkResults);
        setUserDocuments(originalUserDocuments);
        setFilteredRecentDocuments(originalRecentDocuments);
        setIsLoading(false);
        setSearchCompleted(true);
        return;
      }
      
      // Add a small delay before actually searching to prevent flicker
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if this is still the latest request
      if (latestSearchRequestRef.current !== currentRequestId) {
        // A newer request has been made, abandon this one
        return;
      }
      
      // Get the current user for user documents and bookmarks
      const users = mockService.getUsers();
      const currentUser = users.find(user => user.username === "bartsimpson");
      
      // Batch document fetching operations in parallel
      const [documents, allUserDocs, allBookmarks] = await Promise.all([
        mockService.searchDocuments(query),
        currentUser ? mockService.getDocumentsForUser(currentUser.id) : Promise.resolve([]),
        currentUser ? mockService.getBookmarksForUser(currentUser.id) : Promise.resolve([])
      ]);
      
      // Check again if this search is still relevant
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // Convert bookmarks to MockDocument type
      const allBookmarkedDocs = allBookmarks.map(bookmark => bookmark.document);
      
      // For users search - only perform if text query has changed or no current results
      const currentUserResults = userResultsRef.current;
      let updatedUsers: MockUser[] = [];
      
      if (query.trim()) {
        if (query.trim() !== lastTextQueryRef.current || currentUserResults.length === 0) {
          updatedUsers = await mockService.searchUsers(query);
          lastTextQueryRef.current = query.trim();
        } else {
          // Keep existing results if query hasn't changed
          updatedUsers = currentUserResults;
        }
      } else {
        // If there's no query text, clear user results
        lastTextQueryRef.current = '';
        updatedUsers = [];
      }
      
      // Check again if this is still the latest request
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // Apply tag filtering if there are selected tags
      let filteredDocuments = documents;
      let filteredRecentDocs = originalRecentDocuments; // Use original recent documents
      
      if (tags.length > 0) {
        // Split tags into normal tags and file type tags
        const fileTypeFilters = tags.filter(tag => fileTypeTags.includes(tag));
        const regularTags = tags.filter(tag => !fileTypeTags.includes(tag));
        
        // Apply filtering function to both documents
        const applyFilters = (docs: MockDocument[]) => {
          let filtered = docs;
          
          // Apply regular tag filtering
          if (regularTags.length > 0) {
            filtered = filtered.filter(doc => 
              doc.file.tags.some(tag => regularTags.includes(tag))
            );
          }
          
          // Apply file type filtering
          if (fileTypeFilters.length > 0) {
            filtered = filtered.filter(doc => 
              fileTypeFilters.includes(doc.file.type.toLowerCase())
            );
          }
          
          return filtered;
        };
        
        filteredDocuments = applyFilters(documents);
        filteredRecentDocs = applyFilters(originalRecentDocuments);
      } else if (query.trim()) {
        // Filter recent documents by search query when there's a query but no tags
        filteredRecentDocs = originalRecentDocuments.filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // Filter each collection based on the search results
      const filteredUserDocs = allUserDocs.filter(doc => 
        filteredDocuments.some(searchDoc => searchDoc.id === doc.id)
      );
      
      const filteredBookmarks = allBookmarkedDocs.filter(doc => 
        filteredDocuments.some(searchDoc => searchDoc.id === doc.id)
      );

      // One final check before updating state
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }

      // Use requestAnimationFrame for better performance
      // This batches multiple state updates into a single render cycle
      requestAnimationFrame(() => {
        if (latestSearchRequestRef.current === currentRequestId) {
          // Use a microtask to batch these state updates
          Promise.resolve().then(() => {
            setDocumentResults(filteredDocuments);
            setUserDocuments(filteredUserDocs);
            setBookmarkResults(filteredBookmarks);
            setFilteredRecentDocuments(filteredRecentDocs);
            setUserResults(updatedUsers);
            userResultsRef.current = updatedUsers;
            setIsLoading(false);
            setSearchCompleted(true);
          });
        }
      });
    } catch (error) {
      // Silently handle error
      if (latestSearchRequestRef.current === currentRequestId) {
        setIsLoading(false);
        setSearchCompleted(true);
      }
    }
  }, [originalBookmarkResults, originalUserDocuments, originalRecentDocuments]);

  // Complete the current tag and add it to selected tags
  const completeTag = useCallback(() => {
    if (!currentTag) return;
    
    const normalizedTag = currentTag.trim().toLowerCase();
    if (!normalizedTag) return;
    
    // Add tag to selected tags if not already there
    if (!selectedTags.includes(normalizedTag)) {
      const newTags = [...selectedTags, normalizedTag];
      setSelectedTags(newTags);
      
      // Remove the tag from input
      const newInputValue = inputValue.replace(/@\w*$/, '');
      setInputValue(newInputValue);
      
      // Update search
      const cleanQuery = newInputValue.trim();
      setSearchQuery(cleanQuery);
      
      // Always perform search after adding a tag
      setIsLoading(true);
      performSearch(cleanQuery, newTags);
    }
    
    // Reset current tag
    setCurrentTag(null);
  }, [currentTag, selectedTags, inputValue, performSearch]);

  // Optimized debounced search function with a longer delay for better performance
  const debouncedSearch = useMemo(() => 
    debounce((query: string, tags: string[]) => {
      performSearch(query, tags);
    }, 500),
    [performSearch]
  );

  // Throttled function for UI updates to prevent render lag 
  const throttledUIUpdate = useMemo(() => 
    throttle((value: string) => {
      setInputValue(value);
      // Extract tag being typed without triggering search
      const tagBeingTyped = extractCurrentTag(value);
      setCurrentTag(tagBeingTyped);
    }, 50),
    []
  );

  // Handle search input change - optimize to reduce UI lag
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update UI with throttling to prevent render lag
    throttledUIUpdate(value);
    
    // Process the search query with debouncing
    // This is done separately from UI updates to maintain responsiveness
    const cleanQuery = value.replace(/@\w*$/, '').trim();
    setSearchQuery(cleanQuery);
    
    // Update last text query ref when text input changes
    lastTextQueryRef.current = cleanQuery;
    
    // Trigger search with existing tags after debounce
    debouncedSearch(cleanQuery, selectedTags);
  }, [throttledUIUpdate, debouncedSearch, selectedTags]);

  // Handle key press in search input
  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Complete tag on Enter
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      completeTag();
    }
    // Complete current tag and start a new one when @ is typed
    else if (e.key === '@') {
      if (currentTag) {
        e.preventDefault();
        completeTag();
        // Add the @ character after completing the tag
        setTimeout(() => {
          setInputValue((prev) => `${prev}@`);
        }, 0);
      }
    }
    // Handle space - finalize tag without adding space to the input
    else if (e.key === ' ' && currentTag) {
      e.preventDefault();
      completeTag();
    }
  }, [currentTag, completeTag]);

  // Apply a recent search
  const handleRecentSearchClick = useCallback((searchTerm: string) => {
    // Extract any tags from the search term (format: "@tag text")
    const tagRegex = /@(\w+)/g;
    const extractedTags: string[] = [];
    let match: RegExpExecArray | null = tagRegex.exec(searchTerm);
    while (match !== null) {
      extractedTags.push(match[1]);
      match = tagRegex.exec(searchTerm);
    }
    
    // Set the search query without the tag part
    const cleanQuery = searchTerm.replace(/@\w+\s*/g, '').trim();
    
    setInputValue(cleanQuery);
    setSearchQuery(cleanQuery);
    setSelectedTags(extractedTags);
    setIsLoading(true);
    performSearch(cleanQuery, extractedTags);
  }, [performSearch]);

  // Handle tag selection from document
  const handleTagClick = useCallback((tag: string) => {
    // Create a new array for the updated tags
    let updatedTags: string[];
    
    if (selectedTags.includes(tag)) {
      // Remove tag if already selected
      updatedTags = selectedTags.filter(t => t !== tag);
    } else {
      // Add tag to selected tags
      updatedTags = [...selectedTags, tag];
    }
    
    // Update the state
    setSelectedTags(updatedTags);
    
    // Update the input field to reflect selected tags
    const newInputValue = inputValue.replace(/@\w*$/, '');
    setInputValue(newInputValue);
    
    // Trigger search with updated tags and the current searchQuery
    setIsLoading(true);
    performSearch(searchQuery, updatedTags);
    
    // Focus the input after tag selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags, inputValue, searchQuery, performSearch]);

  // Remove tag from search
  const handleRemoveTagFromInput = useCallback((tag: string) => {
    // Remove from selected tags
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
    
    // Trigger search with updated tags and current searchQuery
    setIsLoading(true);
    performSearch(searchQuery, updatedTags);
    
    // Focus the input after tag removal
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags, searchQuery, performSearch]);

  // Handle suggestion click - moved outside and memoized
  const handleSuggestionClick = useCallback((suggestedTag: string) => {
    // Use the full suggested tag, not the partial one
    const updatedTags = [...selectedTags, suggestedTag];
    setSelectedTags(updatedTags);
    
    // Remove the partial tag from input
    const newInputValue = inputValue.replace(/@\w*$/, '');
    setInputValue(newInputValue);
    
    // Update search query
    const cleanQuery = newInputValue.trim();
    setSearchQuery(cleanQuery);
    
    // Reset current tag
    setCurrentTag(null);
    
    // Perform search with the new tag
    setIsLoading(true);
    performSearch(cleanQuery, updatedTags);
    
    // Focus the input after adding the tag
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue, selectedTags, performSearch]);

  // Mock navigation functions (since we're not actually navigating)
  const navigateToUserProfile = useCallback((username: string) => {
    // In a real app, we would use a router here
  }, []);

  const navigateToDocument = useCallback((documentId: string) => {
    // Find the document and open the document modal
    const doc = [...documentResults, ...bookmarkResults, ...userDocuments, ...filteredRecentDocuments].find(doc => doc.id === documentId);
    if (doc) {
      setSelectedDoc(doc);
      setIsDocModalOpen(true);
    }
  }, [documentResults, bookmarkResults, userDocuments, filteredRecentDocuments]);

  const navigateToComments = useCallback((documentId: string) => {
    // In a real app, we would use a router here
  }, []);

  const navigateToReviews = useCallback((documentId: string) => {
    // In a real app, we would use a router here
  }, []);

  const navigateToUserUploads = useCallback((userId: string) => {
    // In a real app, we would use a router here
  }, []);

  // Store last query and tags to detect changes
  const lastQueryRef = useRef(searchQuery);
  const lastTagsRef = useRef(selectedTags);
  const isInitialMountRef = useRef(true);
  const userResultsRef = useRef<MockUser[]>([]);
  const searchQueryRef = useRef(searchQuery);
  const selectedTagsRef = useRef(selectedTags);
  const performSearchRef = useRef(performSearch);

  // Update refs when state changes to avoid dependency issues
  useEffect(() => {
    searchQueryRef.current = searchQuery;
    selectedTagsRef.current = selectedTags;
    performSearchRef.current = performSearch;
    userResultsRef.current = userResults;
  }, [searchQuery, selectedTags, performSearch, userResults]);

  // Fixed useEffect to prevent infinite loops
  useEffect(() => {
    // Only run this effect when the modal opens or closes
    if (isOpen) {
      // Check if this is the initial mount or if query/tags have changed
      const queryChanged = lastQueryRef.current !== searchQueryRef.current;
      const tagsChanged = JSON.stringify(lastTagsRef.current) !== JSON.stringify(selectedTagsRef.current);
      
      // Update refs to current values
      lastQueryRef.current = searchQueryRef.current;
      lastTagsRef.current = selectedTagsRef.current;
      
      // Only perform search on initial mount or if something has changed
      if (isInitialMountRef.current || queryChanged || tagsChanged) {
        if (selectedTagsRef.current.length > 0 || searchQueryRef.current) {
          // Wrap in setTimeout to ensure it happens after state updates
          setTimeout(() => {
            performSearchRef.current(searchQueryRef.current, selectedTagsRef.current);
          }, 0);
        } else {
          setSearchCompleted(true);
        }
      }
    } else if (!isInitialMountRef.current) { // Skip the reset during initial mount
      // Reset state when modal closes
      setInputValue('');
      setSearchQuery('');
      setDocumentResults([]);
      setUserResults([]);
      setBookmarkResults([]);
      setIsLoading(false);
      setSearchCompleted(false);
      setSelectedTags([]);
      setCurrentTag(null);
      // Also reset the last text query reference
      lastTextQueryRef.current = '';
      userResultsRef.current = [];
      
      // Cancel any pending search requests
      const requestId = Date.now();
      latestSearchRequestRef.current = requestId;
    }
    
    // Mark that we're past the initial mount
    isInitialMountRef.current = false;
    
    // Return cleanup function
    return () => {
      // Cancel any pending searches on unmount
      const requestId = Date.now();
      latestSearchRequestRef.current = requestId;
    };
  }, [isOpen]); // Only depend on isOpen

  // Create unique id generators for keys
  const getUniqueKey = useCallback((prefix: string, value: string, fallback?: number) => {
    // Create a more stable key that doesn't rely on array index
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${prefix}-${value}-${hash}${fallback ? `-${fallback}` : ''}`;
  }, []);

  // Clear all search input and tags
  const handleClearAll = useCallback(() => {
    setInputValue('');
    setSelectedTags([]);
    setCurrentTag(null);
    setSearchQuery('');
    setDocumentResults([]);
    setUserResults([]);
    setIsLoading(false);
    setSearchCompleted(false);
    
    // Reset the search refs
    lastTextQueryRef.current = '';
    userResultsRef.current = [];
    
    // Cancel any pending search requests
    const requestId = Date.now();
    latestSearchRequestRef.current = requestId;
    
    // Restore original data instead of reloading
    setBookmarkResults(originalBookmarkResults);
    setUserDocuments(originalUserDocuments);
    setFilteredRecentDocuments(originalRecentDocuments);
    
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [originalBookmarkResults, originalUserDocuments, originalRecentDocuments]);

  // Toggle save status (in a real app, this would call an API)
  const toggleBookmark = useCallback((docId: string) => {
    if (bookmarkResults.some(doc => doc.id === docId)) {
      // Remove from bookmarks
      setBookmarkResults(prev => prev.filter(doc => doc.id !== docId));
    } else {
      // Add to saved - look for document in all available collections
      const docToAdd = documentResults.find(doc => doc.id === docId) || 
                       userDocuments.find(doc => doc.id === docId) ||
                       filteredRecentDocuments.find(doc => doc.id === docId);
      if (docToAdd) {
        setBookmarkResults(prev => [...prev, docToAdd]);
      }
    }
  }, [documentResults, bookmarkResults, userDocuments, filteredRecentDocuments, recentDocuments]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-medium select-none">
            <Search size={18} />
            <span>File Browser</span>
          </div>
        }
        maxWidth="max-w-4xl"
        className="h-[calc(90vh-8rem)]"
        scrollBody={false}
      >
        <div className="p-4 h-full">
          <SearchInput 
            inputValue={inputValue}
            selectedTags={selectedTags}
            currentTag={currentTag}
            handleSearchInputChange={handleSearchInputChange}
            handleKeyPress={handleKeyPress}
            handleRemoveTagFromInput={handleRemoveTagFromInput}
            handleSuggestionClick={handleSuggestionClick}
            inputRef={inputRef}
            searchContainerRef={searchContainerRef}
            fileTypeTags={fileTypeTags}
            onClearAll={handleClearAll}
          />

          <Tabs defaultValue="recent" value={activeTab} onValueChange={(value) => setActiveTab(value as 'recent' | 'saved' | 'user' | 'discover')}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow select-none flex gap-1">
                <TabsTrigger value="recent" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <Clock size={16} className="select-none" />
                  <span>Recent</span>
                  {(searchQuery || selectedTags.length > 0 ? filteredRecentDocuments.length : recentDocuments.length) > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {searchQuery || selectedTags.length > 0 ? filteredRecentDocuments.length : recentDocuments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="saved" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <BookmarkIcon size={16} className="select-none" />
                  <span>Saved</span>
                  {bookmarkResults.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {bookmarkResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="user" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <FolderHeart size={16} className="select-none" />
                  <span>Your Documents</span>
                  {userDocuments.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {userDocuments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="discover" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <Compass size={16} className="select-none" />
                  <span>Discover</span>
                  {documentResults.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {documentResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs content sections */}
            {/* Discover Tab */}
            <TabsContent value="discover" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
              {isLoading && !searchCompleted ? (
                <>
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </>
              ) : documentResults.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Compass className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `We couldn't find any documents matching "${searchQuery}"` : 
                      "No documents match the selected filters"}
                    {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                    {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                    {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                  </p>
                </div>
              ) : documentResults.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Discover documents</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Enter a search term to find documents by name, content, or tags.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Found {documentResults.length} document{documentResults.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {documentResults.map((doc) => (
                    <DocumentItem 
                      key={doc.id} 
                      document={doc} 
                      selectedTags={selectedTags} 
                      handleTagClick={handleTagClick} 
                      navigateToDocument={navigateToDocument} 
                      navigateToUserProfile={navigateToUserProfile} 
                      navigateToReviews={navigateToReviews} 
                      navigateToComments={navigateToComments} 
                      bookmarkResults={bookmarkResults} 
                      toggleBookmark={toggleBookmark}
                    />
                  ))}
                </>
              )}
            </TabsContent>

            {/* Recent Tab */}
            <TabsContent value="recent" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
              {isLoading && !searchCompleted ? (
                <>
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </>
              ) : filteredRecentDocuments.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No recent documents found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `We couldn't find any recent documents matching "${searchQuery}"` : 
                      "No recent documents match the selected filters"}
                    {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                    {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                    {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                  </p>
                </div>
              ) : filteredRecentDocuments.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No recent documents</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Recent documents will appear here as they are uploaded to the platform.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      {selectedTags.length > 0 || searchQuery ? 
                        `Found ${filteredRecentDocuments.length} recent document${filteredRecentDocuments.length !== 1 ? 's' : ''}` :
                        `Showing ${filteredRecentDocuments.length} most recent document${filteredRecentDocuments.length !== 1 ? 's' : ''}`
                      }
                    </div>
                  )}
                  {filteredRecentDocuments.map((doc) => (
                    <DocumentItem 
                      key={doc.id} 
                      document={doc} 
                      selectedTags={selectedTags} 
                      handleTagClick={handleTagClick} 
                      navigateToDocument={navigateToDocument} 
                      navigateToUserProfile={navigateToUserProfile} 
                      navigateToReviews={navigateToReviews} 
                      navigateToComments={navigateToComments} 
                      bookmarkResults={bookmarkResults} 
                      toggleBookmark={toggleBookmark}
                    />
                  ))}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="saved" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
              {isLoading && !searchCompleted ? (
                <>
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </>
              ) : bookmarkResults.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No saved documents found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `We couldn't find any saved documents matching "${searchQuery}"` : 
                      "No saved documents match the selected filters"}
                    {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                    {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                    {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                  </p>
                </div>
              ) : bookmarkResults.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No saved documents yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You haven't saved any documents yet. Saved documents will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Found {bookmarkResults.length} saved document{bookmarkResults.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {bookmarkResults.map((doc) => (
                    <DocumentItem 
                      key={doc.id} 
                      document={doc} 
                      selectedTags={selectedTags} 
                      handleTagClick={handleTagClick} 
                      navigateToDocument={navigateToDocument} 
                      navigateToUserProfile={navigateToUserProfile} 
                      navigateToReviews={navigateToReviews} 
                      navigateToComments={navigateToComments} 
                      bookmarkResults={bookmarkResults} 
                      toggleBookmark={toggleBookmark}
                    />
                  ))}
                </>
              )}
            </TabsContent>
            
            {/* Your Documents Tab */}
            <TabsContent value="user" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
              {isLoading && !searchCompleted ? (
                <>
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                  <DocumentSkeleton />
                </>
              ) : userDocuments.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <FolderHeart className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No user documents found</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `We couldn't find any of your documents matching "${searchQuery}"` : 
                      "None of your documents match the selected filters"}
                    {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                    {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                    {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                  </p>
                </div>
              ) : userDocuments.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <FolderHeart className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No user documents</h3>
                  <p className="text-muted-foreground max-w-sm">
                    You haven't uploaded any documents yet. Upload files to access them here.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Found {userDocuments.length} document{userDocuments.length !== 1 ? 's' : ''} uploaded by you
                    </div>
                  )}
                  {userDocuments.map((doc) => (
                    <DocumentItem 
                      key={doc.id} 
                      document={doc} 
                      selectedTags={selectedTags} 
                      handleTagClick={handleTagClick} 
                      navigateToDocument={navigateToDocument} 
                      navigateToUserProfile={navigateToUserProfile} 
                      navigateToReviews={navigateToReviews} 
                      navigateToComments={navigateToComments} 
                      bookmarkResults={bookmarkResults} 
                      toggleBookmark={toggleBookmark}
                    />
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Modal>

      {/* Document Modal - moved outside of the SearchModal container */}
      {selectedDoc && (
        <DocumentView 
          isOpen={isDocModalOpen} 
          onClose={() => setIsDocModalOpen(false)}
          document={selectedDoc}
          isBookmarked={(docId) => bookmarkResults.some(doc => doc.id === docId)}
          toggleBookmark={toggleBookmark}
          formatDate={formatDate}
          renderThumbnail={renderThumbnail}
          onCloseAllModals={() => {
            setIsDocModalOpen(false);
            onClose(); // Close the SearchModal
          }}
        />
      )}
    </>
  );
});

export default SearchModal; 