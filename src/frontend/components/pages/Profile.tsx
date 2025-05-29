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
  Share2Icon,
  ChevronDownIcon,
  EyeIcon,
  EyeOffIcon,
  Link2Icon,
  Mail as MailIcon,
  ChevronRightIcon
} from 'lucide-react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaTelegram, 
  FaWhatsapp 
} from 'react-icons/fa';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { cn, formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
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
    
    toast.success(
      `Document set to ${visibilityLabels[visibility]}`,
      {
        description: visibilityDescriptions[visibility],
        icon: visibilityIcons[visibility],
      }
    );
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
    toast.info("Edit profile feature coming soon", {
      description: "Profile editing functionality will be available in a future update",
      icon: <EditIcon size={16} />,
    });
  }, []);

  // Handle share profile
  const handleShareProfile = useCallback(async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/${currentUser.username}`;
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
  }, [currentUser.username]);

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
                
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 hover-primary-effect shadow-sm"
                          >
                            <Share2Icon size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Share profile</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Share via</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer flex items-center" onClick={handleShareProfile}>
                      <LinkIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <FaFacebook className="mr-2 h-4 w-4 flex-shrink-0 text-[#1877F2]" />
                      <span>Facebook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <FaTwitter className="mr-2 h-4 w-4 flex-shrink-0 text-[#1DA1F2]" />
                      <span>X / Twitter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <FaTelegram className="mr-2 h-4 w-4 flex-shrink-0 text-[#0088CC]" />
                      <span>Telegram</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <FaWhatsapp className="mr-2 h-4 w-4 flex-shrink-0 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer flex items-center">
                      <MailIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
                      <span>Email</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              userDocuments
                .slice(0, showAllDocs ? undefined : 3)
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 ml-2 flex-shrink-0 cursor-pointer hover:bg-primary/10 shadow-sm"
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
                              <span>Uploaded: {formatRelativeDate(doc.file.uploadedAt)}</span>
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
                ))
            )}
            
            {userDocuments.length > 3 && (
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

      {/* Activity Summary */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUpIcon size={20} className="text-primary" />
          Activity Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
                <FileTextIcon size={20} className="text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">{userDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-full mx-auto mb-3">
                <EyeIcon size={20} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {userDocuments.reduce((total, doc) => total + doc.file.viewCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mx-auto mb-3">
                <DownloadIcon size={20} className="text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">
                {userDocuments.reduce((total, doc) => total + doc.file.downloadCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-full mx-auto mb-3">
                <StarIcon size={20} className="text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-500">
                {userDocuments.length > 0 
                  ? (userDocuments.reduce((total, doc) => total + doc.rating.rating, 0) / userDocuments.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <ClockIcon size={16} className="text-primary" />
              Recent Activity
            </h4>
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
                  <span className="text-sm">Comments this month</span>
                </div>
                <span className="text-sm text-muted-foreground">24</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileTextIcon size={16} className="text-primary" />
                  <span className="text-sm">Documents uploaded this month</span>
                </div>
                <span className="text-sm text-muted-foreground">3</span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookmarkIcon size={16} className="text-primary" />
                  <span className="text-sm">Documents saved</span>
                </div>
                <span className="text-sm text-muted-foreground">{favoriteDocuments.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
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