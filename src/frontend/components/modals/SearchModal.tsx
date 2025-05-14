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
  FileText, 
  User, 
  Clock, 
  Star, 
  MessageSquare, 
  Eye, 
  FileIcon,
  X,
  BookmarkIcon,
  HelpCircle
} from 'lucide-react';
import { mockDataService, type MockDocument, type MockUser } from '../../lib/mockData';
import { debounce, throttle } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  return dateFormatter.format(date);
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

// Document item component - optimized with proper memoization
const DocumentItem = memo(({ document, selectedTags, handleTagClick, navigateToDocument, navigateToUserProfile, navigateToReviews, navigateToComments, bookmarkResults }: { 
  document: MockDocument;
  selectedTags: string[];
  handleTagClick: (tag: string) => void;
  navigateToDocument: (id: string) => void;
  navigateToUserProfile: (username: string) => void;
  navigateToReviews: (id: string) => void;
  navigateToComments: (id: string) => void;
  bookmarkResults: MockDocument[];
}) => {
  // Check if the document is bookmarked (in a real app, this would use actual user data)
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
    formatDate(document.uploadDate), 
    [document.uploadDate]
  );

  // Get file icon based on file type
  const fileIcon = useMemo(() => {
    const fileTypeLower = document.fileType.toLowerCase();
    const isSelected = selectedTags.includes(fileTypeLower);
    
    const handleFileTypeClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering document click
      handleTagClick(fileTypeLower);
    };
    
    const getBadgeStyles = () => {
      const baseStyles = "cursor-pointer ";
      
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
        {document.fileType.toUpperCase()}
      </Badge>
    );
  }, [document.fileType, selectedTags, handleTagClick]);
  
  // Memoize the rendered tags to prevent unnecessary re-renders
  const renderedTags = useMemo(() => {
    if (document.tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {document.tags.map((tag) => {
          // Check if it's a file type tag - unlikely but let's handle it anyway
          const isFileType = fileTypeTags.includes(tag);
          let tagStyles = "text-xs px-1.5 py-0 cursor-pointer border ";
          
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
            tagStyles += "bg-muted/50 text-muted-foreground hover:bg-muted border-primary/30";
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
      </div>
    );
  }, [document.tags, selectedTags, handleTagClick]);
  
  return (
    <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none">
      <div className="flex items-start gap-3">
        <button 
          className="flex-shrink-0 w-16 h-16 bg-muted/30 rounded flex items-center justify-center overflow-hidden cursor-pointer relative"
          onClick={() => navigateToDocument(document.id)}
          aria-label={`Open ${document.name}`}
          type="button"
        >
          <img 
            src={documentPlaceholder} 
            alt={document.name} 
            className="w-full h-full object-cover"
          />
          {isBookmarked && (
            <div className="absolute top-1 right-1 bg-primary/80 rounded-full p-0.5">
              <BookmarkIcon size={12} className="text-primary-foreground" />
            </div>
          )}
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <button
              className="font-medium truncate cursor-pointer hover:text-primary text-left bg-transparent border-0 p-0"
              onClick={() => navigateToDocument(document.id)}
              type="button"
            >
              {document.name}
            </button>
            {fileIcon}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formattedDate}</span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center gap-1 cursor-pointer hover:text-primary bg-transparent border-0 p-0"
                  onClick={() => navigateToReviews(document.id)}
                  type="button"
                >
                  <Star size={14} className="text-yellow-500" />
                  <span>{document.rating.toFixed(1)}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Rating</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center gap-1 cursor-pointer hover:text-primary bg-transparent border-0 p-0"
                  onClick={() => navigateToComments(document.id)}
                  type="button"
                >
                  <MessageSquare size={14} />
                  <span>{document.commentCount}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>Comments</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-1.5 mt-2">
            <Avatar 
              className="h-5 w-5 cursor-pointer"
              onClick={() => navigateToUserProfile(document.uploaderUsername)}
            >
              <img src={document.uploaderAvatar} alt={document.uploaderUsername} />
            </Avatar>
            <button
              className="text-sm cursor-pointer hover:text-primary bg-transparent border-0 p-0 text-left"
              onClick={() => navigateToUserProfile(document.uploaderUsername)}
              type="button"
            >
              {document.uploaderUsername}
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            {renderedTags}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{document.viewCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Views</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-1 ${isBookmarked ? 'text-primary font-medium' : ''}`}>
                    <BookmarkIcon size={12} className={isBookmarked ? 'text-primary fill-primary' : ''} />
                    <span>{document.downloadCount}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Bookmarks</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <span>{document.fileSize}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>File size</TooltipContent>
              </Tooltip>
            </div>
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
}) => (
  <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none">
    <div className="flex items-start gap-3">
      <button 
        className="h-12 w-12 relative rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => navigateToUserProfile(user.username)}
        aria-label={`View ${user.username}'s profile`}
        type="button"
      >
        <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
      </button>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <button 
            className="font-medium cursor-pointer hover:text-primary text-left bg-transparent border-0 p-0"
            onClick={() => navigateToUserProfile(user.username)}
            type="button"
          >
            {user.firstName} {user.lastName}
          </button>
          <Badge 
            variant="outline" 
            className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100"
            onClick={() => navigateToUserProfile(user.username)}
          >
            @{user.username}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
        
        <div className="flex items-center justify-between mt-2">
          {user.publicDocumentsCount > 0 && (
            <button
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary bg-transparent border-0 p-0"
              onClick={() => navigateToUserUploads(user.id)}
              type="button"
            >
              <FileIcon size={14} />
              <span>{user.publicDocumentsCount} public documents</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </Card>
));
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
  fileTypeTags
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
  
  return (
    <div className="mb-6">
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none" size={18} />
        <div 
          ref={searchContainerRef}
          className="pl-10 pr-4 py-2 rounded-full border border-muted-foreground/40 bg-background flex flex-wrap items-center gap-2"
        >
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
  const [activeTab, setActiveTab] = useState<'documents' | 'users' | 'bookmarks'>('documents');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [documentResults, setDocumentResults] = useState<MockDocument[]>([]);
  const [userResults, setUserResults] = useState<MockUser[]>([]);
  const [bookmarkResults, setBookmarkResults] = useState<MockDocument[]>([]);
  const [recentSearches] = useState<string[]>(mockDataService.getRecentSearches());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  // Add a ref to track the latest search request
  const latestSearchRequestRef = useRef<number>(0);
  // Store the last text query (without tags) for user search persistence
  const lastTextQueryRef = useRef<string>('');

  // Function to perform a search and apply tag filters - optimized with useCallback
  const performSearch = useCallback(async (query: string, tags: string[]) => {
    // Generate a unique ID for this search request
    const currentRequestId = Date.now();
    latestSearchRequestRef.current = currentRequestId;
    
    // Set loading state at the beginning of the search
    setIsLoading(true);
    setSearchCompleted(false);

    try {
      // If there's no query and no tags, don't show results
      if (!query.trim() && tags.length === 0) {
        setDocumentResults([]);
        setUserResults([]);
        setBookmarkResults([]);
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
      
      // Batch state updates to reduce renders
      let updatedDocuments: MockDocument[] = [];
      let updatedBookmarks: MockDocument[] = [];
      let updatedUsers: MockUser[] = [];
      
      // Reduce number of async operations by parallel fetching
      const [documents, bookmarks] = await Promise.all([
        mockDataService.searchDocuments(query),
        mockDataService.searchBookmarks(query)
      ]);
      
      // Check again if this search is still relevant
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // For users search - only perform if text query has changed or no current results
      const currentUserResults = userResultsRef.current;
      if (query.trim()) {
        if (query.trim() !== lastTextQueryRef.current || currentUserResults.length === 0) {
          updatedUsers = await mockDataService.searchUsers(query);
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
      if (tags.length > 0) {
        // Split tags into normal tags and file type tags
        const fileTypeFilters = tags.filter(tag => fileTypeTags.includes(tag));
        const regularTags = tags.filter(tag => !fileTypeTags.includes(tag));
        
        // Apply filtering function to both documents and bookmarks
        const applyFilters = (docs: MockDocument[]) => {
          let filtered = docs;
          
          // Apply regular tag filtering
          if (regularTags.length > 0) {
            filtered = filtered.filter(doc => 
              doc.tags.some(tag => regularTags.includes(tag))
            );
          }
          
          // Apply file type filtering
          if (fileTypeFilters.length > 0) {
            filtered = filtered.filter(doc => 
              fileTypeFilters.includes(doc.fileType.toLowerCase())
            );
          }
          
          return filtered;
        };
        
        updatedDocuments = applyFilters(documents);
        updatedBookmarks = applyFilters(bookmarks);
      } else {
        updatedDocuments = documents;
        updatedBookmarks = bookmarks;
      }

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
            setDocumentResults(updatedDocuments);
            setBookmarkResults(updatedBookmarks);
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
  }, []); // Keep this dependency array empty to avoid re-creating the function

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
    }, 1000), // Increased to 1000ms (1 second) for better performance
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
    // In a real app, we would use a router here
  }, []);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium select-none">
          <Search size={18} />
          <span>Search CloudNotes</span>
        </div>
      }
      maxWidth="max-w-3xl"
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
        />

        {!searchQuery && !selectedTags.length && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5 select-none">
              <Clock size={14} className="select-none" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => {
                // Check if term contains tags
                const hasTags = term.includes('@');
                return (
                  <Button
                    key={getUniqueKey('recent', term)}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer rounded-full text-sm select-none ${hasTags ? 'bg-muted/10' : ''}`}
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    {hasTags ? (
                      <div className="flex items-center gap-1.5">
                        {term.split(/\s+/).map((part) => {
                          if (part.startsWith('@')) {
                            const tagName = part.slice(1).toLowerCase();
                            let tagStyles = "text-xs px-1.5 py-0 mr-1 border select-none ";
                            
                            // Apply file type specific styling
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
                              // Regular tag styling
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

        <Tabs defaultValue="documents" value={activeTab} onValueChange={(value) => setActiveTab(value as 'documents' | 'users' | 'bookmarks')}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow select-none">
              <TabsTrigger value="documents" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <FileText size={16} className="select-none" />
                <span>Documents</span>
                {documentResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {documentResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <User size={16} className="select-none" />
                <span>Users</span>
                {userResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {userResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <BookmarkIcon size={16} className="select-none" />
                <span>Bookmarks</span>
                {bookmarkResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {bookmarkResults.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Tag information message moved to right side of tabs */}
            {selectedTags.length > 0 && activeTab === 'users' && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 select-none">
                <HelpCircle size={12} className="select-none" />
                <span>Tags are not applicable to users search</span>
              </div>
            )}
          </div>

          <TabsContent value="documents" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              // Loading state - only show when actually loading and search not completed
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : documentResults.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
              // No results state - only show when search completed with no results
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
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
              // Initial state - no search performed yet
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Search for documents</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a search term to find documents by name, content, or tags.
                </p>
              </div>
            ) : (
              // Results state - documents found
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {documentResults.length} document{documentResults.length !== 1 ? 's' : ''}
                  {selectedTags.length > 0 && ' matching your filters'}
                </div>
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
                  />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              // Loading state - only show when actually loading and search not completed
              <>
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
              </>
            ) : searchQuery && userResults.length === 0 && searchCompleted ? (
              // No results state
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No users found</h3>
                <p className="text-muted-foreground max-w-sm">
                  We couldn't find any users matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : searchQuery ? (
              // Results state
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {userResults.length} user{userResults.length !== 1 ? 's' : ''}
                </div>
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
              // Empty state - no search yet
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Search for users</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a search term to find users by name or username.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bookmarks" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              // Loading state - only show when actually loading and search not completed
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : bookmarkResults.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
              // No results state - only show when a search was attempted
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No bookmarks found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 
                    `We couldn't find any bookmarked documents matching "${searchQuery}"` : 
                    "No bookmarked documents match the selected filters"}
                  {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                  {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                  {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                </p>
              </div>
            ) : bookmarkResults.length === 0 && !searchQuery && !selectedTags.length ? (
              // Initial state - no search performed yet
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Search your bookmarks</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a search term to find your bookmarked documents.
                </p>
              </div>
            ) : (
              // Results state
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {bookmarkResults.length} bookmark{bookmarkResults.length !== 1 ? 's' : ''}
                  {selectedTags.length > 0 && ' matching your filters'}
                </div>
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
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
});

export default SearchModal; 