import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ClockIcon, BookmarkIcon, TrendingUpIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon, HistoryIcon, ChevronUpIcon, ExternalLinkIcon, ThumbsUpIcon, ArrowUpIcon } from 'lucide-react';
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
import { useAppNavigate, useScrollToTop } from '@/lib/navigation';

const Home = () => {
  const appNavigate = useAppNavigate();
  useScrollToTop(); // Automatically scroll to top when location changes
  const [recentDocs, setRecentDocs] = useState<MockDocument[]>([]);
  const [favoriteDocs, setFavoriteDocs] = useState<MockDocument[]>([]);
  const [trendingDocs, setTrendingDocs] = useState<MockDocument[]>([]);
  const [recommendationDocs, setRecommendationDocs] = useState<MockDocument[]>([]);
  const [userDocs, setUserDocs] = useState<MockDocument[]>([]);
  const [showAllUserDocs, setShowAllUserDocs] = useState(false);
  const [showAllRecentDocs, setShowAllRecentDocs] = useState(false);
  const [showAllBookmarkedDocs, setShowAllBookmarkedDocs] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [recommendationCarouselIndex, setRecommendationCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Refs for section headers
  const recentDocsRef = useRef<HTMLHeadingElement>(null);
  const savedDocsRef = useRef<HTMLHeadingElement>(null);
  


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
    
    if (diffInHours < 1) return 'Adesso';
    if (diffInHours === 1) return '1 ora fa';
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ieri';
    return `${diffInDays} giorni fa`;
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
    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
    
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
    
    // Simple recommendations (just use a different slice of trending documents)
    const recommendationDocuments = [...trendingDocuments]
      .filter(doc => doc.author.username !== currentUsername) // Exclude user's own documents
      .slice(3, 13);
    
    // Initialize favorites (mock some documents similar to Profile.tsx)
    const favorites = allDocuments.slice(0, 3);
    
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
    setRecommendationDocs(recommendationDocuments); // Take different slice for recommendations
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

  // Render thumbnail with enhanced styling
  const renderThumbnail = useCallback((thumbnailData: string, title: string) => {
    // Parse the thumbnail format "color:text"
    const [color, text] = thumbnailData.split(':');
    
    return (
      <div 
        style={{ backgroundColor: color }} 
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <span className="text-white font-medium text-center px-2 text-sm relative z-10 drop-shadow-lg">
          {decodeURIComponent(text)}
        </span>
      </div>
    );
  }, []);

  // Move carousel to previous slide - memoized to prevent re-renders
  const previousSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === 0 ? trendingDocs.length - 2 : prev - 1));
  }, [trendingDocs.length]);

  // Move carousel to next slide - memoized to prevent re-renders
  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev === trendingDocs.length - 2 ? 0 : prev + 1));
  }, [trendingDocs.length]);

  // Recommendation carousel navigation
  const previousRecommendationSlide = useCallback(() => {
    setRecommendationCarouselIndex((prev) => (prev === 0 ? recommendationDocs.length - 2 : prev - 1));
  }, [recommendationDocs.length]);

  const nextRecommendationSlide = useCallback(() => {
    setRecommendationCarouselIndex((prev) => (prev === recommendationDocs.length - 2 ? 0 : prev + 1));
  }, [recommendationDocs.length]);

  // Open document modal
  const openDocModal = useCallback((doc: MockDocument) => {
    setSelectedDoc(doc);
    setIsDocModalOpen(true);
  }, []);
  
  // Transform style for carousel - memoized to prevent recalculations
  const carouselTransform = useMemo(() => {
    return { transform: `translateX(-${carouselIndex * (100 / 2)}%)` };
  }, [carouselIndex]);

  // Transform style for recommendation carousel
  const recommendationCarouselTransform = useMemo(() => {
    return { transform: `translateX(-${recommendationCarouselIndex * (100 / 2)}%)` };
  }, [recommendationCarouselIndex]);
  
  // Handle new document upload 
  const handleNewDocumentClick = useCallback(() => {
    // Will be implemented in the future
    console.log("New document upload clicked");
  }, []);

  // Handle view profile click
  const handleViewProfileClick = useCallback(() => {
    // Navigate to profile page
    appNavigate('/profile');
  }, [appNavigate]);

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

  // Scroll to section top functions
  const scrollToRecentDocs = useCallback(() => {
    if (recentDocsRef.current) {
      // Add temporary scroll margin
      recentDocsRef.current.style.scrollMarginTop = '96px';
      recentDocsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      // Remove scroll margin after scroll
      setTimeout(() => {
        if (recentDocsRef.current) {
          recentDocsRef.current.style.scrollMarginTop = '';
        }
      }, 1000);
    }
  }, []);

  const scrollToSavedDocs = useCallback(() => {
    if (savedDocsRef.current) {
      // Add temporary scroll margin
      savedDocsRef.current.style.scrollMarginTop = '96px';
      savedDocsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      // Remove scroll margin after scroll
      setTimeout(() => {
        if (savedDocsRef.current) {
          savedDocsRef.current.style.scrollMarginTop = '';
        }
      }, 1000);
    }
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none">
      {/* Trending Documents Carousel */}
      {trendingDocs.length > 0 && (
        <section className="mb-8 relative">
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <TrendingUpIcon size={24} className="text-primary" />
            Tendenze
          </h2>
          
          <div className="relative">
            {/* The outer container without overflow-hidden */}
            <div className="relative">
              {/* Left navigation button - positioned outside the overflow area */}
              <button 
                onClick={previousSlide} 
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
                aria-label="Diapositiva precedente"
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
                    <div key={doc.id} className="min-w-[50%] px-2">
                      <Card 
                        className="h-full hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
                        onClick={() => openDocModal(doc)}
                      >
                        <CardContent className="p-4 pb-5">
                          <div className="flex items-start gap-3">
                            <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative shadow-sm border border-primary/10">
                              {renderThumbnail(doc.file.thumbnail, doc.title)}
                            </div>
                            
                            <div className="flex-grow min-w-0 flex flex-col h-32">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-md line-clamp-1">{doc.title}</h3>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Avatar className="h-6 w-6 border border-primary/20">
                                  <img src={doc.author.avatar} alt={doc.author.username} />
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{doc.author.firstName} {doc.author.lastName}</span>
                                  <span className="text-xs text-muted-foreground">@{doc.author.username}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ClockIcon size={12} className="text-primary" />
                                  <span>Pubblicato: {formatRelativeDate(doc.file.uploadedAt)}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <StarIcon size={12} className="text-yellow-500" />
                                  <span className="font-medium">{doc.rating.rating.toFixed(1)} valutazione</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-auto">
                                {doc.file.tags.slice(0, 3).map((tag) => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {doc.file.tags.length > 3 && (
                                  <Badge 
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
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
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
                aria-label="Diapositiva successiva"
                type="button"
              >
                <ChevronRightIcon size={24} />
              </button>
            </div>
            
            {/* Pagination dots */}
            <div className="flex justify-center items-center gap-2 mt-6">
              {trendingDocs.slice(0, trendingDocs.length - 1).map((doc, index) => (
                <button
                  key={`dot-${doc.id}`}
                  type="button"
                  aria-label={`Vai alla diapositiva ${index + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all bg-muted-foreground/30 hover:bg-muted-foreground/50 cursor-pointer shadow-sm",
                    index === carouselIndex 
                      ? "w-8 bg-primary shadow-md" 
                      : "w-2"
                  )}
                  onClick={() => setCarouselIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Recommendations Section */}
      {recommendationDocs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <ThumbsUpIcon size={24} className="text-primary" />
            Raccomandazioni
          </h2>
          
          <div className="relative">
            {/* Left navigation button - positioned outside the overflow area */}
            <button 
              onClick={previousRecommendationSlide} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
              aria-label="Diapositiva precedente"
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
                style={recommendationCarouselTransform}
              >
                {recommendationDocs.map((doc) => (
                  <div key={doc.id} className="min-w-[50%] px-2">
                    <Card 
                      className="h-full hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
                      onClick={() => openDocModal(doc)}
                    >
                      <CardContent className="p-4 pb-5">
                        <div className="flex items-start gap-3">
                          <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative shadow-sm border border-primary/10">
                            {renderThumbnail(doc.file.thumbnail, doc.title)}
                          </div>
                          
                          <div className="flex-grow min-w-0 flex flex-col h-32">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-md line-clamp-1">{doc.title}</h3>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-6 w-6 border border-primary/20">
                                <img src={doc.author.avatar} alt={doc.author.username} />
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{doc.author.firstName} {doc.author.lastName}</span>
                                <span className="text-xs text-muted-foreground">@{doc.author.username}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ClockIcon size={12} className="text-primary" />
                                <span>Pubblicato: {formatRelativeDate(doc.file.uploadedAt)}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <StarIcon size={12} className="text-yellow-500" />
                                <span className="font-medium">{doc.rating.rating.toFixed(1)} valutazione</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-auto">
                              {doc.file.tags.slice(0, 3).map((tag) => (
                                <Badge 
                                  key={tag} 
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {doc.file.tags.length > 3 && (
                                <Badge 
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
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
              onClick={nextRecommendationSlide} 
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-20 bg-muted/90 hover:bg-primary/90 hover:text-primary-foreground text-muted-foreground p-1.5 rounded-full shadow-lg transition-colors cursor-pointer"
              aria-label="Diapositiva successiva"
              type="button"
            >
              <ChevronRightIcon size={24} />
            </button>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {recommendationDocs.slice(0, recommendationDocs.length - 1).map((doc, index) => (
              <button
                key={`recommendation-dot-${doc.id}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all bg-muted-foreground/30 hover:bg-muted-foreground/50 cursor-pointer shadow-sm",
                  index === recommendationCarouselIndex 
                    ? "w-8 bg-primary shadow-md" 
                    : "w-2"
                )}
                onClick={() => setRecommendationCarouselIndex(index)}
              />
            ))}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Recent Documents */}
        <section>
          <h2 ref={recentDocsRef} className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <ClockIcon size={24} className="text-primary" />
            Recenti ({recentDocs.length})
          </h2>
          <div className="space-y-4">
            {recentDocs.slice(0, showAllRecentDocs ? recentDocs.length : 3).map((doc) => (
              <Card 
                key={doc.id} 
                className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
                onClick={() => openDocModal(doc)}
              >
                <CardContent className="p-4 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative shadow-sm border border-primary/10">
                      {renderThumbnail(doc.file.thumbnail, doc.title)}
                    </div>
                    
                    <div className="flex-grow min-w-0 flex flex-col h-32">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-md line-clamp-1">{doc.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 ml-2 flex-shrink-0 cursor-pointer hover:bg-primary/10 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            toggleFavorite(doc.id);
                          }}
                        >
                          <BookmarkIcon 
                            size={16} 
                            className={isDocumentFavorite(doc.id) 
                              ? "fill-primary text-primary" 
                              : "hover:text-primary hover:fill-primary/30"
                            } 
                          />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6 border border-primary/20">
                          <img src={doc.author.avatar} alt={doc.author.username} />
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{doc.author.firstName} {doc.author.lastName}</span>
                          <span className="text-xs text-muted-foreground">@{doc.author.username}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <HistoryIcon size={12} className="text-primary" />
                          <span>Ultima lettura: {getLastOpenedTime(doc)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {doc.file.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline"
                            className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {doc.file.tags.length > 3 && (
                          <Badge 
                            variant="outline"
                            className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
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
          {recentDocs.length > 2 && (
            <div className="relative flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={toggleShowAllRecentDocs}
              >
                {showAllRecentDocs ? (
                  <>
                    Mostra di meno
                    <ChevronUpIcon size={16} />
                  </>
                ) : (
                  <>
                    Mostra di piú
                    <ChevronRightIcon size={16} />
                  </>
                )}
              </Button>
              {showAllRecentDocs && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute right-0 hover-primary-effect shadow-sm"
                  onClick={scrollToRecentDocs}
                  aria-label="Scorri in cima ai Documenti Recenti"
                >
                  <ArrowUpIcon size={16} />
                </Button>
              )}
            </div>
          )}
        </section>
        
        {/* Favorite Documents */}
        <section>
          <h2 ref={savedDocsRef} className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <BookmarkIcon size={24} className="text-primary" />
            Salvati ({favoriteDocs.length})
          </h2>
          {favoriteDocs.length > 0 ? (
            <div className="space-y-4">
              {favoriteDocs.slice(0, showAllBookmarkedDocs ? favoriteDocs.length : 3).map((doc) => (
                <Card 
                  key={doc.id} 
                  className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
                  onClick={() => openDocModal(doc)}
                >
                  <CardContent className="p-4 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-muted/30 relative shadow-sm border border-primary/10">
                        {renderThumbnail(doc.file.thumbnail, doc.title)}
                      </div>
                      
                      <div className="flex-grow min-w-0 flex flex-col h-32">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-md line-clamp-1">{doc.title}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 ml-2 flex-shrink-0 cursor-pointer hover:bg-primary/10 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              toggleFavorite(doc.id);
                            }}
                          >
                            <BookmarkIcon 
                              size={16}
                              className="fill-primary text-primary hover:fill-primary/80 hover:text-primary/80" 
                            />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6 border border-primary/20">
                            <img src={doc.author.avatar} alt={doc.author.username} />
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{doc.author.firstName} {doc.author.lastName}</span>
                            <span className="text-xs text-muted-foreground">@{doc.author.username}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <HistoryIcon size={12} className="text-primary" />
                            <span>Ultima lettura: {getLastOpenedTime(doc)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {doc.file.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {doc.file.tags.length > 3 && (
                            <Badge 
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
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
            <Card className="bg-gradient-to-r from-muted/20 to-muted/40 shadow-md border-primary/10">
              <CardContent className="p-8 text-center">
                <BookmarkIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Non hai ancora aggiunto documenti salvati.</p>
              </CardContent>
            </Card>
          )}
          {favoriteDocs.length > 3 && (
            <div className="relative flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={toggleShowAllBookmarkedDocs}
              >
                                  {showAllBookmarkedDocs ? (
                    <>
                      Mostra di meno
                      <ChevronUpIcon size={16} />
                    </>
                  ) : (
                    <>
                      Visualizza Tutti i Salvati
                      <ChevronRightIcon size={16} />
                    </>
                  )}
              </Button>
              {showAllBookmarkedDocs && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute right-0 hover-primary-effect shadow-sm"
                  onClick={scrollToSavedDocs}
                  aria-label="Scorri in cima ai Documenti Salvati"
                >
                  <ArrowUpIcon size={16} />
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
      
      {/* Enhanced Profile Section */}
      <section className="mt-16 mb-8">
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-md">
                <img src="https://github.com/shadcn.png" alt="Bart Simpson" />
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Bart Simpson</h2>
                <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 px-3 py-1.5 font-medium">
                  @bartsimpson
                </Badge>
              </div>
            </div>
            <Button 
              className="gap-2 hover-primary-effect shadow-md cursor-pointer" 
              variant="outline"
              size="lg"
              onClick={handleViewProfileClick}
            >
              <ExternalLinkIcon size={16} />
              Visualizza Profilo
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Home; 