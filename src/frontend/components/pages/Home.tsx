import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileTextIcon, ClockIcon, BookmarkIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, PlusIcon, HistoryIcon, ChevronUpIcon, CalendarIcon, EditIcon, ExternalLinkIcon } from 'lucide-react';
import { 
  Card, 
  CardContent} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument } from '../../lib/mocking/mocked';
import { cn } from '../../lib/utils';
import DocumentView from '../modals/DocumentView';

const Home = () => {
  const [recentDocs, setRecentDocs] = useState<MockDocument[]>([]);
  const [favoriteDocs, setFavoriteDocs] = useState<MockDocument[]>([]);
  const [trendingDocs, setTrendingDocs] = useState<MockDocument[]>([]);
  const [userDocs, setUserDocs] = useState<MockDocument[]>([]);
  const [showAllUserDocs, setShowAllUserDocs] = useState(false);
  const [showAllRecentDocs, setShowAllRecentDocs] = useState(false);
  const [showAllBookmarkedDocs, setShowAllBookmarkedDocs] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Calculate last opened time (in a real app this would come from user session data)
  const getLastOpenedTime = useCallback((doc: MockDocument): string => {
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
  }, []);

  // Get hours since last opened (for sorting)
  const getHoursSinceLastOpened = useCallback((doc: MockDocument): number => {
    // Generate a consistent value based on document ID
    const seed = doc.id.charCodeAt(0) + doc.id.charCodeAt(doc.id.length - 1);
    return Math.floor((seed % 150) + 1); // 1-150 hours, using doc ID as seed
  }, []);

  // Format date to relative time (e.g. "2 days ago")
  const formatRelativeDate = useCallback((date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }, []);

  // Calculate last edited time (in a real app this would come from edit history)
  const getLastEditedTime = useCallback((doc: MockDocument): string => {
    // For demo purposes, generate a random time based on document ID 
    // to ensure consistent results but different from last opened
    const seed = doc.id.charCodeAt(doc.id.length - 1) + doc.id.charCodeAt(0);
    const randomHours = Math.floor((seed % 200) + 1); // 1-200 hours, different from last opened
    
    const now = new Date();
    const lastEdited = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
    
    // Format the relative time
    return formatRelativeDate(lastEdited);
  }, [formatRelativeDate]);

  // Simulate data fetching
  useEffect(() => {
    const allDocuments = mockService.getDocuments();
    
    // Sort for recent (by "last opened" rather than upload date)
    const recentDocuments = [...allDocuments].sort((a, b) => 
      getHoursSinceLastOpened(a) - getHoursSinceLastOpened(b)
    );
    
    // Sort for trending (by view count, download count, and recency)
    const trendingDocuments = [...allDocuments].sort((a, b) => {
      // Score = (viewCount * 1) + (downloadCount * 2) + (recency factor * 4)
      // Recency factor = 1 / (days old + 1) to keep it between 0-1
      const daysA = Math.floor((new Date().getTime() - a.file.uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.floor((new Date().getTime() - b.file.uploadedAt.getTime()) / (1000 * 60 * 60 * 24));
      const recencyFactorA = 1 / (daysA + 1);
      const recencyFactorB = 1 / (daysB + 1);
      
      const scoreA = a.file.viewCount + (a.file.downloadCount * 2) + (recencyFactorA * 4) + (a.rating.rating * 5);
      const scoreB = b.file.viewCount + (b.file.downloadCount * 2) + (recencyFactorB * 4) + (b.rating.rating * 5);
      
      return scoreB - scoreA;
    });
    
    // Initialize favorites (in a real app, this would come from user data)
    const favorites: MockDocument[] = [];
    
    // Get current user's documents - this would be a call to a user service in a real app
    // For demo purposes use bartsimpson if documents exist, otherwise use a fallback to CurrentUser
    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
    
    // Get user documents and sort by last edited time (newest first)
    const userDocuments = allDocuments
      .filter(doc => doc.author.username === currentUsername)
      .sort((a, b) => {
        // Get the seed values used in getLastEditedTime
        const seedA = a.id.charCodeAt(a.id.length - 1) + a.id.charCodeAt(0);
        const seedB = b.id.charCodeAt(b.id.length - 1) + b.id.charCodeAt(0);
        // Lower hours means more recent edit
        return seedA - seedB;
      });
    
    setRecentDocs(recentDocuments);
    setTrendingDocs(trendingDocuments.slice(0, 10)); // Take top 10 trending
    setFavoriteDocs(favorites);
    setUserDocs(userDocuments);
  }, [getHoursSinceLastOpened]);

  // Toggle favorite (in a real app, this would call an API)
  const toggleFavorite = useCallback((docId: string) => {
    setFavoriteDocs(prev => {
      const docExists = prev.some(doc => doc.id === docId);
      if (docExists) {
        return prev.filter(doc => doc.id !== docId);
      }
      
      const docToAdd = [...recentDocs, ...trendingDocs].find(doc => doc.id === docId);
      if (docToAdd) {
        return [...prev, docToAdd];
      }
      return prev;
    });
  }, [recentDocs, trendingDocs]);

  // Format file size
  const formatFileSize = (size: string): string => {
    return size;
  };
  
  // Check if a document is in favorites
  const isDocumentFavorite = useCallback((docId: string) => {
    return favoriteDocs.some(doc => doc.id === docId);
  }, [favoriteDocs]);

  // Render thumbnail
  const renderThumbnail = useCallback((thumbnailData: string, title: string) => {
    // Parse the thumbnail format "color:text"
    const [color, text] = thumbnailData.split(':');
    
    return (
      <div 
        style={{ backgroundColor: color }} 
        className="w-full h-full flex items-center justify-center"
      >
        <span className="text-white font-medium text-center px-2 text-sm">
          {decodeURIComponent(text)}
        </span>
      </div>
    );
  }, []);

  // Move carousel to previous slide - memoized to prevent re-renders
  const previousSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === 0 ? trendingDocs.length - 3 : prev - 1));
  }, [trendingDocs.length]);

  // Move carousel to next slide - memoized to prevent re-renders
  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === trendingDocs.length - 3 ? 0 : prev + 1));
  }, [trendingDocs.length]);

  // Open document modal
  const openDocModal = useCallback((doc: MockDocument) => {
    setSelectedDoc(doc);
    setIsDocModalOpen(true);
  }, []);
  
  // Transform style for carousel - memoized to prevent recalculations
  const carouselTransform = useMemo(() => {
    return { transform: `translateX(-${carouselIndex * (100 / 3)}%)` };
  }, [carouselIndex]);
  
  // Handle new document upload 
  const handleNewDocumentClick = useCallback(() => {
    // Will be implemented in the future
    console.log("New document upload clicked");
  }, []);

  // Separate toggle functions for each section
  const toggleShowAllUserDocs = useCallback(() => {
    setShowAllUserDocs(prev => !prev);
  }, []);

  const toggleShowAllRecentDocs = useCallback(() => {
    setShowAllRecentDocs(prev => !prev);
  }, []);

  const toggleShowAllBookmarkedDocs = useCallback(() => {
    setShowAllBookmarkedDocs(prev => !prev);
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none">
      {/* Trending Documents Carousel */}
      {trendingDocs.length > 0 && (
        <section className="mb-8 relative">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <TrendingUpIcon size={20} className="text-primary" />
            Trending Documents
          </h2>
          
          <div className="relative">
            {/* The outer container without overflow-hidden */}
            <div className="relative">
              {/* Left navigation button - positioned outside the overflow area */}
              <button 
                onClick={previousSlide} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-md transition-colors cursor-pointer"
                aria-label="Previous slide"
                type="button"
              >
                <ChevronLeftIcon size={24} />
              </button>
              
              {/* Inner container with overflow-hidden */}
              <div className="overflow-hidden">
                {/* Carousel container */}
                <div 
                  ref={carouselRef} 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={carouselTransform}
                >
                  {trendingDocs.map((doc) => (
                    <div key={doc.id} className="min-w-[33.333%] px-2">
                      <Card 
                        className="h-full hover:bg-primary/5 hover:border-primary/20 transition-colors overflow-hidden cursor-pointer"
                        onClick={() => openDocModal(doc)}
                      >
                        <CardContent className="p-3 pb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-24 h-32 rounded-md overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative">
                              {renderThumbnail(doc.file.thumbnail, doc.title)}
                            </div>
                            
                            <div className="flex-grow min-w-0 flex flex-col h-32">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-2">
                                <Avatar className="h-4 w-4">
                                  <img src={doc.author.avatar} alt={doc.author.username} />
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{doc.author.username}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ClockIcon size={10} />
                                  <span>{formatRelativeDate(doc.file.uploadedAt)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                      <StarIcon size={10} className="text-yellow-500" />
                                  <span>{doc.rating.rating.toFixed(1)}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-auto">
                                {doc.file.tags.slice(0, 3).map((tag) => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.file.tags.length > 3 && (
                                  <Badge 
                                    variant="outline"
                                    className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                                  >
                                    +{doc.file.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right navigation button - positioned outside the overflow area */}
              <button 
                onClick={nextSlide} 
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-md transition-colors cursor-pointer"
                aria-label="Next slide"
                type="button"
              >
                <ChevronRightIcon size={24} />
              </button>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center items-center gap-1.5 mt-4">
              {trendingDocs.slice(0, trendingDocs.length - 2).map((doc, index) => (
                <button
                  key={`dot-${doc.id}`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all bg-muted-foreground/30 hover:bg-muted-foreground/50 cursor-pointer",
                    index === carouselIndex 
                      ? "w-6 bg-primary" 
                      : "w-1.5"
                  )}
                  onClick={() => setCarouselIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Your Documents Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FileTextIcon size={20} className="text-primary" />
          Your Documents
        </h2>
        
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Upload New Document Card */}
          <Card 
            className="group cursor-pointer h-[220px] hover:bg-primary/5 hover:border-primary/20 transition-colors"
            onClick={handleNewDocumentClick}
          >
            <CardContent className="p-0 h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <PlusIcon size={36} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Upload Document
              </p>
            </CardContent>
          </Card>
          
          {/* User Documents */}
          {userDocs
            .slice(0, showAllUserDocs ? undefined : 4)
            .map((doc) => (
              <Card 
                key={doc.id} 
                className="overflow-hidden cursor-pointer h-[220px] hover:bg-primary/5 hover:border-primary/20 transition-colors"
                onClick={() => openDocModal(doc)}
              >
                <div className="h-[140px] overflow-hidden bg-muted/30 relative">
                  {renderThumbnail(doc.file.thumbnail, doc.title)}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                  <div className="flex flex-col gap-1 mt-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon size={10} />
                      <span>Uploaded: {formatRelativeDate(doc.file.uploadedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <EditIcon size={10} />
                      <span>Last edited: {getLastEditedTime(doc)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          
          {/* Show empty state cards if there are no documents */}
          {userDocs.length === 0 && (
            <Card className="h-[220px] overflow-hidden border-dashed border-muted-foreground/30">
              <CardContent className="h-full flex items-center justify-center p-3 text-center">
                <p className="text-muted-foreground text-sm">
                  You haven't uploaded any documents yet
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* View More Documents Button */}
        {userDocs.length > 4 && (
          <div className="flex justify-center mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleShowAllUserDocs}
              className="gap-1 hover-primary-effect"
            >
              {showAllUserDocs ? (
                <>
                  Show Less
                  <ChevronUpIcon size={16} />
                </>
              ) : (
                <>
                  View All Documents
                  <ChevronRightIcon size={16} />
                </>
              )}
            </Button>
          </div>
        )}
      </section>
      
      {/* Document Modal - Replace with DocumentView component */}
      <DocumentView 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)}
        document={selectedDoc}
        isBookmarked={isDocumentFavorite}
        toggleBookmark={toggleFavorite}
        formatDate={formatRelativeDate}
        renderThumbnail={renderThumbnail}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Documents */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ClockIcon size={20} />
            Recent Documents
          </h2>
          <div className="space-y-3">
            {recentDocs.slice(0, showAllRecentDocs ? 5 : 3).map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:bg-primary/5 hover:border-primary/20 transition-colors overflow-hidden cursor-pointer"
                onClick={() => openDocModal(doc)}
              >
                <CardContent className="p-3 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-24 h-32 rounded-md overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative">
                      {renderThumbnail(doc.file.thumbnail, doc.title)}
                    </div>
                    
                    <div className="flex-grow min-w-0 flex flex-col h-32">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-1 flex-shrink-0 cursor-pointer hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            toggleFavorite(doc.id);
                          }}
                        >
                          <BookmarkIcon 
                            size={14} 
                            className={isDocumentFavorite(doc.id) 
                              ? "fill-primary text-primary" 
                              : "hover:text-primary hover:fill-primary/30"
                            } 
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <Avatar className="h-4 w-4">
                          <img src={doc.author.avatar} alt={doc.author.username} />
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{doc.author.username}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <HistoryIcon size={10} />
                          <span>Last opened: {getLastOpenedTime(doc)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {doc.file.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline"
                            className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {doc.file.tags.length > 3 && (
                          <Badge 
                            variant="outline"
                            className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                          >
                            +{doc.file.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {recentDocs.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 hover-primary-effect"
                onClick={toggleShowAllRecentDocs}
              >
                {showAllRecentDocs ? (
                  <>
                    Show Less
                    <ChevronUpIcon size={16} />
                  </>
                ) : (
                  <>
                    View All Documents
                    <ChevronRightIcon size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
        
        {/* Favorite Documents */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <BookmarkIcon size={20} className="text-primary" />
            Bookmarked
          </h2>
          {favoriteDocs.length > 0 ? (
            <div className="space-y-3">
              {favoriteDocs.slice(0, showAllBookmarkedDocs ? 5 : 3).map((doc) => (
                <Card 
                  key={doc.id} 
                  className="hover:bg-primary/5 hover:border-primary/20 transition-colors overflow-hidden cursor-pointer"
                  onClick={() => openDocModal(doc)}
                >
                  <CardContent className="p-3 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-24 h-32 rounded-md overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative">
                        {renderThumbnail(doc.file.thumbnail, doc.title)}
                      </div>
                      
                      <div className="flex-grow min-w-0 flex flex-col h-32">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 ml-1 flex-shrink-0 cursor-pointer hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              toggleFavorite(doc.id);
                            }}
                          >
                            <BookmarkIcon 
                              size={14}
                              className="fill-primary text-primary hover:fill-primary/80 hover:text-primary/80" 
                            />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-2">
                          <Avatar className="h-4 w-4">
                            <img src={doc.author.avatar} alt={doc.author.username} />
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{doc.author.username}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <HistoryIcon size={10} />
                            <span>Last opened: {getLastOpenedTime(doc)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {doc.file.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {doc.file.tags.length > 3 && (
                            <Badge 
                              variant="outline"
                              className="text-xs px-1.5 py-0 bg-muted/50 text-muted-foreground border-primary/30 hover:bg-muted"
                            >
                              +{doc.file.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven't added any bookmarks yet.</p>
                <Button variant="outline" className="mt-4 hover-primary-effect">Browse Documents</Button>
              </CardContent>
            </Card>
          )}
          {favoriteDocs.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 hover-primary-effect"
                onClick={toggleShowAllBookmarkedDocs}
              >
                {showAllBookmarkedDocs ? (
                  <>
                    Show Less
                    <ChevronUpIcon size={16} />
                  </>
                ) : (
                  <>
                    View All Bookmarks
                    <ChevronRightIcon size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
      </div>
      
      {/* Profile Section */}
      <section className="mt-12 mb-6">
        <Card className="overflow-hidden border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-primary/10">
                <img src="https://github.com/shadcn.png" alt="Bart Simpson" />
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Bart Simpson</h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-2 py-1">
                  @bartsimpson
                </Badge>
                <p className="text-muted-foreground mt-1">
                  Opera enthusiast and classical music aficionado
                </p>
              </div>
            </div>
            <Button 
              className="gap-1.5 hover-primary-effect" 
              variant="outline"
              size="sm"
            >
                <ExternalLinkIcon size={14} />
                View Profile
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home; 