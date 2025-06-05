import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  BookmarkIcon,
  StarIcon,
  EditIcon,
  LinkIcon,
  LockIcon,
  UnlockIcon,
  BarChart3Icon,
  ClockIcon,
  MessageSquareIcon,
  ArrowLeftIcon,
  HistoryIcon,
  ChevronUpIcon,
  Share2Icon,
  EyeIcon,
  Link2Icon,
  ChevronRightIcon,
  CheckIcon,
  PlusIcon,
  Activity,
  TimerIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import DocumentView from '../modals/DocumentView';
import EditProfileModal from '../modals/EditProfileModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import { Switch } from '../ui/switch';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';

const Profile = () => {
  const appNavigate = useAppNavigate();
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<MockDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [showAllBookmarkedDocs, setShowAllBookmarkedDocs] = useState(false);
  const [showAllRecentDocs, setShowAllRecentDocs] = useState(false);
  const [showRevenueNumbers, setShowRevenueNumbers] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentUserState, setCurrentUserState] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
    bio: string;
    joinDate: Date;
  } | null>(null);

  // Mock user data - in a real app this would come from an API
  const currentUser = useMemo(() => ({
    id: 'bartsimpson',
    firstName: 'Bart',
    lastName: 'Simpson',
    username: 'bartsimpson',
    avatar: 'https://github.com/shadcn.png',
    bio: 'Passionate opera enthusiast and classical music aficionado with over a decade of experience in musical composition and performance. I specialize in 18th-century baroque compositions and have performed with various symphony orchestras across Europe. When I\'m not immersed in music, I enjoy sharing my knowledge through educational documents and helping others discover the beauty of classical arts. My collection includes rare manuscripts, performance notes, and detailed analyses of masterpieces from Mozart, Bach, and Vivaldi.',
    joinDate: new Date('2023-01-15')
  }), []);

  // Get the display user data (use currentUserState if available, fallback to currentUser)
  const displayUser = currentUserState || currentUser;

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
    
    // Initialize current user state if not already set
    if (!currentUserState) {
      setCurrentUserState(currentUser);
    }
  }, [currentUser, currentUserState]);

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
  const setDocumentVisibility = useCallback((docId: string, visibility: 'private' | 'public' | 'link-only', event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent opening the document modal
    }
    
    setUserDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, file: { ...doc.file, visibility } }
        : doc
    ));
    
    const visibilityLabels = {
      'private': 'Private',
      'public': 'Public', 
      'link-only': 'Link Only'
    };
    
    const visibilityDescriptions = {
      'private': 'Only visible to you',
      'public': 'Visible to everyone',
      'link-only': 'Only accessible via direct link'
    };
    
    const visibilityIcons = {
      'private': <LockIcon size={16} />,
      'public': <UnlockIcon size={16} />,
      'link-only': <Link2Icon size={16} />
    };
    
    // Auto-copy link when switching to link-only
    if (visibility === 'link-only') {
      const documentUrl = `${window.location.origin}/document/${docId}`;
      navigator.clipboard.writeText(documentUrl).then(() => {
        toast.success(
          `Document set to ${visibilityLabels[visibility]}`,
          {
            description: 'Link copied to clipboard',
            icon: visibilityIcons[visibility],
          }
        );
      }).catch(() => {
        toast.success(
          `Document set to ${visibilityLabels[visibility]}`,
          {
            description: visibilityDescriptions[visibility],
            icon: visibilityIcons[visibility],
          }
        );
      });
    } else {
      toast.success(
        `Document set to ${visibilityLabels[visibility]}`,
        {
          description: visibilityDescriptions[visibility],
          icon: visibilityIcons[visibility],
        }
      );
    }
  }, []);

  // Copy document link
  const copyDocumentLink = useCallback(async (docId: string) => {
    try {
      const documentUrl = `${window.location.origin}/document/${docId}`;
      await navigator.clipboard.writeText(documentUrl);
      
      // Set the copied state
      setCopiedLinkId(docId);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopiedLinkId(null);
      }, 2000);
      
      toast.success("Document link copied", {
        description: "Link has been copied to clipboard",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy document link:', err);
      toast.error("Failed to copy link", {
        description: "Could not copy document link to clipboard",
        icon: <LinkIcon size={16} />,
      });
    }
  }, []);

  // Get visibility display info
  const getVisibilityInfo = useCallback((visibility: 'private' | 'public' | 'link-only') => {
    switch (visibility) {
      case 'private':
        return { icon: LockIcon, color: 'text-muted-foreground', label: 'Private' };
      case 'public':
        return { icon: UnlockIcon, color: 'text-primary', label: 'Public' };
      case 'link-only':
        return { icon: Link2Icon, color: 'text-blue-500', label: 'Link Only' };
    }
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
    setIsEditProfileModalOpen(true);
  }, []);

  // Handle share profile
  const handleShareProfile = useCallback(async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/${displayUser.username}`;
      await navigator.clipboard.writeText(profileUrl);

      toast.success("Profile link copied", {
        description: "Profile URL has been copied to clipboard",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy profile link:', err);
      toast.error("Failed to copy link", {
        description: "Could not copy profile URL to clipboard",
        icon: <LinkIcon size={16} />,
      });
    }
  }, [displayUser.username]);

  // Handle profile update
  const handleProfileUpdate = useCallback((updatedUser: Partial<{
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
    bio: string;
  }>) => {
    if (currentUserState) {
      setCurrentUserState(prev => prev ? { ...prev, ...updatedUser } : null);
    }
  }, [currentUserState]);

  // Handle document upload
  const handleDocumentUpload = useCallback((documentData: {
    title: string;
    description: string;
    tags: string[];
    file: File;
    thumbnailColor: string;
  }) => {
    // In a real app, this would upload the file to a server and create a document
    // For demo purposes, we'll just show a success message
    toast.success("Document uploaded successfully", {
      description: `"${documentData.title}" has been uploaded to your collection`,
      icon: <FileTextIcon size={16} />,
    });
    
    // In a real implementation, you would:
    // 1. Upload the file to a server
    // 2. Create a document record in the database
    // 3. Refresh the user's documents list
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
      <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg relative">
        <CardContent className="p-8 relative z-20">
          <div className="flex gap-10">
            {/* Left side - Profile image and basic info */}
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-md mb-6">
                <img src={displayUser.avatar} alt={displayUser.username} />
              </Avatar>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 hover-primary-effect shadow-sm text-blue-600 hover:text-blue-600"
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
            </div>
            
            {/* Right side - Profile details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold leading-tight mb-2">
                    {displayUser.firstName} {displayUser.lastName}
                  </h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 px-3 py-1.5 font-medium mb-4">
                    @{displayUser.username}
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
                  {displayUser.bio}
                </p>
              </div>
              
              {/* Enhanced Details */}
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  <span className="font-medium">Joined:</span>
                  <span className="text-muted-foreground">{formatRelativeDate(displayUser.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Your Documents */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <FileTextIcon size={24} className="text-primary" />
            Your Documents ({userDocuments.length})
          </h2>

          <div className="space-y-4">
            {userDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                <p className="text-muted-foreground">Start by uploading your first document!</p>
              </div>
            ) : (
              <>
                {/* Upload Document Button */}
                <Card 
                  className="hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 overflow-hidden cursor-pointer shadow-md hover:shadow-lg border-primary/10 border-dashed"
                  onClick={() => {
                    setIsUploadModalOpen(true);
                  }}
                >
                  <CardContent className="p-4 pb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-primary/10 relative shadow-sm border border-primary/20 border-dashed flex items-center justify-center">
                        <PlusIcon size={32} className="text-primary" />
                      </div>
                      
                      <div className="flex-grow min-w-0 flex flex-col h-32 justify-center">
                        <h3 className="font-semibold text-lg mb-2">Upload Document</h3>
                        <p className="text-muted-foreground text-sm">
                          Share your knowledge by uploading a new document to your collection.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Documents */}
                {userDocuments
                  .slice(0, showAllDocs ? undefined : 2)
                  .map((doc) => (
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
                              <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
                              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              {doc.file.visibility === 'link-only' && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/20 text-green-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyDocumentLink(doc.id);
                                          }}
                                        >
                                          {copiedLinkId === doc.id ? (
                                            <CheckIcon size={14} />
                                          ) : (
                                            <LinkIcon size={14} />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copy link</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 cursor-pointer hover:bg-primary/10 shadow-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {(() => {
                                        const { icon: Icon, color } = getVisibilityInfo(doc.file.visibility);
                                        return <Icon size={14} className={color} />;
                                      })()}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={(e) => setDocumentVisibility(doc.id, 'public', e)}
                                      className="gap-2 cursor-pointer hover-primary-effect"
                                    >
                                      <UnlockIcon size={14} className="text-primary" />
                                      <div className="flex flex-col">
                                        <span className="font-medium">Public</span>
                                        <span className="text-xs text-muted-foreground">Visible to everyone</span>
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => setDocumentVisibility(doc.id, 'link-only', e)}
                                      className="gap-2 cursor-pointer hover-primary-effect"
                                    >
                                      <Link2Icon size={14} className="text-blue-500" />
                                      <div className="flex flex-col">
                                        <span className="font-medium">Link Only</span>
                                        <span className="text-xs text-muted-foreground">Only accessible via direct link</span>
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => setDocumentVisibility(doc.id, 'private', e)}
                                      className="gap-2 cursor-pointer hover-primary-effect"
                                    >
                                      <LockIcon size={14} className="text-muted-foreground" />
                                      <div className="flex flex-col">
                                        <span className="font-medium">Private</span>
                                        <span className="text-xs text-muted-foreground">Only visible to you</span>
                                      </div>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
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
                                <CalendarIcon size={12} className="text-primary" />
                                <span>Published: {formatRelativeDate(doc.file.uploadedAt)}</span>
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
              </>
            )}
            
            {userDocuments.length > 2 && (
              <div className="flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAllDocs(!showAllDocs)}
                  className="gap-2 hover-primary-effect shadow-sm"
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
          </div>
        </div>

        {/* Saved Documents */}
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <BookmarkIcon size={24} className="text-primary" />
            Saved
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
                          <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
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
                              className="fill-primary text-primary hover-primary-effect" 
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
                <p className="text-muted-foreground font-medium">You haven't added any saved documents yet.</p>
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
                    View All Saved
                    <ChevronRightIcon size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Your Revenue Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BarChart3Icon size={24} className="text-primary" />
            Your Revenue
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowRevenueNumbers(!showRevenueNumbers)}
            className="gap-2 hover-primary-effect"
          >
            {showRevenueNumbers ? <EyeIcon size={16} /> : <LockIcon size={16} />}
            {showRevenueNumbers ? 'Hide Numbers' : 'Show Numbers'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Affiliate Program */}
          <Card className="border-primary/10 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full flex-shrink-0">
                  <LinkIcon size={20} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Affiliate Program</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Earn money from automated ads on your document pages. When users click and purchase, you get a cut.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Enable Ads on Documents</span>
                  <Switch 
                    checked={adsEnabled}
                    onCheckedChange={setAdsEnabled}
                    className="cursor-pointer"
                  />
                </div>
                
                {adsEnabled && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">Total Earnings</span>
                      <span className="text-lg font-bold text-green-500">
                        {showRevenueNumbers ? '$247.50' : '******'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-sm font-bold text-green-500">
                        {showRevenueNumbers ? '$32.80' : '*****'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">Ad Clicks</span>
                      <span className="text-sm font-bold text-primary">
                        {showRevenueNumbers ? '21' : '****'}
                      </span>
                    </div>
                  </>
                )}
                
                {!adsEnabled && (
                  <div className="text-center py-6">
                    <div className="text-muted-foreground text-sm">
                      Enable ads to start earning revenue from your documents
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donations */}
          <Card className="border-primary/10 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full flex-shrink-0">
                  <StarIcon size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Personal Donations</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Receive donations from users.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Total Received</span>
                  <span className="text-lg font-bold text-blue-500">
                    {showRevenueNumbers ? '$89.20' : '*****'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-sm font-bold text-blue-500">
                    {showRevenueNumbers ? '$15.40' : '*****'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Supporters</span>
                  <span className="text-sm font-bold text-primary">
                    {showRevenueNumbers ? '7 people' : '* people'}
                  </span>
                </div>
                
                <ShareLinksDropdown
                  triggerText="Share Donation Link"
                  triggerIcon={<LinkIcon size={16} />}
                  triggerClassName="w-full gap-2 mt-4 hover-primary-effect"
                  onCopyLink={() => {
                    const donationUrl = `${window.location.origin}/donate/${displayUser.username}`;
                    navigator.clipboard.writeText(donationUrl).then(() => {
                      toast.success("Donation link copied", {
                        description: "Donation URL has been copied to clipboard",
                        icon: <LinkIcon size={16} />,
                      });
                    }).catch(() => {
                      toast.error("Failed to copy link", {
                        description: "Could not copy donation URL to clipboard",
                        icon: <LinkIcon size={16} />,
                      });
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="mt-6 border-primary/10 shadow-md">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-8 flex items-center gap-2 text-lg">
              Revenue Summary
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {showRevenueNumbers ? '$336.70' : '*******'}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {showRevenueNumbers ? '$48.20' : '*****'}
                </div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {showRevenueNumbers ? '25' : '**'}
                </div>
                <div className="text-sm text-muted-foreground">Total Supporters</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Recent Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Activity */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <Activity size={24} className="text-primary" />
            Activity
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                  <ClockIcon size={20} className="text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {userDocuments.length > 0 ? Math.floor(userDocuments.length * 2.5) : 0}h
                </div>
                <div className="text-sm text-muted-foreground">Hours Reading</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-3">
                  <TimerIcon size={20} className="text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  {userDocuments.length + favoriteDocuments.length * 2}
                </div>
                <div className="text-sm text-muted-foreground">Reads with Timer</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-full mx-auto mb-3">
                  <MessageSquareIcon size={20} className="text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-500">
                  {Math.floor(userDocuments.length * 3.2)}
                </div>
                <div className="text-sm text-muted-foreground">Comments Written</div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-full mx-auto mb-3">
                  <StarIcon size={20} className="text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  {Math.floor(userDocuments.length * 1.8)}
                </div>
                <div className="text-sm text-muted-foreground">Ratings Given</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <ClockIcon size={24} className="text-primary" />
            Recent Documents
          </h2>
          {userDocuments.length > 0 ? (
            <div className="space-y-4">
              {[...userDocuments, ...favoriteDocuments]
                .slice(0, showAllRecentDocs ? undefined : 3)
                .map((doc, index) => {
                  return (
                    <Card 
                      key={`${doc.id}-${index}`}
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
                              <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
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
                                <span>Last read: {Math.floor(Math.random() * 7) + 1}d ago</span>
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
                  );
                })}
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-muted/20 to-muted/40 shadow-md border-primary/10">
              <CardContent className="p-8 text-center">
                <ClockIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">You haven't read any documents recently.</p>
              </CardContent>
            </Card>
          )}
          {(userDocuments.length + favoriteDocuments.length) > 2 && (
            <div className="flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={() => setShowAllRecentDocs(!showAllRecentDocs)}
              >
                {showAllRecentDocs ? (
                  <>
                    Show Less
                    <ChevronUpIcon size={16} />
                  </>
                ) : (
                  <>
                    View All Recent
                    <ChevronRightIcon size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
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

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={currentUserState}
        onSave={handleProfileUpdate}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
      />
    </div>
  );
};

export default Profile; 