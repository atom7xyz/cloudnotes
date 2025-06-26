import type React from 'react';
import { useState, useEffect, useCallback, type KeyboardEvent, useRef, useMemo, memo } from 'react'
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Search, 
  User, 
  Clock, 
  Star, 
  MessageSquare, 
  FileIcon,
  X,
  BookmarkIcon,
  HelpCircle,
  Compass,
  FolderHeart,
  Users,
  CalendarIcon
} from 'lucide-react';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockUser, MockBookmark } from '../../lib/mocking/mocked';
import { debounce, throttle } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider, TooltipContentArrowColored } from '../ui/tooltip';
import DocumentView from './DocumentView';
import { useAppNavigate } from '@/lib/navigation';

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
  
  if (diffInDays === 0) return 'Oggi';
  if (diffInDays === 1) return 'Ieri';

  if (diffInDays < 7) {
    const days = diffInDays;
    return `${days} giorni fa`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    if (weeks === 1) return '1 settimana fa';
    return `${weeks} settimane fa`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    if (months === 1) return '1 mese fa';
    return `${months} mesi fa`;
  }

  const years = Math.floor(diffInDays / 365);
  if (years === 1) return '1 anno fa';
  return `${years} anni fa`;
};

// Extract any tag currently being typed - moved outside component
const extractCurrentTag = (input: string): string | null => {
  const match = input.match(/#(\w*)$/);
  return match ? match[1] : null;
};

// Extract any user currently being typed - moved outside component
const extractCurrentUser = (input: string): string | null => {
  const match = input.match(/@(\w*)$/);
  return match ? match[1] : null;
};

// Search scoring function to prioritize results
const scoreDocument = (doc: MockDocument, searchQuery: string): number => {
  if (!searchQuery.trim()) return 0;
  
  const query = searchQuery.toLowerCase();
  const title = doc.title.toLowerCase();
  const description = doc.description.toLowerCase();
  const tags = doc.file.tags.map(tag => tag.toLowerCase());
  
  let score = 0;
  
  // Title matches (highest priority - 100 points base)
  if (title.includes(query)) {
    score += 100;
    // Bonus for exact match
    if (title === query) score += 50;
    // Bonus for starting with query
    if (title.startsWith(query)) score += 25;
  }
  
  // Tag matches (medium priority - 50 points base)
  for (const tag of tags) {
    if (tag.includes(query)) {
      score += 50;
      // Bonus for exact tag match
      if (tag === query) score += 25;
    }
  }
  
  // Description matches (low priority - 10 points base)
  if (description.includes(query)) {
    score += 10;
    // Count multiple occurrences
    const occurrences = (description.match(new RegExp(query, 'g')) || []).length;
    score += (occurrences - 1) * 5; // Additional 5 points per extra occurrence
  }
  
  return score;
};

// Sort documents by search relevance score
const sortDocumentsByRelevance = (docs: MockDocument[], searchQuery: string): MockDocument[] => {
  if (!searchQuery.trim()) return docs;
  
  return docs
    .map(doc => ({ doc, score: scoreDocument(doc, searchQuery) }))
    .filter(item => item.score > 0) // Only include documents with matches
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .map(item => item.doc);
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
                <CalendarIcon size={16} />
                <span className="font-medium">Pubblicato:</span>
                <span className="text-muted-foreground">{formattedDate}</span>
              </div>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Star size={14} className="text-yellow-500" />
                    <span className="font-medium">{displayDoc.rating.toFixed(1)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Valutazione</TooltipContent>
              </Tooltip>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <BookmarkIcon size={14} className="text-primary" />
                    <span className="font-medium">{displayDoc.downloadCount.toLocaleString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Segnalibri</TooltipContent>
              </Tooltip>
              
              <div className="h-4 w-px bg-muted-foreground/20" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare size={14} className="text-primary" />
                    <span className="font-medium">{displayDoc.commentCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Commenti</TooltipContent>
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
        <div 
          className="flex-shrink-0 w-14 h-14 relative rounded-full overflow-hidden shadow-md border border-primary/20 transition-all duration-200 mr-3"
          onClick={() => navigateToUserProfile(user.username)}
          aria-label={`View ${user.username}'s profile`}
        >
          <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
        </div>
        
        <div className="flex-grow min-w-0 flex flex-col justify-between min-h-[80px]">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col">
                <div 
                  className="font-semibold text-base text-left"
                  onClick={() => navigateToUserProfile(user.username)}
                >
                  {user.firstName} {user.lastName}
                </div>
                <span className="text-xs text-muted-foreground">@{user.username}</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 hover-primary-effect cursor-pointer" onClick={() => navigateToUserProfile(user.username)}>
                <User size={14} />
                View Profile
              </Button>
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
                    <span>documento{publicDocumentsCount !== 1 ? 'i' : ''}</span>
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
  currentUser,
  activeTab,
  handleSearchInputChange, 
  handleKeyPress, 
  handleRemoveTagFromInput,
  handleSuggestionClick,
  inputRef,
  searchContainerRef,
  fileTypeTags,
  onClearAll,
  showHelpTooltip,
  onHelpButtonClick
}: {
  inputValue: string;
  selectedTags: string[];
  currentTag: string | null;
  currentUser: string | null;
  activeTab: string;
  handleSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveTagFromInput: (tag: string) => void;
  handleSuggestionClick: (suggestedTag: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  fileTypeTags: string[];
  onClearAll: () => void;
  showHelpTooltip: boolean;
  onHelpButtonClick: () => void;
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
  
  // Determine if we should show the colored placeholder
  const shouldShowColoredPlaceholder = !inputValue && selectedTags.length === 0 && !currentTag && !currentUser;
  
  return (
    <div className="mb-6">
      <div className="relative mb-2">
        <div 
          ref={searchContainerRef}
          className="pl-10 pr-16 py-2 rounded-full border border-muted-foreground/40 bg-background flex flex-wrap items-center gap-2 relative"
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
          <div className={`flex-1 ${shouldWrapInput ? 'w-full' : 'min-w-[180px]'} relative`}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              placeholder={
                currentTag 
                  ? "Premi Invio o Spazio per completare il tag..." 
                  : currentUser
                  ? "Premi Invio o Spazio per completare la ricerca utente..."
                  : activeTab === 'users'
                  ? "Cerca utenti per nome o nome utente..."
                  : ""
              }
              className="border-none shadow-none focus-visible:ring-0 pl-0 h-auto p-0 w-full"
              autoFocus
            />
            
            {/* Colored Placeholder Overlay */}
            {shouldShowColoredPlaceholder && activeTab !== 'users' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm flex items-center gap-1">
                <span>Cerca documenti o utenti...</span>
              </div>
            )}
          </div>
          
          {/* Help Button */}
          <TooltipProvider>
            <Tooltip open={showHelpTooltip}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute ${hasContent ? 'right-8' : 'right-2'} top-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover-primary-effect z-10`}
                  onClick={onHelpButtonClick}
                >
                  <HelpCircle size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContentArrowColored 
                side="bottom" 
                className="bg-white border border-muted-foreground/20 shadow-lg p-3 max-w-xl"
                arrowColor="bg-white fill-white border-b border-r border-muted-foreground/20"
              >
                <div className="text-sm">
                  <p className="font-medium mb-2 text-primary">Suggerimenti per la Ricerca:</p>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-start gap-2 text-primary">
                      <span className="text-muted-foreground">•</span>
                      <span>Usa <span className="text-blue-600 font-medium">#tag</span> per filtrare per tag (es. #pdf #italiano Commedia Dante)</span>
                    </li>
                    <li className="flex items-start gap-2 text-primary">
                      <span className="text-muted-foreground">•</span>
                      <span>Cerca utenti per <span className="text-blue-600 font-medium">nome e cognome</span> o per <span className="text-blue-600 font-medium">@username</span></span>
                    </li>
                  </ul>
                </div>
              </TooltipContentArrowColored>
            </Tooltip>
          </TooltipProvider>
          
          {/* Clear All Button */}
          {hasContent && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover-primary-effect z-10"
              onClick={onClearAll}
              title="Cancella tutto"
            >
              <X size={14} />
            </Button>
          )}
          
          {tagSuggestions.length > 0 && (
            <div className="w-full mt-1 flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1 select-none">Suggerimenti:</span>
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
  const [activeTab, setActiveTab] = useState<'discover' | 'users' | 'saved' | 'user'>('discover');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [documentResults, setDocumentResults] = useState<MockDocument[]>([]);
  const [userResults, setUserResults] = useState<MockUser[]>([]);
  const [bookmarkResults, setBookmarkResults] = useState<MockDocument[]>([]);
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [originalBookmarkResults, setOriginalBookmarkResults] = useState<MockDocument[]>([]);
  const [originalUserDocuments, setOriginalUserDocuments] = useState<MockDocument[]>([]);
  const [recentSearches] = useState<string[]>(mockService.getRecentSearches());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const latestSearchRequestRef = useRef<number>(0);
  const lastTextQueryRef = useRef<string>('');
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isUserSearch, setIsUserSearch] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [hasUserStartedTyping, setHasUserStartedTyping] = useState(false);
  
  // Add navigation hook
  const appNavigate = useAppNavigate();

  useEffect(() => {
    if (isOpen) {
      const loadInitialData = async () => {
        try {
          const [docs, users, currentUser] = await Promise.all([
            mockService.getDocuments(),
            mockService.getUsers(),
            Promise.resolve(mockService.getUsers().find(user => user.username === "bartsimpson"))
          ]);
          
          if (currentUser) {
            const userDocs = await mockService.getDocumentsForUser(currentUser.id);
            setUserDocuments(userDocs);
            setOriginalUserDocuments(userDocs);
            
            const bookmarks = await mockService.getBookmarksForUser(currentUser.id);
            const bookmarkedDocs = bookmarks.map((bookmark: MockBookmark) => bookmark.document);
            setBookmarkResults(bookmarkedDocs);
            setOriginalBookmarkResults(bookmarkedDocs);
          }
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      };
      
      loadInitialData();
      
      // Show help tooltip automatically after 1 second
      const tooltipTimer = setTimeout(() => {
        if (!hasUserStartedTyping) {
          setShowHelpTooltip(true);
        }
      }, 1000);
      
      return () => clearTimeout(tooltipTimer);
    } else {
      // Reset states when modal closes
      setShowHelpTooltip(false);
      setHasUserStartedTyping(false);
    }
  }, [isOpen, hasUserStartedTyping]);

  const performSearch = useCallback(async (query: string, tags: string[]) => {
    const currentRequestId = Date.now();
    latestSearchRequestRef.current = currentRequestId;
    
    setIsLoading(true);
    setSearchCompleted(false);

    try {
      if (!query.trim() && tags.length === 0) {
        setDocumentResults([]);
        setUserResults([]);
        setBookmarkResults(originalBookmarkResults);
        setUserDocuments(originalUserDocuments);
        setIsLoading(false);
        setSearchCompleted(true);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      const users = mockService.getUsers();
      const currentUser = users.find(user => user.username === "bartsimpson");
      
      const [documents, allUserDocs, allBookmarks] = await Promise.all([
        mockService.searchDocuments(query),
        currentUser ? mockService.getDocumentsForUser(currentUser.id) : Promise.resolve([]),
        currentUser ? mockService.getBookmarksForUser(currentUser.id) : Promise.resolve([])
      ]);
      
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      const allBookmarkedDocs = allBookmarks.map(bookmark => bookmark.document);
      
      // For users search - only perform if text query has changed or no current results
      const currentUserResults = userResultsRef.current;
      let updatedUsers: MockUser[] = [];
      
      if (query.trim()) {
        if (query.trim() !== lastTextQueryRef.current || currentUserResults.length === 0) {
          // Perform comprehensive user search across multiple fields
          const searchTerm = query.trim().toLowerCase();
          const allUsers = await mockService.getUsers();
          updatedUsers = allUsers.filter(user => {
            const firstName = user.firstName.toLowerCase();
            const lastName = user.lastName.toLowerCase();
            const username = user.username.toLowerCase();
            const bio = user.bio.toLowerCase();
            
            return firstName.includes(searchTerm) ||
                   lastName.includes(searchTerm) ||
                   username.includes(searchTerm) ||
                   bio.includes(searchTerm) ||
                   `${firstName} ${lastName}`.includes(searchTerm);
          });
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
      
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      let filteredDocuments = documents;
      
      if (tags.length > 0) {
        const fileTypeFilters = tags.filter(tag => fileTypeTags.includes(tag));
        const regularTags = tags.filter(tag => !fileTypeTags.includes(tag));
        
        const applyFilters = (docs: MockDocument[]) => {
          let filtered = docs;
          
          if (regularTags.length > 0) {
            filtered = filtered.filter(doc => 
              doc.file.tags.some(tag => regularTags.includes(tag))
            );
          }
          
          if (fileTypeFilters.length > 0) {
            filtered = filtered.filter(doc => 
              fileTypeFilters.includes(doc.file.type.toLowerCase())
            );
          }
          
          return filtered;
        };
        
        filteredDocuments = applyFilters(documents);
      }
      
      // Apply scoring and sorting to search results
      if (query.trim()) {
        filteredDocuments = sortDocumentsByRelevance(filteredDocuments, query);
      }
      
      const filteredUserDocs = allUserDocs.filter(doc => 
        filteredDocuments.some(searchDoc => searchDoc.id === doc.id)
      );
      
      const filteredBookmarks = allBookmarkedDocs.filter(doc => 
        filteredDocuments.some(searchDoc => searchDoc.id === doc.id)
      );

      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }

      requestAnimationFrame(() => {
        if (latestSearchRequestRef.current === currentRequestId) {
          Promise.resolve().then(() => {
            // If this is a user search or we're in the users tab, clear document results
            if (isUserSearch || activeTab === 'users') {
              setDocumentResults([]);
              setUserDocuments([]);
              setBookmarkResults([]);
            } else {
              setDocumentResults(filteredDocuments);
              setUserDocuments(filteredUserDocs);
              setBookmarkResults(filteredBookmarks);
            }
            setUserResults(updatedUsers);
            userResultsRef.current = updatedUsers;
            setIsLoading(false);
            setSearchCompleted(true);
          });
        }
      });
    } catch (error) {
      if (latestSearchRequestRef.current === currentRequestId) {
        setIsLoading(false);
        setSearchCompleted(true);
      }
    }
  }, [originalBookmarkResults, originalUserDocuments]);

  const completeTag = useCallback(() => {
    if (!currentTag) return;
    
    const normalizedTag = currentTag.trim().toLowerCase();
    if (!normalizedTag) return;
    
    if (!selectedTags.includes(normalizedTag)) {
      const newTags = [...selectedTags, normalizedTag];
      setSelectedTags(newTags);
      
      const newInputValue = inputValue.replace(/#\w*$/, '');
      setInputValue(newInputValue);
      
      const cleanQuery = newInputValue.trim();
      setSearchQuery(cleanQuery);
      
      setIsLoading(true);
      performSearch(cleanQuery, newTags);
    }
    
    setCurrentTag(null);
  }, [currentTag, selectedTags, inputValue, performSearch]);

  // Handle user search when @ is used
  const handleUserSearch = useCallback((userQuery: string) => {
    if (!userQuery.trim()) return;
    
    // Remove the @ from input and set it as the search query
    const newInputValue = inputValue.replace(/@\w*$/, userQuery);
    setInputValue(newInputValue);
    
    // Strip @ symbols from the user query for searching
    const cleanUserQuery = userQuery.replace(/@/g, '');
    setSearchQuery(cleanUserQuery);
    
    // Reset current user
    setCurrentUser(null);
    
    // Perform search with the clean user query
    setIsLoading(true);
    performSearch(cleanUserQuery, selectedTags);
  }, [inputValue, selectedTags, performSearch]);

  const debouncedSearch = useMemo(() => 
    debounce((query: string, tags: string[]) => {
      performSearch(query, tags);
    }, 500),
    [performSearch]
  );

  const throttledUIUpdate = useMemo(() => 
    throttle((value: string) => {
      setInputValue(value);
      const tagBeingTyped = extractCurrentTag(value);
      setCurrentTag(tagBeingTyped);
      // Extract user being typed
      const userBeingTyped = extractCurrentUser(value);
      setCurrentUser(userBeingTyped);
    }, 50),
    []
  );

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Close help tooltip and mark that user has started typing
    if (value.length > 0 && !hasUserStartedTyping) {
      setHasUserStartedTyping(true);
      setShowHelpTooltip(false);
    }
    
    throttledUIUpdate(value);
    
    // Check if this is a user search (starts with @ and has a complete username)
    const userMatch = value.match(/@(\w+)/);
    const isUserSearch = userMatch && userMatch[1].length > 0;
    
    let cleanQuery = value.replace(/#\w*$/, '').trim();
    
    if (isUserSearch) {
      // If there's a complete user search pattern, extract the username
      const username = userMatch[1];
      cleanQuery = cleanQuery.replace(/@\w+/g, username);
      
      // Auto-switch to users tab when user search is detected
      if (activeTab !== 'users') {
        setActiveTab('users');
      }
    } else {
      // Remove incomplete user search patterns (e.g., "@" with no following text)
      cleanQuery = cleanQuery.replace(/@\w*$/, '');
    }
    
    // Set user search state
    setIsUserSearch(!!isUserSearch);
    
    // For user tab, remove any remaining @ symbols
    if (activeTab === 'users') {
      cleanQuery = cleanQuery.replace(/@/g, '');
    }
    
    setSearchQuery(cleanQuery);
    
    lastTextQueryRef.current = cleanQuery;
    
    debouncedSearch(cleanQuery, selectedTags);
  }, [throttledUIUpdate, debouncedSearch, selectedTags, activeTab, hasUserStartedTyping]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Complete tag on Enter
    if (e.key === 'Enter' && currentTag) {
      e.preventDefault();
      completeTag();
    }
    // Complete user search on Enter
    else if (e.key === 'Enter' && currentUser) {
      e.preventDefault();
      handleUserSearch(currentUser);
    }
    // Complete current tag and start a new one when # is typed
    else if (e.key === '#') {
      if (currentTag) {
        e.preventDefault();
        completeTag();
        // Add the # character after completing the tag
        setTimeout(() => {
          setInputValue((prev) => `${prev}#`);
        }, 0);
      }
    }
    // Complete current user search and start a new one when @ is typed
    else if (e.key === '@') {
      if (currentUser) {
        e.preventDefault();
        handleUserSearch(currentUser);
        // Add the @ character after completing the user search
        setTimeout(() => {
          setInputValue((prev) => `${prev}@`);
        }, 0);
      }
    }
    // Handle space - finalize tag or user search without adding space to the input
    else if (e.key === ' ' && (currentTag || currentUser)) {
      e.preventDefault();
      if (currentTag) {
        completeTag();
      } else if (currentUser) {
        handleUserSearch(currentUser);
      }
    }
  }, [currentTag, currentUser, completeTag, handleUserSearch]);

  const handleRecentSearchClick = useCallback((searchTerm: string) => {
    const tagRegex = /#(\w+)/g;
    const extractedTags: string[] = [];
    let match: RegExpExecArray | null = tagRegex.exec(searchTerm);
    while (match !== null) {
      extractedTags.push(match[1]);
      match = tagRegex.exec(searchTerm);
    }
    
    const cleanQuery = searchTerm.replace(/#\w+\s*/g, '').trim();
    
    setInputValue(cleanQuery);
    setSearchQuery(cleanQuery);
    setSelectedTags(extractedTags);
    setIsLoading(true);
    
    // Close tooltip and mark that user has interacted since there's content now
    if (cleanQuery || extractedTags.length > 0) {
      setShowHelpTooltip(false);
      setHasUserStartedTyping(true);
    }
    
    performSearch(cleanQuery, extractedTags);
  }, [performSearch]);

  const handleTagClick = useCallback((tag: string) => {
    let updatedTags: string[];
    
    if (selectedTags.includes(tag)) {
      updatedTags = selectedTags.filter(t => t !== tag);
    } else {
      updatedTags = [...selectedTags, tag];
    }
    
    setSelectedTags(updatedTags);
    
    const newInputValue = inputValue.replace(/#\w*$/, '');
    setInputValue(newInputValue);
    
    setIsLoading(true);
    performSearch(searchQuery, updatedTags);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags, inputValue, searchQuery, performSearch]);

  const handleRemoveTagFromInput = useCallback((tag: string) => {
    const updatedTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(updatedTags);
    
    setIsLoading(true);
    performSearch(searchQuery, updatedTags);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags, searchQuery, performSearch]);

  const handleSuggestionClick = useCallback((suggestedTag: string) => {
    const updatedTags = [...selectedTags, suggestedTag];
    setSelectedTags(updatedTags);
    
    const newInputValue = inputValue.replace(/#\w*$/, '');
    setInputValue(newInputValue);
    
    const cleanQuery = newInputValue.trim();
    setSearchQuery(cleanQuery);
    
    setCurrentTag(null);
    
    setIsLoading(true);
    performSearch(cleanQuery, updatedTags);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue, selectedTags, performSearch]);

  const navigateToUserProfile = useCallback((username: string) => {
    // Check if it's the current user
    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
    
    if (username === currentUsername) {
      // Navigate to own profile page
      appNavigate('/profile');
    } else {
      // Navigate to other user's profile
      appNavigate(`/profile/${username}`);
    }
    
    // Close the modal after navigation
    onClose();
  }, [appNavigate, onClose]);

  const navigateToDocument = useCallback((documentId: string) => {
    const doc = [...documentResults, ...bookmarkResults, ...userDocuments].find(doc => doc.id === documentId);
    if (doc) {
      setSelectedDoc(doc);
      setIsDocModalOpen(true);
    }
  }, [documentResults, bookmarkResults, userDocuments]);

  const navigateToComments = useCallback((documentId: string) => {
    // In a real app, we would use a router here
  }, []);

  const navigateToReviews = useCallback((documentId: string) => {
    // In a real app, we would use a router here
  }, []);

  const navigateToUserUploads = useCallback((userId: string) => {
    // In a real app, we would use a router here
  }, []);

  const lastQueryRef = useRef(searchQuery);
  const lastTagsRef = useRef(selectedTags);
  const isInitialMountRef = useRef(true);
  const userResultsRef = useRef<MockUser[]>([]);
  const searchQueryRef = useRef(searchQuery);
  const selectedTagsRef = useRef(selectedTags);
  const performSearchRef = useRef(performSearch);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    selectedTagsRef.current = selectedTags;
    performSearchRef.current = performSearch;
    userResultsRef.current = userResults;
  }, [searchQuery, selectedTags, performSearch, userResults]);

  useEffect(() => {
    if (isOpen) {
      const queryChanged = lastQueryRef.current !== searchQueryRef.current;
      const tagsChanged = JSON.stringify(lastTagsRef.current) !== JSON.stringify(selectedTagsRef.current);
      
      lastQueryRef.current = searchQueryRef.current;
      lastTagsRef.current = selectedTagsRef.current;
      
      if (isInitialMountRef.current || queryChanged || tagsChanged) {
        if (selectedTagsRef.current.length > 0 || searchQueryRef.current) {
          setTimeout(() => {
            performSearchRef.current(searchQueryRef.current, selectedTagsRef.current);
          }, 0);
        } else {
          setSearchCompleted(true);
        }
      }
    } else if (!isInitialMountRef.current) {
      setInputValue('');
      setSearchQuery('');
      setDocumentResults([]);
      setUserResults([]);
      setBookmarkResults([]);
      setIsLoading(false);
      setSearchCompleted(false);
      setSelectedTags([]);
      setCurrentTag(null);
      setShowHelpTooltip(false);
      setHasUserStartedTyping(false);
      lastTextQueryRef.current = '';
      userResultsRef.current = [];
      
      const requestId = Date.now();
      latestSearchRequestRef.current = requestId;
    }
    
    isInitialMountRef.current = false;
    
    return () => {
      const requestId = Date.now();
      latestSearchRequestRef.current = requestId;
    };
  }, [isOpen]);

  const getUniqueKey = useCallback((prefix: string, value: string, fallback?: number) => {
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${prefix}-${value}-${hash}${fallback ? `-${fallback}` : ''}`;
  }, []);

  const toggleBookmark = useCallback((docId: string) => {
    if (bookmarkResults.some(doc => doc.id === docId)) {
      setBookmarkResults(prev => prev.filter(doc => doc.id !== docId));
    } else {
      const docToAdd = documentResults.find(doc => doc.id === docId) || 
                       userDocuments.find(doc => doc.id === docId);
      if (docToAdd) {
        setBookmarkResults(prev => [...prev, docToAdd]);
      }
    }
  }, [documentResults, bookmarkResults, userDocuments]);

  const handleClearAll = useCallback(() => {
    setInputValue('');
    setSelectedTags([]);
    setCurrentTag(null);
    setCurrentUser(null);
    setIsUserSearch(false);
    setSearchQuery('');
    setDocumentResults([]);
    setUserResults([]);
    setIsLoading(false);
    setSearchCompleted(false);
    setHasUserStartedTyping(false);
    
    lastTextQueryRef.current = '';
    userResultsRef.current = [];
    
    const requestId = Date.now();
    latestSearchRequestRef.current = requestId;
    
    const loadInitialData = async () => {
      try {
        const users = mockService.getUsers();
        const currentUser = users.find(user => user.username === "bartsimpson");
        
        if (currentUser) {
          const [userDocsData, bookmarksData] = await Promise.all([
            mockService.getDocumentsForUser(currentUser.id),
            mockService.getBookmarksForUser(currentUser.id)
          ]);
          setUserDocuments(userDocsData);
          const bookmarkedDocs = bookmarksData.map((bookmark: MockBookmark) => bookmark.document);
          setBookmarkResults(bookmarkedDocs);
        }
      } catch (error) {
        console.error('Error reloading initial data:', error);
      }
    };
    
    loadInitialData();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
    }, []);

  const handleHelpButtonClick = useCallback(() => {
    // Toggle tooltip on click
    setShowHelpTooltip(prev => !prev);
  }, []);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 text-lg font-medium select-none">
            <Search size={18} />
            <span>Cerca in CloudNotes</span>
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
            currentUser={currentUser}
            activeTab={activeTab}
            handleSearchInputChange={handleSearchInputChange}
            handleKeyPress={handleKeyPress}
            handleRemoveTagFromInput={handleRemoveTagFromInput}
            handleSuggestionClick={handleSuggestionClick}
            inputRef={inputRef}
            searchContainerRef={searchContainerRef}
            fileTypeTags={fileTypeTags}
            onClearAll={handleClearAll}
            showHelpTooltip={showHelpTooltip}
            onHelpButtonClick={handleHelpButtonClick}
          />

          <Tabs defaultValue="discover" value={activeTab} onValueChange={(value) => setActiveTab(value as 'discover' | 'users' | 'saved' | 'user')}>
            <div className="flex justify-between items-center mb-4">
              <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow select-none flex gap-1">
                <TabsTrigger value="discover" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <Compass size={16} className="select-none" />
                  <span>Scopri</span>
                  {documentResults.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {documentResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="users" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <Users size={16} className="select-none" />
                  <span>Utenti</span>
                  {userResults.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {userResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="saved" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <BookmarkIcon size={16} className="select-none" />
                  <span>Salvati</span>
                  {bookmarkResults.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {bookmarkResults.length}
                    </Badge>
                  )}
                </TabsTrigger>
                
                <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
                
                <TabsTrigger value="user" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                  <FolderHeart size={16} className="select-none" />
                  <span>I Tuoi Documenti</span>
                  {userDocuments.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                      {userDocuments.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              {selectedTags.length > 0 && activeTab === 'users' && (
                <div className="text-xs text-muted-foreground flex items-center gap-1 select-none ml-2">
                  <HelpCircle size={14} className="select-none" />
                  <span>I tag non sono applicabili alla ricerca utenti</span>
                </div>
              )}
            </div>

            {!searchQuery && !selectedTags.length && activeTab === 'discover' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 select-none">
                  <Clock size={14} className="select-none" />
                  Ricerche Recenti
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => {
                    const hasTags = term.includes('#');
                    return (
                      <Button
                        key={getUniqueKey('recent', term)}
                        variant="outline"
                        size="sm"
                        className={`cursor-pointer rounded-full text-sm select-none hover:bg-primary/5 hover:border-primary/20 transition-colors ${hasTags ? 'bg-muted/10' : ''}`}
                        onClick={() => handleRecentSearchClick(term)}
                      >
                        {hasTags ? (
                          <div className="flex items-center gap-1.5">
                            {term.split(/\s+/).map((part) => {
                              if (part.startsWith('#')) {
                                const tagName = part.slice(1).toLowerCase();
                                let tagStyles = "text-xs px-1.5 py-0 mr-1 border select-none ";
                                
                                if (fileTypeTags.includes(tagName)) {
                                  switch (tagName) {
                                    case 'pdf':
                                      tagStyles += "bg-red-200 text-red-800 border-red-300";
                                      break;
                                    case 'word':
                                      tagStyles += "bg-blue-200 text-blue-800 border-blue-300";
                                      break;
                                    case 'powerpoint':
                                      tagStyles += "bg-orange-200 text-orange-800 border-orange-300";
                                      break;
                                    case 'txt':
                                      tagStyles += "bg-gray-200 text-gray-800 border-gray-300";
                                      break;
                                    case 'epub':
                                      tagStyles += "bg-green-200 text-green-800 border-green-300";
                                      break;
                                    default:
                                      tagStyles += "bg-primary/80 text-primary-foreground border-primary";
                                  }
                                } else {
                                  tagStyles += "bg-primary/80 text-primary-foreground border-primary";
                                }
                                
                                return (
                                  <Badge key={getUniqueKey('tag', tagName)} className={tagStyles}>
                                    {tagName}
                                  </Badge>
                                );
                              }
                              return <span key={getUniqueKey('text', part)}>{part}</span>;
                            })}
                          </div>
                        ) : (
                          term
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  <h3 className="text-lg font-medium">Nessun documento trovato</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `Non abbiamo trovato documenti corrispondenti a "${searchQuery}"` : 
                      "Nessun documento corrisponde ai filtri selezionati"}
                    {selectedTags.length > 0 ? ' con i tag selezionati' : ''}. 
                    {searchQuery ? ' Prova un termine di ricerca diverso' : ' Prova ad aggiustare i filtri'}
                    {selectedTags.length > 0 ? ' o rimuovi alcuni tag' : ''}.
                  </p>
                </div>
              ) : documentResults.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Scopri documenti</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Inserisci un termine di ricerca per trovare documenti per nome, contenuto o tag.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Trovat{documentResults.length !== 1 ? 'i' : 'o'} {documentResults.length} document{documentResults.length !== 1 ? 'i' : 'o'}
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

            <TabsContent value="users" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
              {isLoading && !searchCompleted ? (
                <>
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                  <UserSkeleton />
                </>
              ) : searchQuery && userResults.length === 0 && searchCompleted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Nessun utente trovato</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Non abbiamo trovato utenti corrispondenti a "{searchQuery}". Prova un termine di ricerca diverso.
                  </p>
                </div>
              ) : searchQuery ? (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Trovat{userResults.length !== 1 ? 'i' : 'o'} {userResults.length} utent{userResults.length !== 1 ? 'i' : 'e'}
                    </div>
                  )}
                  {userResults.map((user) => (
                    <UserItem 
                      key={user.id} 
                      user={user} 
                      navigateToUserProfile={navigateToUserProfile} 
                      navigateToUserUploads={navigateToUserUploads} 
                    />
                  ))}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Cerca utenti</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Inserisci un termine di ricerca per trovare utenti per nome o nome utente.
                  </p>
                </div>
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
                  <h3 className="text-lg font-medium">Nessun documento salvato trovato</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `Non abbiamo trovato documenti salvati corrispondenti a "${searchQuery}"` : 
                      "Nessun documento salvato corrisponde ai filtri selezionati"}
                    {selectedTags.length > 0 ? ' con i tag selezionati' : ''}. 
                    {searchQuery ? ' Prova un termine di ricerca diverso' : ' Prova ad aggiustare i filtri'}
                    {selectedTags.length > 0 ? ' o rimuovi alcuni tag' : ''}.
                  </p>
                </div>
              ) : bookmarkResults.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Nessun documento salvato ancora</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Non hai ancora salvato documenti. I documenti salvati appariranno qui.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Trovat{bookmarkResults.length !== 1 ? 'i' : 'o'} {bookmarkResults.length} document{bookmarkResults.length !== 1 ? 'i' : 'o'} salvat{bookmarkResults.length !== 1 ? 'i' : 'o'}
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
                  <h3 className="text-lg font-medium">Nessun documento utente trovato</h3>
                  <p className="text-muted-foreground max-w-sm">
                    {searchQuery ? 
                      `Non abbiamo trovato tuoi documenti corrispondenti a "${searchQuery}"` : 
                      "Nessuno dei tuoi documenti corrisponde ai filtri selezionati"}
                    {selectedTags.length > 0 ? ' con i tag selezionati' : ''}. 
                    {searchQuery ? ' Prova un termine di ricerca diverso' : ' Prova ad aggiustare i filtri'}
                    {selectedTags.length > 0 ? ' o rimuovi alcuni tag' : ''}.
                  </p>
                </div>
              ) : userDocuments.length === 0 && !searchQuery && !selectedTags.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                  <FolderHeart className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">Nessun documento utente</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Non hai ancora caricato documenti. Carica file per accedervi qui.
                  </p>
                </div>
              ) : (
                <>
                  {searchCompleted && (
                    <div className="mb-2 text-sm text-muted-foreground select-none">
                      Trovat{userDocuments.length !== 1 ? 'i' : 'o'} {userDocuments.length} document{userDocuments.length !== 1 ? 'i' : 'o'} caricat{userDocuments.length !== 1 ? 'i' : 'o'} da te
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
            onClose();
          }}
        />
      )}
    </>
  );
});

export default SearchModal; 