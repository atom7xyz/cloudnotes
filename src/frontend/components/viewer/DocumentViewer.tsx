import React, { useState, useEffect, useCallback, memo } from 'react';
import { useZoom } from '@/lib/contexts/ZoomContext';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingModal from '@/components/modals/LoadingModal';

// Import the PDFViewer
import PDFViewer, { ScrollMode } from './PDFViewer';

// Define file type enum 
export enum FileType {
  PDF = 'pdf',
  TXT = 'txt',
  UNKNOWN = 'unknown'
}

// Map of default files for each file type
export const DEFAULT_FILES = {
  [FileType.PDF]: '/assets/files/sample.pdf',
  [FileType.TXT]: '/assets/files/sample.txt',
  [FileType.UNKNOWN]: '/assets/files/sample.pdf',
};

// Props interface for DocumentViewer
interface DocumentViewerProps {
  filePath: string; // Path to the file (can be a local or remote URL)
  onLoadSuccess?: (numPages?: number) => void;
  onLoadError?: (error: Error) => void;
  currentPage?: number; // For multi-page documents
  onTextSearch?: (searchTerm: string) => void;
  scrollMode?: ScrollMode; // Add scrollMode prop
  onPageChange?: (pageNumber: number) => void; // Add page change callback
}

// Helper function to determine file type from path
export const getFileType = (filePath: string): FileType => {
  if (!filePath) return FileType.UNKNOWN;
  
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return FileType.PDF;
    case 'txt':
      return FileType.TXT;
    default:
      return FileType.UNKNOWN;
  }
};

// Main DocumentViewer component
const DocumentViewer: React.FC<DocumentViewerProps> = memo(({
  filePath,
  onLoadSuccess,
  onLoadError,
  currentPage = 1,
  onTextSearch,
  scrollMode = ScrollMode.VERTICAL,
  onPageChange
}) => {
  const { zoomLevel } = useZoom();
  const [fileType, setFileType] = useState<FileType>(FileType.UNKNOWN);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [numPages, setNumPages] = useState<number>(1);
  const [previousFilePath, setPreviousFilePath] = useState<string>('');
  
  // Detect file type based on path
  useEffect(() => {
    if (filePath) {
      setFileType(getFileType(filePath));
      
      // Only show loading and reset state when file path changes
      if (filePath !== previousFilePath) {
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

  // Handle page change events from PDFViewer
  const handlePageChange = useCallback((pageNumber: number) => {
    if (onPageChange) {
      onPageChange(pageNumber);
    }
  }, [onPageChange]);

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
          />
        );
      case FileType.TXT:
      case FileType.UNKNOWN:
      default:
        // For text files or unknown types, fallback to a simple viewer or PDF viewer
        return (
          <PDFViewer
            filePath={DEFAULT_FILES[FileType.PDF]}
            currentPage={currentPage}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleError}
            scrollMode={scrollMode}
            onPageChange={handlePageChange}
          />
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