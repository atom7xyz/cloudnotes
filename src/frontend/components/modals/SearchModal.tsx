import type React from 'react';
import { useState, useEffect, useCallback, type KeyboardEvent, useRef } from 'react'
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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'users' | 'bookmarks'>('documents');
  const [isLoading, setIsLoading] = useState(false);
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

  // Define file type tags for filtering
  const fileTypeTags = ['pdf', 'word', 'txt', 'powerpoint', 'epub'];

  // Array of placeholder images to use for documents
  const placeholderImages = [
    placeholder1, placeholder7, placeholder8, placeholder9, placeholder10, 
    placeholder11, placeholder12, placeholder13, placeholder14, placeholder15, 
    placeholder16, placeholder17, placeholder18, placeholder19, placeholder20, 
    placeholder21
  ];

  // Format the date to a user-friendly string
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Extract any tag currently being typed
  const extractCurrentTag = (input: string): string | null => {
    const match = input.match(/@(\w*)$/);
    return match ? match[1] : null;
  };

  // Complete the current tag and add it to selected tags
  const completeTag = () => {
    if (currentTag && currentTag.trim()) {
      const normalizedTag = currentTag.trim().toLowerCase();
      
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
    }
  };

  // Function to perform a search and apply tag filters
  const performSearch = useCallback(async (query: string, tags: string[]) => {
    // Generate a unique ID for this search request
    const currentRequestId = Date.now();
    latestSearchRequestRef.current = currentRequestId;
    
    // Set loading state at the beginning of the search
    setIsLoading(true);

    try {
      // If there's no query and no tags, don't show results
      if (!query.trim() && tags.length === 0) {
        setDocumentResults([]);
        setUserResults([]);
        setBookmarkResults([]);
        setIsLoading(false);
        return;
      }
      
      // Add a small delay before actually searching to prevent flicker
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if this is still the latest request
      if (latestSearchRequestRef.current !== currentRequestId) {
        // A newer request has been made, abandon this one
        return;
      }
      
      // For documents search
      const documents = await mockDataService.searchDocuments(query);
      
      // After each async operation, check if this search is still relevant
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // For bookmarks search
      const bookmarks = await mockDataService.searchBookmarks(query);
      
      // Check again if this search is still relevant
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // For users search - cache the current users for comparison
      const currentUserResults = userResults;
      
      // Only perform user search if the text query has changed
      let users = currentUserResults;
      if (query.trim()) {
        if (query.trim() !== lastTextQueryRef.current) {
          // If there's a new text query, update the search results
          users = await mockDataService.searchUsers(query);
          lastTextQueryRef.current = query.trim();
        } else if (currentUserResults.length === 0) {
          // If we have the same query but no results (e.g., when switching tabs), re-fetch
          users = await mockDataService.searchUsers(query);
        }
        // Otherwise, keep existing results
      } else {
        // If there's no query text, clear user results
        lastTextQueryRef.current = '';
        users = [];
      }
      
      // Check again if this is still the latest request
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }
      
      // Apply tag filtering if there are selected tags
      let filteredDocuments = documents;
      let filteredBookmarks = bookmarks;
      
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
        
        filteredDocuments = applyFilters(filteredDocuments);
        filteredBookmarks = applyFilters(filteredBookmarks);
      }

      // One final check before updating state
      if (latestSearchRequestRef.current !== currentRequestId) {
        return;
      }

      setDocumentResults(filteredDocuments);
      setBookmarkResults(filteredBookmarks);
      // Set users results - tags don't affect user results, but we update based on text
      setUserResults(users);
    } catch (error) {
      // Silently handle error
    } finally {
      // Only update loading state if this is still the latest request
      if (latestSearchRequestRef.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }, []);

  // Optimized debounced search function with a longer delay for better performance
  const debouncedSearch = useCallback(
    debounce((query: string, tags: string[]) => {
      performSearch(query, tags);
    }, 300),
    [performSearch]
  );

  // Throttled function for UI updates to prevent render lag
  const throttledUIUpdate = useCallback(
    throttle((value: string) => {
      setInputValue(value);
      // Extract tag being typed without triggering search
      const tagBeingTyped = extractCurrentTag(value);
      setCurrentTag(tagBeingTyped);
    }, 50),
    []
  );

  // Handle search input change - optimize to reduce UI lag
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Handle key press in search input
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
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
          setInputValue(prev => prev + '@');
        }, 0);
      }
    }
    // Handle space - finalize tag without adding space to the input
    else if (e.key === ' ' && currentTag) {
      e.preventDefault();
      completeTag();
    }
  };

  // Apply a recent search
  const handleRecentSearchClick = (searchTerm: string) => {
    // Extract any tags from the search term (format: "@tag text")
    const tagRegex = /@(\w+)/g;
    const extractedTags: string[] = [];
    let match;
    while ((match = tagRegex.exec(searchTerm)) !== null) {
      extractedTags.push(match[1]);
    }
    
    // Set the search query without the tag part
    const cleanQuery = searchTerm.replace(/@\w+\s*/g, '').trim();
    
    setInputValue(cleanQuery);
    setSearchQuery(cleanQuery);
    setSelectedTags(extractedTags);
    setIsLoading(true);
    performSearch(cleanQuery, extractedTags);
  };

  // Handle tag selection from document
  const handleTagClick = (tag: string) => {
    // Create a new array for the updated tags
    let updatedTags;
    
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
  };

  // Remove tag from search
  const handleRemoveTagFromInput = (tag: string) => {
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
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    const fileTypeLower = fileType.toLowerCase();
    const isSelected = selectedTags.includes(fileTypeLower);
    
    const handleFileTypeClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering document click
      
      // Toggle selection: if already selected, remove it from tags
      if (isSelected) {
        const updatedTags = selectedTags.filter(t => t !== fileTypeLower);
        setSelectedTags(updatedTags);
        setIsLoading(true);
        performSearch(searchQuery, updatedTags);
        return;
      }
      
      // Add file type to selected tags
      const updatedTags = [...selectedTags, fileTypeLower];
      setSelectedTags(updatedTags);
      
      // Trigger search with updated tags and the current searchQuery
      setIsLoading(true);
      performSearch(searchQuery, updatedTags);
    };
    
    const getBadgeStyles = () => {
      let baseStyles = "cursor-pointer ";
      
      if (isSelected) {
        // Selected state styling
        switch (fileTypeLower) {
          case 'pdf':
            return baseStyles + "bg-red-200 text-red-800 border-red-300 hover:bg-red-300";
          case 'word':
            return baseStyles + "bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300";
          case 'powerpoint':
            return baseStyles + "bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300";
          case 'txt':
            return baseStyles + "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
          case 'epub':
            return baseStyles + "bg-green-200 text-green-800 border-green-300 hover:bg-green-300";
          default:
            return baseStyles + "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300";
        }
      } else {
        // Normal state styling
        switch (fileTypeLower) {
          case 'pdf':
            return baseStyles + "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
          case 'word':
            return baseStyles + "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
          case 'powerpoint':
            return baseStyles + "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
          case 'txt':
            return baseStyles + "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
          case 'epub':
            return baseStyles + "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
          default:
            return baseStyles + "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
        }
      }
    };
    
    return (
      <Badge 
        variant="outline" 
        className={getBadgeStyles()}
        onClick={handleFileTypeClick}
      >
        {fileType.toUpperCase()}
      </Badge>
    );
  };

  // Mock navigation functions (since we're not actually navigating)
  const navigateToUserProfile = (username: string) => {
    // In a real app, we would use a router here
  };

  const navigateToDocument = (documentId: string) => {
    // In a real app, we would use a router here
  };

  const navigateToComments = (documentId: string) => {
    // In a real app, we would use a router here
  };

  const navigateToReviews = (documentId: string) => {
    // In a real app, we would use a router here
  };

  const navigateToUserUploads = (userId: string) => {
    // In a real app, we would use a router here
  };

  // Get a fixed placeholder image based on document ID
  const getDocumentPlaceholder = (docId: string) => {
    // Use the document ID to generate a consistent index
    const charSum = docId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = charSum % placeholderImages.length;
    return placeholderImages[index];
  };

  // Document item component
  const DocumentItem = ({ document }: { document: MockDocument }) => {
    // Check if the document is bookmarked (in a real app, this would use actual user data)
    const isBookmarked = bookmarkResults.some(bookmark => bookmark.id === document.id);
    
    return (
      <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none">
        <div className="flex items-start gap-3">
          <div 
            className="flex-shrink-0 w-16 h-16 bg-muted/30 rounded flex items-center justify-center overflow-hidden cursor-pointer relative"
            onClick={() => navigateToDocument(document.id)}
          >
            <img 
              src={getDocumentPlaceholder(document.id)} 
              alt={document.name} 
              className="w-full h-full object-cover"
            />
            {isBookmarked && (
              <div className="absolute top-1 right-1 bg-primary/80 rounded-full p-0.5">
                <BookmarkIcon size={12} className="text-primary-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <h3 
                className="font-medium truncate cursor-pointer hover:text-primary"
                onClick={() => navigateToDocument(document.id)}
              >
                {document.name}
              </h3>
              {getFileIcon(document.fileType)}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{formatDate(document.uploadDate)}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => navigateToReviews(document.id)}
                    >
                      <Star size={14} className="text-yellow-500" />
                      <span>{document.rating.toFixed(1)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rating</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center gap-1 cursor-pointer hover:text-primary"
                      onClick={() => navigateToComments(document.id)}
                    >
                      <MessageSquare size={14} />
                      <span>{document.commentCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comments</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2">
              <Avatar 
                className="h-5 w-5 cursor-pointer"
                onClick={() => navigateToUserProfile(document.uploaderUsername)}
              >
                <img src={document.uploaderAvatar} alt={document.uploaderUsername} />
              </Avatar>
              <span 
                className="text-sm cursor-pointer hover:text-primary"
                onClick={() => navigateToUserProfile(document.uploaderUsername)}
              >
                {document.uploaderUsername}
              </span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => {
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
                        key={index} 
                        variant="secondary"
                        className={tagStyles}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{document.viewCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Views</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1 ${isBookmarked ? 'text-primary font-medium' : ''}`}>
                        <BookmarkIcon size={12} className={isBookmarked ? 'text-primary fill-primary' : ''} />
                        <span>{document.downloadCount}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bookmarks</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span>{document.fileSize}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>File size</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Document skeleton for loading state
  const DocumentSkeleton = () => (
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
  );

  // User item component
  const UserItem = ({ user }: { user: MockUser }) => (
    <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none">
      <div className="flex items-start gap-3">
        <Avatar 
          className="h-12 w-12 cursor-pointer"
          onClick={() => navigateToUserProfile(user.username)}
        >
          <img src={user.avatar} alt={user.username} />
        </Avatar>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 
              className="font-medium cursor-pointer hover:text-primary"
              onClick={() => navigateToUserProfile(user.username)}
            >
              {user.firstName} {user.lastName}
            </h3>
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
              <div 
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary"
                onClick={() => navigateToUserUploads(user.id)}
              >
                <FileIcon size={14} />
                <span>{user.publicDocumentsCount} public documents</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  // User skeleton for loading state
  const UserSkeleton = () => (
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
  );

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedTags.length > 0) {
        // If there are selected tags, load documents that match those tags
        setIsLoading(true);
        performSearch(searchQuery, selectedTags);
      } else if (searchQuery) {
        // If there's a search query, perform the search
        setIsLoading(true);
        performSearch(searchQuery, selectedTags);
      }
    } else {
      // Reset state when modal closes
      setInputValue('');
      setSearchQuery('');
      setDocumentResults([]);
      setUserResults([]);
      setBookmarkResults([]);
      setIsLoading(false);
      setSelectedTags([]);
      setCurrentTag(null);
      // Also reset the last text query reference
      lastTextQueryRef.current = '';
    }
  }, [isOpen, performSearch]);

  // Custom search input with tag display
  const SearchInput = () => {
    const shouldWrapInput = selectedTags.length > 2;
    
    // Helper function to suggest file type tags
    const getTagSuggestions = () => {
      if (!currentTag) return [];
      
      // Return file type tags that match the current partial tag
      return fileTypeTags.filter(tag => 
        tag.toLowerCase().startsWith(currentTag.toLowerCase())
      );
    };
    
    const tagSuggestions = getTagSuggestions();
    
    // Sort tags to have file types first, then other tags
    const sortedTags = [...selectedTags].sort((a, b) => {
      const aIsFileType = fileTypeTags.includes(a);
      const bIsFileType = fileTypeTags.includes(b);
      
      if (aIsFileType && !bIsFileType) return -1;
      if (!aIsFileType && bIsFileType) return 1;
      return a.localeCompare(b); // alphabetical within their groups
    });
    
    // Handle suggestion click 
    const handleSuggestionClick = (suggestedTag: string) => {
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
    };
    
    return (
      <div className="mb-6">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <div 
            ref={searchContainerRef}
            className="pl-10 pr-4 py-2 rounded-full border border-muted-foreground/40 bg-background flex flex-wrap items-center gap-2"
          >
            {selectedTags.length > 0 && (
              <div className={`flex flex-wrap gap-2 ${shouldWrapInput ? 'w-full mb-1.5' : ''}`}>
                {sortedTags.map(tag => {
                  // Get file type specific styling for file type tags
                  let tagStyles = "px-2 py-1 gap-1 h-6 cursor-pointer";
                  
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
                      <X size={14} className="ml-1" />
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
                <span className="text-xs text-muted-foreground mr-1">Suggestions:</span>
                {tagSuggestions.map(tag => (
                  <Badge 
                    key={tag}
                    variant="outline"
                    className="text-xs px-1.5 py-0 cursor-pointer bg-muted/30 hover:bg-muted"
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
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium">
          <Search size={18} />
          <span>Search CloudNotes</span>
        </div>
      }
      maxWidth="max-w-3xl"
      className="h-[calc(90vh-8rem)]"
      scrollBody={false}
    >
      <div className="p-4 h-full">
        <SearchInput />

        {!searchQuery && !selectedTags.length && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Clock size={14} />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => {
                // Check if term contains tags
                const hasTags = term.includes('@');
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer rounded-full text-sm ${hasTags ? 'bg-muted/10' : ''}`}
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    {hasTags ? (
                      <div className="flex items-center gap-1.5">
                        {term.split(/\s+/).map((part, i) => {
                          if (part.startsWith('@')) {
                            const tagName = part.slice(1).toLowerCase();
                            let tagStyles = "text-xs px-1.5 py-0 mr-1 border ";
                            
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
                              <Badge key={i} className={tagStyles}>
                                {tagName}
                              </Badge>
                            );
                          }
                          return <span key={i}>{part}</span>;
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
            <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow">
              <TabsTrigger value="documents" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10">
                <FileText size={16} />
                <span>Documents</span>
                {documentResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full">
                    {documentResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10">
                <User size={16} />
                <span>Users</span>
                {userResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full">
                    {userResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10">
                <BookmarkIcon size={16} />
                <span>Bookmarks</span>
                {bookmarkResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full">
                    {bookmarkResults.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Tag information message moved to right side of tabs */}
            {selectedTags.length > 0 && activeTab === 'users' && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 select-none">
                <HelpCircle size={12} />
                <span>Tags are not applicable to users search</span>
              </div>
            )}
          </div>

          <TabsContent value="documents" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading ? (
              // Loading state - fixed 3 skeletons
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : documentResults.length === 0 && (searchQuery || selectedTags.length > 0) ? (
              // No results state - only show when a search was attempted
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
            ) : documentResults.length === 0 ? (
              // Initial state - no search performed yet
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Search for documents</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a search term to find documents by name, content, or tags.
                </p>
              </div>
            ) : (
              // Results state
              <>
                <div className="mb-2 text-sm text-muted-foreground select-none">
                  Found {documentResults.length} document{documentResults.length !== 1 ? 's' : ''}
                  {selectedTags.length > 0 && ' matching your filters'}
                </div>
                {documentResults.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading ? (
              // Loading state - fixed 3 skeletons
              <>
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
                <UserSkeleton />
              </>
            ) : searchQuery && userResults.length === 0 ? (
              // No results state
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
                  <UserItem key={user.id} user={user} />
                ))}
              </>
            ) : (
              // Empty state - no search yet
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">Search for users</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a search term to find users by name or username.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bookmarks" className="min-h-[300px] max-h-[calc(90vh-24rem)] overflow-y-auto pr-1">
            {isLoading ? (
              // Loading state - fixed 3 skeletons
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : bookmarkResults.length === 0 && (searchQuery || selectedTags.length > 0) ? (
              // No results state - only show when a search was attempted
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
            ) : bookmarkResults.length === 0 ? (
              // Initial state - no search performed yet
              <div className="flex flex-col items-center justify-center py-10 text-center">
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
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
};

export default SearchModal; 