import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import type React from "react";
import { useState, useEffect } from "react";
import { BookOpenIcon, SearchIcon, UploadIcon, GraduationCapIcon, BriefcaseIcon, ChevronRightIcon, ArrowRightToLineIcon } from "lucide-react";

// Import demo images
import giuseppeVerdi from "../../assets/giuseppe_verdi.jpg";
import michelangelo from "../../assets/michelangelo.jpg";
import readerDemo from "../../assets/reader_demo.png";
import uploadDemo from "../../assets/upload_demo.PNG";
import searchDemo from "../../assets/search_demo.PNG";
import yourDocumentsDemo from "../../assets/your_documents_demo.PNG";

/**
 * Props for the WelcomeModal component
 */
export interface WelcomeModalProps {
  /** Whether the welcome modal is currently visible */
  isOpen: boolean;
  /** Function to call when the modal should close */
  onClose: () => void;
  /** Function to call when the user completes the welcome flow */
  onComplete: () => void;
}

type WelcomeStage = "intro" | "search" | "upload" | "reader" | "library" | "final";

/**
 * WelcomeModal - A multi-stage onboarding modal for new users
 * 
 * This component provides an engaging introduction to CloudNotes, showcasing:
 * - Application purpose and target audience
 * - Key features (search, upload, reading, personal library)
 * - Enhanced reading experience details
 * - Final encouragement to start learning
 * 
 * @example
 * ```tsx
 * const [showWelcome, setShowWelcome] = useState(true);
 * 
 * <WelcomeModal
 *   isOpen={showWelcome}
 *   onClose={() => setShowWelcome(false)}
 *   onComplete={() => {
 *     setShowWelcome(false);
 *     // Mark user as onboarded
 *     localStorage.setItem('hasSeenWelcome', 'true');
 *   }}
 * />
 * ```
 */
const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [stage, setStage] = useState<WelcomeStage>("intro");

  // Reset to first stage when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage("intro");
    }
  }, [isOpen]);

  const handleNext = () => {
    switch (stage) {
      case "intro":
        setStage("search");
        break;
      case "search":
        setStage("upload");
        break;
      case "upload":
        setStage("reader");
        break;
      case "reader":
        setStage("library");
        break;
      case "library":
        setStage("final");
        break;
      case "final":
        onComplete();
        onClose();
        break;
    }
  };

  const getButtonText = () => {
    switch (stage) {
      case "final":
        return "Start your journey";
      default:
        return "Next";
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 select-none">
          <BookOpenIcon size={20} />
          <span>Welcome to CloudNotes</span>
        </div>
      }
      maxWidth="max-w-6xl"
      className="overflow-hidden min-h-[800px]"
    >
      <div className="p-6 h-[750px] flex flex-col">
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="w-full">
        {/* Introduction Stage */}
        {stage === "intro" && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-foreground">
                Welcome to CloudNotes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                This application is for everybody whose intent is to learn from and explore the catalog of documents that other users have made. From school to careers, CloudNotes helps with easy finding and reading of documents of all kinds of things — for free!
              </p>
            </div>

                <div className="grid grid-cols-2 gap-8 mt-8 w-10/12 mx-auto">
              <div className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="overflow-hidden rounded-xl cursor-pointer">
                  <img 
                    src={giuseppeVerdi} 
                    alt="Giuseppe Verdi" 
                            className="w-full h-80 object-contain"
                  />
                </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Giuseppe Verdi</p>
                        <p className="text-xs text-muted-foreground">Italian composer</p>
                      </TooltipContent>
                    </Tooltip>
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <GraduationCapIcon size={16} />
                    <span className="text-sm font-medium">Academic Learning</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Explore historical documents and educational content
                  </p>
                </div>
              </div>

              <div className="relative group">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="overflow-hidden rounded-xl cursor-pointer">
                  <img 
                    src={michelangelo} 
                    alt="Michelangelo" 
                            className="w-full h-80 object-contain"
                  />
                </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Michelangelo</p>
                        <p className="text-xs text-muted-foreground">Italian sculptor and painter</p>
                      </TooltipContent>
                    </Tooltip>
                <div className="mt-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <BriefcaseIcon size={16} />
                    <span className="text-sm font-medium">Professional Growth</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access career resources and professional documents
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Search Stage */}
            {stage === "search" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                    Smart Search
              </h2>
              <p className="text-lg text-muted-foreground">
                    Find exactly what you're looking for
              </p>
            </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                    <img 
                      src={searchDemo} 
                        alt="Search Interface" 
                        className="w-full h-108 object-cover object-top"
                    />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Search Features
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Advanced Filters</p>
                            <p className="text-xs text-muted-foreground">Filter by document type, subject, and date</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Instant Results</p>
                            <p className="text-xs text-muted-foreground">Get results as you type with real-time search</p>
                  </div>
                </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Content Search</p>
                            <p className="text-xs text-muted-foreground">Search within document content, not just titles</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Smart Suggestions</p>
                            <p className="text-xs text-muted-foreground">Get intelligent search suggestions and recommendations</p>
                          </div>
                        </div>
                  </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Stage */}
            {stage === "upload" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    Easy Upload
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Share your documents with the community
                  </p>
              </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                      <img 
                        src={uploadDemo} 
                        alt="Upload Interface" 
                        className="w-full h-130 object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Upload Features
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Multiple Formats</p>
                            <p className="text-xs text-muted-foreground">Support for PDF, EPUB, Word, PowerPoint and TXT</p>
                  </div>
                </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Tag system</p>
                            <p className="text-xs text-muted-foreground">Tag your documents with keywords and categories to make them easier to find</p>
                          </div>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Reader Stage */}
            {stage === "reader" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                    Built-in Reader
              </h2>
              <p className="text-lg text-muted-foreground">
                    Advanced document viewing experience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="overflow-hidden rounded-xl border shadow-lg">
                  <img 
                    src={readerDemo} 
                    alt="Reader Interface" 
                        className="w-full h-128 object-cover object-center"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                        Reader Features
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Zoom & Pan</p>
                            <p className="text-xs text-muted-foreground">Smooth zooming and panning for detailed viewing</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Draw & Highlight</p>
                            <p className="text-xs text-muted-foreground">Highlight text and draw on documents</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Notes and Bookmarks</p>
                            <p className="text-xs text-muted-foreground">Add notes and bookmarks to pages</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Undo-redo</p>
                            <p className="text-xs text-muted-foreground">Undo and redo your actions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                            <p className="font-medium text-sm">Personalization</p>
                            <p className="text-xs text-muted-foreground">Customize your reading experience with different document themes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Library Stage */}
            {stage === "library" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">
                    Personal Library
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Organize and manage your document collection
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="overflow-hidden rounded-xl border shadow-lg">
                      <img 
                        src={yourDocumentsDemo} 
                        alt="Library Interface" 
                        className="w-full h-108 object-cover object-top"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Library Features
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Save to Favorites</p>
                            <p className="text-xs text-muted-foreground">Save and quickly access your favorite documents</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Recent History</p>
                            <p className="text-xs text-muted-foreground">Keep track of recently viewed documents</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm">Privacy Controls</p>
                            <p className="text-xs text-muted-foreground">Choose who can access your shared documents</p>
                          </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Stage */}
        {stage === "final" && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-6xl font-bold text-foreground font-bigshot-one italic">
                      CloudNotes
              </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                      your virtual oasis of knowledge.
              </p>
            </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/5 via-green-500/5 to-orange-500/5 p-8 pt-12 border border-green-500/20 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <SearchIcon size={24} className="text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Discover</h3>
                      <p className="text-sm text-muted-foreground">
                        Search through thousands of documents and find exactly what you need
                      </p>
              </div>
              
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <BookOpenIcon size={24} className="text-green-500" />
                </div>
                      <h3 className="text-lg font-semibold">Learn</h3>
                      <p className="text-sm text-muted-foreground">
                        Use our advanced reader to study and take notes on any document
                      </p>
              </div>
              
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon size={24} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-semibold">Share</h3>
                      <p className="text-sm text-muted-foreground">
                        Contribute to the community by sharing your own documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Fixed at absolute bottom */}
        <div className="flex-shrink-0 pt-6 pb-2">
          <div className="flex justify-center">
            <Button 
              onClick={handleNext}
              className="px-8 py-2 rounded-full font-medium transition-colors cursor-pointer"
              size="lg"
            >
              <span className="select-none flex items-center gap-2">
                {getButtonText()}
                {stage !== "final" && <ChevronRightIcon size={16} />}
                {stage === "final" && <ArrowRightToLineIcon size={16} />}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;