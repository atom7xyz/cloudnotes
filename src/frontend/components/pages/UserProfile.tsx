import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  StarIcon,
  ClockIcon,
  ArrowLeftIcon,
  HistoryIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  Share2Icon,
  BookmarkIcon,
  HeartIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import DocumentView from '../modals/DocumentView';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const appNavigate = useAppNavigate();
  const { username } = useParams<{ username: string }>();
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<MockDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);

  // Mock user data - in a real app this would be fetched based on username
  const profileUser = useMemo(() => {
    const allDocuments = mockService.getDocuments();
    const userDoc = allDocuments.find(doc => doc.author.username === username);
    
    if (!userDoc) {
      return null;
    }
    
    return {
      id: userDoc.author.username,
      firstName: userDoc.author.firstName,
      lastName: userDoc.author.lastName,
      username: userDoc.author.username,
      avatar: userDoc.author.avatar,
      bio: 'Passionate about sharing knowledge through educational documents and research papers.',
      joinDate: new Date('2023-06-20') // Mock join date
    };
  }, [username]);

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

  // Load user documents
  useEffect(() => {
    if (!profileUser) return;
    
    const allDocuments = mockService.getDocuments();
    
    // Get all user's documents (not just public ones) and sort by upload date (newest first)
    const userDocs = allDocuments
      .filter(doc => doc.author.username === profileUser.username)
      .sort((a, b) => new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime());
    setUserDocuments(userDocs);
  }, [profileUser]);

  // Toggle favorite (simplified for viewing other users)
  const toggleFavorite = useCallback((docId: string) => {
    const docExists = favoriteDocuments.some(doc => doc.id === docId);
    
    if (docExists) {
      // Remove from favorites
      setFavoriteDocuments(prev => prev.filter(doc => doc.id !== docId));
      toast.success("Removed from saved", {
        description: "Document removed from your saved documents",
        icon: <BookmarkIcon size={16} />,
      });
    } else {
      // Add to favorites
      const docToAdd = userDocuments.find(doc => doc.id === docId);
      if (docToAdd) {
        setFavoriteDocuments(prev => [...prev, docToAdd]);
        toast.success("Added to saved", {
          description: "Document saved to your saved documents",
          icon: <BookmarkIcon size={16} />,
        });
      }
    }
  }, [favoriteDocuments, userDocuments]);

  // Check if a document is in favorites (always false for other users)
  const isDocumentFavorite = useCallback((docId: string) => {
    return favoriteDocuments.some(doc => doc.id === docId);
  }, [favoriteDocuments]);

  // Render thumbnail with enhanced styling
  const renderThumbnail = useCallback((thumbnailData: string, title: string) => {
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

  // Open document modal
  const openDocModal = useCallback((doc: MockDocument) => {
    setSelectedDoc(doc);
    setIsDocModalOpen(true);
  }, []);

  // Go back to previous page
  const handleGoBack = useCallback(() => {
    appNavigate('/home');
  }, [appNavigate]);

  // Handle share profile
  const handleShareProfile = useCallback(async () => {
    if (!profileUser) return;
    
    try {
      const profileUrl = `${window.location.origin}/profile/${profileUser.username}`;
      await navigator.clipboard.writeText(profileUrl);

      toast.success("Profile link copied", {
        description: "Profile URL has been copied to clipboard",
        icon: <Share2Icon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy profile link:', err);
      toast.error("Failed to copy link", {
        description: "Could not copy profile URL to clipboard",
      });
    }
  }, [profileUser]);

  if (!profileUser) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto select-none">
        <div className="text-center py-12">
          <UserIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium mb-2">User not found</h3>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleGoBack}
          className="gap-2 hover-primary-effect group"
        >
          <ArrowLeftIcon size={16} />
          Back to Home
        </Button>
      </div>

      {/* Enhanced Profile Header */}
      <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg relative">
        <CardContent className="p-8 relative z-20">
          <div className="flex gap-10">
            {/* Left side - Profile image and basic info */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-md mb-6">
                <img src={profileUser.avatar} alt={profileUser.username} />
              </Avatar>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ShareLinksDropdown
                          triggerText=""
                          triggerIcon={<Share2Icon size={20} />}
                          triggerClassName="h-12 w-12 hover-primary-effect shadow-sm p-0"
                          onCopyLink={handleShareProfile}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Share profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Donation Button */}
              <div className="w-full">
                <Button 
                  className="w-full gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md cursor-pointer"
                  onClick={() => {
                    toast.success("Donation feature coming soon", {
                      description: "Support your favorite creators with donations",
                      icon: <HeartIcon size={16} />,
                    });
                  }}
                >
                  <HeartIcon size={18} />
                  Support Creator
                </Button>
              </div>
            </div>
            
            {/* Right side - Profile details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold leading-tight mb-2">
                    {profileUser.firstName} {profileUser.lastName}
                  </h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 px-3 py-1.5 font-medium mb-4">
                    @{profileUser.username}
                  </Badge>
                </div>
              </div>
              
              {/* Enhanced Bio Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <UserIcon size={18} className="text-primary" />
                  About
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-4 rounded-lg border-l-4 border-primary/30">
                  {profileUser.bio}
                </p>
              </div>
              
              {/* Enhanced Details */}
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  <span className="font-medium">Joined:</span>
                  <span className="text-muted-foreground">{formatRelativeDate(profileUser.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <div className="mb-10">
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <FileTextIcon size={24} className="text-primary" />
            {profileUser.firstName}'s Documents ({userDocuments.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userDocuments.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <FileTextIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground">This user hasn't uploaded any documents yet.</p>
              </div>
            ) : (
              <>
                {userDocuments.slice(0, showAllDocs ? userDocuments.length : 6).map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
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
                            <div className="flex items-center gap-1">
                              <ClockIcon size={12} className="text-primary" />
                              <span>Published: {formatRelativeDate(doc.file.uploadedAt)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <StarIcon size={12} className="text-yellow-500" />
                              <span className="font-medium">{doc.rating.rating.toFixed(1)} rating</span>
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
                
                {userDocuments.length > 6 && (
                  <div className="col-span-2 flex justify-center mt-6">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 hover-primary-effect shadow-sm"
                      onClick={() => setShowAllDocs(!showAllDocs)}
                    >
                      {showAllDocs ? (
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
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Document Modal */}
      <DocumentView 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)}
        document={selectedDoc}
        isBookmarked={isDocumentFavorite}
        toggleBookmark={toggleFavorite}
        formatDate={formatRelativeDate}
        renderThumbnail={renderThumbnail}
      />
    </div>
  );
};

export default UserProfile; 