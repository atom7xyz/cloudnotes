import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  ArrowUp, 
  ArrowDown,
  Text,
  Clock,
  X
} from 'lucide-react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface DocumentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (query: string, direction: 'forward' | 'backward') => void;
  onFindAll?: (query: string) => void;
  recentSearches?: string[];
  saveRecentSearch?: (query: string) => void;
}

const DocumentSearchModal = ({
  isOpen,
  onClose,
  onFind,
  onFindAll,
  recentSearches = [],
  saveRecentSearch
}: DocumentSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        if (e.shiftKey) {
          handleFindPrevious();
        } else {
          handleFindNext();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [searchQuery, onClose]);

  // Handle search in the forward direction
  const handleFindNext = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    onFind(searchQuery, 'forward');
    
    if (saveRecentSearch) {
      saveRecentSearch(searchQuery);
    }
    
    // Simulate loading state (remove in actual implementation)
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [searchQuery, onFind, saveRecentSearch]);

  // Handle search in the backward direction
  const handleFindPrevious = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    onFind(searchQuery, 'backward');
    
    if (saveRecentSearch) {
      saveRecentSearch(searchQuery);
    }
    
    // Simulate loading state (remove in actual implementation)
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [searchQuery, onFind, saveRecentSearch]);

  // Handle find all occurrences
  const handleFindAll = useCallback(() => {
    if (!searchQuery.trim() || !onFindAll) return;
    
    setIsLoading(true);
    onFindAll(searchQuery);
    
    if (saveRecentSearch) {
      saveRecentSearch(searchQuery);
    }
    
    // Simulate loading state (remove in actual implementation)
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [searchQuery, onFindAll, saveRecentSearch]);

  // Load a recent search into the search input
  const handleRecentSearchClick = useCallback((recentSearch: string) => {
    setSearchQuery(recentSearch);
    // Focus the input after setting the query
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  // Clear the search input
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    inputRef.current?.focus();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          <span>Find in Document</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4">Search for text within the current document</p>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Text className="h-4 w-4" />
          </div>
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
            placeholder="Search text..."
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleFindPrevious}
            disabled={!searchQuery.trim() || isLoading}
            className="flex-1 gap-1"
          >
            <ArrowUp className="h-4 w-4" />
            Previous
            <Badge variant="outline" className="ml-auto text-xs">
              Shift+Enter
            </Badge>
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleFindNext}
            disabled={!searchQuery.trim() || isLoading}
            className="flex-1 gap-1"
          >
            <ArrowDown className="h-4 w-4" />
            Next
            <Badge variant="outline" className="ml-auto text-xs">
              Enter
            </Badge>
          </Button>
        </div>

        {onFindAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFindAll}
            disabled={!searchQuery.trim() || isLoading}
            className="w-full mt-2"
          >
            Highlight All Matches
          </Button>
        )}

        {recentSearches.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term, index) => (
                <button
                  key={`${term}-${index}`}
                  onClick={() => handleRecentSearchClick(term)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full bg-muted hover:bg-muted/80 transition-colors",
                    "flex items-center gap-1 max-w-full truncate"
                  )}
                >
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentSearchModal; 