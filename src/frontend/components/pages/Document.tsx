import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookmarkIcon,
  Share2Icon,
  StarIcon,
  MessageSquareIcon,
  ExternalLinkIcon,
  LinkIcon,
  SendIcon,
  ArrowLeftIcon,
  PrinterIcon,
  UserIcon,
  CalendarIcon,
  FileTextIcon,
  TagIcon,
  DownloadIcon,
  XIcon,
  TimerIcon,
  AlertTriangleIcon,
  CheckIcon,
  TrashIcon,
  RefreshCwIcon,
  SettingsIcon,
  ChevronDownIcon,
  EditIcon,
  TrendingUpIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { cn, formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';
import AdBanner from '../ui/AdBanner';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockComment, MockReport } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { useReadingSpeed } from '../../lib/contexts/ReadingSpeedContext';
import ReportProblemModal from '../modals/ReportProblemModal';
import EditDocumentModal from '../modals/EditDocumentModal';
import ReadingSpeedTestModal from '../modals/ReadingSpeedTestModal';
import TimerWelcomeModal from '../modals/TimerWelcomeModal';

const Document = () => {
  const { id } = useParams<{ id: string }>();
  const appNavigate = useAppNavigate();
  const { estimateReadingTime, getOptimalTimerDuration, hasValidReadingSpeed, readingSpeed, markTimerInteractionAfterFirstTest } = useReadingSpeed();
  const [document, setDocument] = useState<MockDocument | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<MockComment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<MockReport[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedTimerDuration, setSelectedTimerDuration] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReadingSpeedTestModalOpen, setIsReadingSpeedTestModalOpen] = useState(false);
  const [isTimerWelcomeModalOpen, setIsTimerWelcomeModalOpen] = useState(false);
  const [showDeleteReportConfirm, setShowDeleteReportConfirm] = useState<string | null>(null);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState<string | null>(null);

  // Mock current user - in a real app this would come from auth context
  const currentUser = {
    id: 'current-user',
    username: 'bartsimpson'
  };

  // Check if current user is the author
  const isAuthor = document?.author.username === currentUser.username;

  // Calculate estimated reading time and optimal duration
  const documentWordCount = document ? document.description.split(' ').length * 50 : 0; // Estimate ~50x description length for full document
  const documentType = document?.file.tags.some(tag => 
    ['science', 'technical', 'research', 'academic'].includes(tag.toLowerCase())
  ) ? 'technical' : 
  document?.file.tags.some(tag => 
    ['literature', 'novel', 'poetry', 'story'].includes(tag.toLowerCase())
  ) ? 'literary' : 'general';

  const estimatedTime = hasValidReadingSpeed && documentWordCount ? 
    estimateReadingTime(documentWordCount, documentType) : null;
  const optimalDuration = hasValidReadingSpeed && documentWordCount ? 
    getOptimalTimerDuration(documentWordCount, documentType) : null;

  // Timer duration options (in minutes)
  const baseTimerOptions = [
    { label: '5 minuti', value: 5 },
    { label: '10 minuti', value: 10 },
    { label: '15 minuti', value: 15 },
    { label: '30 minuti', value: 30 },
    { label: '45 minuti', value: 45 },
    { label: '60 minuti', value: 60 },
    { label: 'Nessun timer', value: null }
  ];

  // Use base timer options without recommendations
  const timerOptions = baseTimerOptions;

  // Get selected timer option
  const selectedTimerOption = timerOptions.find(option => option.value === selectedTimerDuration) || timerOptions[timerOptions.length - 1];

  // Load document data
  useEffect(() => {
    if (id) {
      const allDocuments = mockService.getDocuments();
      const foundDoc = allDocuments.find(doc => doc.id === id);
      if (foundDoc) {
        setDocument(foundDoc);
        // Sort comments from latest to oldest
        const sortedComments = [...foundDoc.comments].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setComments(sortedComments);
        // Load reports for this document
        const documentReports = mockService.getReportsForDocument(id);
        // Sort reports by timestamp in descending order (newest first)
        const sortedReports = documentReports.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setReports(sortedReports);
        // In a real app, check if document is saved by current user
        setIsBookmarked(false);
      }
    }
  }, [id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Format date to relative time
  const relativeDateFormatted = useCallback((date: Date): string => {
    return formatRelativeDate(date);
  }, []);

  // Render thumbnail with enhanced styling
  const renderThumbnail = useCallback((thumbnailData: string) => {
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

  // Toggle save with animation
  const toggleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
    toast.success(isBookmarked ? "Rimosso dai salvati" : "Aggiunto ai salvati", {
      description: isBookmarked ? "Documento rimosso dai tuoi documenti salvati" : "Documento salvato nei tuoi documenti salvati",
      icon: <BookmarkIcon size={16} />,
    });
  }, [isBookmarked]);

  // Copy document link to clipboard (custom function for document-specific URL)
  const handleCopyDocumentLink = useCallback(async () => {
    try {
      const documentUrl = `${window.location.origin}/document/${document?.id}`;
      await navigator.clipboard.writeText(documentUrl);

      toast.success("Link copiato negli appunti", {
        description: "Ora puoi incollarlo ovunque",
        icon: <LinkIcon size={16} />,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [document?.id]);

  // Handle rating
  const handleRating = useCallback((rating: number) => {
    setUserRating(rating);
  }, []);

  // Handle rating removal
  const handleRemoveRating = useCallback(() => {
    setUserRating(0);
  }, []);

  // Handle comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || !document) return;

    setIsSubmittingComment(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the current user from mock service (bartsimpson)
      const currentUser = mockService.getUsers().find(u => u.username === 'bartsimpson');
      if (!currentUser) {
        throw new Error('Current user not found');
      }

      // Add comment to mock service
      const newCommentData = {
        content: newComment.trim(),
        timestamp: new Date()
      };

      const createdComment = mockService.addComment(newCommentData, currentUser.id, document.id);
      
      if (createdComment) {
        // Add new comment at the beginning (latest first)
        setComments(prev => [createdComment, ...prev]);
        setNewComment('');
        
        toast.success("Commento pubblicato", {
          description: "Il tuo commento è stato aggiunto alla discussione",
          icon: <MessageSquareIcon size={16} />,
        });
      } else {
        throw new Error('Failed to create comment');
      }
    } catch (error) {
      toast.error("Impossibile pubblicare il commento", {
        description: "Riprova di nuovo",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  }, [newComment, document]);

  // Go back to previous page
  const handleGoBack = useCallback(() => {
    appNavigate('/home');
  }, [appNavigate]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle download
  const handleDownload = useCallback(async () => {
    try {
      // Create a dummy download 
      const link = window.document.createElement('a');
      link.href = '#'; // In a real app, this would be the actual file URL
      link.download = document?.title || 'document';
      link.click();
      
      toast.success("Documento scaricato", {
        description: "Il documento è stato scaricato",
        icon: <DownloadIcon size={16} />,
      });
      
    } catch (error) {
      toast.error("Download fallito", {
        description: "Impossibile scaricare il documento",
      });
    }
  }, [document]);

  // Handle report deletion
  const handleDeleteReport = useCallback((reportId: string) => {
    const success = mockService.removeReport(reportId);
    if (success) {
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success("Segnalazione eliminata", {
        description: "La segnalazione è stata rimossa",
        icon: <TrashIcon size={16} />,
      });
    }
    setShowDeleteReportConfirm(null);
  }, []);

  // Handle comment deletion
  const handleDeleteComment = useCallback((commentId: string) => {
    const success = mockService.removeComment(commentId);
    if (success) {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success("Commento eliminato", {
        description: "Il commento è stato rimosso",
        icon: <TrashIcon size={16} />,
      });
    }
    setShowDeleteCommentConfirm(null);
  }, []);

  // Handle user profile navigation
  const handleUserProfileClick = useCallback((username: string) => {
    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
    
    if (username === currentUsername) {
      // Navigate to own profile page
      appNavigate('/profile');
    } else {
      // Navigate to other user's profile
      appNavigate(`/profile/${username}`);
    }
  }, [appNavigate]);

  // Handle timer duration selection
  const handleTimerSelection = useCallback((duration: number | null) => {
    setSelectedTimerDuration(duration);
    
    // Mark timer interaction after first test
    if (readingSpeed.isFirstTestCompleted && !readingSpeed.hasInteractedWithTimerAfterFirstTest) {
      markTimerInteractionAfterFirstTest();
    }
    
    if (duration) {
          toast.success("Durata timer impostata", {
      description: `Timer di lettura impostato a ${duration} minuti`,
      icon: <TimerIcon size={16} />,
    });
    } else {
      toast.success("Timer disabilitato", {
        description: "Il documento si aprirà senza timer",
        icon: <TimerIcon size={16} />,
      });
    }
  }, [readingSpeed.isFirstTestCompleted, readingSpeed.hasInteractedWithTimerAfterFirstTest, markTimerInteractionAfterFirstTest]);

  // Handle timer duration change from ReadingTimer component
  const handleTimerDurationChange = useCallback((newDurationMinutes: number) => {
    setSelectedTimerDuration(newDurationMinutes);
    toast.success("Durata timer aggiornata", {
      description: `Timer di lettura aggiornato a ${newDurationMinutes} minuti`,
      icon: <TimerIcon size={16} />,
    });
  }, []);

  // Handle document opening with timer
  const handleOpenDocument = useCallback(() => {
    if (selectedTimerDuration) {
      // Show timer welcome modal first before navigation
      setIsTimerWelcomeModalOpen(true);
    } else {
      appNavigate(`/reader/${document?.id}`);
    }
  }, [selectedTimerDuration, document?.id, appNavigate]);

  // Handle starting reading from timer welcome modal
  const handleStartReadingFromModal = useCallback(() => {
    if (selectedTimerDuration && document?.id) {
      appNavigate(`/reader/${document?.id}?timer=${selectedTimerDuration}`);
    }
    setIsTimerWelcomeModalOpen(false);
  }, [selectedTimerDuration, document?.id, appNavigate]);

  // Handle retaking speed test from timer welcome modal
  const handleRetakeSpeedTestFromModal = useCallback(() => {
    setIsTimerWelcomeModalOpen(false);
    setIsReadingSpeedTestModalOpen(true);
  }, []);

  // Handle document update after editing
  const handleDocumentUpdate = useCallback((updatedDocument: Partial<MockDocument>) => {
    if (document) {
      setDocument(prev => prev ? { ...prev, ...updatedDocument } : null);
    }
  }, [document]);

  // Handle reading speed test
  const handleOpenReadingSpeedTest = useCallback(() => {
    setIsReadingSpeedTestModalOpen(true);
  }, []);

  if (!document) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="text-center py-12">
          <FileTextIcon size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Documento non trovato</h2>
          <p className="text-muted-foreground mb-6">Il documento che stai cercando non esiste o è stato rimosso.</p>
          <Button 
            variant="outline" 
            className="gap-2 hover-primary-effect"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon size={16} />
            Torna Indietro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none relative">
      {/* Main Content */}
      <div className="w-full">


        {/* Enhanced Document Header */}
        <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="flex gap-10">
              {/* Left side - Enhanced Document thumbnail and action buttons */}
              <div className="flex flex-col items-center">
                <div className="w-64 h-80 rounded-lg overflow-hidden bg-muted/30 mb-6 shadow-md border border-primary/10">
                  {renderThumbnail(document.file.thumbnail)}
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 mb-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className={cn(
                            "h-12 w-12 transition-all duration-200 hover-primary-effect", 
                            isBookmarked && "bg-primary/10 border-primary text-primary scale-105"
                          )}
                          onClick={toggleBookmark}
                        >
                          <BookmarkIcon size={20} className={isBookmarked ? "fill-primary" : ""} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isBookmarked ? "Rimosso dai salvati" : "Aggiungi ai salvati"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ShareLinksDropdown
                            triggerText=""
                            triggerIcon={<Share2Icon size={20} />}
                            triggerClassName="h-12 w-12 hover-primary-effect"
                            onCopyLink={handleCopyDocumentLink}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Condividi documento</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 hover-primary-effect"
                          onClick={handlePrint}
                        >
                          <PrinterIcon size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Stampa documento</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-12 w-12 hover-primary-effect"
                          onClick={handleDownload}
                        >
                          <DownloadIcon size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Scarica documento</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {isAuthor && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 hover-primary-effect text-blue-600 hover:text-blue-600"
                            onClick={() => setIsEditModalOpen(true)}
                          >
                            <EditIcon size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Modifica documento</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {!isAuthor && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-12 w-12 hover-primary-effect text-orange-600 hover:text-orange-700 hover:border-orange-300"
                            onClick={() => setIsReportModalOpen(true)}
                          >
                            <AlertTriangleIcon size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Segnala un problema</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {/* User Rating Section - Moved here */}
                <div className="w-full mb-4 p-4 bg-muted/20 rounded-lg">
                  <h3 className="font-semibold mb-3 text-center">Valuta questo documento</h3>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="transition-colors"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleRating(star)}
                      >
                        <StarIcon 
                          size={24} 
                          className={cn(
                            "transition-colors",
                            (hoveredRating >= star || userRating >= star) 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <div className="text-center mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Hai dato {userRating} stell{userRating !== 1 ? 'e' : 'a'}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRemoveRating}
                        className="text-xs text-muted-foreground hover:text-destructive hover-primary-effect"
                      >
                        <XIcon size={12} className="mr-1" />
                        Rimuovi valutazione
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Enhanced Document details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold leading-tight pr-4">{document.title}</h1>
                </div>

                {/* Enhanced Stats Row */}
                <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon size={16} className="text-primary" />
                    <span className="font-medium">Pubblicato:</span>
                    <span className="text-muted-foreground">{relativeDateFormatted(document.file.uploadedAt)}</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    <StarIcon size={16} className="text-yellow-500" />
                    <span className="font-medium">{document.rating.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">valutazione</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    <BookmarkIcon size={16} className="text-primary" />
                    <span className="font-medium">{document.file.downloadCount}</span>
                    <span className="text-muted-foreground">salvati</span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-4" />
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquareIcon size={16} />
                    <span className="font-medium">{comments.length}</span>
                    <span className="text-muted-foreground">commenti</span>
                  </div>
                </div>
                
                {/* Enhanced Author Section */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <img src={document.author.avatar} alt={document.author.username} />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{document.author.firstName} {document.author.lastName}</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Autore
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">@{document.author.username}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 hover-primary-effect cursor-pointer"
                    onClick={() => handleUserProfileClick(document.author.username)}
                  >
                    <UserIcon size={14} />
                    Visualizza Profilo
                  </Button>
                </div>
                
                {/* Enhanced Tags Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon size={16} className="text-primary" />
                    <span className="font-medium">Tag</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {document.file.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="text-sm px-3 py-1 bg-gradient-to-r from-primary/5 to-primary/10 text-primary border-primary/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Enhanced Description */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileTextIcon size={18} className="text-primary" />
                    Descrizione
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base bg-muted/20 p-4 rounded-lg border-l-4 border-primary/30">
                    {document.description}
                  </p>
                </div>
                
                {/* Enhanced Bottom Stats and CTA */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-foreground">{document.file.type.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Ultima modifica: {relativeDateFormatted(document.file.uploadedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Timer Settings Dropdown */}
                    <DropdownMenu onOpenChange={(open) => {
                      if (open && readingSpeed.isFirstTestCompleted && !readingSpeed.hasInteractedWithTimerAfterFirstTest) {
                        markTimerInteractionAfterFirstTest();
                      }
                    }}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={cn(
                            "gap-2 rounded-full cursor-pointer shadow-md transition-all duration-300",
                            readingSpeed.isFirstTestCompleted && !readingSpeed.hasInteractedWithTimerAfterFirstTest
                              ? "border-red-500 hover:border-red-600 animate-pulse shadow-red-200" 
                              : "hover:border-primary/30"
                          )}
                          size="lg"
                        >
                          <TimerIcon size={18} />
                          {selectedTimerOption.label}
                          <ChevronDownIcon size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 select-none">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <TimerIcon size={16} />
                          Impostazioni Timer di Lettura
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* Timer Duration Options */}
                        {timerOptions.map((option) => (
                          <DropdownMenuItem
                            key={option.value || 'no-timer'}
                            className="flex flex-col items-start p-3 cursor-pointer hover-primary-effect"
                            onClick={() => handleTimerSelection(option.value)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={cn(
                                "font-medium",
                                selectedTimerDuration === option.value ? "text-primary" : ""
                              )}>
                                {option.label}
                              </span>
                              {selectedTimerDuration === option.value && (
                                <CheckIcon size={16} className="text-primary" />
                              )}
                            </div>
                          </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />


                        {/* User Statistics Section */}
                        {hasValidReadingSpeed && (
                          <>
                            <div className="px-3 py-2">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <TrendingUpIcon size={14} className="text-blue-600" />
                                Metriche attuali
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Velocità di lettura media:</span>
                                  <span className="font-medium">{readingSpeed.averageWpm} WPM</span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenuSeparator />
                          </>
                        )}

                        {/* Reading Speed Test Option */}
                        <DropdownMenuItem
                          className="cursor-pointer p-3 hover-primary-effect"
                          onClick={handleOpenReadingSpeedTest}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <RefreshCwIcon size={14} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {hasValidReadingSpeed ? 'Ripeti Test di Velocità di Lettura' : 'Fai Test di Velocità di Lettura'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {hasValidReadingSpeed 
                                  ?                                   'Aggiorna la tua velocità di lettura per raccomandazioni migliori'
                                  : 'Facendo questo test il sistema sarà in grado di determinare e dividere automaticamente il tuo lavoro'
                                }
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      className="gap-2 rounded-full cursor-pointer shadow-md" 
                      size="lg" 
                      onClick={handleOpenDocument}
                    >
                      <ExternalLinkIcon size={18} />
                      {selectedTimerDuration ? `Apri con Timer ${selectedTimerDuration}min` : 'Apri Documento'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Management Section - Only visible to authors */}
        {isAuthor && reports.length > 0 && (
          <Card className="overflow-hidden border-orange-200 mb-8 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <AlertTriangleIcon size={24} className="text-orange-600" />
                Segnalazioni Documento ({reports.length})
              </h2>
              
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="h-10 w-10 border-2 border-orange-200 cursor-pointer hover:border-orange-300 transition-colors"
                          onClick={() => handleUserProfileClick(report.author.username)}
                        >
                          <img src={report.author.avatar} alt={report.author.username} />
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="font-medium cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleUserProfileClick(report.author.username)}
                            >
                              {report.author.firstName} {report.author.lastName}
                            </span>
                          </div>
                          <p 
                            className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleUserProfileClick(report.author.username)}
                          >
                            @{report.author.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {relativeDateFormatted(report.timestamp)}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenu 
                                open={showDeleteReportConfirm === report.id} 
                                onOpenChange={(open) => setShowDeleteReportConfirm(open ? report.id : null)}
                              >
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                                  >
                                    <TrashIcon size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Eliminare Segnalazione?</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteReport(report.id)}
                                    className="text-red-600 focus:text-red-600 hover-primary-effect cursor-pointer"
                                  >
                                                                            Conferma Eliminazione
                                  </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                        onClick={() => setShowDeleteReportConfirm(null)} 
                                        className="hover-primary-effect cursor-pointer"
                                      >
                                        Annulla
                                      </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipTrigger>
                                                                <TooltipContent>Elimina segnalazione</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-200 bg-white/50 dark:bg-black/20 p-3 rounded border border-orange-200 dark:border-orange-700">
                      {report.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* First Ad Banner - Between Document Info and Comments - Hidden for authors */}
        {!isAuthor && (
          <div className="mb-8">
            <AdBanner 
              type="horizontal" 
            />
          </div>
        )}

        {/* Enhanced Comments Section */}
        <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
              <MessageSquareIcon size={24} className="text-primary" />
              Commenti ({comments.length})
            </h2>

            {/* Enhanced Add Comment */}
            <div className="mb-10 p-2">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                  <img src="https://github.com/shadcn.png" alt="Your avatar" />
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Condividi i tuoi pensieri su questo documento..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] resize-none border-primary/20 focus:border-primary/40"
                  />
                  <div className="flex justify-end items-center mt-3">
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="gap-2 rounded-full cursor-pointer shadow-md"
                    >
                      {isSubmittingComment ? (
                        <>
                          <span className="animate-spin">
                            <RefreshCwIcon size={14} />
                          </span>
                          Pubblicando...
                        </>
                      ) : (
                        <>
                          <SendIcon size={14} />
                          Pubblica Commento
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquareIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun commento ancora</h3>
                  <p className="text-muted-foreground">Sii il primo a condividere i tuoi pensieri su questo documento!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted rounded-lg border border-primary/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="h-10 w-10 border-2 border-muted cursor-pointer hover:border-primary/30 transition-colors"
                          onClick={() => handleUserProfileClick(comment.author.username)}
                        >
                          <img src={comment.author.avatar} alt={comment.author.username} />
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              className="font-medium cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleUserProfileClick(comment.author.username)}
                            >
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                          </div>
                          <p 
                            className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleUserProfileClick(comment.author.username)}
                          >
                            @{comment.author.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {relativeDateFormatted(comment.timestamp)}
                        </span>
                        {(isAuthor || comment.author.username === 'bartsimpson') && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenu 
                                  open={showDeleteCommentConfirm === comment.id} 
                                  onOpenChange={(open) => setShowDeleteCommentConfirm(open ? comment.id : null)}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                      <TrashIcon size={14} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Eliminare Commento?</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-red-600 focus:text-red-600 hover-primary-effect cursor-pointer"
                                    >
                                      Conferma Eliminazione
                                    </DropdownMenuItem>
                                                                          <DropdownMenuItem 
                                        onClick={() => setShowDeleteCommentConfirm(null)} 
                                        className="hover-primary-effect cursor-pointer"
                                      >
                                        Annulla
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TooltipTrigger>
                              <TooltipContent>Elimina commento</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed bg-background p-3 rounded border border-muted">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Second Ad Banner - At the bottom of comments section as footer - Hidden for authors */}
        {!isAuthor && (
          <div className="mb-8">
            <AdBanner 
              type="horizontal" 
            />
          </div>
        )}

        {/* Report Problem Modal */}
        <ReportProblemModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          document={document}
        />

        {/* Edit Document Modal */}
        <EditDocumentModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          document={document}
          onSave={handleDocumentUpdate}
        />

        {/* Reading Speed Test Modal */}
        <ReadingSpeedTestModal 
          isOpen={isReadingSpeedTestModalOpen}
          onClose={() => setIsReadingSpeedTestModalOpen(false)}
        />

        {/* Timer Welcome Modal */}
        <TimerWelcomeModal 
          isOpen={isTimerWelcomeModalOpen}
          onClose={() => setIsTimerWelcomeModalOpen(false)}
          timerMinutes={selectedTimerDuration || 0}
          onStartReading={handleStartReadingFromModal}
          onRetakeSpeedTest={handleRetakeSpeedTestFromModal}
        />
      </div>

      {/* Floating Right Sidebar - Sticky Vertical Ad - Hidden for authors */}
      {!isAuthor && (
        <div className="fixed top-50 right-6 bottom-38 w-80 z-30 hidden xl:block">
          <AdBanner 
            type="vertical" 
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};

export default Document; 