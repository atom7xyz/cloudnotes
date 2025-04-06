import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileReaderTopNavbar from './FileReaderTopNavbar';
import NoteBar from './NoteBar';
import PageNavigationControls from './PageNavigationControls';
import DocumentViewer, { FileType } from '@/components/viewer/DocumentViewer';
import { useZoom } from '@/lib/contexts/ZoomContext';
import { useTabs } from '@/lib/contexts/TabsContext';
import { DEFAULT_FILES } from '@/components/viewer/DocumentViewer';

// Define a type that works for both DocToolbar and NoteBar
type ToolType = 'text' | 'highlight' | 'draw' | 'drag';

const FileReader: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { zoomLevel, setZoomLevel } = useZoom();
  const { openTabs, getTabById, openTab } = useTabs();
  
  // Get current tab info
  const currentTab = useMemo(() => {
    return fileId ? getTabById(fileId) : null;
  }, [fileId, getTabById]);
  
  // State for document viewer
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTool, setCurrentTool] = useState<ToolType>('text');
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  
  // Redirect if file doesn't exist
  React.useEffect(() => {
    if (fileId && !currentTab) {
      // If the tab doesn't exist, redirect to home
      navigate('/');
    }
  }, [fileId, currentTab, navigate]);
  
  // Handle document load
  const handleDocumentLoad = useCallback((numPages?: number) => {
    if (numPages) {
      setTotalPages(numPages);
    }
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  // Handle zoom change
  const handleZoomChange = useCallback((value: number[]) => {
    if (value.length > 0) {
      setZoomLevel(value[0]);
    }
  }, [setZoomLevel]);
  
  // Handle note bar toggle
  const toggleNotes = useCallback(() => {
    setIsNotesOpen(prev => !prev);
  }, []);
  
  // Determine file path from current tab or use default
  const filePath = useMemo(() => {
    return currentTab?.path || DEFAULT_FILES[FileType.PDF];
  }, [currentTab]);
  
  // Handle tool change - works for both components
  const handleToolChange = useCallback((tool: ToolType) => {
    setCurrentTool(tool);
  }, []);
  
  if (!fileId) {
    return <div>No file selected</div>;
  }
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <FileReaderTopNavbar 
        zoomLevel={zoomLevel} 
        onZoomChange={handleZoomChange}
        isNotesOpen={isNotesOpen}
        onToggleNotes={toggleNotes}
      />
      
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden relative">
          <DocumentViewer 
            filePath={filePath}
            onLoadSuccess={handleDocumentLoad}
            currentPage={currentPage}
          />
          
          {/* Page navigation controls */}
          <PageNavigationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        
        {isNotesOpen && (
          <NoteBar
            currentPage={currentPage}
            totalPages={totalPages}
            currentTool={currentTool}
            setCurrentTool={handleToolChange}
          />
        )}
      </div>
    </div>
  );
};

export default FileReader; 