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
import { getHomeDocuments, type HomeDocument } from '../../lib/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';
import { Modal } from '../ui/modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

const Home = () => {
  const [recentDocs, setRecentDocs] = useState<HomeDocument[]>([]);
  const [favoriteDocs, setFavoriteDocs] = useState<HomeDocument[]>([]);
  const [trendingDocs, setTrendingDocs] = useState<HomeDocument[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<HomeDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Simulate data fetching
  useEffect(() => {
    const allDocuments = getHomeDocuments();
    
    // Sort for recent (by upload date)
    const recentDocuments = [...allDocuments].sort((a, b) => 
      b.uploadDate.getTime() - a.uploadDate.getTime()
    );
    
    // Sort for trending (by view count, download count, and recency)
    const trendingDocuments = [...allDocuments].sort((a, b) => {
      // Score = (viewCount * 1) + (downloadCount * 2) + (recency factor * 4)
      // Recency factor = 1 / (days old + 1) to keep it between 0-1
      const daysA = Math.floor((new Date().getTime() - a.uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysB = Math.floor((new Date().getTime() - b.uploadDate.getTime()) / (1000 * 60 * 60 * 24));
      const recencyFactorA = 1 / (daysA + 1);
      const recencyFactorB = 1 / (daysB + 1);
      
      const scoreA = a.viewCount + (a.downloadCount * 2) + (recencyFactorA * 4) + (a.rating * 5);
      const scoreB = b.viewCount + (b.downloadCount * 2) + (recencyFactorB * 4) + (b.rating * 5);
      
      return scoreB - scoreA;
    });
    
    // Filter for favorites
    const favorites = allDocuments.filter(doc => doc.isFavorite);
    
    setRecentDocs(recentDocuments);
    setTrendingDocs(trendingDocuments.slice(0, 10)); // Take top 10 trending
    setFavoriteDocs(favorites);
  }, []);

  // Toggle favorite (in a real app, this would call an API)
  const toggleFavorite = useCallback((docId: string) => {
    const allDocuments = getHomeDocuments();
    const updatedDocs = allDocuments.map(doc => 
      doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    const favorites = updatedDocs.filter(doc => doc.isFavorite);
    setFavoriteDocs(favorites);
    
    // If toggling the currently selected document, update it too
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc({
        ...selectedDoc,
        isFavorite: !selectedDoc.isFavorite
      });
    }
  }, [selectedDoc]);

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

  // Move carousel to previous slide - memoized to prevent re-renders
  const previousSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === 0 ? trendingDocs.length - 3 : prev - 1));
  }, [trendingDocs.length]);

  // Move carousel to next slide - memoized to prevent re-renders
  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === trendingDocs.length - 3 ? 0 : prev + 1));
  }, [trendingDocs.length]);
  
  // Get file type badge styling
  const getFileTypeBadgeStyles = useCallback((fileType: string) => {
    const fileTypeLower = fileType.toLowerCase();
    
    switch (fileTypeLower) {
      case 'pdf':
        return "bg-red-50 text-red-700 border-red-200";
      case 'word':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'powerpoint':
        return "bg-orange-50 text-orange-700 border-orange-200";
      case 'txt':
        return "bg-gray-50 text-gray-700 border-gray-200";
      case 'epub':
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }, []);

  // Open document modal
  const openDocModal = useCallback((doc: HomeDocument) => {
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
                        <CardContent className="p-4 pb-5">
                          <div className="flex items-start gap-3">
                            <div className="w-24 h-32 rounded-md overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative">
                              <img 
                                src={doc.thumbnail} 
                                alt={doc.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-sm line-clamp-1">{doc.title}</h3>
                              </div>
                              
                              <div className="flex items-center gap-1.5 mt-2">
                                <Avatar className="h-4 w-4">
                                  <img src={doc.uploaderAvatar} alt={doc.uploaderUsername} />
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{doc.uploaderUsername}</span>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ClockIcon size={10} />
                                  <span>{formatRelativeDate(doc.uploadDate)}</span>
                                </div>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 cursor-pointer">
                                        <StarIcon size={10} className="text-yellow-500" />
                                        <span>{doc.rating.toFixed(1)}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Rating</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {doc.tags.slice(0, 3).map((tag) => (
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
      
      {/* Document Modal */}
      <Modal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)}
        title="Document View"
        maxWidth="max-w-4xl"
      >
        {selectedDoc && (
          <div className="p-6">
            <div className="flex gap-8">
              {/* Left side - Document image and action buttons */}
              <div className="flex flex-col items-center">
                <div className="w-56 h-64 rounded-md overflow-hidden bg-muted/30 mb-4">
                  <img 
                    src={selectedDoc.thumbnail} 
                    alt={selectedDoc.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn("h-10 w-10", selectedDoc.isFavorite && "bg-primary/10 border-primary text-primary")}
                          onClick={() => toggleFavorite(selectedDoc.id)}
                        >
                          <BookmarkIcon size={20} className={selectedDoc.isFavorite ? "fill-primary" : ""} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{selectedDoc.isFavorite ? "Remove bookmark" : "Add to bookmarks"}</TooltipContent>
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
                        <FacebookIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>Facebook</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <Twitter className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>X.com</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <svg 
                          viewBox="0 0 24 24" 
                          className="mr-2 h-4 w-4 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          aria-label="Telegram icon"
                          role="img"
                        >
                          <path d="M21.64 3.64A1.35 1.35 0 0 0 21.14 3H2.86a1.35 1.35 0 0 0-.5.64m19.28 0L12 12.5 2.36 3.64m19.28 0L20.5 16.14a1.35 1.35 0 0 1-1.93 1.11L12 13.5l-6.57 3.75A1.35 1.35 0 0 1 3.5 16.14L2.36 3.64" />
                        </svg>
                        <span>Telegram</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <svg 
                          viewBox="0 0 24 24" 
                          className="mr-2 h-4 w-4 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          aria-label="WhatsApp icon"
                          role="img"
                        >
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm5 0a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm-5 5a5 5 0 0 0 5 0" />
                        </svg>
                        <span>WhatsApp</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center">
                        <MailIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>Email</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Right side - Document details */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-3">{selectedDoc.title}</h2>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ClockIcon size={14} />
                    <span>{formatRelativeDate(selectedDoc.uploadDate)}</span>
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                          <StarIcon size={14} className="text-yellow-500" />
                          <span>{selectedDoc.rating.toFixed(1)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Rating</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer">
                          <MessageSquareIcon size={14} />
                          <span>{selectedDoc.commentCount}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Comments</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-6 w-6">
                    <img src={selectedDoc.uploaderAvatar} alt={selectedDoc.uploaderUsername} />
                  </Avatar>
                  <span className="text-sm">{selectedDoc.uploaderUsername}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-5">
                  {selectedDoc.tags.map((tag) => (
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
                  {selectedDoc.description}
                </p>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{selectedDoc.fileType.toUpperCase()} · {selectedDoc.fileSize}</span>
                    
                    <div className="flex items-center gap-1">
                      <EyeIcon size={14} />
                      <span>{selectedDoc.viewCount.toLocaleString()} views</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <BookmarkIcon size={14} />
                      <span>
                        {/* This is a mock number since we don't track this in the model */}
                        {Math.floor(selectedDoc.downloadCount / 3)} bookmarks
                      </span>
                    </div>
                  </div>
                  
                  <Button className="gap-2">
                    <ExternalLinkIcon size={16} />
                    Open Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
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
                    <img 
                      src={doc.thumbnail} 
                      alt={doc.title} 
                      className="w-full h-full object-cover"
                    />
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
                          className={doc.isFavorite ? "fill-primary text-primary" : ""} 
                        />
                      </Button>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mb-1 mt-0.5">
                      <UserIcon size={10} className="mr-1" />
                      <span className="mr-3">{doc.uploaderUsername}</span>
                      <span>{formatRelativeDate(doc.uploadDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {doc.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1 py-0 font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 font-normal">
                            +{doc.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileTextIcon size={10} />
                          <span>{doc.fileType.toUpperCase()}</span>
                        </div>
                        <span>{formatFileSize(doc.fileSize)}</span>
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
            Favorites
          </h2>
          {favoriteDocs.length > 0 ? (
            <div className="space-y-3">
              {favoriteDocs.slice(0, 5).map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="flex p-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-3">
                      <img 
                        src={doc.thumbnail} 
                        alt={doc.title} 
                        className="w-full h-full object-cover"
                      />
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
                        <span className="mr-3">{doc.uploaderUsername}</span>
                        <span>{formatRelativeDate(doc.uploadDate)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          {doc.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0 font-normal">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0 font-normal">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileTextIcon size={10} />
                            <span>{doc.fileType.toUpperCase()}</span>
                          </div>
                          <span>{formatFileSize(doc.fileSize)}</span>
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
                <p className="text-muted-foreground">You haven't added any favorites yet.</p>
                <Button variant="outline" className="mt-4">Browse Documents</Button>
              </CardContent>
            </Card>
          )}
          {favoriteDocs.length > 5 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild size="sm">
                <AppLink href="/saved">View All Favorites</AppLink>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home; 