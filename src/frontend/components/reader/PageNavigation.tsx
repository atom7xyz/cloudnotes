import React, { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageNavigationProps {
  pageNumber: number;
  numPages: number | null;
  onPageChange: (pageNumber: number, manual: boolean) => void;
  isVisible: boolean;
  isNotesOpen: boolean;
}

/**
 * PageNavigation component handles user navigation through PDF pages.
 * 
 * @param manual - When true, indicates user explicitly requested page change (via buttons or input)
 *                 which should trigger scrolling to that page.
 *               - When false, indicates automatic page update from scrolling with no additional actions needed.
 */
const PageNavigation = memo(({ pageNumber, numPages, onPageChange, isVisible, isNotesOpen }: PageNavigationProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [inputValue, setInputValue] = useState<string>(pageNumber.toString());
  
  // Update the input value when pageNumber changes from outside (e.g., from scrolling)
  React.useEffect(() => {
    setInputValue(pageNumber.toString());
  }, [pageNumber]);
  
  // Handle input field changes - just update the field without navigating
  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);
  
  // Process page input and navigate if valid
  const processPageInput = useCallback(() => {
    const newPage = Number.parseInt(inputValue) || pageNumber;
    const maxPage = numPages || 1;
    
    if (newPage >= 1 && newPage <= maxPage && newPage !== pageNumber) {
      // Manual navigation - user explicitly requested this page
      // This will trigger scrolling to the page
      onPageChange(newPage, true);
    } else {
      // Invalid input - reset to current page
      setInputValue(pageNumber.toString());
    }
  }, [inputValue, numPages, onPageChange, pageNumber]);
  
  // Handle input field blur - process the input
  const handlePageInputBlur = useCallback(() => {
    processPageInput();
  }, [processPageInput]);
  
  // Handle keyboard events in the input field
  const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      processPageInput();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue(pageNumber.toString());
      e.currentTarget.blur();
    }
  }, [processPageInput, pageNumber]);

  // Navigate to the previous page - manual navigation
  const handlePrevPage = useCallback(() => {
    if (pageNumber > 1) {
      // Ensure manual flag is set to true to trigger scrolling
      onPageChange(pageNumber - 1, true);
      
      // Directly dispatch an event to the PDF container using document querySelector
      // This ensures it works regardless of the scroll mode or view state
      setTimeout(() => {
        const pdfContainer = document.querySelector('.pdf-container');
        if (pdfContainer) {
          pdfContainer.dispatchEvent(
            new CustomEvent('direct-navigate', { 
              detail: { pageNumber: pageNumber - 1 } 
            })
          );
        }
      }, 10); // Small timeout to ensure event handling is ready
    }
  }, [pageNumber, onPageChange]);

  // Navigate to the next page - manual navigation
  const handleNextPage = useCallback(() => {
    if (pageNumber < (numPages || 1)) {
      // Ensure manual flag is set to true to trigger scrolling
      onPageChange(pageNumber + 1, true);
      
      // Directly dispatch an event to the PDF container using document querySelector
      // This ensures it works regardless of the scroll mode or view state
      setTimeout(() => {
        const pdfContainer = document.querySelector('.pdf-container');
        if (pdfContainer) {
          pdfContainer.dispatchEvent(
            new CustomEvent('direct-navigate', { 
              detail: { pageNumber: pageNumber + 1 } 
            })
          );
        }
      }, 10); // Small timeout to ensure event handling is ready
    }
  }, [pageNumber, numPages, onPageChange]);

  // Position the navigation controls based on notes panel state
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
                className="h-8 w-8 rounded-full hover-primary-effect transition-colors"
                aria-label="Previous page"
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
              type="text" 
              value={inputValue} 
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              className="w-20 text-center appearance-none text-sm h-8 bg-transparent border rounded px-2"
              aria-label="Current page number"
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
                className="h-8 w-8 rounded-full hover-primary-effect transition-colors"
                aria-label="Next page"
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

export default PageNavigation; 