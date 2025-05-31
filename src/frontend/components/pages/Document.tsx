import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookmarkIcon,
  Share2Icon,
  StarIcon,
  MessageSquareIcon,
  ExternalLinkIcon,
  Mail as MailIcon,
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
  RefreshCwIcon
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
import { AppLink } from '../ui/app-link';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { cn, formatRelativeDate } from '../../lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '../ui/dropdown-menu';
import ShareLinksDropdown from '../ui/ShareLinksDropdown';
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockComment, MockReport } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import { useTheme } from '../../lib/contexts/ThemeContext';
import ReportProblemModal from '../modals/ReportProblemModal';

const Document = () => {
  const { id } = useParams<{ id: string }>();
  const { theme, setTheme } = useTheme();
  const appNavigate = useAppNavigate();
  const [document, setDocument] = useState<MockDocument | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<MockComment[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState<MockReport[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Mock current user - in a real app this would come from auth context
  const currentUser = {
    id: 'current-user',
    username: 'bartsimpson'
  };

  // Check if current user is the author
  const isAuthor = document?.author.username === currentUser.username;

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

  // Format date to relative time
  const relativeDateFormatted = useCallback((date: Date): string => {
    return formatRelativeDate(date);
  }, []);

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

  // Toggle save with animation
  const toggleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
    toast.success(isBookmarked ? "Removed from saved" : "Added to saved", {
      description: isBookmarked ? "Document removed from your saved documents" : "Document saved to your saved documents",
      icon: <BookmarkIcon size={16} />,
    });
  }, [isBookmarked]);

  // Copy document link to clipboard (custom function for document-specific URL)
  const handleCopyDocumentLink = useCallback(async () => {
    try {
      const documentUrl = `${window.location.origin}/document/${document?.id}`;
      await navigator.clipboard.writeText(documentUrl);

      toast.success("Link copied to clipboard", {
        description: "You can now paste it anywhere",
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

      const newCommentData = {
        id: `comment-${Date.now()}`,
        author: {
          id: 'current-user',
          firstName: 'Bart',
          lastName: 'Simpson',
          username: 'bartsimpson',
          avatar: 'https://github.com/shadcn.png',
          comments: [],
          ratings: [],
          documents: [],
          savedDocuments: [],
          bio: '',
          joinDate: new Date()
        },
        document: document,
        content: newComment.trim(),
        timestamp: new Date()
      };

      // Add new comment at the beginning (latest first)
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      
      toast.success("Comment posted", {
        description: "Your comment has been added to the discussion",
        icon: <MessageSquareIcon size={16} />,
      });
    } catch (error) {
      toast.error("Failed to post comment", {
        description: "Please try again",
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
      // For browsers that support the File System Access API
      if ('showDirectoryPicker' in window) {
        try {
          // Try to open the Downloads directory directly
          const directoryHandle = await (window as any).showDirectoryPicker({
            id: 'downloads',
            startIn: 'downloads'
          });
          
          toast.success("Downloads folder opened", {
            description: "Downloads folder has been opened for you",
            icon: <DownloadIcon size={16} />,
          });
        } catch (error) {
          // User cancelled or error occurred, fall back to regular download
          toast.info("Download initiated", {
            description: "Document download has been started",
            icon: <DownloadIcon size={16} />,
          });
        }
      } else {
        // Fallback for browsers without File System Access API
        // Create a dummy download link
        const link = window.document.createElement('a');
        link.href = '#'; // In a real app, this would be the actual file URL
        link.download = document?.title || 'document';
        link.click();
        
        toast.success("Document downloaded", {
          description: "Your document has been downloaded",
          icon: <DownloadIcon size={16} />,
        });
      }
    } catch (error) {
      toast.error("Download failed", {
        description: "Unable to download the document",
      });
    }
  }, [document]);

  // Handle report deletion
  const handleDeleteReport = useCallback((reportId: string) => {
    const success = mockService.removeReport(reportId);
    if (success) {
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast.success("Report deleted", {
        description: "The report has been removed",
        icon: <TrashIcon size={16} />,
      });
    }
  }, []);

  // Handle report status change
  const handleMarkReportDone = useCallback((reportId: string) => {
    const success = mockService.updateReportStatus(reportId, 'resolved');
    if (success) {
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, status: 'resolved' } : report
      ));
      toast.success("Report marked as resolved", {
        description: "The report has been marked as done",
        icon: <CheckIcon size={16} />,
      });
    }
  }, []);

  if (!document) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="text-center py-12">
          <FileTextIcon size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Document not found</h2>
          <p className="text-muted-foreground mb-6">The document you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="gap-2 hover-primary-effect"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon size={16} />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto select-none">
      {/* Enhanced Back Button */}
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

      {/* Enhanced Document Header */}
      <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg">
        <CardContent className="p-8">
          <div className="flex gap-10">
            {/* Left side - Enhanced Document thumbnail and action buttons */}
            <div className="flex flex-col items-center">
              <div className="w-64 h-80 rounded-lg overflow-hidden bg-muted/30 mb-6 shadow-md border border-primary/10">
                {renderThumbnail(document.file.thumbnail, document.title)}
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
                    <TooltipContent>{isBookmarked ? "Removed from saved" : "Add to saved"}</TooltipContent>
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
                    <TooltipContent>Share document</TooltipContent>
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
                    <TooltipContent>Print document</TooltipContent>
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
                    <TooltipContent>Download document</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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
                      <TooltipContent>Report a problem</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* User Rating Section - Moved here */}
              <div className="w-full mb-4 p-4 bg-muted/20 rounded-lg">
                <h3 className="font-semibold mb-3 text-center">Rate this document</h3>
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
                      You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveRating}
                      className="text-xs text-muted-foreground hover:text-destructive hover-primary-effect"
                    >
                      <XIcon size={12} className="mr-1" />
                      Remove rating
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
                  <span className="font-medium">Published:</span>
                  <span className="text-muted-foreground">{relativeDateFormatted(document.file.uploadedAt)}</span>
                </div>
                
                <Separator orientation="vertical" className="h-4" />
                
                <div className="flex items-center gap-2 text-sm">
                  <StarIcon size={16} className="text-yellow-500" />
                  <span className="font-medium">{document.rating.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>
                
                <Separator orientation="vertical" className="h-4" />
                
                <div className="flex items-center gap-2 text-sm">
                  <BookmarkIcon size={16} className="text-primary" />
                  <span className="font-medium">{document.file.downloadCount}</span>
                  <span className="text-muted-foreground">saved</span>
                </div>
                
                <Separator orientation="vertical" className="h-4" />
                
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquareIcon size={16} />
                  <span className="font-medium">{comments.length}</span>
                  <span className="text-muted-foreground">comments</span>
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
                      Author
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">@{document.author.username}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 hover-primary-effect cursor-pointer"
                  onClick={() => {
                    // Check if it's the current user's document
                    const currentUsername = "bartsimpson"; // This would be dynamic in a real app
                    
                    if (document.author.username === currentUsername) {
                      // Navigate to own profile page
                      appNavigate('/profile');
                    } else {
                      // Navigate to other user's profile
                      appNavigate(`/profile/${document.author.username}`);
                    }
                  }}
                >
                  <UserIcon size={14} />
                  View Profile
                </Button>
              </div>
              
              {/* Enhanced Tags Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon size={16} className="text-primary" />
                  <span className="font-medium">Tags</span>
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
                  Description
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
                    <span>Last edited: {relativeDateFormatted(document.file.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className={cn(
                      "gap-2 rounded-full cursor-pointer shadow-md",
                      theme === "dark" ? "hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-400 border-cyan-200 text-cyan-400" : "hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-800 border-cyan-200 text-cyan-800"
                    )} 
                    size="lg"
                    onClick={() => {
                      toast.success("Timer mode activated", {
                        description: "Document will open with reading timer",
                        icon: <TimerIcon size={16} />,
                      });
                      // In a real app, this would navigate to reader with timer mode
                      appNavigate(`/reader/${document.id}?timer=true`);
                    }}
                  >
                    <TimerIcon size={18} />
                    Open with Timer
                  </Button>
                  
                  <Button className="gap-2 rounded-full cursor-pointer shadow-md" size="lg" asChild>
                    <AppLink href={`/reader/${document.id}`} preventNavigation className="hover:no-underline">
                      <ExternalLinkIcon size={18} />
                      Open Document
                    </AppLink>
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
              Document Reports ({reports.length})
            </h2>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-orange-200">
                        <img src={report.author.avatar} alt={report.author.username} />
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{report.author.firstName} {report.author.lastName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">@{report.author.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {relativeDateFormatted(report.timestamp)}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() => handleDeleteReport(report.id)}
                            >
                              <TrashIcon size={14} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete report</TooltipContent>
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

      {/* Enhanced Comments Section */}
      <Card className="overflow-hidden border-primary/20 mb-8 shadow-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-8 flex items-center gap-3">
            <MessageSquareIcon size={24} className="text-primary" />
            Comments ({comments.length})
          </h2>

          {/* Enhanced Add Comment */}
          <div className="mb-10 p-6 bg-muted/20 rounded-lg border border-primary/10">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                <img src="https://github.com/shadcn.png" alt="Your avatar" />
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts about this document..."
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
                        Posting...
                      </>
                    ) : (
                      <>
                        <SendIcon size={14} />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquareIcon size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                <p className="text-muted-foreground">Be the first to share your thoughts about this document!</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div key={comment.id} className="space-y-4">
                  {/* Enhanced Main Comment */}
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/10">
                      <img src={comment.author.avatar} alt={comment.author.username} />
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/30 rounded-lg p-4 border border-primary/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-semibold">{comment.author.firstName} {comment.author.lastName}</span>
                              <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {relativeDateFormatted(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Separator between comments */}
                  {index < comments.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Problem Modal */}
      <ReportProblemModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        document={document}
      />
    </div>
  );
};

export default Document; 