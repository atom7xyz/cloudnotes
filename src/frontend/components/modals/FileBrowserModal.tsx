import type React from 'react';
import { useState, useEffect, useCallback } from 'react'
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
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
  FolderOpenIcon
} from 'lucide-react';
import { mockDataService, type MockDocument } from '../../lib/mockData';
import { debounce } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface FileBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileBrowserModal: React.FC<FileBrowserModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'bookmarks'>('documents');
  const [isLoading, setIsLoading] = useState(false);
  const [documentResults, setDocumentResults] = useState<MockDocument[]>([]);
  const [bookmarkResults, setBookmarkResults] = useState<MockDocument[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Define file type tags for filtering
  const fileTypeTags = ['pdf', 'word', 'txt', 'powerpoint', 'epub'];

  // Format the date to a user-friendly string
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Function to perform a search and apply tag filters
  const performSearch = useCallback(async (query: string, tags: string[]) => {
    setIsLoading(true);

    try {
      // Get initial document data
      const documents = await mockDataService.searchDocuments(query);
      const bookmarks = await mockDataService.searchBookmarks(query);
      
      // Apply tag filtering if there are selected tags
      let filteredDocuments = documents;
      let filteredBookmarks = bookmarks;
      
      if (tags.length > 0) {
        // Split tags into file type tags and regular tags
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

      setDocumentResults(filteredDocuments);
      setBookmarkResults(filteredBookmarks);
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string, tags: string[]) => {
      performSearch(query, tags);
    }, 1000),
    []
  );

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value, selectedTags);
  };

  // Handle tag click
  const handleTagClick = (tag: string) => {
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
    
    // Trigger search with updated tags and the current searchQuery
    setIsLoading(true);
    performSearch(searchQuery, updatedTags);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    const fileTypeLower = fileType.toLowerCase();
    const isSelected = selectedTags.includes(fileTypeLower);
    
    const handleFileTypeClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
        {fileType.toUpperCase()}
      </Badge>
    );
  };

  // Navigate to document
  const navigateToDocument = (documentId: string): void => {
    console.log(`Opening document: ${documentId}`);
    onClose();
  };

  // Document item component
  const DocumentItem = ({ document }: { document: MockDocument }) => {
    // Check if the document is bookmarked (in a real app, this would use actual user data)
    const isBookmarked = bookmarkResults.some(bookmark => bookmark.id === document.id);
    
    return (
      <Card className="p-4 mb-3 hover:bg-muted/20 transition-colors select-none cursor-pointer" onClick={() => navigateToDocument(document.id)}>
        <div className="flex items-start gap-3">
          <div 
            className="flex-shrink-0 w-16 h-16 bg-muted/30 rounded flex items-center justify-center overflow-hidden cursor-pointer relative"
          >
            <FileIcon size={32} className="text-muted-foreground" />
            {isBookmarked && (
              <div className="absolute top-1 right-1 bg-primary/80 rounded-full p-0.5">
                <BookmarkIcon size={12} className="text-primary-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">
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
                    <div className="flex items-center gap-1">
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
                    <div className="flex items-center gap-1">
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
            
            <div className="flex justify-between items-center mt-2">
              {document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => {
                    // Check if it's a file type tag
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
                        tagStyles += "bg-primary/80 text-primary-foreground border-primary hover:bg-primary";
                      }
                    } else {
                      tagStyles += "bg-muted/50 text-muted-foreground hover:bg-muted border-primary/30";
                    }
                    
                    return (
                      <Badge 
                        key={`tag-${document.id}-${tag}`}
                        variant="secondary"
                        className={tagStyles}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
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
    <Card className="p-4 mb-3">
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

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      
      // Always load documents and bookmarks when opening
      Promise.all([
        mockDataService.getDocuments(),
        mockDataService.getBookmarkedDocuments()
      ]).then(([documents, bookmarks]) => {
        setDocumentResults(documents);
        setBookmarkResults(bookmarks);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error loading initial data:', error);
        setIsLoading(false);
      });
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setSelectedTags([]);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-lg font-medium">
          <FileText size={18} />
          <span>Browse Files</span>
        </div>
      }
      maxWidth="max-w-3xl"
      className="h-[calc(90vh-8rem)]"
      scrollBody={false}
    >
      <div className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search for documents..."
              className="pl-10 pr-4 py-2 rounded-full"
              autoFocus
            />
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center mb-4">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {selectedTags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleTagClick(tag)}
              >
                {tag} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* File type filter buttons */}
        <div className="flex gap-2 mb-4">
          {fileTypeTags.map((type) => (
            <Badge
              key={`filetype-${type}`}
              variant="outline"
              className={`cursor-pointer ${
                selectedTags.includes(type) 
                  ? "bg-primary/10 border-primary text-primary font-medium" 
                  : "bg-muted/50"
              }`}
              onClick={() => handleTagClick(type)}
            >
              {type.toUpperCase()}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="documents" value={activeTab} onValueChange={(value) => setActiveTab(value as 'documents' | 'bookmarks')}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background p-1 border border-muted-foreground/20 shadow">
              <TabsTrigger value="documents" className="gap-2 text-[13px] cursor-pointer data-[state=active]:bg-primary/10">
                <FileText size={16} />
                <span>All Files</span>
                {documentResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 rounded-full">
                    {documentResults.length}
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
          </div>

          <TabsContent value="documents" className="min-h-[300px] max-h-[calc(90vh-25rem)] overflow-y-auto pr-1">
            {isLoading ? (
              // Loading state - fixed 3 skeletons
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : documentResults.length === 0 && searchQuery ? (
              // No results state - only show when a search was attempted
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-muted-foreground max-w-sm">
                  We couldn't find any documents matching "{searchQuery}"
                  {selectedTags.length > 0 ? ' with the selected tags' : ''}.
                </p>
              </div>
            ) : (
              // Results state
              <>
                <div className="mb-2 text-sm text-muted-foreground">
                  Found {documentResults.length} document{documentResults.length !== 1 ? 's' : ''}
                  {selectedTags.length > 0 && ' matching your filters'}
                </div>
                {documentResults.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="min-h-[300px] max-h-[calc(90vh-25rem)] overflow-y-auto pr-1">
            {isLoading ? (
              // Loading state - fixed 3 skeletons
              <>
                <DocumentSkeleton />
                <DocumentSkeleton />
                <DocumentSkeleton />
              </>
            ) : bookmarkResults.length === 0 && searchQuery ? (
              // No results state - only show when a search was attempted
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No bookmarks found</h3>
                <p className="text-muted-foreground max-w-sm">
                  We couldn't find any bookmarked documents matching "{searchQuery}"
                  {selectedTags.length > 0 ? ' with the selected tags' : ''}.
                </p>
              </div>
            ) : bookmarkResults.length === 0 ? (
              // Initial state - no bookmarks
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <BookmarkIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  You haven't bookmarked any documents yet.
                </p>
              </div>
            ) : (
              // Results state
              <>
                <div className="mb-2 text-sm text-muted-foreground">
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

export default FileBrowserModal; 