import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  BookmarkIcon,
  StarIcon,
  EditIcon,
  DownloadIcon,
  LinkIcon,
  LockIcon,
  UnlockIcon,
  TrendingUpIcon,
  ClockIcon,
  MessageSquareIcon,
  ArrowLeftIcon,
  HistoryIcon,
  ChevronUpIcon,
  Share2Icon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { cn, formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import DocumentView from '../modals/DocumentView';

const Profile = () => {
  const appNavigate = useAppNavigate();
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<MockDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showAllBookmarkedDocs, setShowAllBookmarkedDocs] = useState(false);

  // Mock user data - in a real app this would come from an API
  const currentUser = useMemo(() => ({
    id: 'bartsimpson',
    firstName: 'Bart',
    lastName: 'Simpson',
    username: 'bartsimpson',
    avatar: 'https://github.com/shadcn.png',
    bio: 'Opera enthusiast and classical music aficionado. Passionate about sharing knowledge through well-crafted documents and educational content.',
    joinDate: new Date('2023-01-15')
  }), []);

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

  // Load user documents and favorites
  useEffect(() => {
    const allDocuments = mockService.getDocuments();
    
    // Get user's documents and sort by upload date (newest first)
    const userDocs = allDocuments
      .filter(doc => doc.author.username === currentUser.username)
      .sort((a, b) => new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime());
    setUserDocuments(userDocs);
    
    // Mock favorites (in a real app, this would come from user data)
    const favorites = allDocuments.slice(0, 3);
    setFavoriteDocuments(favorites);
  }, [currentUser]);

  // Toggle favorite (in a real app, this would call an API)
  const toggleFavorite = useCallback((docId: string) => {
    setFavoriteDocuments(prev => {
      const docExists = prev.some(doc => doc.id === docId);
      if (docExists) {
        return prev.filter(doc => doc.id !== docId);
      }
      
      const docToAdd = userDocuments.find(doc => doc.id === docId);
      if (docToAdd) {
        return [...prev, docToAdd];
      }
      return prev;
    });
  }, [userDocuments]);

  // Check if a document is in favorites
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

  // Toggle document visibility
  const toggleDocumentVisibility = useCallback((docId: string, isPublic: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent opening the document modal
    }
    
    setUserDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, file: { ...doc.file, isPublic: !isPublic } }
        : doc
    ));
    
    toast.success(
      !isPublic ? "Document made public" : "Document made private",
      {
        description: !isPublic 
          ? "This document is now visible to everyone" 
          : "This document is now only visible to you",
        icon: !isPublic ? <UnlockIcon size={16} /> : <LockIcon size={16} />,
      }
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

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    toast.info("Edit profile feature coming soon", {
      description: "Profile editing functionality will be available in a future update",
      icon: <EditIcon size={16} />,
    });
  }, []);

  // Handle share profile
  const handleShareProfile = useCallback(() => {
    toast.success("Profile link copied", {
      description: "Profile URL has been copied to clipboard",
      icon: <LinkIcon size={16} />,
    });
  }, []);

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
      <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg">
        <CardContent className="p-8">
          <div className="flex gap-10">
            {/* Left side - Profile image and basic info */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-md mb-6">
                <img src={currentUser.avatar} alt={currentUser.username} />
              </Avatar>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 hover-primary-effect shadow-sm"
                        onClick={handleEditProfile}
                      >
                        <EditIcon size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 hover-primary-effect shadow-sm"
                        onClick={handleShareProfile}
                      >
                        <Share2Icon size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Right side - Profile details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold leading-tight mb-2">
                    {currentUser.firstName} {currentUser.lastName}
                  </h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 px-3 py-1.5 font-medium mb-4">
                    @{currentUser.username}
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
                  {currentUser.bio}
                </p>
              </div>
              
              {/* Enhanced Details */}
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  <span className="font-medium">Joined:</span>
                  <span className="text-muted-foreground">{formatRelativeDate(currentUser.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* My Documents */}
        <div>
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
            <FileTextIcon size={24} className="text-primary" />
            My Documents ({userDocuments.length})
          </h2>

          <div className="space-y-6">
            {userDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground">Start by uploading your first document!</p>
              </div>
            ) : (
              userDocuments
                .slice(0, showAllDocs ? undefined : 5)
                .map((doc) => (
                  <Card 
                    key={doc.id}
                    className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10"
                    onClick={() => openDocModal(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 relative shadow-sm border border-primary/10">
                          {renderThumbnail(doc.file.thumbnail, doc.title)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-base line-clamp-1">{doc.title}</h3>
                            <div className="flex items-center gap-2 ml-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={doc.file.isPublic}
                                        onCheckedChange={() => toggleDocumentVisibility(doc.id, doc.file.isPublic)}
                                        className="data-[state=checked]:bg-primary"
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      {!doc.file.isPublic ? (
                                        <LockIcon size={16} className="text-muted-foreground" />
                                      ) : (
                                        <UnlockIcon size={16} className="text-primary" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {!doc.file.isPublic ? "Make public" : "Make private"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon size={12} className="text-primary" />
                              <span>Uploaded: {formatRelativeDate(doc.file.uploadedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DownloadIcon size={12} className="text-primary" />
                              <span>{doc.file.downloadCount} downloads</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <StarIcon size={12} className="text-yellow-500" />
                              <span>{doc.rating.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {doc.file.tags.slice(0, 4).map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {doc.file.tags.length > 4 && (
                              <Badge 
                                variant="outline"
                                className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                              >
                                +{doc.file.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
            
            {userDocuments.length > 5 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllDocs(!showAllDocs)}
                  className="gap-2 hover-primary-effect shadow-sm"
                >
                  {showAllDocs ? "Show Less" : `View All ${userDocuments.length} Documents`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bookmarked Documents */}
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <BookmarkIcon size={24} className="text-primary" />
            Bookmarked
          </h2>
          {favoriteDocuments.length > 0 ? (
            <div className="space-y-4">
              {favoriteDocuments.slice(0, showAllBookmarkedDocs ? 5 : 3).map((doc) => (
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
                          <h3 className="font-semibold text-sm line-clamp-1">{doc.title}</h3>
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
                          <Avatar className="h-5 w-5 border border-primary/20">
                            <img src={doc.author.avatar} alt={doc.author.username} />
                          </Avatar>
                          <span className="text-xs text-muted-foreground font-medium">{doc.author.username}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <HistoryIcon size={12} className="text-primary" />
                            <span>Last opened: {getLastOpenedTime(doc)}</span>
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
                <p className="text-muted-foreground font-medium">You haven't added any bookmarks yet.</p>
              </CardContent>
            </Card>
          )}
          {favoriteDocuments.length > 3 && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={() => setShowAllBookmarkedDocs(!showAllBookmarkedDocs)}
              >
                {showAllBookmarkedDocs ? (
                  <>
                    Show Less
                    <ChevronUpIcon size={16} />
                  </>
                ) : (
                  <>
                    View All Bookmarks
                    <ChevronUpIcon size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUpIcon size={20} className="text-primary" />
          Activity Summary
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon size={16} className="text-primary" />
              <span className="text-sm">Last active</span>
            </div>
            <span className="text-sm text-muted-foreground">2 hours ago</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareIcon size={16} className="text-primary" />
              <span className="text-sm">Comments</span>
            </div>
            <span className="text-sm text-muted-foreground">24 this month</span>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileTextIcon size={16} className="text-primary" />
              <span className="text-sm">Documents uploaded</span>
            </div>
            <span className="text-sm text-muted-foreground">3 this month</span>
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

export default Profile; 