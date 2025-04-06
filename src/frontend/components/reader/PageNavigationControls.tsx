import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageNavigationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  inDocumentView?: boolean; // Flag to indicate if the control is within document view
}

const PageNavigationControls: React.FC<PageNavigationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  inDocumentView = false,
}) => {
  // Track mouse idle time for visibility control
  const [mouseIdleTime, setMouseIdleTime] = useState(0);
  const mouseActivityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedPageChangeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate visibility based on mouse idle time
  const pageControlsVisible = mouseIdleTime < 4;
  
  // Debounce the page change to improve performance
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    
    // Clear any existing timeout
    if (debouncedPageChangeRef.current) {
      clearTimeout(debouncedPageChangeRef.current);
    }
    
    // Set a new timeout to handle the page change
    debouncedPageChangeRef.current = setTimeout(() => {
      onPageChange(newPage);
    }, 50); // Small delay to debounce rapid changes
  }, [currentPage, totalPages, onPageChange]);
  
  // Handle input change with debouncing
  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    
    if (debouncedPageChangeRef.current) {
      clearTimeout(debouncedPageChangeRef.current);
    }
    
    debouncedPageChangeRef.current = setTimeout(() => {
      if (value >= 1 && value <= totalPages) {
        onPageChange(value);
      }
    }, 300); // Longer delay for input changes
  }, [totalPages, onPageChange]);
  
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
      if (debouncedPageChangeRef.current) {
        clearTimeout(debouncedPageChangeRef.current);
      }
      window.removeEventListener('mousemove', handleMouseActivity);
      window.removeEventListener('mousedown', handleMouseActivity);
    };
  }, []);

  // Always use fixed position for consistent bottom positioning
  return (
    <div 
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 ${
        pageControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="cursor-pointer h-8 w-8"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center px-2">
          <Input 
            type="number" 
            value={currentPage} 
            onChange={handlePageInputChange}
            className="w-20 text-center appearance-none text-sm h-8 bg-transparent"
            min={1}
            max={totalPages}
            style={{ 
              MozAppearance: 'textfield',
              WebkitAppearance: 'none',
              margin: 0
            }}
          />
          <span className="mx-1 text-muted-foreground text-sm whitespace-nowrap">of {totalPages}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="cursor-pointer h-8 w-8"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PageNavigationControls; 