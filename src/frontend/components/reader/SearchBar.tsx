import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  ArrowUp, 
  ArrowDown,
  X,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (query: string, direction: 'forward' | 'backward') => void;
  recentSearches?: string[];
  saveRecentSearch?: (query: string) => void;
  searchMetadata?: { totalMatches: number; currentMatch: number; };
}

const SearchBar = ({
  isOpen,
  onClose,
  onFind,
  recentSearches = [],
  saveRecentSearch,
  searchMetadata = { totalMatches: 0, currentMatch: 0 }
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Focus the input field when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close recent searches dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-search whenever the query changes (for automatic highlighting)
  useEffect(() => {
    if (searchQuery.trim()) {
      // Add a small debounce to avoid excessive searches during typing
      const debounceTimer = setTimeout(() => {
        onFind(searchQuery, 'forward');
        
        if (saveRecentSearch) {
          saveRecentSearch(searchQuery);
        }
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, onFind, saveRecentSearch]);

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
    } else if (e.key === 'ArrowDown' && showRecentSearches && recentSearches.length > 0) {
      e.preventDefault();
      // Handle arrow navigation in recent searches
    }
  }, [searchQuery, onClose, showRecentSearches, recentSearches]);

  // Handle search in the forward direction
  const handleFindNext = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    onFind(searchQuery, 'forward');
    
    if (saveRecentSearch) {
      saveRecentSearch(searchQuery);
    }
    
    // Short loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }, [searchQuery, onFind, saveRecentSearch]);

  // Handle search in the backward direction
  const handleFindPrevious = useCallback(() => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    onFind(searchQuery, 'backward');
    
    if (saveRecentSearch) {
      saveRecentSearch(searchQuery);
    }
    
    // Short loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  }, [searchQuery, onFind, saveRecentSearch]);

  // Load a recent search into the search input
  const handleRecentSearchClick = useCallback((recentSearch: string) => {
    setSearchQuery(recentSearch);
    setShowRecentSearches(false);
    
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-16 right-8 z-50 flex flex-col"
      ref={searchBarRef}
    >
      <div className="bg-background rounded-md shadow-lg border border-border p-2 flex flex-col gap-2 w-[350px]">
        {/* Search input bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowRecentSearches(true)}
              className="pl-9 pr-8 h-9"
              placeholder="Trova nel documento..."
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Pulisci ricerca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Search metadata display */}
          {searchMetadata.totalMatches > 0 && searchQuery && (
            <div className="px-2.5 h-9 flex items-center text-xs text-muted-foreground bg-muted rounded-md">
              {searchMetadata.currentMatch} di {searchMetadata.totalMatches}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleFindPrevious}
            disabled={!searchQuery.trim() || isLoading}
            className="h-9 w-9 shrink-0"
            title="Corrispondenza precedente (Shift+Invio)"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleFindNext}
            disabled={!searchQuery.trim() || isLoading}
            className="h-9 w-9 shrink-0"
            title="Corrispondenza successiva (Invio)"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-9 w-9 shrink-0"
            title="Chiudi ricerca (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Recent searches */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="border-t pt-2 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              Ricerche recenti
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => handleRecentSearchClick(term)}
                  className="px-2 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 