import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import NoteBar from '@/components/reader/NoteBar';
import FileReaderTopNavbar from '@/components/reader/FileReaderTopNavbar';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Hand, 
  Highlighter, 
  StickyNote,
  Pencil,
  Eraser} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from 'react-router-dom';
import { ZoomProvider, useZoom } from '@/lib/contexts/ZoomContext';
import { TabsProvider, useTabs } from '@/lib/contexts/TabsContext';
import DocumentViewer, { DEFAULT_FILES, FileType } from '@/components/viewer/DocumentViewer';
import { ScrollMode } from '@/components/viewer/PDFViewer';

// Memoized page navigation controls component
interface PageNavigationProps {
  pageNumber: number;
  numPages: number | null;
  onPageChange: (pageNumber: number) => void;
  isVisible: boolean;
  isNotesOpen: boolean;
}

const PageNavigation = memo(({ pageNumber, numPages, onPageChange, isVisible, isNotesOpen }: PageNavigationProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= (numPages || 1)) {
      onPageChange(value);
    }
  }, [numPages, onPageChange]);

  const handlePrevPage = useCallback(() => {
    onPageChange(pageNumber - 1);
  }, [pageNumber, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(pageNumber + 1);
  }, [pageNumber, onPageChange]);

  // Adjust the left position when notes are open
  const positionClass = isNotesOpen 
    ? "fixed bottom-6 left-[calc(50%-150px)] -translate-x-1/2" 
    : "fixed bottom-6 left-1/2 -translate-x-1/2";

  return (
    <TooltipProvider>
      <div 
        className={`${positionClass} z-40 transition-all duration-300 ${
          isVisible || isHovering ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex items-center bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous page</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center px-2">
            <input 
              type="number" 
              value={pageNumber} 
              onChange={handlePageInputChange}
              className="w-20 text-center appearance-none text-sm h-8 bg-transparent border rounded px-2"
              min={1}
              max={numPages || 1}
              style={{ 
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
                margin: 0
              }}
            />
            <span className="mx-1 text-muted-foreground text-sm whitespace-nowrap">of {numPages || 1}</span>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next page</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
});

PageNavigation.displayName = 'PageNavigation';

// Memoized toolbar component for document tools
interface LeftToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAddNote: () => void;
}

const LeftToolbar = memo(({ activeTool, onToolChange, onAddNote }: LeftToolbarProps) => {
  const tools = [
    { id: 'move', icon: <Hand className="h-4 w-4" />, title: 'Move/drag document' },
    { id: 'highlight', icon: <Highlighter className="h-4 w-4" />, title: 'Highlight text' },
    { id: 'pencil', icon: <Pencil className="h-4 w-4" />, title: 'Annotate document' },
    { id: 'eraser', icon: <Eraser className="h-4 w-4" />, title: 'Erase annotations' },
    { id: 'note', icon: <StickyNote className="h-4 w-4" />, title: 'Add note', onClick: onAddNote }
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border">
      <TooltipProvider delayDuration={300}>
        {tools.map(tool => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? "secondary" : "ghost"}
                size="icon"
                className={`h-8 w-8 rounded-full transition-all duration-200 ${activeTool === tool.id ? 'bg-primary/20 text-primary' : ''}`}
                onClick={tool.onClick || (() => onToolChange(tool.id))}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.title}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
});

LeftToolbar.displayName = 'LeftToolbar';

// FileReaderContent component to use the ZoomContext
const FileReaderContent = memo(() => {
  const navigate = useNavigate();
  const { zoomLevel, setZoomLevel, setZoomLevelFromSlider, isDraggingZoom, setIsDraggingZoom } = useZoom();
  const { activeTabId, getTabById } = useTabs();
  
  // Group all state hooks together at the top
  const [numPages, setNumPages] = useState<number | null>(10); // Default to 10 pages as placeholder
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [mouseIdleTime, setMouseIdleTime] = useState(0);
  const [filePath, setFilePath] = useState<string>(DEFAULT_FILES[FileType.PDF]); // Default to PDF
  const [fileError, setFileError] = useState<Error | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [scrollMode, setScrollMode] = useState<ScrollMode>(ScrollMode.VERTICAL);
  const [activeTool, setActiveTool] = useState('move');
  
  // Group all refs together
  const documentRef = useRef<HTMLDivElement>(null);
  const mouseActivityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const newNoteRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Group all memoized values together
  const pageControlsVisible = useMemo(() => mouseIdleTime < 3, [mouseIdleTime]);
  
  const documentContainerClass = useMemo(() => 
    `flex justify-center p-4 bg-slate-100 dark:bg-slate-900/40 ${isDraggingZoom ? 'cursor-grabbing' : 'cursor-default'}`,
    [isDraggingZoom]
  );

  // Update file path based on active tab
  useEffect(() => {
    // Reset error state when changing files
    setFileError(null);
    
    if (activeTabId) {
      const activeTab = getTabById(activeTabId);
      if (activeTab) {
        setFilePath(activeTab.path);
        // Reset page number when changing files
        setPageNumber(1);
      }
    } else {
      // If no active tab, use a default file based on file type preference
      // This ensures we always have a valid file to show
      setFilePath(DEFAULT_FILES[FileType.PDF]);
    }
  }, [activeTabId, getTabById]);

  // Group all callbacks together
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
      
      // Scroll to the selected page
      if (scrollMode !== ScrollMode.PAGE) {
        setTimeout(() => {
          const pageElement = document.getElementById(`page-${newPage}`);
          if (pageElement) {
            pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
    }
  }, [numPages, scrollMode]);

  const handleToggleNotes = useCallback(() => {
    setIsNotesOpen(prev => !prev);
  }, []);

  const handleScrollModeChange = useCallback((mode: ScrollMode) => {
    setScrollMode(mode);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleDocumentLoadSuccess = useCallback((numPages?: number) => {
    if (numPages) {
      setNumPages(numPages);
    }
  }, []);

  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading document:', error);
    setFileError(error);
    
    // If there's an error loading the file, we could optionally fall back to a default file
    if (filePath !== DEFAULT_FILES[FileType.PDF]) {
      console.log('Falling back to default PDF file');
      setFilePath(DEFAULT_FILES[FileType.PDF]);
    }
  }, [filePath]);

  // Handle text search
  const handleTextSearch = useCallback((searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    // Implement document searching functionality
  }, []);

  const handleToolChange = useCallback((tool: string) => {
    setActiveTool(tool);
    
    // Apply cursor changes based on the selected tool
    if (documentRef.current) {
      if (tool === 'move') {
        documentRef.current.style.cursor = 'grab';
      } else if (tool === 'highlight' || tool === 'pencil') {
        documentRef.current.style.cursor = 'text';
      } else if (tool === 'eraser') {
        documentRef.current.style.cursor = 'no-drop';
      } else {
        documentRef.current.style.cursor = 'default';
      }
    }
  }, []);

  const handleAddNote = useCallback(() => {
    setIsNotesOpen(true);
    
    // Create a new note and focus on it
    // In a real app, this would add a note to the notes array
    // and then focus on the new note's textarea
    setTimeout(() => {
      if (newNoteRef.current) {
        newNoteRef.current.focus();
      }
    }, 100);
  }, []);

  // Group all effects together
  // Add wheel event listener for CTRL+SCROLLWHEEL zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle zooming when CTRL key is pressed
      if (e.ctrlKey) {
        e.preventDefault();
        
        // Calculate new zoom level based on wheel direction
        const delta = e.deltaY < 0 ? 10 : -10; // Increase/decrease by 10%
        const newZoom = Math.min(Math.max(zoomLevel + delta, 50), 200); // Limit between 50% and 200%
        
        setZoomLevel(newZoom);
      }
    };

    const docElement = documentRef.current;
    if (docElement) {
      docElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (docElement) {
        docElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoomLevel, setZoomLevel]);

  // Page controls visibility
  useEffect(() => {
    // Initialize idle timer
    mouseActivityIntervalRef.current = setInterval(() => {
      setMouseIdleTime(prev => {
        // After 4 seconds of inactivity, we consider mouse idle
        if (prev >= 4) return prev;
        return prev + 1;
      });
    }, 1000);
    
    // Reset idle timer on mouse movement
    const handleMouseActivity = () => {
      setMouseIdleTime(0);
    };
    
    window.addEventListener('mousemove', handleMouseActivity);
    window.addEventListener('mousedown', handleMouseActivity);
    
    return () => {
      if (mouseActivityIntervalRef.current) {
        clearInterval(mouseActivityIntervalRef.current);
      }
      window.removeEventListener('mousemove', handleMouseActivity);
      window.removeEventListener('mousedown', handleMouseActivity);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <FileReaderTopNavbar 
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevelFromSlider}
        onGoBack={handleGoBack}
        onFindText={(text, direction) => console.log('Finding text:', text, direction)}
        onFindAllText={(text) => console.log('Finding all occurrences of:', text)}
        isNotesOpen={isNotesOpen}
        onToggleNotes={handleToggleNotes}
        scrollMode={scrollMode}
        onScrollModeChange={handleScrollModeChange}
      />

      {/* Main document area */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto relative">
          <div 
            className={documentContainerClass}
            ref={documentRef}
          >
            {/* Use the DocumentViewer component instead of placeholder */}
            <DocumentViewer
              filePath={filePath}
              currentPage={pageNumber}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              onTextSearch={handleTextSearch}
              scrollMode={scrollMode}
              onPageChange={handlePageChange}
            />
          </div>
          
          {/* Left toolbar */}
          <LeftToolbar 
            activeTool={activeTool} 
            onToolChange={handleToolChange}
            onAddNote={handleAddNote}
          />
          
          {/* Always render page navigation controls outside of viewport for better accessibility */}
          {numPages && (
            <PageNavigation 
              pageNumber={pageNumber}
              numPages={numPages}
              onPageChange={handlePageChange}
              isVisible={pageControlsVisible}
              isNotesOpen={isNotesOpen}
            />
          )}
        </div>
        
        {/* NoteBar - conditionally rendered based on isNotesOpen */}
        {isNotesOpen && (
          <NoteBar
            currentPage={pageNumber}
            totalPages={numPages || 0}
            currentTool="text"
            setCurrentTool={() => {}}
            newNoteRef={newNoteRef}
          />
        )}
      </div>
    </div>
  );
});

FileReaderContent.displayName = 'FileReaderContent';

// Wrapped FileReader with ZoomProvider and TabsProvider
const FileReader = memo(() => {
  return (
    <TabsProvider>
      <ZoomProvider initialZoom={150}>
        <FileReaderContent />
      </ZoomProvider>
    </TabsProvider>
  );
});

FileReader.displayName = 'FileReader';

export default FileReader; 