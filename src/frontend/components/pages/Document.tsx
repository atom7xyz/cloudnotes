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
  TimerIcon
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
import { mockService } from '../../lib/mocking/mockedData';
import type { MockDocument, MockComment } from '../../lib/mocking/mocked';
import { toast } from 'sonner';
import { useAppNavigate } from '@/lib/navigation';
import { useTheme } from '../../lib/contexts/ThemeContext';

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
        // In a real app, check if document is bookmarked by current user
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

  // Toggle bookmark with animation
  const toggleBookmark = useCallback(() => {
    setIsBookmarked(prev => !prev);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
      description: isBookmarked ? "Document removed from your bookmarks" : "Document saved to your bookmarks",
      icon: <BookmarkIcon size={16} />,
    });
  }, [isBookmarked]);

  // Copy document link to clipboard
  const handleCopyLink = useCallback(async () => {
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
  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim() || !document) return;

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
  const handleDownload = useCallback(() => {
    toast.success("Document downloaded", {
      description: "Your document has been downloaded",
      icon: <DownloadIcon size={16} />,
    });
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
                    <TooltipContent>{isBookmarked ? "Remove bookmark" : "Add to bookmarks"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-12 w-12 hover-primary-effect">
                            <Share2Icon size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>Share document</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Share via</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer flex items-center" onClick={handleCopyLink}>
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
                  <span className="text-muted-foreground">bookmarks</span>
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
                <Button variant="outline" size="sm" className="gap-2 hover-primary-effect">
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

      {/* Enhanced Comments Section */}
      <Card className="overflow-hidden border-primary/20 shadow-lg">
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
                    size="sm" 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="gap-2 hover-primary-effect"
                  >
                    <SendIcon size={14} />
                    Post Comment
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
                            <span className="font-semibold">{comment.author.username}</span>
                            <span className="text-sm text-muted-foreground">
                              {relativeDateFormatted(comment.timestamp)}
                            </span>
                          </div>
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
    </div>
  );
};

export default Document; 