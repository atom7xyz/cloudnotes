import React, { useState, useEffect, useCallback, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingModal from '@/components/modals/LoadingModal';
import { ZoomValue } from '@/components/reader/FileReaderTopNavbar';

// Import the PDFViewer
import PDFViewer, { ScrollMode } from './PDFViewer';

// Define file type enum 
export enum FileType {
  PDF = 'pdf',
  UNKNOWN = 'unknown'
}

// Set up default files for testing/demo
export const DEFAULT_FILES: Record<FileType, string> = {
  [FileType.PDF]: '/assets/files/genesis.pdf',
  [FileType.UNKNOWN]: '/assets/files/genesis.pdf'
};

// Helper function to determine file type from path
const getFileType = (filePath: string): FileType => {
  if (!filePath) return FileType.UNKNOWN;
  
  // Get file extension
  const ext = filePath.split('.').pop()?.toLowerCase();
  
  // Check against known file types
  switch (ext) {
    case 'pdf':
      return FileType.PDF;
    default:
      return FileType.UNKNOWN;
  }
};

// Viewer props
interface DocumentViewerProps {
  filePath: string;
  currentPage?: number;
  onLoadSuccess?: (numPages?: number) => void;
  onLoadError?: (error: Error) => void;
  onTextSearch?: (text: string) => void;
  scrollMode?: ScrollMode;
  onPageChange?: (pageNumber: number) => void;
  activeTool?: string | null;
  onToolChange?: (tool: string | null) => void;
  onZoomChange?: (zoomValue: ZoomValue) => void;
  selectedMarkerColor?: string;
  selectedDrawingColor?: string;
  drawingLineWidth?: number;
}

// Main DocumentViewer component
const DocumentViewer: React.FC<DocumentViewerProps> = memo(({
  filePath,
  onLoadSuccess,
  onLoadError,
  currentPage = 1,
  scrollMode = ScrollMode.VERTICAL,
  onPageChange,
  activeTool = 'move',
  onToolChange,
  onZoomChange,
  selectedMarkerColor = 'rgba(255, 255, 0, 0.3)', // Default yellow
  selectedDrawingColor = '#FF0000', // Default red
  drawingLineWidth = 2 // Default line width
}) => {
  const [fileType, setFileType] = useState<FileType>(FileType.UNKNOWN);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [_numPages, setNumPages] = useState<number>(1);
  const [previousFilePath, setPreviousFilePath] = useState<string>('');
  const [previousScrollMode, setPreviousScrollMode] = useState<ScrollMode | undefined>(undefined);
  
  // Log when scroll mode changes
  useEffect(() => {
    if (previousScrollMode !== scrollMode) {
      console.log('DocumentViewer: scrollMode changed from', previousScrollMode, 'to', scrollMode);
      setPreviousScrollMode(scrollMode);
    }
  }, [scrollMode, previousScrollMode]);
  
  // Detect file type based on path
  useEffect(() => {
    if (filePath) {
      setFileType(getFileType(filePath));
      
      // Only show loading and reset state when file path changes
      if (filePath !== previousFilePath) {
        console.log(`DocumentViewer: File path changed from ${previousFilePath} to ${filePath}`);
        
        setIsLoading(true);
        setError(null);
        setShowLoadingModal(true);
        setPreviousFilePath(filePath);
        
        // Hide loading modal after a reasonable timeout or when load completes
        const timer = setTimeout(() => {
          setShowLoadingModal(false);
        }, 10000); // 10 seconds max timeout
        
        return () => clearTimeout(timer);
      }
    }
  }, [filePath, previousFilePath]);

  // Handle loading error
  const handleError = useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
    setShowLoadingModal(false);
    if (onLoadError) {
      onLoadError(error);
    }
  }, [onLoadError]);

  // Handle loading success
  const handleLoadSuccess = useCallback((pages?: number) => {
    const totalPages = pages || 1;
    setNumPages(totalPages);
    setIsLoading(false);
    setShowLoadingModal(false);
    if (onLoadSuccess) {
      onLoadSuccess(totalPages);
    }
  }, [onLoadSuccess]);

  // Handle page change events from PDFViewer - this function will trigger smooth scrolling
  const handlePageChange = useCallback((pageNumber: number) => {
    console.log(`DocumentViewer: handlePageChange called with page ${pageNumber}`);
    if (onPageChange) {
      // Pass the page change to the parent component
      onPageChange(pageNumber);
    }
  }, [onPageChange]);

  // Handle zoom change events
  const handleZoomChange = useCallback((zoomValue: number) => {
    if (onZoomChange) {
      onZoomChange(zoomValue);
    }
  }, [onZoomChange]);

  // Render appropriate viewer based on file type
  const renderViewer = () => {
    if (isLoading && !filePath) {
      return <Skeleton className="h-[842px] w-[595px]" />;
    }

    if (error) {
      return (
        <div className="h-[842px] w-[595px] bg-muted rounded-md flex items-center justify-center shadow-md">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Document</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      );
    }

    // Based on file type, use the appropriate viewer
    switch (fileType) {
      case FileType.PDF:
        return (
          <PDFViewer
            filePath={filePath}
            currentPage={currentPage}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleError}
            scrollMode={scrollMode}
            onPageChange={handlePageChange}
            activeTool={activeTool || undefined}
            onZoomChange={handleZoomChange}
            selectedMarkerColor={selectedMarkerColor}
            selectedDrawingColor={selectedDrawingColor}
            drawingLineWidth={drawingLineWidth}
          />
        );
      case FileType.UNKNOWN:
      default:
        // Only show the fallback PDF for unknown files
        return (
          <div className="h-[842px] w-[595px] bg-muted rounded-md flex items-center justify-center shadow-md">
            <div className="text-center p-4">
              <h3 className="text-lg font-semibold mb-2">Unsupported File Type</h3>
              <p className="text-muted-foreground">The file type could not be determined or is not supported.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderViewer()}
      
      {/* Loading Modal - only shown when initially loading a file */}
      <LoadingModal 
        isOpen={showLoadingModal}
        message={`Loading document...`}
        fullScreen={false}
      />
    </>
  );
});

DocumentViewer.displayName = 'DocumentViewer';

export default DocumentViewer; 