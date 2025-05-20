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
  Clock, 
  Star, 
  MessageSquare, 
  Eye, 
  FileIcon,
  X,
  BookmarkIcon,
  HelpCircle,
  LayoutGrid,
  User,
  Compass,
  FolderHeart,
  History
} from 'lucide-react';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockBookmark } from '../../lib/mocking/mocked';
import { debounce } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import DocumentView from './DocumentView';

// Import placeholder images (same as in SearchModal)
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

// Pool placeholder images
const placeholderImages = [
  placeholder1, placeholder7, placeholder8, placeholder9, placeholder10, 
  placeholder11, placeholder12, placeholder13, placeholder14, placeholder15, 
  placeholder16, placeholder17, placeholder18, placeholder19, placeholder20, 
  placeholder21
];

// File type tags
const fileTypeTags = ['pdf', 'word', 'txt', 'powerpoint', 'epub'];

// Date formatter
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

// Document skeleton for loading state
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

// Get document placeholder image
const getDocumentPlaceholder = (docId: string) => {
  const charSum = docId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = charSum % placeholderImages.length;
  return placeholderImages[index];
};

// Function to render thumbnail from color:text format
const renderThumbnail = (thumbnailData: string, title: string) => {
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

// Adapts document for display
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
    isPublic: doc.file.isPublic
  };
};

// Document item component - for displaying file items in all tabs
const DocumentItem = memo(({ document, selectedTags, handleTagClick, navigateToDocument, isBookmarked }: { 
  document: MockDocument;
  selectedTags: string[];
  handleTagClick: (tag: string) => void;
  navigateToDocument: (id: string) => void;
  isBookmarked: boolean;
}) => {
  // Adapt the document to the display format
  const displayDoc = useMemo(() => adaptDocumentForDisplay(document), [document]);
  
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
        {displayDoc.fileType.toUpperCase()}
      </Badge>
    );
  }, [displayDoc.fileType, selectedTags, handleTagClick]);
  
  // Memoize the rendered tags to prevent unnecessary re-renders
  const renderedTags = useMemo(() => {
    if (displayDoc.tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 overflow-hidden max-w-[300px]">
        {displayDoc.tags.map((tag: string) => {
          // Check if it's a file type tag 
          const isFileType = fileTypeTags.includes(tag);
          let tagStyles = "text-xs px-1.5 py-0 cursor-pointer border ";
          
          if (selectedTags.includes(tag)) {
            // Selected styles
            if (isFileType) {
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
  }, [displayDoc.tags, selectedTags, handleTagClick]);
  
  return (
    <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none">
      <div className="flex items-start gap-3">
        <button 
          className="flex-shrink-0 w-24 h-32 bg-muted/30 rounded flex items-center justify-center overflow-hidden cursor-pointer relative"
          onClick={() => navigateToDocument(document.id)}
          aria-label={`Open ${displayDoc.name}`}
          type="button"
        >
          {renderThumbnail(displayDoc.thumbnailUrl, displayDoc.name)}
          {isBookmarked && (
            <div className="absolute top-1 right-1 bg-primary/80 rounded-full p-0.5">
              <BookmarkIcon size={12} className="text-primary-foreground" />
            </div>
          )}
        </button>
        
        <div className="flex-grow min-w-0 flex flex-col justify-between h-32">
          <div>
            <div className="flex items-center justify-between">
              <button
                className="font-medium truncate cursor-pointer hover:text-primary text-left bg-transparent border-0 p-0"
                onClick={() => navigateToDocument(document.id)}
                type="button"
              >
                {displayDoc.name}
              </button>
              {fileIcon}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formattedDate}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500" />
                      <span>{displayDoc.rating.toFixed(1)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Rating</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>{displayDoc.commentCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Comments</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2">
              <Avatar 
                className="h-5 w-5"
              >
                <img src={displayDoc.uploaderAvatar} alt={displayDoc.uploaderUsername} />
              </Avatar>
              <span className="text-sm">
                {displayDoc.uploaderUsername}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            {renderedTags}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{displayDoc.viewCount} views</span>
              </div>
              
              <div className="flex items-center gap-1">
                <BookmarkIcon size={12} />
                <span>{displayDoc.downloadCount} bookmarks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
DocumentItem.displayName = 'DocumentItem';

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileBrowserModal: React.FC<FileBrowserModalProps> = ({ isOpen, onClose }) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'recent' | 'bookmarks' | 'discover' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<MockDocument[]>([]);
  const [bookmarkedDocuments, setBookmarkedDocuments] = useState<MockDocument[]>([]);
  const [discoverDocuments, setDiscoverDocuments] = useState<MockDocument[]>([]);
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const latestSearchRequestRef = useRef<number>(0);
  
  // Load initial data when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Load all files and collections
      setIsLoading(true);
      
      // Get the current user (bartsimpson for demo purposes)
      const users = mockService.getUsers();
      const currentUser = users.find(user => user.username === "bartsimpson");
      
      Promise.all([
        mockService.getDocuments(),
        currentUser ? mockService.getBookmarksForUser(currentUser.id) : Promise.resolve([]),
        currentUser ? mockService.getDocumentsForUser(currentUser.id) : Promise.resolve([])
      ]).then(([recentDocs, bookmarkDocs, userDocs]) => {
        setRecentDocuments(recentDocs);
        
        // Convert bookmarks to MockDocument type
        const bookmarkedDocs = bookmarkDocs.map(bookmark => bookmark.document);
        
        setBookmarkedDocuments(bookmarkedDocs);
        setUserDocuments(userDocs);
        
        // Also set discover documents to all available documents initially
        setDiscoverDocuments(recentDocs);
        
        setIsLoading(false);
        setSearchCompleted(true);
      });
    }
  }, [isOpen]);

  // Perform search when in the discover tab
  const performSearch = useCallback(async (query: string, tags: string[]) => {
    const currentRequestId = Date.now();
    latestSearchRequestRef.current = currentRequestId;
    
    setIsLoading(true);
    setSearchCompleted(false);

    try {
      // Add a small delay to prevent flicker
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (latestSearchRequestRef.current !== currentRequestId) return;
      
      // Search for documents
      let documents = await mockService.searchDocuments(query);
      
      if (latestSearchRequestRef.current !== currentRequestId) return;
      
      // Apply tag filtering if there are selected tags
      if (tags.length > 0) {
        const fileTypeFilters = tags.filter(tag => fileTypeTags.includes(tag));
        const regularTags = tags.filter(tag => !fileTypeTags.includes(tag));
        
        // Filter documents by tags
        if (regularTags.length > 0) {
          documents = documents.filter(doc => 
            doc.file.tags.some(tag => regularTags.includes(tag))
          );
        }
        
        // Filter documents by file type
        if (fileTypeFilters.length > 0) {
          documents = documents.filter(doc => 
            fileTypeFilters.includes(doc.file.type.toLowerCase())
          );
        }
      }
      
      if (latestSearchRequestRef.current !== currentRequestId) return;

      // Get the current user (bartsimpson for demo purposes)
      const users = mockService.getUsers();
      const currentUser = users.find(user => user.username === "bartsimpson");
      
      // Fetch all document collections that we need to filter
      const [allRecentDocs, allBookmarkDocs, allUserDocs] = await Promise.all([
        mockService.getDocuments(),
        currentUser ? mockService.getBookmarksForUser(currentUser.id) : Promise.resolve([]),
        currentUser ? mockService.getDocumentsForUser(currentUser.id) : Promise.resolve([])
      ]);
      
      if (latestSearchRequestRef.current !== currentRequestId) return;
      
      // Convert bookmarks to MockDocument type
      const allBookmarkedDocs = allBookmarkDocs.map(bookmark => bookmark.document);
      
      // Filter each collection based on the search results
      const filteredRecent = allRecentDocs.filter(doc => 
        documents.some(searchDoc => searchDoc.id === doc.id)
      );
      
      const filteredBookmarks = allBookmarkedDocs.filter(doc => 
        documents.some(searchDoc => searchDoc.id === doc.id)
      );
      
      const filteredUserDocs = allUserDocs.filter(doc => 
        documents.some(searchDoc => searchDoc.id === doc.id)
      );
      
      // Update all document collections regardless of active tab
      setRecentDocuments(filteredRecent);
      setBookmarkedDocuments(filteredBookmarks);
      setUserDocuments(filteredUserDocs);
      setDiscoverDocuments(documents);
      
      setIsLoading(false);
      setSearchCompleted(true);
    } catch (error) {
      if (latestSearchRequestRef.current === currentRequestId) {
        setIsLoading(false);
        setSearchCompleted(true);
      }
    }
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(() => 
    debounce((query: string, tags: string[]) => {
      performSearch(query, tags);
    }, 300),
    [performSearch]
  );

  // Search input change handler
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value.trim());
    
    // Perform search in any tab
    debouncedSearch(value.trim(), selectedTags);
  }, [debouncedSearch, selectedTags]);

  // Navigate to document
  const navigateToDocument = useCallback((documentId: string) => {
    // Find the document and open the document modal
    const allDocs = [...recentDocuments, ...bookmarkedDocuments, ...discoverDocuments, ...userDocuments];
    const doc = allDocs.find(doc => doc.id === documentId);
    if (doc) {
      setSelectedDoc(doc);
      setIsDocModalOpen(true);
    }
  }, [recentDocuments, bookmarkedDocuments, discoverDocuments, userDocuments]);

  // Handle tag click
  const handleTagClick = useCallback((tag: string) => {
    let updatedTags: string[];
    
    if (selectedTags.includes(tag)) {
      updatedTags = selectedTags.filter(t => t !== tag);
    } else {
      updatedTags = [...selectedTags, tag];
    }
    
    setSelectedTags(updatedTags);
    
    // Perform search in any tab
    performSearch(searchQuery, updatedTags);
  }, [selectedTags, searchQuery, performSearch]);

  // Toggle bookmark status
  const toggleBookmark = useCallback((docId: string) => {
    const isCurrentlyBookmarked = bookmarkedDocuments.some(doc => doc.id === docId);
    
    if (isCurrentlyBookmarked) {
      setBookmarkedDocuments(prev => prev.filter(doc => doc.id !== docId));
    } else {
      const allDocs = [...recentDocuments, ...discoverDocuments, ...userDocuments];
      const docToAdd = allDocs.find(doc => doc.id === docId);
      if (docToAdd) {
        setBookmarkedDocuments(prev => [...prev, docToAdd]);
      }
    }
  }, [recentDocuments, bookmarkedDocuments, discoverDocuments, userDocuments]);

  // Switch to discover tab and perform search
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'recent' | 'bookmarks' | 'discover' | 'user');
    
    // Perform search when switching tabs with a search query
    if (searchQuery || selectedTags.length > 0) {
      performSearch(searchQuery, selectedTags);
    }
  }, [performSearch, searchQuery, selectedTags]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setSearchQuery('');
      setSelectedTags([]);
      setCurrentTag(null);
      
      // Don't clear actual documents to prevent flicker on reopen
      setIsLoading(false);
      setSearchCompleted(false);
      
      // Cancel any pending search requests
      latestSearchRequestRef.current = Date.now();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium select-none">
          <FileText size={18} />
          <span>File Browser</span>
        </div>
      }
      maxWidth="max-w-3xl"
      className="h-[calc(90vh-8rem)]"
      scrollBody={false}
    >
      <div className="p-4 h-full">
        {/* Search input - shown in all tabs */}
        <div className="mb-6">
          <div className="relative mb-2" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none" size={18} />
            <div className="pl-10 pr-4 py-2 rounded-full border border-muted-foreground/40 bg-background flex flex-wrap items-center gap-2">
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => {
                    let tagStyles = "px-2 py-1 gap-1 h-6 cursor-pointer select-none";
                    
                    if (fileTypeTags.includes(tag)) {
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
                      tagStyles += " bg-primary/80 text-primary-foreground hover:bg-primary";
                    }
                    
                    return (
                      <Badge 
                        key={tag} 
                        className={tagStyles}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                        <X size={14} className="ml-1 select-none" />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <div className="flex-1 min-w-[180px]">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleSearchInputChange}
                  placeholder="Search for documents or use @tag..."
                  className="border-none shadow-none focus-visible:ring-0 pl-0 h-auto p-0 w-full"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>

        <Tabs 
          defaultValue="user" 
          value={activeTab} 
          onValueChange={handleTabChange}
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow select-none flex gap-1">
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
              
              <TabsTrigger value="bookmarks" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <BookmarkIcon size={16} className="select-none" />
                <span>Bookmarks</span>
                {bookmarkedDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {bookmarkedDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
              
              <TabsTrigger value="recent" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <History size={16} className="select-none" />
                <span>Recent</span>
                {recentDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {recentDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
              
              <div className="h-6 w-px bg-muted-foreground/20 my-auto" />
              
              <TabsTrigger value="discover" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10 select-none">
                <Compass size={16} className="select-none" />
                <span>Discover</span>
                {discoverDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full select-none">
                    {discoverDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Recently Opened Files Tab */}
          <TabsContent value="recent" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : recentDocuments.length === 0 && searchCompleted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No recent files</h3>
                <p className="text-muted-foreground max-w-sm">
                  You haven't opened any files recently. Try exploring the Discover tab to find files.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {recentDocuments.length} document{recentDocuments.length === 1 ? '' : 's'} recently viewed
                </div>
                {recentDocuments.map((doc) => (
                  <DocumentItem 
                    key={doc.id} 
                    document={doc} 
                    selectedTags={selectedTags} 
                    handleTagClick={handleTagClick} 
                    navigateToDocument={navigateToDocument} 
                    isBookmarked={bookmarkedDocuments.some(bookmarked => bookmarked.id === doc.id)}
                  />
                ))}
              </>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : bookmarkedDocuments.length === 0 && searchCompleted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No bookmarked files</h3>
                <p className="text-muted-foreground max-w-sm">
                  You haven't bookmarked any files yet. Bookmark files to access them quickly.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {bookmarkedDocuments.length} bookmark{bookmarkedDocuments.length === 1 ? '' : 's'}
                </div>
                {bookmarkedDocuments.map((doc) => (
                  <DocumentItem 
                    key={doc.id} 
                    document={doc} 
                    selectedTags={selectedTags} 
                    handleTagClick={handleTagClick} 
                    navigateToDocument={navigateToDocument} 
                    isBookmarked={true}
                  />
                ))}
              </>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : discoverDocuments.length === 0 && searchCompleted && (searchQuery || selectedTags.length > 0) ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No matching files found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchQuery ? 
                    `We couldn't find any files matching "${searchQuery}"` : 
                    "No files match the selected filters"}
                  {selectedTags.length > 0 ? ' with the selected tags' : ''}. 
                  {searchQuery ? ' Try a different search term' : ' Try adjusting your filters'}
                  {selectedTags.length > 0 ? ' or remove some tags' : ''}.
                </p>
              </div>
            ) : discoverDocuments.length === 0 && !searchQuery && !selectedTags.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Discover files</h3>
                <p className="text-muted-foreground max-w-sm">
                  Use the search bar above to find files by name, content, or tags.
                </p>
              </div>
            ) : (
              <>
                {searchCompleted && (
                  <div className="mb-2 text-sm text-muted-foreground select-none">
                    Found {discoverDocuments.length} document{discoverDocuments.length === 1 ? '' : 's'}
                  </div>
                )}
                {discoverDocuments.map((doc) => (
                  <DocumentItem 
                    key={doc.id} 
                    document={doc} 
                    selectedTags={selectedTags} 
                    handleTagClick={handleTagClick} 
                    navigateToDocument={navigateToDocument} 
                    isBookmarked={bookmarkedDocuments.some(bookmarked => bookmarked.id === doc.id)}
                  />
                ))}
              </>
            )}
          </TabsContent>

          {/* User Documents Tab */}
          <TabsContent value="user" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading && !searchCompleted ? (
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : userDocuments.length === 0 && searchCompleted ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none">
                <User className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No user documents</h3>
                <p className="text-muted-foreground max-w-sm">
                  You haven't uploaded any documents yet. Upload files to access them here.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {userDocuments.length} document{userDocuments.length === 1 ? '' : 's'} uploaded by you
                </div>
                {userDocuments.map((doc) => (
                  <DocumentItem 
                    key={doc.id} 
                    document={doc} 
                    selectedTags={selectedTags} 
                    handleTagClick={handleTagClick} 
                    navigateToDocument={navigateToDocument} 
                    isBookmarked={bookmarkedDocuments.some(bookmarked => bookmarked.id === doc.id)}
                  />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Document modal */}
        <DocumentView 
          isOpen={isDocModalOpen} 
          onClose={() => setIsDocModalOpen(false)}
          document={selectedDoc}
          isBookmarked={(docId) => bookmarkedDocuments.some(doc => doc.id === docId)}
          toggleBookmark={toggleBookmark}
          formatDate={formatDate}
          renderThumbnail={renderThumbnail}
          maxWidth="max-w-4xl"
        />
      </div>
    </Modal>
  );
};

export default FileBrowserModal;
