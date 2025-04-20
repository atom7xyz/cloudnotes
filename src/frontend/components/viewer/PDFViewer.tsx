import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useZoom } from '@/lib/contexts/ZoomContext';
import { useEditHistoryContext } from '@/lib/contexts/EditHistoryContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Crosshair } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Highlight } from '@/lib/types';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Export ScrollMode enum for use in other components
export enum ScrollMode {
  PAGE = 'page',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
}

// Interface for PDFViewer props
interface PDFViewerProps {
  filePath: string;
  currentPage?: number;
  onLoadSuccess?: (numPages?: number) => void;
  onLoadError?: (error: Error) => void;
  scrollMode?: ScrollMode;
  onPageChange?: (pageNumber: number) => void;
  activeTool?: string;
  onZoomChange?: (zoomLevel: number) => void;
  className?: string;
  isPageNavigationEnabled?: boolean;
  selectedMarkerColor?: string;
  selectedDrawingColor?: string;
  drawingLineWidth?: number;
}

// Error boundary component to catch PDF rendering errors
class PDFErrorBoundary extends React.Component<{ children: React.ReactNode, onError: (error: Error) => void }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let the parent component handle the error display
    }

    return this.props.children;
  }
}

// Define highlight colors
const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: 'rgba(255, 255, 0, 0.3)' },
  { label: 'Green', value: 'rgba(0, 255, 0, 0.3)' },
  { label: 'Blue', value: 'rgba(0, 196, 255, 0.3)' },
  { label: 'Pink', value: 'rgba(255, 0, 255, 0.3)' },
  { label: 'Orange', value: 'rgba(255, 165, 0, 0.3)' },
];

// Add drawing and eraser interface and state
interface DrawingPoint {
  x: number;
  y: number;
}

interface Drawing {
  id: string;
  pageNumber: number;
  path: DrawingPoint[];
  color: string;
  lineWidth: number;
}

// PDFViewer component
const PDFViewer = memo(({
  filePath,
  currentPage = 1,
  onLoadSuccess,
  onLoadError,
  scrollMode = ScrollMode.VERTICAL,
  onPageChange,
  activeTool = undefined,
  onZoomChange,
  className,
  isPageNavigationEnabled = true,
  selectedMarkerColor = HIGHLIGHT_COLORS[0].value,
  selectedDrawingColor = '#FF0000',
  drawingLineWidth = 2
}: PDFViewerProps) => {
  // =========================================================================
  // IMPORTANT SCROLLING BEHAVIOR NOTES:
  // =========================================================================
  // This component follows specific principles for scroll behavior:
  //
  // 1. User Control: The user has complete control over scrolling position.
  //    - No automatic scrolling/jumping occurs during normal browsing
  //    - Observer only updates page counter, never changes scroll position
  //
  // 2. Explicit Navigation: Smooth scrolling ONLY happens when:
  //    - User clicks next/previous page buttons
  //    - User uses keyboard shortcuts (arrows, PgUp/PgDn)
  //    - User manually enters a page number
  //
  // 3. No Auto-Jumping: When switching scroll modes or during automatic
  //    page detection, the component will NOT automatically scroll to 
  //    position the current page in view.
  //
  // These design decisions prevent disruptive page jumps and ensure the
  // user maintains complete control over their viewing position.
  // =========================================================================
  
  // State hooks
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageArray, setPageArray] = useState<number[]>([1]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [visiblePageNumber, setVisiblePageNumber] = useState<number>(currentPage);
  const [debugMode, setDebugMode] = useState(false);
  const [currentObservedPage, setCurrentObservedPage] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    bestVisibility: number;
    centerOffset: number;
    entries: Array<{pageNumber: number, visibility: number, centerValue: number}>
  } | null>(null);
  const [isMiddleClickScrolling, setIsMiddleClickScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState<{
    content: string;
    range: Range | null;
    position: { x: number; y: number } | null;
  } | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [eraserPosition, setEraserPosition] = useState<{ x: number, y: number } | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number, height: number } | null>(null);
  const [customZoomMode, setCustomZoomMode] = useState<'fit' | 'width' | null>(null);

  // Get zoom level from context
  const { zoomLevel, setZoomLevel } = useZoom();
  
  // Add the edit history context to track drawing and highlight changes
  const editHistory = useEditHistoryContext();
  
  // Reference to the viewport container for scrolling
  const viewportRef = useRef<HTMLDivElement>(null);
  
  // References for page size calculation
  const firstPageRef = useRef<HTMLDivElement>(null);
  
  // Reference for the IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Flag to prevent scrolling feedback loops
  const isManualScrollRef = useRef(false);
  const lastReportedPageRef = useRef(currentPage);

  // Helper function to find the parent scrollable container
  const getScrollContainer = useCallback(() => {
    if (!viewportRef.current) return null;
    
    // Function to check if an element is scrollable
    const isScrollable = (el: HTMLElement) => {
      // Check for scrollable content
      const hasScrollableContent = el.scrollHeight > el.clientHeight;
      
      // Check computed style
      const overflowYStyle = window.getComputedStyle(el).overflowY;
      const isOverflowScrollable = overflowYStyle === 'scroll' || overflowYStyle === 'auto';
      
      // Also check for tailwind classes that indicate scrollability
      const hasTailwindScrollClass = el.classList.contains('overflow-y-auto') || 
                                     el.classList.contains('overflow-auto');
      
      return (hasScrollableContent && isOverflowScrollable) || hasTailwindScrollClass;
    };
    
    // Look for direct parent first - most reliable approach
    let element: HTMLElement | null = viewportRef.current;
    
    // Go up the parent chain until we find a scrollable container
    while (element && element.parentElement) {
      element = element.parentElement;
      
      if (isScrollable(element)) {
        return element;
      }
      
      // Stop at body to prevent going too far up the tree
      if (element === document.body) break;
    }
    
    // Fallback to manually checking for FileReaderContent's main scroll container
    const fileReaderScrollContainer = document.querySelector('.flex-1.overflow-y-auto.relative');
    if (fileReaderScrollContainer && fileReaderScrollContainer instanceof HTMLElement) {
      console.log('Found FileReaderContent scroll container via selector');
      return fileReaderScrollContainer;
    }
    
    // Final fallback to viewport ref
    console.log('Using viewport as scroll container (fallback)');
    return viewportRef.current;
  }, []);

  // Handle page size measured for fit/width zoom calculations
  useEffect(() => {
    if (!pageSize || !customZoomMode || !viewportRef.current) return;
    
    const viewportWidth = viewportRef.current.clientWidth;
    const viewportHeight = viewportRef.current.clientHeight;
    
    let newZoom = 100; // Default zoom level
    
    if (customZoomMode === 'fit') {
      // Calculate zoom to fit the entire page
      const heightRatio = (viewportHeight - 40) / pageSize.height; // Subtract padding
      const widthRatio = (viewportWidth - 40) / pageSize.width;
      const ratio = Math.min(heightRatio, widthRatio);
      newZoom = Math.floor(ratio * 100);
    } else if (customZoomMode === 'width') {
      // Calculate zoom to fit page width
      const widthRatio = (viewportWidth - 40) / pageSize.width;
      newZoom = Math.floor(widthRatio * 100);
    }
    
    // Apply the calculated zoom
    setZoomLevel(newZoom);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
    
    // Reset custom zoom mode after applying
    setCustomZoomMode(null);
  }, [pageSize, customZoomMode, setZoomLevel, onZoomChange]);

  // Auto-enable debug mode when devtools are open
  useEffect(() => {
    const checkDevTools = () => {
      // Check if devtools is open
      const isDevToolsOpen = window.outerHeight - window.innerHeight > 100 || 
                             window.outerWidth - window.innerWidth > 100;
      
      setDebugMode(isDevToolsOpen);
    };

    // Initial check
    checkDevTools();
    
    // Set up resize listener to detect devtools toggling
    window.addEventListener('resize', checkDevTools);
    
    return () => {
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  // Handle middle click scrolling
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Middle mouse button is 1
      if (e.button === 1) {
        setIsMiddleClickScrolling(true);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      // Middle mouse button is 1
      if (e.button === 1) {
        setIsMiddleClickScrolling(false);
      }
    };
    
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Handle document load success
  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);

    // Update page array based on scroll mode
    if (scrollMode === ScrollMode.PAGE) {
      setPageArray([currentPage]);
    } else {
      setPageArray(Array.from({ length: numPages }, (_, i) => i + 1));
    }

    // Call parent success handler if provided
    if (onLoadSuccess) {
      onLoadSuccess(numPages);
    }
  }, [onLoadSuccess, currentPage, scrollMode]);

  // Handle when the first page is rendered - to get page dimensions
  const handlePageRenderSuccess = useCallback((page: any) => {
    if (!pageSize && page && page._pageInfo) {
      const { width, height } = page._pageInfo;
      setPageSize({ width, height });
      
      // Apply custom zoom if it's pending
      if (customZoomMode && viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const viewportHeight = viewportRef.current.clientHeight;
        
        let newZoom = 100;
        if (customZoomMode === 'fit') {
          const heightRatio = (viewportHeight - 40) / height;
          const widthRatio = (viewportWidth - 40) / width;
          const ratio = Math.min(heightRatio, widthRatio);
          newZoom = Math.floor(ratio * 100);
        } else if (customZoomMode === 'width') {
          const widthRatio = (viewportWidth - 40) / width;
          newZoom = Math.floor(widthRatio * 100);
        }
        
        setZoomLevel(newZoom);
        if (onZoomChange) {
          onZoomChange(newZoom);
        }
        
        // Reset custom zoom mode after applying
        setCustomZoomMode(null);
      }
    }
  }, [pageSize, customZoomMode, setZoomLevel, onZoomChange]);

  // Handle current page changes in PAGE mode
  useEffect(() => {
    if (scrollMode !== ScrollMode.PAGE || !numPages || isLoading) return;
    
    // If the current page has changed externally, update the page array
    if (pageArray[0] !== currentPage) {
      console.log('Current page changed in PAGE mode, updating pageArray from', pageArray[0], 'to', currentPage);
      setPageArray([currentPage]);
    }
  }, [currentPage, scrollMode, pageArray, numPages, isLoading]);

  // Update page array when scroll mode changes
  useEffect(() => {
    if (!numPages) return;
    
    console.log('Scroll mode changed to:', scrollMode, 'Current page:', currentPage);
    
    // Update page array based on scroll mode
    if (scrollMode === ScrollMode.PAGE) {
      console.log('Setting page array to single page:', [currentPage]);
      setPageArray([currentPage]);
    } else {
      console.log('Setting page array to all pages:', numPages);
      setPageArray(Array.from({ length: numPages }, (_, i) => i + 1));
      
      // IMPORTANT: When switching modes, do NOT automatically scroll to the current page
      // We disable this functionality completely as requested by the user
      // This gives the user complete control over scrolling without any automatic jumps
    }
  }, [scrollMode, currentPage, numPages]);

  // Setup the IntersectionObserver for page detection in vertical and horizontal modes
  useEffect(() => {
    // Skip if in page mode, loading, or middle-click scrolling
    if (scrollMode === ScrollMode.PAGE || !viewportRef.current || isLoading || !numPages || isMiddleClickScrolling) {
      return;
    }

    // Get the scroll container - either the parent container or our own viewport
    const scrollContainer = getScrollContainer();

    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Function to find the most visible page
    const determineVisiblePage = (entries: IntersectionObserverEntry[]) => {
      // Skip if this is during programmatic scrolling
      if (isManualScrollRef.current) return;
      
      // Find the most visible page
      let bestPage = -1;
      let bestVisibility = 0;
      let bestCenterOffset = 0;
      
      // Debug information collection
      const debugEntries: Array<{pageNumber: number, visibility: number, centerValue: number}> = [];
      
      entries.forEach(entry => {
        // Get the viewport dimensions relative to window
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const viewportCenterY = window.scrollY + (viewportHeight / 2);
        const viewportCenterX = window.scrollX + (viewportWidth / 2);
        
        const rect = entry.target.getBoundingClientRect();
        const elementTop = window.scrollY + rect.top;
        const elementLeft = window.scrollX + rect.left;
        const elementCenterY = elementTop + (rect.height / 2);
        const elementCenterX = elementLeft + (rect.width / 2);
        
        // Calculate centering based on scroll mode
        let centerValue: number;
        
        if (scrollMode === ScrollMode.VERTICAL) {
          // For vertical mode, focus on vertical centering
          const distanceFromCenterY = Math.abs(elementCenterY - viewportCenterY);
          centerValue = 1 - Math.min(distanceFromCenterY / (viewportHeight / 2), 1);
          
          // Only consider pages with significant visibility (helps with boundary cases)
          if (entry.intersectionRatio < 0.4) {
            centerValue *= 0.5; // Reduce score for barely visible pages
          }
        } else {
          // For horizontal (wrapped) mode, consider both X and Y centering
          // with greater emphasis on X centering in wrapped view
          const distanceFromCenterX = Math.abs(elementCenterX - viewportCenterX);
          const distanceFromCenterY = Math.abs(elementCenterY - viewportCenterY);
          
          const centerValueX = 1 - Math.min(distanceFromCenterX / (viewportWidth / 2), 1);
          const centerValueY = 1 - Math.min(distanceFromCenterY / (viewportHeight / 2), 1);
          
          // In wrapped mode, X position is more important for determining active page
          centerValue = (centerValueX * 1.5 + centerValueY) / 2.5;
        }
        
        // Adjust weight based on scroll mode
        const centerWeight = scrollMode === ScrollMode.VERTICAL ? 3.0 : 2.5;
        const visibilityScore = entry.intersectionRatio;
        
        // Calculate the score with stronger preference for centered pages
        const score = visibilityScore * (1 + (centerValue * centerWeight));
        
        // Add data to debug array
        const pageNumber = parseInt(entry.target.id.replace('page-', ''), 10);
        debugEntries.push({
          pageNumber,
          visibility: visibilityScore,
          centerValue
        });
        
        if (entry.isIntersecting && score > bestVisibility) {
          bestVisibility = score;
          bestPage = pageNumber;
          bestCenterOffset = centerValue;
        }
      });
      
      // Update debug information
      if (debugMode) {
        setDebugInfo({
          bestVisibility,
          centerOffset: bestCenterOffset,
          entries: debugEntries.sort((a, b) => a.pageNumber - b.pageNumber)
        });
      }
      
      // Update debug display
      setCurrentObservedPage(bestPage > 0 ? bestPage : null);
      
      // Add hysteresis to prevent oscillation (only change page if it's significantly better)
      // This prevents the counter from going back and forth when between two pages
      const needsUpdate = bestPage > 0 && (
        bestPage !== visiblePageNumber && (
          // Either this is a new detection and we got nothing before
          visiblePageNumber === 0 || 
          // Or the new page is significantly better (hysteresis)
          bestVisibility > 1.2 ||
          // Or we're moving in sequence (prevents skipping)
          Math.abs(bestPage - visiblePageNumber) === 1
        )
      );
      
      if (needsUpdate) {
        // IMPORTANT: Just update the page counter without changing scroll position
        setVisiblePageNumber(bestPage);
        lastReportedPageRef.current = bestPage;
        
        // Notify parent component of page change (counter only, don't scroll)
        if (onPageChange) {
          onPageChange(bestPage);
        }
      }
    };
    
    // Create appropriate observer settings based on scroll mode
    const observerOptions: IntersectionObserverInit = {
      root: getScrollContainer(), // Use parent container for better detection if available
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      rootMargin: scrollMode === ScrollMode.VERTICAL 
        ? '-20% 0px -20% 0px' // Focus on center 60% for vertical mode - more restrictive
        : '-5% -5% -5% -5%'   // Tighter margin for horizontal/wrapped mode
    };
    
    observerRef.current = new IntersectionObserver(determineVisiblePage, observerOptions);
    
    // Start observing pages after a delay to ensure they're rendered
    setTimeout(() => {
      if (!viewportRef.current) return;
      
      const pageElements = viewportRef.current.querySelectorAll('.pdf-page');
      pageElements.forEach(page => {
        observerRef.current?.observe(page);
      });
    }, 300);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [scrollMode, isLoading, numPages, visiblePageNumber, onPageChange, debugMode, isMiddleClickScrolling]);

  // Toggle debug mode on double click
  const toggleDebug = useCallback(() => {
    setDebugMode(prev => !prev);
  }, []);

  // Function to handle document loading error
  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading PDF document:', error);
    setError(error);
    setIsLoading(false);

    if (onLoadError) {
      onLoadError(error);
    }
  }, [onLoadError]);

  // Handle errors from the error boundary
  const handleBoundaryError = useCallback((error: Error) => {
    console.error('PDF Error Boundary caught error:', error);
    setError(error);
    setIsLoading(false);
    
    if (onLoadError) {
      onLoadError(error);
    }
  }, [onLoadError]);

  // Rendering loading placeholder
  const renderLoading = useCallback(() => (
    <div className="flex flex-col items-center justify-center p-4">
      <Skeleton className="h-[842px] w-[595px] rounded-md" />
    </div>
  ), []);

  // Scale factor based on zoom level - memoized to prevent unnecessary re-renders 
  const scale = useMemo(() => zoomLevel / 100, [zoomLevel]);

  // Calculate container classes based on scroll mode
  const containerClasses = useMemo(() => {
    switch (scrollMode) {
      case ScrollMode.VERTICAL:
        return "flex flex-col items-center gap-4 pb-24";
      case ScrollMode.HORIZONTAL:
        return "flex flex-wrap justify-center gap-4 p-4 pb-16";
      case ScrollMode.PAGE:
      default:
        return "flex flex-col items-center justify-center h-full pb-24";
    }
  }, [scrollMode]);

  // Debug crosshair indicator
  const renderDebugInfo = useCallback(() => {
    if (!debugMode) {
      return null;
    }
    
    return (
      <div className="fixed top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-md z-50 text-sm flex flex-col items-start gap-2 max-w-sm">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          <span className="font-medium">
            {isMiddleClickScrolling ? (
              <span className="text-yellow-400">Observer Paused (Middle-click)</span>
            ) : (
              <span>Observer Debug {currentObservedPage ? `(Page ${currentObservedPage}/${numPages})` : '(No page detected)'}</span>
            )}
          </span>
        </div>
        
        {isMiddleClickScrolling && (
          <div className="text-xs text-yellow-400 mt-1">
            <p>Observer paused while middle-click is active.</p>
            <p>Release middle mouse button to resume page observation.</p>
          </div>
        )}
        
        {debugInfo && !isMiddleClickScrolling && (
          <>
            <div className="text-xs flex flex-col gap-1">
              <p>Best score: {debugInfo.bestVisibility.toFixed(2)}</p>
              <p>Center value: {debugInfo.centerOffset.toFixed(2)}</p>
              <p>Scroll mode: {scrollMode}</p>
            </div>
            
            <div className="text-xs mt-1 max-h-32 overflow-y-auto w-full">
              <p className="font-medium border-b border-white/20 pb-1 mb-1">Page Visibility Data:</p>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                <span className="font-medium">Page</span>
                <span className="font-medium">Visible %</span>
                <span className="font-medium">Center</span>
                
                {debugInfo.entries.map(entry => (
                  <React.Fragment key={entry.pageNumber}>
                    <span>{entry.pageNumber}</span>
                    <span>{(entry.visibility * 100).toFixed(0)}%</span>
                    <span>{entry.centerValue.toFixed(2)}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        )}
        
        <div className="text-xs text-muted mt-1 border-t border-white/20 pt-1 w-full">
          {/* Indicator that debug is auto-enabled by devtools */}
          <p className="text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
            Debug auto-enabled by DevTools
          </p>
          <p className="text-gray-400">Middle-click: {isMiddleClickScrolling ? "Active" : "Inactive"}</p>
          <p className="text-gray-400">Active Tool: {activeTool}</p>
          {activeTool === 'move' && (
            <p className="text-gray-400">Dragging: <span className={isDragging ? "text-green-400" : "text-red-400"}>{isDragging ? "Yes" : "No"}</span></p>
          )}
        </div>
      </div>
    );
  }, [debugMode, currentObservedPage, numPages, debugInfo, scrollMode, isMiddleClickScrolling, activeTool, isDragging]);

  // Update cursor style based on tool and dragging state
  useEffect(() => {
    if (viewportRef.current) {
      delete viewportRef.current.dataset.tool; // Remove tool attribute initially

      if (isMiddleClickScrolling) {
        viewportRef.current.style.cursor = 'all-scroll';
      } else if (activeTool === 'move') {
        viewportRef.current.style.cursor = isDragging ? 'grabbing' : 'grab';
        viewportRef.current.dataset.tool = 'move'; // Set tool attribute
      } else if (activeTool === 'marker') {
        viewportRef.current.style.cursor = 'text';
        viewportRef.current.dataset.tool = 'marker'; // Set tool attribute
      } else if (activeTool === 'pencil') {
        viewportRef.current.style.cursor = 'crosshair';
        viewportRef.current.dataset.tool = 'pencil'; // Set tool attribute
      } else if (activeTool === 'eraser') {
        // Use the Eraser icon as cursor - we implement this via CSS
        viewportRef.current.dataset.tool = 'eraser'; // Set tool attribute
        viewportRef.current.style.cursor = ''; // Let CSS handle the cursor
      } else {
        // Default cursor when no tool is active or tool is unknown
        viewportRef.current.style.cursor = 'default';
      }
    }
    // Ensure activeTool is included in dependencies if it wasn't already implicitly
  }, [isMiddleClickScrolling, activeTool, isDragging]);

  // Implement document dragging behavior based on the article technique
  // This follows a pattern of:
  // 1. On mousedown: Store initial mouse position and scroll position
  // 2. On mousemove: Calculate delta between current and initial positions
  // 3. Apply the delta to the scroll position
  // 4. On mouseup: Clean up event listeners
  // This provides smooth and intuitive document dragging
  const handleDragStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'move' || isMiddleClickScrolling) return;
    
    // Only start dragging on left mouse button
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get the scroll container - either the parent container or our own viewport
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) return;
    
    // Set the initial positions
    const pos = {
      // Current scroll position
      left: scrollContainer.scrollLeft || 0,
      top: scrollContainer.scrollTop || 0,
      // Current mouse position
      x: e.clientX,
      y: e.clientY,
    };
    
    setIsDragging(true);
    
    // Change the cursor and prevent user from selecting text
    if (viewportRef.current) {
      viewportRef.current.style.cursor = 'grabbing';
      viewportRef.current.style.userSelect = 'none';
    }
    
    // Mouse move handler for drag
    const mouseMoveHandler = (e: MouseEvent) => {
      e.preventDefault();
      
      if (!scrollContainer) return;
      
      // How far the mouse has been moved
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
      
      // Scroll the element
      scrollContainer.scrollTop = pos.top - dy;
      scrollContainer.scrollLeft = pos.left - dx;
    };
    
    // Mouse up handler to clean up
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      
      setIsDragging(false);
      
      // Reset the cursor and user-select property
      if (viewportRef.current) {
        viewportRef.current.style.cursor = 'grab';
        viewportRef.current.style.removeProperty('user-select');
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }, [activeTool, isMiddleClickScrolling, getScrollContainer]);

  // Add keyboard escape to cancel dragging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        setIsDragging(false);
        
        if (viewportRef.current) {
          viewportRef.current.style.cursor = 'grab';
          viewportRef.current.style.removeProperty('user-select');
        }
        
        setTimeout(() => {
          isManualScrollRef.current = false;
        }, 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging]);

  // Handler for text selection - modified to use a two-step process
  const handleTextSelection = useCallback(() => {
    if (activeTool !== 'marker') return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return;
    }
    
    const range = selection.getRangeAt(0);
    const content = range.toString().trim();
    
    if (!content) {
      return;
    }
    
    // Get the rect for the highlight
    const rects = range.getClientRects();
    if (!rects.length || !viewportRef.current) return;
    
    // Store each highlight separately (for multiple lines)
    const newHighlights: Highlight[] = [];
    
    const viewportRect = viewportRef.current.getBoundingClientRect();
    
    // Determine which page this highlight belongs to
    let highlightPageNumber = currentPage;
    if (scrollMode !== ScrollMode.PAGE) {
      // For continuous modes, find which page the selection is on
      const pageElements = document.querySelectorAll('.pdf-page');
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const pageRect = pageEl.getBoundingClientRect();
        const selectionY = rects[0].bottom;
        
        if (pageRect.top <= selectionY && pageRect.bottom >= selectionY) {
          const pageId = pageEl.id;
          highlightPageNumber = parseInt(pageId.replace('page-', ''), 10);
          break;
        }
      }
    }
    
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      
      // Skip tiny highlight areas (likely selection artifacts)
      if (rect.width < 3 || rect.height < 3) continue;
      
      const highlightPosition = {
        x: rect.left - viewportRect.left + viewportRef.current.scrollLeft,
        y: rect.top - viewportRect.top + viewportRef.current.scrollTop,
        width: rect.width,
        height: rect.height
      };
      
      newHighlights.push({
        id: `highlight-${Date.now()}-${i}`,
        pageNumber: highlightPageNumber,
        position: highlightPosition,
        color: selectedMarkerColor,
        content: content
      });
    }
    
    // Only apply highlights when we detect mouseup event
    if (newHighlights.length > 0) {
      setHighlights(prev => {
        const updatedHighlights = [...prev, ...newHighlights];
        
        // Save to edit history
        editHistory.updateHighlights(updatedHighlights);
        
        return updatedHighlights;
      });
      
      // Don't clear the selection immediately to allow for better UX
      // It will be cleared on next interaction
    }
  }, [activeTool, currentPage, scrollMode, selectedMarkerColor, editHistory, viewportRef]);

  // Effect to handle text selection events - modified for two-step process
  useEffect(() => {
    if (activeTool !== 'marker') {
      return;
    }
    
    // This is the first step - selection
    // We don't do anything on selectionchange, just let the browser handle it
    
    // Only apply highlighting on mouseup (second step)
    const handleMouseUp = () => {
      // Short delay to ensure selection is complete
      setTimeout(() => {
        handleTextSelection();
      }, 50);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTool, handleTextSelection]);

  // Update to use editHistory
  const deleteHighlight = useCallback((id: string) => {
    setHighlights(prev => {
      const updatedHighlights = prev.filter(h => h.id !== id);
      
      // Save to edit history
      editHistory.updateHighlights(updatedHighlights);
      
      return updatedHighlights;
    });
  }, [editHistory]);

  // Update drawing handlers to use the props
  const handleDrawingStart = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'pencil' || !viewportRef.current) return;
    
    e.preventDefault();
    
    // Get coordinates relative to the viewport
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - viewportRect.left + viewportRef.current.scrollLeft;
    const y = e.clientY - viewportRect.top + viewportRef.current.scrollTop;
    
    // Determine which page this drawing belongs to
    let drawingPageNumber = currentPage;
    if (scrollMode !== ScrollMode.PAGE) {
      // For continuous modes, find which page the drawing is on
      const pageElements = document.querySelectorAll('.pdf-page');
      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        const pageRect = pageEl.getBoundingClientRect();
        
        if (pageRect.top <= e.clientY && pageRect.bottom >= e.clientY) {
          const pageId = pageEl.id;
          drawingPageNumber = parseInt(pageId.replace('page-', ''), 10);
          break;
        }
      }
    }
    
    const newDrawing: Drawing = {
      id: `drawing-${Date.now()}`,
      pageNumber: drawingPageNumber,
      path: [{ x, y }],
      color: selectedDrawingColor,
      lineWidth: drawingLineWidth
    };
    
    setCurrentDrawing(newDrawing);
    setIsDrawing(true);
  }, [activeTool, currentPage, scrollMode, selectedDrawingColor, drawingLineWidth]);

  const handleDrawingMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentDrawing || !viewportRef.current) return;
    
    e.preventDefault();
    
    // Get coordinates relative to the viewport
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - viewportRect.left + viewportRef.current.scrollLeft;
    const y = e.clientY - viewportRect.top + viewportRef.current.scrollTop;
    
    setCurrentDrawing(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        path: [...prev.path, { x, y }]
      };
    });
  }, [isDrawing, currentDrawing]);

  // Update to use editHistory
  const handleDrawingEnd = useCallback(() => {
    if (!isDrawing || !currentDrawing) return;
    
    // Only save drawings with at least 2 points
    if (currentDrawing.path.length > 1) {
      const updatedDrawings = [...drawings, currentDrawing];
      setDrawings(updatedDrawings);
      
      // Save to edit history
      editHistory.updateDrawings(updatedDrawings);
    }
    
    setCurrentDrawing(null);
    setIsDrawing(false);
  }, [isDrawing, currentDrawing, drawings, editHistory]);

  // Render drawings
  const renderDrawings = useCallback(() => {
    if (!drawings.length && !currentDrawing) return null;
    
    // Create SVG paths from the drawings
    const allDrawings = [...drawings];
    if (currentDrawing) allDrawings.push(currentDrawing);
    
    // Only render drawings for the current page in PAGE mode
    // In continuous modes, render all drawings
    const visibleDrawings = scrollMode === ScrollMode.PAGE
      ? allDrawings.filter(d => d.pageNumber === currentPage)
      : allDrawings;
    
    if (!visibleDrawings.length) return null;
    
    return (
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 40 }}
      >
        {visibleDrawings.map(drawing => {
          // Skip if less than 2 points
          if (drawing.path.length < 2) return null;
          
          // Create path data string
          const pathData = drawing.path.reduce((acc, point, index) => {
            if (index === 0) {
              return `M ${point.x} ${point.y}`;
            }
            return `${acc} L ${point.x} ${point.y}`;
          }, '');
          
          return (
            <g key={drawing.id}>
              <path
                d={pathData}
                stroke={drawing.color}
                strokeWidth={drawing.lineWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={activeTool === 'eraser' ? 'pointer-events-auto hover:stroke-destructive/70' : ''}
                onClick={activeTool === 'eraser' ? () => deleteDrawing(drawing.id) : undefined}
              />
            </g>
          );
        })}
      </svg>
    );
  }, [drawings, currentDrawing, scrollMode, currentPage, activeTool]);

  // Update to use editHistory with file path awareness
  const deleteDrawing = useCallback((id: string) => {
    setDrawings(prev => {
      const updatedDrawings = prev.filter(d => d.id !== id);
      
      // Save to edit history
      editHistory.updateDrawings(updatedDrawings);
      
      return updatedDrawings;
    });
  }, [editHistory]);

  // Remove drawing controls since they're now in the LeftToolbar
  const renderDrawingControls = useCallback(() => {
    return null; // No UI needed here anymore as it's in the LeftToolbar
  }, []);

  // Render highlights (now markers)
  const renderHighlights = useCallback(() => {
    if (!highlights.length) return null;
    
    // Only render highlights for the current page in PAGE mode
    // In continuous modes, render all highlights
    const visibleHighlights = scrollMode === ScrollMode.PAGE
      ? highlights.filter(h => h.pageNumber === currentPage)
      : highlights;
    
    // Group highlights by page number
    const highlightsByPage = new Map<number, Highlight[]>();
    
    visibleHighlights.forEach(highlight => {
      const pageHighlights = highlightsByPage.get(highlight.pageNumber) || [];
      pageHighlights.push(highlight);
      highlightsByPage.set(highlight.pageNumber, pageHighlights);
    });
    
    // Return a function that accepts a page number and returns the highlights for that page
    return (pageNumber: number) => {
      const pageHighlights = highlightsByPage.get(pageNumber) || [];
      
      return pageHighlights.map(highlight => (
        <div
          key={highlight.id}
          className="absolute pointer-events-none"
          style={{
            left: `${highlight.position.x}px`,
            top: `${highlight.position.y}px`,
            width: `${highlight.position.width}px`,
            height: `${highlight.position.height}px`,
            backgroundColor: highlight.color,
            position: 'absolute',
            zIndex: 40,
            mixBlendMode: 'multiply',
            border: activeTool === 'eraser' ? '1px dashed rgba(255,0,0,0.3)' : 'none'
          }}
        >
          {activeTool === 'eraser' && (
            <div 
              className="absolute inset-0 pointer-events-auto hover:bg-destructive/20"
              onClick={() => deleteHighlight(highlight.id)}
            />
          )}
        </div>
      ));
    };
  }, [highlights, scrollMode, currentPage, activeTool, deleteHighlight]);

  // Handler for eraser start
  const handleEraserStart = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'eraser' || !viewportRef.current) return;
    
    e.preventDefault();
    
    // Get coordinates relative to the viewport
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - viewportRect.left + viewportRef.current.scrollLeft;
    const y = e.clientY - viewportRect.top + viewportRef.current.scrollTop;
    
    setIsErasing(true);
    setEraserPosition({ x, y });
    
    // Check if we're already over a drawing and erase it
    eraseDrawingsAtPosition(x, y);
  }, [activeTool]);

  const handleEraserMove = useCallback((e: React.MouseEvent) => {
    if (!isErasing || !viewportRef.current) return;
    
    e.preventDefault();
    
    // Get coordinates relative to the viewport
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - viewportRect.left + viewportRef.current.scrollLeft;
    const y = e.clientY - viewportRect.top + viewportRef.current.scrollTop;
    
    setEraserPosition({ x, y });
    
    // Erase any drawings at the current position
    eraseDrawingsAtPosition(x, y);
  }, [isErasing]);

  const handleEraserEnd = useCallback(() => {
    if (isErasing) {
      setIsErasing(false);
      setEraserPosition(null);
    }
  }, [isErasing]);

  // Function to erase drawings at a specific position
  const eraseDrawingsAtPosition = useCallback((x: number, y: number) => {
    const eraserRadius = 10; // pixels
    
    // Erase drawings
    setDrawings(prevDrawings => {
      // Filter out drawings that are close to the eraser position
      const newDrawings = prevDrawings.filter(drawing => {
        // Check if any point in the drawing path is within range of the eraser
        const isErased = drawing.path.some(point => {
          const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
          return distance <= eraserRadius;
        });
        
        // Keep the drawing if it's not erased
        return !isErased;
      });
      
      // Only update history if something changed
      if (newDrawings.length !== prevDrawings.length) {
        editHistory.updateDrawings(newDrawings);
      }
      
      return newDrawings;
    });
    
    // Erase highlights
    setHighlights(prevHighlights => {
      const newHighlights = prevHighlights.filter(highlight => {
        // Get the center point of the highlight
        const highlightCenterX = highlight.position.x + (highlight.position.width / 2);
        const highlightCenterY = highlight.position.y + (highlight.position.height / 2);
        
        // Calculate distance from eraser to highlight center
        const distance = Math.sqrt(
          Math.pow(highlightCenterX - x, 2) + 
          Math.pow(highlightCenterY - y, 2)
        );
        
        // Also check if eraser is within the highlight bounds
        const isWithinBounds = 
          x >= highlight.position.x &&
          x <= highlight.position.x + highlight.position.width &&
          y >= highlight.position.y &&
          y <= highlight.position.y + highlight.position.height;
        
        // Keep the highlight if it's not erased
        return !(distance <= eraserRadius || isWithinBounds);
      });
      
      // Only update history if something changed
      if (newHighlights.length !== prevHighlights.length) {
        editHistory.updateHighlights(newHighlights);
      }
      
      return newHighlights;
    });
  }, [editHistory]);

  // Update the navigateToPage function to better handle continuous scrolling modes
  const navigateToPage = useCallback((pageNumber: number) => {
    if (!numPages || pageNumber < 1 || pageNumber > numPages) return;
    
    console.log(`PDFViewer: Navigating to page ${pageNumber} (Scroll mode: ${scrollMode})`);
    
    // If we're in PAGE mode, just update the page number via props
    if (scrollMode === ScrollMode.PAGE) {
      // Update internal state
      setVisiblePageNumber(pageNumber);
      
      // Notify parent component of page change
      if (onPageChange) {
        onPageChange(pageNumber);
      }
      return;
    }
    
    // For continuous modes, find the page element and scroll to it
    const pageElement = document.getElementById(`page-${pageNumber}`);
    if (!pageElement) {
      console.error('Page element not found:', pageNumber);
      
      // Special case for first and last pages - if we can't find the exact element
      if (pageNumber === 1 || pageNumber === numPages) {
        const scrollContainer = getScrollContainer();
        if (scrollContainer) {
          isManualScrollRef.current = true;
          
          // For first page, scroll to top
          if (pageNumber === 1) {
            console.log('Navigating to first page by scrolling to top');
            scrollContainer.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
          }
          
          // For last page, scroll to bottom
          if (pageNumber === numPages) {
            console.log('Navigating to last page by scrolling to bottom');
            if (scrollMode === ScrollMode.HORIZONTAL) {
              // In horizontal mode, we need to scroll to the rightmost position
              scrollContainer.scrollTo({
                top: 0,
                left: scrollContainer.scrollWidth,
                behavior: 'smooth'
              });
            } else {
              // In vertical mode, scroll to bottom
              scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                left: 0,
                behavior: 'smooth'
              });
            }
          }
          
          // Update our internal state
          setVisiblePageNumber(pageNumber);
          lastReportedPageRef.current = pageNumber;
          
          // Clear the flag after scrolling is likely complete
          setTimeout(() => {
            isManualScrollRef.current = false;
          }, 500);
        }
      }
      return;
    }
    
    // Get the scroll container
    const scrollContainer = getScrollContainer();
    if (!scrollContainer) {
      console.error('Scroll container not found');
      return;
    }
    
    // Set a flag to avoid triggering the IntersectionObserver during programmatic scrolling
    isManualScrollRef.current = true;
    
    // Get the page position relative to the scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    
    // Calculate the scroll position based on the scroll mode with additional adjustments
    // for better centering
    if (scrollMode === ScrollMode.HORIZONTAL) {
      // For horizontal mode, scroll to the left position of the page
      // Adjust to center the page horizontally if it's smaller than the viewport
      const scrollLeft = pageRect.left - containerRect.left + scrollContainer.scrollLeft;
      const centeringOffset = (containerRect.width - pageRect.width) / 2;
      
      scrollContainer.scrollTo({
        left: Math.max(0, scrollLeft - (centeringOffset > 0 ? centeringOffset : 0)),
        behavior: 'smooth'
      });
    } else {
      // For vertical mode, scroll to the top position of the page
      // Add a small offset to give it some space at the top
      const scrollTop = pageRect.top - containerRect.top + scrollContainer.scrollTop;
      const topOffset = 20; // pixels of space at the top
      
      scrollContainer.scrollTo({
        top: Math.max(0, scrollTop - topOffset),
        behavior: 'smooth'
      });
    }
    
    // Update our internal state with the new page number
    setVisiblePageNumber(pageNumber);
    lastReportedPageRef.current = pageNumber;
    
    // Notify parent component of page change
    if (onPageChange) {
      onPageChange(pageNumber);
    }
    
    // Clear the flag after scrolling is likely complete
    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 500); // Provide enough time for smooth scrolling to complete
  }, [scrollMode, numPages, onPageChange, getScrollContainer]);

  // Add keyboard navigation support for page switching
  useEffect(() => {
    // Don't add keyboard navigation if page navigation is disabled
    if (!isPageNavigationEnabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in a text input or if the focus is inside an input element
      if (document.activeElement && 
          (document.activeElement.tagName === 'INPUT' || 
           document.activeElement.tagName === 'TEXTAREA' ||
           (document.activeElement as HTMLElement).isContentEditable)) {
        return;
      }
      
      // Skip if ctrl, alt or meta key is pressed (to avoid interfering with browser shortcuts)
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        // Previous page
        if (visiblePageNumber > 1) {
          e.preventDefault(); // Prevent default behavior
          navigateToPage(visiblePageNumber - 1);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        // Next page
        if (numPages && visiblePageNumber < numPages) {
          e.preventDefault(); // Prevent default behavior
          navigateToPage(visiblePageNumber + 1);
        }
      } else if (e.key === 'Home') {
        // First page
        e.preventDefault();
        navigateToPage(1);
      } else if (e.key === 'End') {
        // Last page
        if (numPages) {
          e.preventDefault();
          navigateToPage(numPages);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPageNavigationEnabled, numPages, visiblePageNumber, navigateToPage]);
  
  // Add an effect to listen for custom navigation events
  useEffect(() => {
    const handleCustomNavigate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.pageNumber) {
        console.log(`PDFViewer: Received custom navigate event to page ${customEvent.detail.pageNumber}`);
        navigateToPage(customEvent.detail.pageNumber);
      }
    };

    // Get the element to attach the listener to
    const containerElement = viewportRef.current;
    if (containerElement) {
      containerElement.addEventListener('navigate-to-page', handleCustomNavigate);
    }

    return () => {
      if (containerElement) {
        containerElement.removeEventListener('navigate-to-page', handleCustomNavigate);
      }
    };
  }, [navigateToPage]);

  // Add an effect to listen for direct navigation events
  useEffect(() => {
    const handleDirectNavigate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.pageNumber) {
        console.log(`PDFViewer: Received direct navigation event to page ${customEvent.detail.pageNumber}`);
        navigateToPage(customEvent.detail.pageNumber);
      }
    };

    // Since we're setting up a global event listener, need to limit it to this component
    const container = viewportRef.current;
    if (container) {
      container.addEventListener('direct-navigate', handleDirectNavigate);
    }

    return () => {
      if (container) {
        container.removeEventListener('direct-navigate', handleDirectNavigate);
      }
    };
  }, [navigateToPage]);

  // When tool changes, clear selection
  useEffect(() => {
    if (activeTool !== 'marker') {
      window.getSelection()?.removeAllRanges();
    }
  }, [activeTool]);

  // Enhance keyboard handling with undo and redo shortcuts
  useEffect(() => {
    if (!viewportRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when the user isn't typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (editHistory.canUndo) {
          console.log('Keyboard shortcut: Undo');
          editHistory.undo();
        }
      }
      
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        if (editHistory.canRedo) {
          console.log('Keyboard shortcut: Redo');
          editHistory.redo();
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editHistory]);

  // Sync PDF viewer state with editHistory context when currentFilePath changes
  // or when editHistory's drawings/highlights change
  useEffect(() => {
    // Ensure we have arrays to work with (prevent unintended side effects)
    if (Array.isArray(editHistory.drawings)) {
      setDrawings(editHistory.drawings);
    }
    
    if (Array.isArray(editHistory.highlights)) {
      setHighlights(editHistory.highlights);
    }
  }, [editHistory.drawings, editHistory.highlights, editHistory.currentFilePath, filePath]);

  // When filePath changes, clear local state drawings and highlights
  // The EditHistoryContext will provide the correct ones for the new file
  useEffect(() => {
    console.log('File path changed in PDFViewer:', filePath);
    // No need to manually clear drawings/highlights as they will be
    // updated from the EditHistoryContext when it changes file path
  }, [filePath]);

  return (
    <div 
      ref={viewportRef}
      className={cn(
        "relative flex flex-col items-center h-full overflow-hidden",
        "bg-document-bg dark:bg-document-bg-dark",
        scrollMode === ScrollMode.VERTICAL && "viewer-vertical",
        scrollMode === ScrollMode.HORIZONTAL && "viewer-horizontal",
        className
      )}
      data-testid="pdf-viewer"
    >
      <style>{`
        .react-pdf__Page {
          position: relative;
        }
        
        .react-pdf__Page__textContent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10; /* Set z-index to be above the canvas but below highlights */
          opacity: 0.25;
          pointer-events: none;
        }
        
        .react-pdf__Page__textContent span {
          color: transparent;
          pointer-events: auto; /* Allow text selection */
        }
        
        .react-pdf__Page__textContent::selection {
          background-color: rgba(255, 255, 0, 0.3); /* Default selection color */
        }
        
        .react-pdf__Page__textContent span::selection {
          background-color: rgba(255, 255, 0, 0.3); /* Default selection color */
        }
        
        .react-pdf__Page__textContent mark {
          background-color: transparent;
          color: transparent;
        }
        
        .react-pdf__Page__annotations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 15; /* Above text layer */
          pointer-events: none;
        }
        
        .react-pdf__Page__annotations .linkAnnotation {
          position: absolute;
          pointer-events: auto;
        }
        
        .highlight-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40; /* Increased z-index to be above canvas and text */
          pointer-events: none;
        }
        
        .pdf-container.dragging {
          cursor: grabbing !important;
        }
        
        .pdf-container[data-tool="move"] {
          cursor: grab;
        }
        
        .pdf-container[data-tool="move"]:active {
          cursor: grabbing;
        }
        
        .pdf-container[data-tool="marker"] {
          cursor: text !important;
        }
        
        .pdf-container[data-tool="marker"] * {
          user-select: text !important;
        }
        
        .pdf-container[data-tool="pencil"] {
          cursor: crosshair !important;
        }
        
        .pdf-container[data-tool="eraser"] {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'%3E%3C/path%3E%3Cpath d='M22 21H7'%3E%3C/path%3E%3Cpath d='m5 11 9 9'%3E%3C/path%3E%3C/svg%3E") 0 24, auto !important;
        }
      `}</style>
      <div 
        className={`pdf-container ${containerClasses} overflow-y-auto h-full ${isDragging ? 'select-none touch-none dragging' : ''}`}
        ref={viewportRef}
        onDoubleClick={toggleDebug}
        onMouseDown={
          activeTool === 'move' 
            ? handleDragStart 
            : activeTool === 'pencil'
              ? handleDrawingStart
              : activeTool === 'eraser'
                ? handleEraserStart
                : undefined
        }
        onMouseMove={
          isDrawing
            ? handleDrawingMove
            : isErasing
              ? handleEraserMove
              : undefined
        }
        onMouseUp={
          isDrawing
            ? handleDrawingEnd
            : isErasing
              ? handleEraserEnd
              : undefined
        }
        onMouseLeave={
          isDrawing
            ? handleDrawingEnd
            : isErasing
              ? handleEraserEnd
              : undefined
        }
        style={{
          userSelect: isDragging ? 'none' : 'auto',
          position: 'relative'
        }}
        {...(activeTool ? { 'data-tool': activeTool } : {})}
      >
        {/* Render drawings */}
        {renderDrawings()}

        {error ? (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading PDF</AlertTitle>
            <AlertDescription>
              {error.message || 'Failed to load the PDF document. Please try again or check if the file is valid.'}
            </AlertDescription>
          </Alert>
        ) : (
          <PDFErrorBoundary onError={handleBoundaryError}>
            <Document
              file={filePath}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={renderLoading}
              className="shadow-lg"
            >
              {isLoading ? (
                renderLoading()
              ) : (
                <>
                  {pageArray.map((pageNumber) => (
                    <div 
                      key={`page_${pageNumber}`} 
                      id={`page-${pageNumber}`}
                      className={`pdf-page bg-white rounded-md relative ${
                        scrollMode === ScrollMode.HORIZONTAL ? 'inline-flex mb-4' : ''
                      } ${
                        debugMode && currentObservedPage === pageNumber ? 'ring-2 ring-primary' : ''
                      } ${
                        debugMode && debugInfo && debugInfo.entries.some(e => e.pageNumber === pageNumber) 
                          ? 'outline outline-offset-1 outline-yellow-500/30' 
                          : ''
                      }`}
                      ref={pageNumber === 1 ? firstPageRef : null}
                    >
                      <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={activeTool !== 'move' && activeTool !== 'pencil' && activeTool !== 'eraser'} // Only render text layer when highlighting
                        renderAnnotationLayer={activeTool !== 'move' && activeTool !== 'pencil' && activeTool !== 'eraser'}
                        className="shadow-md"
                        loading={
                          <div className="h-full w-full flex items-center justify-center">
                            <Skeleton className="h-full w-full rounded-md opacity-30" />
                          </div>
                        }
                        canvasBackground="white"
                        onRenderSuccess={pageNumber === 1 ? handlePageRenderSuccess : undefined}
                      />
                      
                      {/* Highlight container to ensure highlights are above text */}
                      <div className="highlight-layer">
                        {(() => {
                          const highlightRenderer = renderHighlights();
                          return highlightRenderer ? highlightRenderer(pageNumber) : null;
                        })()}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </Document>
          </PDFErrorBoundary>
        )}
      </div>
      
      {/* Debug crosshair */}
      {renderDebugInfo()}
    </div>
  );
});

export default PDFViewer;