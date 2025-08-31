import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  BookmarkIcon,
  StarIcon,
  EditIcon,
  LinkIcon,
  LockIcon,
  BarChart3Icon,
  ClockIcon,
  MessageSquareIcon,
  HistoryIcon,
  ChevronUpIcon,
  Share2Icon,
  EyeIcon,
  Link2Icon,
  ChevronRightIcon,
  CheckIcon,
  PlusIcon,
  Activity,
  TimerIcon,
  ArrowUpIcon,
  GlobeIcon,
  EyeOffIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockUser } from '../../lib/mocking/mocked';
import { toast } from '@/lib/utils/toast';
import { useAppNavigate, useScrollToTop } from '@/lib/navigation';
import DocumentView from '../modals/DocumentView';
import EditProfileModal from '../modals/EditProfileModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { playSound } from '@/lib/utils/sound';

const Profile = () => {
  const appNavigate = useAppNavigate();
  useScrollToTop(); // Automatically scroll to top when location changes
  const [userDocuments, setUserDocuments] = useState<MockDocument[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<MockDocument[]>([]);
  const [recentDocs, setRecentDocs] = useState<MockDocument[]>([]);
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

  // Refs for section headers
  const yourDocsRef = useRef<HTMLHeadingElement>(null);
  const savedDocsRef = useRef<HTMLHeadingElement>(null);
  const recentDocsRef = useRef<HTMLHeadingElement>(null);

  // Mock user data - in a real app this would come from an API
  const currentUser = useMemo(() => ({
    id: 'bartsimpson',
    firstName: 'Bart',
    lastName: 'Simpson',
    username: 'bartsimpson',
    avatar: 'https://github.com/shadcn.png',
    bio: 'Appassionato di opera e amante della musica classica con oltre un decennio di esperienza nella composizione e nell\'esecuzione musicale. Mi specializzo in composizioni barocche del XVIII secolo e ho suonato con varie orchestre sinfoniche in tutta Europa. Quando non sono immerso nella musica, mi piace condividere le mie conoscenze attraverso documenti educativi e aiutare gli altri a scoprire la bellezza delle arti classiche. La mia collezione include manoscritti rari, appunti di esecuzione e analisi dettagliate di capolavori di Mozart, Bach e Vivaldi.',
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
    
    if (diffInHours < 1) return 'Ora';
    if (diffInHours === 1) return '1 ora fa';
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ieri';
    return `${diffInDays} giorni fa`;
  }, []);

  // Get hours since last opened (for sorting) - same logic as Home
  const getHoursSinceLastOpened = useCallback((doc: MockDocument): number => {
    // Generate a consistent value based on document ID
    const seed = doc.id.charCodeAt(0) + doc.id.charCodeAt(doc.id.length - 1);
    return Math.floor((seed % 150) + 1); // 1-150 hours, using doc ID as seed
  }, []);

  // Load user documents and favorites
  useEffect(() => {
    const allDocuments = mockService.getDocuments();
    
    // Get user's documents and sort by upload date (newest first)
    const userDocs = allDocuments
      .filter(doc => doc.author.username === currentUser.username)
      .sort((a, b) => new Date(b.file.uploadedAt).getTime() - new Date(a.file.uploadedAt).getTime());
    setUserDocuments(userDocs);
    
    // Sort for recent (by "last opened" rather than upload date) - same as Home
    const recentDocuments = [...allDocuments]
        .filter(doc => !doc.title.includes("Enterprise")) // Exclude "Enterprise" documents
        .sort((a, b) =>
      getHoursSinceLastOpened(a) - getHoursSinceLastOpened(b)
    );
    setRecentDocs(recentDocuments);
    
    // Mock favorites (in a real app, this would come from user data)
    const favorites = [...allDocuments.slice(0, 3), ...allDocuments.filter(a => a.id === "mock-file-react-for-beginners")];
    setFavoriteDocuments(favorites);
    
    // Initialize current user state if not already set
    if (!currentUserState) {
      setCurrentUserState(currentUser);
    }
  }, [currentUser, currentUserState, getHoursSinceLastOpened]);

  // Toggle favorite (in a real app, this would call an API)
  const toggleFavorite = useCallback((docId: string) => {
    setFavoriteDocuments(prev => {
      const docExists = prev.some(doc => doc.id === docId);
      if (docExists) {
        return prev.filter(doc => doc.id !== docId);
      }
      
      const docToAdd = [...recentDocs, ...userDocuments].find(doc => doc.id === docId);
      if (docToAdd) {
        return [...prev, docToAdd];
      }
      return prev;
    });
  }, [recentDocs, userDocuments]);

  // Check if a document is in favorites
  const isDocumentFavorite = useCallback((docId: string) => {
    return favoriteDocuments.some(doc => doc.id === docId);
  }, [favoriteDocuments]);

  // Render thumbnail with enhanced styling
  const renderThumbnail = useCallback((thumbnailData: string, title: string) => {
    const [color, text] = thumbnailData.split(':');
    
    if (thumbnailData.startsWith('https://')) {
      return (
        <img src={thumbnailData} className="w-full h-full object-cover" />
      );
    }

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
      'private': 'Privato',
      'public': 'Pubblico', 
      'link-only': 'Solo link'
    };
    
    const visibilityDescriptions = {
      'private': 'Visibile solo a te',
      'public': 'Visibile a tutti',
      'link-only': 'Accessibile solo tramite link diretto'
    };
    
    const visibilityIcons = {
      'private': <LockIcon size={16} />,
      'public': <GlobeIcon size={16} />,
      'link-only': <Link2Icon size={16} />
    };
    
    // Auto-copy link when switching to link-only
    if (visibility === 'link-only') {
      const documentUrl = `${window.location.origin}/document/${docId}`;
      navigator.clipboard.writeText(documentUrl).then(() => {
        toast.success(
          `Documento impostato a ${visibilityLabels[visibility]}`,
          {
            description: 'Link copiato negli appunti',
            icon: visibilityIcons[visibility],
          }
        );
      }).catch(() => {
        toast.success(
          `Documento impostato a ${visibilityLabels[visibility]}`,
          {
            description: visibilityDescriptions[visibility],
            icon: visibilityIcons[visibility],
          }
        );
      });
    } else {
      toast.success(
        `Documento impostato a ${visibilityLabels[visibility]}`,
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
      
      toast.success("Link documento copiato", {
        description: "Il link è stato copiato negli appunti",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy document link:', err);
      toast.error("Impossibile copiare il link", {
        description: "Non è stato possibile copiare il link del documento negli appunti",
        icon: <LinkIcon size={16} />,
    });
    }
  }, []);

  // Get visibility display info
  const getVisibilityInfo = useCallback((visibility: 'private' | 'public' | 'link-only') => {
    switch (visibility) {
      case 'private':
        return { icon: LockIcon, color: 'text-primary', label: 'Privato' };
      case 'public':
        return { icon: GlobeIcon, color: 'text-primary', label: 'Pubblico' };
      case 'link-only':
        return { icon: Link2Icon, color: 'text-blue-500', label: 'Solo link' };
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

          toast.success("Link profilo copiato", {
      description: "L'URL del profilo è stato copiato negli appunti",
      icon: <LinkIcon size={16} />,
    });
    } catch (err) {
      console.error('Failed to copy profile link:', err);
      toast.error("Impossibile copiare il link", {
        description: "Non è stato possibile copiare l'URL del profilo negli appunti",
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
    visibility: 'private' | 'public' | 'link-only';
  }) => {
    // Map file type properly
    const getFileType = (mimeType: string): 'pdf' | 'word' | 'powerpoint' | 'txt' | 'epub' => {
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'powerpoint';
      if (mimeType.includes('epub')) return 'epub';
      return 'txt';
    };

    // Create a complete MockUser for author
    const mockAuthor: MockUser = {
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      username: currentUser.username,
      avatar: currentUser.avatar,
      comments: [],
      ratings: [],
      documents: [],
      savedDocuments: [],
      bio: currentUser.bio,
      joinDate: currentUser.joinDate
    };

    // Create a mock document for demo purposes
    const newDocument: MockDocument = {
      id: `doc-${Date.now()}`, // Simple ID generation
      title: documentData.title,
      description: documentData.description,
      author: mockAuthor,
      file: {
        id: `file-${Date.now()}`,
        author: mockAuthor,
        type: getFileType(documentData.file.type),
        size: `${(documentData.file.size / 1024 / 1024).toFixed(1)}MB`,
        uploadedAt: new Date(),
        downloadCount: 0,
        viewCount: 0,
        tags: documentData.tags,
        thumbnail: `${documentData.thumbnailColor}:${encodeURIComponent(documentData.title)}`,
        visibility: documentData.visibility
      },
      rating: {
        id: `rating-${Date.now()}`,
        author: mockAuthor,
        document: {} as MockDocument, // Will be set below
        rating: 0,
        timestamp: new Date()
      },
      comments: [],
      reports: []
    };

    // Set the document reference in rating
    newDocument.rating.document = newDocument;

    // Add the new document to the beginning of the user documents list
    setUserDocuments(prev => [newDocument, ...prev]);
  }, [currentUser]);

  // Scroll to section top functions
  const scrollToYourDocs = useCallback(() => {
    if (yourDocsRef.current) {
      // Add temporary scroll margin
      yourDocsRef.current.style.scrollMarginTop = '96px';
      yourDocsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      // Remove scroll margin after scroll
      setTimeout(() => {
        if (yourDocsRef.current) {
          yourDocsRef.current.style.scrollMarginTop = '';
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

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none">


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
                    <TooltipContent>Modifica profilo</TooltipContent>
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
                    <TooltipContent>Condividi profilo</TooltipContent>
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
                  Info
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-4 rounded-lg border-l-4 border-primary/30">
                  {displayUser.bio}
                </p>
              </div>
              
              {/* Enhanced Details */}
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-primary" />
                  <span className="font-medium">Iscritto:</span>
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
        <div className="mr-6">
          <h2 ref={yourDocsRef} className="text-2xl font-semibold mb-4 flex items-center gap-3">
            <FileTextIcon size={24} className="text-primary" />
            I Tuoi Documenti ({userDocuments.length})
          </h2>
          <Separator className="mb-4 bg-primary/20" />
          <div className="space-y-4">
            {userDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileTextIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nessun documento ancora</h3>
                <p className="text-muted-foreground">Inizia caricando il tuo primo documento!</p>
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
                        <h3 className="font-semibold text-lg mb-2">Carica Documento</h3>
                        <p className="text-muted-foreground text-sm">
                          Condividi la tua conoscenza caricando un nuovo documento nella tua collezione.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Documents */}
                {userDocuments
                  .slice(0, showAllDocs ? userDocuments.length : 2)
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
                          
                          <div className="flex-grow min-w-0 flex flex-col h-32 relative">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold line-clamp-1 max-w-[340px]">{doc.title}</h3>
                              <div className="relative">
                                <Select 
                                  value={doc.file.visibility} 
                                  onValueChange={(value: 'private' | 'public' | 'link-only') => setDocumentVisibility(doc.id, value)}
                                >
                                  <SelectTrigger 
                                    className="h-7 w-auto min-w-[60px] hover-primary-effect absolute -top-1 right-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                  <SelectValue>
                                    {(() => {
                                      const { icon: Icon, color } = getVisibilityInfo(doc.file.visibility);
                                      return <Icon size={14} className={color} />;
                                    })()}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {(['public', 'link-only', 'private'] as const).map((visibility) => {
                                    const info = getVisibilityInfo(visibility);
                                    const Icon = info.icon;
                                    return (
                                      <SelectItem key={visibility} value={visibility} className="hover-primary-effect">
                                        <div className="flex items-center gap-2">
                                          <Icon size={14} className={info.color} />
                                          <span className="font-medium">{info.label}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              </div>
                            </div>
                            
                            {doc.file.visibility === 'link-only' && (
                              <div className="absolute top-9 right-0">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 cursor-pointer bg-green-100 text-green-500 hover:text-green-600 hover:bg-green-200 border border-green-600/20"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copyDocumentLink(doc.id);
                                        }}
                                      >
                                        {copiedLinkId === doc.id ? (
                                          <CheckIcon size={12} />
                                        ) : (
                                          <LinkIcon size={12} />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copia link</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                            
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
                                <span>Pubblicato: {formatRelativeDate(doc.file.uploadedAt)}</span>
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
              <div className="relative flex justify-center mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllDocs(!showAllDocs)}
                  className="gap-2 hover-primary-effect shadow-sm"
                >
                  {showAllDocs ? (
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
                {showAllDocs && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute right-0 hover-primary-effect shadow-sm"
                    onClick={scrollToYourDocs}
                    aria-label="Scroll to top of Your Documents"
                  >
                    <ArrowUpIcon size={16} />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Saved Documents */}
        <div className="ml-6">
          <h2 ref={savedDocsRef} className="text-2xl font-semibold flex items-center gap-3 mb-4">
            <BookmarkIcon size={24} className="text-primary" />
            Salvati ({favoriteDocuments.length})
          </h2>
          <Separator className="mb-4 bg-primary/20" />
          {favoriteDocuments.length > 0 ? (
            <div className="space-y-4">
              {favoriteDocuments.slice(0, showAllBookmarkedDocs ? favoriteDocuments.length : 3).map((doc) => (
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
                            <span>Ultimo accesso: {getLastOpenedTime(doc)}</span>
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
          {favoriteDocuments.length > 3 && (
            <div className="relative flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={() => setShowAllBookmarkedDocs(!showAllBookmarkedDocs)}
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
                  aria-label="Scroll to top of Saved Documents"
                >
                  <ArrowUpIcon size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Your Revenue Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <BarChart3Icon size={24} className="text-primary" />
            Guadagni
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowRevenueNumbers(!showRevenueNumbers)}
            className="gap-2 hover-primary-effect"
          >
            {showRevenueNumbers ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            {showRevenueNumbers ? 'Nascondi numeri' : 'Mostra numeri'}
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
                  <h3 className="text-lg font-semibold mb-2">Programma affiliato</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Guadagna denaro dagli annunci automatici sulle tue pagine di documenti.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-muted">
                  <span className="text-sm font-medium">Abilita gli annunci sui documenti</span>
                  <Switch 
                    checked={adsEnabled}
                    onCheckedChange={setAdsEnabled}
                    className="cursor-pointer"
                  />
                </div>
                
                {adsEnabled && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">Guadagni totali</span>
                      <span className="text-lg font-bold text-green-500">
                        {showRevenueNumbers ? '$247.50' : '******'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">Questo mese</span>
                      <span className="text-sm font-bold text-green-500">
                        {showRevenueNumbers ? '$32.80' : '*****'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm font-medium">Click annunci</span>
                      <span className="text-sm font-bold text-primary">
                        {showRevenueNumbers ? '21' : '****'}
                      </span>
                    </div>
                  </>
                )}
                
                {!adsEnabled && (
                    <div className="text-center py-6">
                      <div className="text-muted-foreground text-sm">
                        Abilita gli annunci per iniziare a guadagnare dai tuoi documenti
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
                  <h3 className="text-lg font-semibold mb-2">Donazioni</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Ricevi donazioni dagli utenti.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Totale ricevuto</span>
                  <span className="text-lg font-bold text-blue-500">
                    {showRevenueNumbers ? '$89.20' : '*****'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Questo mese</span>
                  <span className="text-sm font-bold text-blue-500">
                    {showRevenueNumbers ? '$15.40' : '*****'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Sostenitori totali</span>
                  <span className="text-sm font-bold text-primary">
                    {showRevenueNumbers ? '7' : '*'}
                  </span>
                </div>
                
                <ShareLinksDropdown
                  triggerText="Condividi link donazioni"
                  triggerIcon={<LinkIcon size={16} />}
                  triggerClassName="w-full gap-2 mt-4 hover-primary-effect"
                  onCopyLink={() => {
                    const donationUrl = `${window.location.origin}/donate/${displayUser.username}`;
                    navigator.clipboard.writeText(donationUrl).then(() => {
                      toast.success("Link donazioni copiato", {
                        description: "L'URL delle donazioni è stato copiato negli appunti",
                        icon: <LinkIcon size={16} />,
                      });
                    }).catch(() => {
                      toast.error("Impossibile copiare il link", {
                        description: "Non è stato possibile copiare l'URL delle donazioni negli appunti",
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
              Riepilogo entrate
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {showRevenueNumbers ? '$336.70' : '*******'}
                </div>
                <div className="text-sm text-muted-foreground">Entrate totali</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {showRevenueNumbers ? '$48.20' : '*****'}
                </div>
                <div className="text-sm text-muted-foreground">Questo mese</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {showRevenueNumbers ? '25' : '**'}
                </div>
                <div className="text-sm text-muted-foreground">Sostenitori totali</div>
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
            Attività
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
                <div className="text-sm text-muted-foreground">Ore di lettura</div>
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
                <div className="text-sm text-muted-foreground">Letture con timer</div>
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
                <div className="text-sm text-muted-foreground">Commenti scritti</div>
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
                <div className="text-sm text-muted-foreground">Valutazioni date</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <h2 ref={recentDocsRef} className="text-2xl font-semibold flex items-center gap-3 mb-6">
            <ClockIcon size={24} className="text-primary" />
            Recenti ({recentDocs.length})
          </h2>
          {recentDocs.length > 0 ? (
            <div className="space-y-4">
              {recentDocs
                .slice(0, showAllRecentDocs ? recentDocs.length : 3)
                .map((doc) => {
                  return (
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
                  );
                })}
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-muted/20 to-muted/40 shadow-md border-primary/10">
              <CardContent className="p-8 text-center">
                <ClockIcon size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Non hai letto documenti di recente.</p>
              </CardContent>
            </Card>
          )}
          {recentDocs.length > 2 && (
            <div className="relative flex justify-center mt-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover-primary-effect shadow-sm"
                onClick={() => setShowAllRecentDocs(!showAllRecentDocs)}
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