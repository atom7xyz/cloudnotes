import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FileTextIcon, ClockIcon, UploadIcon, BookmarkIcon, UserIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, Share2Icon, MessageSquareIcon, EyeIcon, ExternalLinkIcon, FacebookIcon, MailIcon, Twitter } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppLink } from '../ui/app-link';
import { Avatar } from '../ui/avatar';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument } from '../../lib/mocking/mocked';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import DocumentView from '../modals/DocumentView';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const Home = () => {
  const [recentDocs, setRecentDocs] = useState<MockDocument[]>([]);
  const [favoriteDocs, setFavoriteDocs] = useState<MockDocument[]>([]);
  const [trendingDocs, setTrendingDocs] = useState<MockDocument[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Simulate data fetching
  useEffect(() => {
    const allDocuments = mockService.getDocuments();
    
    // Sort for recent (by upload date)
    const recentDocuments = [...allDocuments].sort((a, b) => 
      b.file.uploadedAt.getTime() - a.file.uploadedAt.getTime()
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
    
    setRecentDocs(recentDocuments);
    setTrendingDocs(trendingDocuments.slice(0, 10)); // Take top 10 trending
    setFavoriteDocs(favorites);
  }, []);

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <ClockIcon size={20} />
            Recent Documents
          </h2>
          <div className="space-y-3">
            {recentDocs.slice(0, 5).map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <div className="flex p-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                    {renderThumbnail(doc.file.thumbnail, doc.title)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1 flex-shrink-0"
                        onClick={() => toggleFavorite(doc.id)}
                      >
                        <BookmarkIcon 
                          size={14} 
                          className={isDocumentFavorite(doc.id) ? "fill-primary text-primary" : ""} 
                        />
                      </Button>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mb-1 mt-0.5">
                      <UserIcon size={10} className="mr-1" />
                      <span className="mr-3">{doc.author.username}</span>
                      <span>{formatRelativeDate(doc.file.uploadedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {doc.file.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0 font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {doc.file.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 font-normal">
                            +{doc.file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <EyeIcon size={10} />
                          <span>{doc.file.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookmarkIcon size={10} />
                          <span>{doc.file.downloadCount} bookmarks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {recentDocs.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild size="sm">
                <AppLink href="/documents">View All Documents</AppLink>
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
              {favoriteDocs.slice(0, 5).map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="flex p-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                      {renderThumbnail(doc.file.thumbnail, doc.title)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-1 flex-shrink-0"
                          onClick={() => toggleFavorite(doc.id)}
                        >
                          <BookmarkIcon 
                            size={14} 
                            className="fill-primary text-primary" 
                          />
                        </Button>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mb-1 mt-0.5">
                        <UserIcon size={10} className="mr-1" />
                        <span className="mr-3">{doc.author.username}</span>
                        <span>{formatRelativeDate(doc.file.uploadedAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          {doc.file.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0 font-normal">
                              {tag}
                            </Badge>
                          ))}
                          {doc.file.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0 font-normal">
                              +{doc.file.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <EyeIcon size={10} />
                            <span>{doc.file.viewCount} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookmarkIcon size={10} />
                            <span>{doc.file.downloadCount} bookmarks</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven't added any bookmarks yet.</p>
                <Button variant="outline" className="mt-4">Browse Documents</Button>
              </CardContent>
            </Card>
          )}
          {favoriteDocs.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild size="sm">
                <AppLink href="/saved">View All Bookmarks</AppLink>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home; 