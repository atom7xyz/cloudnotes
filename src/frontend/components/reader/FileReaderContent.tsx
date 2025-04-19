import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZoom } from '@/lib/contexts/ZoomContext';
import { useTabs } from '@/lib/contexts/TabsContext';
import { useEditHistoryContext } from '@/lib/contexts/EditHistoryContext';
import FileReaderTopNavbar, { ZoomValue } from '@/components/reader/FileReaderTopNavbar';
import NoteBar from '@/components/reader/NoteBar';
import DocumentViewer, { DEFAULT_FILES, FileType } from '@/components/viewer/DocumentViewer';
import { ScrollMode } from '@/components/viewer/PDFViewer';
import PageNavigation from '@/components/reader/PageNavigation';
import LeftToolbar from '@/components/reader/LeftToolbar';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Define default colors
const DEFAULT_MARKER_COLOR = 'rgba(255, 255, 0, 0.3)'; // Yellow
const DEFAULT_DRAWING_COLOR = '#FF0000'; // Red
const DEFAULT_LINE_WIDTH = 2;

const FileReaderContent = memo(() => {
  const navigate = useNavigate();
  const { zoomLevel, setZoomLevel, isDraggingZoom } = useZoom();
  const { activeTabId, getTabById, isLoading, setIsLoading } = useTabs();
  const { undo, redo } = useEditHistoryContext();
  
  // Group all state hooks together at the top
  const [numPages, setNumPages] = useState<number | null>(10); // Default to 10 pages as placeholder
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [mouseIdleTime, setMouseIdleTime] = useState(0);
  const [filePath, setFilePath] = useState<string>(DEFAULT_FILES[FileType.PDF]); // Default to PDF
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [scrollMode, setScrollMode] = useState<ScrollMode>(ScrollMode.PAGE); // Default to PAGE mode for single page view
  const [activeTool, setActiveTool] = useState<string | null>(null); // Default to null (no active tool)
  // Map to store last viewed page for each document
  const [documentPageMap, setDocumentPageMap] = useState<Map<string, number>>(new Map());
  
  // New states for marker and drawing customization
  const [selectedMarkerColor, setSelectedMarkerColor] = useState<string>(DEFAULT_MARKER_COLOR);
  const [selectedDrawingColor, setSelectedDrawingColor] = useState<string>(DEFAULT_DRAWING_COLOR);
  const [drawingLineWidth, setDrawingLineWidth] = useState<number>(DEFAULT_LINE_WIDTH);
  
  // Group all refs together
  const documentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mouseActivityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const previousActiveTabIdRef = useRef<string | null>(null);
  
  // Group all memoized values together
  const pageControlsVisible = useMemo(() => mouseIdleTime < 3, [mouseIdleTime]);
  
  const documentContainerClass = useMemo(() => 
    `flex justify-center p-4 bg-slate-100 dark:bg-slate-900/40 ${isDraggingZoom ? 'cursor-grabbing' : 'cursor-default'}`,
    [isDraggingZoom]
  );

  // Update file path based on active tab
  useEffect(() => {
    if (activeTabId === previousActiveTabIdRef.current) {
      return; // Skip if the active tab hasn't changed
    }
    
    // Save current page position for the previous tab
    if (previousActiveTabIdRef.current) {
      const previousTab = getTabById(previousActiveTabIdRef.current);
      if (previousTab) {
        setDocumentPageMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.set(previousTab.path, pageNumber);
          return newMap;
        });
      }
    }
    
    if (activeTabId) {
      const activeTab = getTabById(activeTabId);
      if (activeTab) {
        // Only update the file path if it actually changed
        if (filePath !== activeTab.path) {
          setFilePath(activeTab.path);
          
          // Check if we have a saved page position for this document
          if (documentPageMap.has(activeTab.path)) {
            setPageNumber(documentPageMap.get(activeTab.path) || 1);
          } else {
            // Reset page number when opening a new document
            setPageNumber(1);
          }
        }
      }
      
      // Update the previousActiveTabIdRef
      previousActiveTabIdRef.current = activeTabId;
    } else {
      // If no active tab, use a default file based on file type preference
      if (filePath !== DEFAULT_FILES[FileType.PDF]) {
        setFilePath(DEFAULT_FILES[FileType.PDF]);
        setPageNumber(1);
      }
      
      previousActiveTabIdRef.current = null;
    }
  }, [activeTabId, getTabById, filePath, documentPageMap, pageNumber]);

  const handleDocumentLoadSuccess = useCallback((numPages?: number) => {
    if (numPages) {
      setNumPages(numPages);
    }
    setIsLoading(false);
  }, [setIsLoading]);

  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('Error loading document:', error);
    setIsLoading(false);
    
    // If there's an error loading the file, we could optionally fall back to a default file
    if (filePath !== DEFAULT_FILES[FileType.PDF]) {
      console.log('Falling back to default PDF file');
      setFilePath(DEFAULT_FILES[FileType.PDF]);
    }
  }, [filePath, setIsLoading]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number, manual: boolean = false) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      // Update our internal state
      setPageNumber(newPage);
      
      // Manual navigation: user explicitly requested to go to this page (via buttons/input)
      // This should trigger scrolling to the page
      if (manual) {
        const documentViewerElement = document.querySelector('.pdf-container');
        if (documentViewerElement) {
          documentViewerElement.dispatchEvent(
            new CustomEvent('direct-navigate', { detail: { pageNumber: newPage } })
          );
        }
      }
      // Automatic navigation: user is scrolling through document naturally
      // No need to trigger additional scrolling, just update the page counter
      
      // Update the document page map with the new page for tab state persistence
      if (activeTabId) {
        const activeTab = getTabById(activeTabId);
        if (activeTab) {
          setDocumentPageMap(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(activeTab.path, newPage);
            return newMap;
          });
        }
      }
    }
  }, [numPages, activeTabId, getTabById]);

  const handleToggleNotes = useCallback(() => {
    setIsNotesOpen(prev => !prev);
  }, []);

  const handleScrollModeChange = useCallback((mode: ScrollMode) => {
    console.log('Changing scroll mode to:', mode);
    setScrollMode(mode);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Handle text search
  const handleTextSearch = useCallback((searchTerm: string) => {
    console.log('Searching for:', searchTerm);
    // Implement document searching functionality
  }, []);

  // Handle zoom change with new ZoomValue type
  const handleZoomChange = useCallback((value: ZoomValue) => {
    if (typeof value === 'number') {
      // For normal percentage values
      setZoomLevel(value);
    }
    // Special zoom values like 'fit' and 'width' will be handled by the PDFViewer
  }, [setZoomLevel]);

  // Update tool change handler to toggle tools
  const handleToolChange = useCallback((tool: string | null) => {
    setActiveTool(tool);
    
    // When selecting the marker tool, automatically apply the selected color
    if (tool === 'marker') {
      // This will be applied when PDFViewer renders
      console.log('Selected marker color:', selectedMarkerColor);
    } 
    // When selecting the pencil tool, automatically apply the selected color and line width
    else if (tool === 'pencil') {
      // This will be applied when PDFViewer renders
      console.log('Selected drawing color:', selectedDrawingColor);
      console.log('Selected line width:', drawingLineWidth);
    }
  }, [selectedMarkerColor, selectedDrawingColor, drawingLineWidth]);

  // Handle marker color change
  const handleMarkerColorChange = useCallback((color: string) => {
    setSelectedMarkerColor(color);
    console.log('Marker color changed to:', color);
  }, []);

  // Handle drawing color change
  const handleDrawingColorChange = useCallback((color: string) => {
    setSelectedDrawingColor(color);
    console.log('Drawing color changed to:', color);
  }, []);

  // Handle line width change
  const handleDrawingLineWidthChange = useCallback((width: number) => {
    setDrawingLineWidth(width);
    console.log('Line width changed to:', width);
  }, []);

  const handleAddNote = useCallback(() => {
    // Toggle the notes panel
    setIsNotesOpen(prev => !prev);
    
    // If notes are being opened, set the tool to note
    if (!isNotesOpen) {
      setActiveTool('note');
      
      // Create a new note, focus on it, and select all text
      setTimeout(() => {
        if (newNoteRef.current) {
          newNoteRef.current.focus();
        }
      }, 100);
    } else {
      // If notes are being closed, set activeTool to null
      setActiveTool(null);
    }
  }, [isNotesOpen]);

  // Support for keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Skip if we're in a text input
      if (document.activeElement && 
          (document.activeElement.tagName === 'INPUT' || 
           document.activeElement.tagName === 'TEXTAREA' ||
           (document.activeElement as HTMLElement).isContentEditable)) {
        return;
      }
      
      // Handle Ctrl+Z for undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Handle Ctrl+Shift+Z or Ctrl+Y for redo
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || 
          (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [undo, redo]);

  // Group all effects together
  // Add wheel event listener for CTRL+SCROLLWHEEL zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle zooming when CTRL key is pressed
      if (e.ctrlKey) {
        e.preventDefault();
        
        // Calculate new zoom level based on wheel direction
        const delta = e.deltaY < 0 ? 25 : -25; // Increase/decrease by 25%
        const newZoom = Math.min(Math.max(zoomLevel + delta, 50), 200); // Limit between 50% and 200%
        
        setZoomLevel(newZoom);
      }
    };

    // Add the event listener to the document element
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

  // Add keyboard navigation support
  useEffect(() => {
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
        if (pageNumber > 1) {
          e.preventDefault(); // Prevent default behavior
          handlePageChange(pageNumber - 1, true);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        // Next page
        if (numPages && pageNumber < numPages) {
          e.preventDefault(); // Prevent default behavior
          handlePageChange(pageNumber + 1, true);
        }
      } else if (e.key === 'Home') {
        // First page
        e.preventDefault();
        handlePageChange(1, true);
      } else if (e.key === 'End') {
        // Last page
        if (numPages) {
          e.preventDefault();
          handlePageChange(numPages, true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pageNumber, numPages, handlePageChange]);

  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <FileReaderTopNavbar 
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        onGoBack={handleGoBack}
        onFindText={(text, direction) => console.log('Finding text:', text, direction)}
        onFindAllText={(text) => console.log('Finding all occurrences of:', text)}
        isNotesOpen={isNotesOpen}
        onToggleNotes={handleToggleNotes}
        scrollMode={scrollMode}
        onScrollModeChange={handleScrollModeChange}
        isLoading={isLoading}
      />

      {/* Main document area */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
          <div 
            className={documentContainerClass}
            ref={documentRef}
          >
            {/* DocumentViewer should be the only component rendering the PDF */}
            <DocumentViewer
              filePath={filePath}
              currentPage={pageNumber}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              onTextSearch={handleTextSearch}
              scrollMode={scrollMode}
              onPageChange={(page) => handlePageChange(page, false)}
              activeTool={activeTool}
              onToolChange={handleToolChange}
              onZoomChange={handleZoomChange}
              selectedMarkerColor={selectedMarkerColor}
              selectedDrawingColor={selectedDrawingColor}
              drawingLineWidth={drawingLineWidth}
            />
          </div>
          
          {/* Left toolbar */}
          <LeftToolbar 
            activeTool={activeTool || ''}
            onToolChange={handleToolChange}
            onAddNote={handleAddNote}
            isNotesOpen={isNotesOpen}
            selectedMarkerColor={selectedMarkerColor}
            onMarkerColorChange={handleMarkerColorChange}
            selectedDrawingColor={selectedDrawingColor}
            onDrawingColorChange={handleDrawingColorChange}
            drawingLineWidth={drawingLineWidth}
            onDrawingLineWidthChange={handleDrawingLineWidthChange}
          />
          
          {/* Page navigation controls */}
          {numPages && numPages > 1 && (
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
            newNoteRef={newNoteRef as React.RefObject<HTMLTextAreaElement>}
          />
        )}
      </div>
    </div>
  );
});

FileReaderContent.displayName = 'FileReaderContent';

export default FileReaderContent; 