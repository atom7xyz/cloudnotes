import React, { useState, type CSSProperties, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  MinusIcon, 
  SquareIcon,
  MaximizeIcon, 
  XIcon,
  NotebookText,
  FileIcon,
  ScrollText,
  MoveHorizontal,
  MonitorSmartphone,
  ChevronLeft,
  ChevronRight,
  X,
  FolderOpenIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getElectronAPI } from '@/lib/navigation';
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TabSwitcherModal, { type FileTab } from '@/components/modals/TabSwitcherModal';
import { useTabs } from '@/lib/contexts/TabsContext';
import { cn } from '@/lib/utils';
import { ScrollMode } from '@/components/viewer/PDFViewer';
import { useDebounce } from '../../lib/hooks/useDebounce';
import FileBrowserModal from '@/components/modals/FileBrowserModal';

// Custom CSS properties for Electron window drag regions
interface ElectronCSSProperties extends CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

// Define special zoom types for adaptive zooming
export type ZoomValue = number | 'fit' | 'width';

interface FileReaderTopNavbarProps {
  zoomLevel: number;
  onZoomChange: (value: number) => void;
  onGoBack?: () => void;
  onFindText?: (text: string, direction?: 'forward' | 'backward') => void;
  isNotesOpen?: boolean;
  onToggleNotes?: () => void;
  scrollMode?: ScrollMode;
  onScrollModeChange?: (mode: ScrollMode) => void;
  isLoading?: boolean;
  searchMetadata?: { totalMatches: number; currentMatch: number; };
}

// Memoized CSS style objects for better performance
const dragRegion: ElectronCSSProperties = { WebkitAppRegion: 'drag' };
const noDragRegion: ElectronCSSProperties = { WebkitAppRegion: 'no-drag' };

// Navigation Button component for reuse
interface NavButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

const NavButton: React.FC<NavButtonProps> = memo(({
  icon,
  title,
  onClick,
  disabled = false,
  active = false
}) => (
  <Button 
    variant={active ? "secondary" : "ghost"}
    size="icon"
    className={cn(
      "h-8 w-8 rounded-full transition-all duration-200",
      disabled 
        ? "opacity-50 cursor-default" 
        : active
          ? "active-primary-effect"
          : "hover-primary-effect"
    )}
    title={title}
    disabled={disabled}
    onClick={onClick}
  >
    {icon}
  </Button>
));

NavButton.displayName = 'NavButton';

// Zoom Control with Dropdown menu
const ZoomControl = memo(({ 
  zoomLevel, 
  onZoomChange 
}: { 
  zoomLevel: number;
  onZoomChange: (value: number) => void;
}) => {
  // Predefined zoom levels
  const zoomLevels = [
    { label: 'Actual size', value: 100, id: 'zoom-actual' },
    { label: 'Page fit', value: 'fit', id: 'zoom-fit' },
    { label: 'Page width', value: 'width', id: 'zoom-width' },
    { label: '50%', value: 50, id: 'zoom-50' },
    { label: '75%', value: 75, id: 'zoom-75' },
    { label: '100%', value: 100, id: 'zoom-100' },
    { label: '125%', value: 125, id: 'zoom-125' },
    { label: '150%', value: 150, id: 'zoom-150' },
    { label: '200%', value: 200, id: 'zoom-200' },
    { label: '300%', value: 300, id: 'zoom-300' },
    { label: '400%', value: 400, id: 'zoom-400' },
  ];

  // Handle zoom level selection
  const handleZoomSelect = useCallback((value: number | string) => {
    if (typeof value === 'number') {
      onZoomChange(value);
    }
    
    if (value === 'fit') {
      onZoomChange(125);
    }
    
    if (value === 'width') {
      onZoomChange(310);
    }
  }, [onZoomChange]);

  // Handle zoom in button click
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(400, zoomLevel + 25);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);
  
  // Handle zoom out button click
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(25, zoomLevel - 25);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  // Get display label for the current zoom level
  const currentZoomLabel = useMemo(() => {
    return `${zoomLevel}%`;
  }, [zoomLevel]);

  return (
    <div className="flex items-center gap-1" style={noDragRegion}>
      <NavButton
        icon={<ZoomOut className="h-4 w-4" />}
        title="Zoom out"
        onClick={handleZoomOut}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 flex items-center gap-1 text-xs font-medium hover-primary-effect"
          >
            {currentZoomLabel}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-32">
          {zoomLevels.map((level) => (
            <React.Fragment key={level.id}>
              {(level.id === 'zoom-actual' || level.id === 'zoom-50') && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem 
                className={cn(
                  "flex justify-between hover-primary-effect",
                  (typeof level.value === 'number' && level.value === zoomLevel) || 
                  (level.value === 'fit' && zoomLevel === -1) ||
                  (level.value === 'width' && zoomLevel === -2)
                    ? "active-primary-effect" 
                    : ""
                )}
                onClick={() => handleZoomSelect(level.value)}
              >
                <span>{level.label}</span>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <NavButton
        icon={<ZoomIn className="h-4 w-4" />}
        title="Zoom in"
        onClick={handleZoomIn}
      />
    </div>
  );
});

ZoomControl.displayName = 'ZoomControl';

// Memoized WindowControls component
const WindowControls = memo(({ 
  isMaximized,
  onMinimize,
  onMaximize, 
  onClose
}: { 
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="flex items-center h-full w-[150px]">
      <Button 
        onClick={onMinimize}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover-primary-effect" style={noDragRegion}
        title="Minimize"
      >
        <MinusIcon size={16} />
      </Button>
      
      <Button 
        onClick={onMaximize}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover-primary-effect" style={noDragRegion}
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <SquareIcon size={16} /> : <MaximizeIcon size={16} />}
      </Button>
      
      <Button 
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover:bg-destructive hover:text-white transition-all duration-200" style={noDragRegion}
        title="Close"
      >
        <XIcon size={16} />
      </Button>
    </div>
  );
});

WindowControls.displayName = 'WindowControls';

// Memoized DropdownItem component to prevent re-renders
const DropdownTabItem = memo(({ 
  tab, 
  isActive, 
  onSelect, 
  onClose 
}: { 
  tab: FileTab; 
  isActive: boolean; 
  onSelect: (id: string) => void; 
  onClose: (id: string) => void; 
}) => {
  const handleSelect = useCallback(() => {
    onSelect(tab.id);
  }, [tab.id, onSelect]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(tab.id);
  }, [tab.id, onClose]);

  return (
    <DropdownMenuItem
      key={tab.id}
      className={`flex gap-2 items-center py-2 hover-primary-effect ${
        isActive ? 'active-primary-effect' : ''
      }`}
      onSelect={(e) => {
        // Prevent the default behavior to avoid closing the dropdown immediately
        e.preventDefault();
        handleSelect();
      }}
    >
      <button
        type="button"
        className="flex-1 flex items-center text-left" 
        onClick={handleSelect}
      >
        <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="flex-1 truncate">{tab.name}</span>
      </button>
      <button
        type="button"
        className="opacity-50 hover:opacity-100"
        onClick={handleClose}
        title="Close"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </DropdownMenuItem>
  );
});

DropdownTabItem.displayName = 'DropdownTabItem';

// Memoized ScrollModeSelector component
const ScrollModeSelector = memo(({
  currentMode,
  onChange,
}: {
  currentMode: ScrollMode;
  onChange: (mode: ScrollMode) => void;
}) => {
  return (
    <div className="flex items-center gap-2" style={noDragRegion}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 rounded-full hover-primary-effect">
            {currentMode === ScrollMode.PAGE && <MonitorSmartphone className="h-4 w-4" />}
            {currentMode === ScrollMode.VERTICAL && <ScrollText className="h-4 w-4" />}
            {currentMode === ScrollMode.HORIZONTAL && <MoveHorizontal className="h-4 w-4" />}
            <span className="text-xs">View Mode</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Page View Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className={`flex gap-2 hover-primary-effect items-center ${currentMode === ScrollMode.PAGE ? 'active-primary-effect' : ''}`}
            onClick={() => onChange(ScrollMode.PAGE)}
          >
            <MonitorSmartphone className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Page Scrolling</span>
              <span className="text-xs text-muted-foreground">Show one page at a time</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className={`flex gap-2 hover-primary-effect items-center ${currentMode === ScrollMode.VERTICAL ? 'active-primary-effect' : ''}`}
            onClick={() => onChange(ScrollMode.VERTICAL)}
          >
            <ScrollText className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Vertical Scrolling</span>
              <span className="text-xs text-muted-foreground">Show all pages in a column</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className={`flex gap-2 hover-primary-effect items-center ${currentMode === ScrollMode.HORIZONTAL ? 'active-primary-effect' : ''}`}
            onClick={() => onChange(ScrollMode.HORIZONTAL)}
          >
            <MoveHorizontal className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Wrapped Scrolling</span>
              <span className="text-xs text-muted-foreground">Show pages in a wrapped layout</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

ScrollModeSelector.displayName = 'ScrollModeSelector';

// Memoized RecentFilesDropdown component
const RecentFilesDropdown = memo(({ isLoading }: { isLoading?: boolean }) => {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useTabs();
  const [isOpen, setIsOpen] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  
  // Close dropdown when loading
  useEffect(() => {
    if (isLoading && isOpen) {
      setIsOpen(false);
    }
  }, [isLoading, isOpen]);
  
  // Get the tabs sorted by most recently opened
  const sortedTabs = useMemo(() => {
    return [...openTabs].sort((a, b) => 
      b.lastOpened.getTime() - a.lastOpened.getTime()
    );
  }, [openTabs]);
  
  // Memoize the handlers to prevent recreating functions
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  }, [setActiveTab]);
  
  const handleTabClose = useCallback((tabId: string) => {
    closeTab(tabId);
  }, [closeTab]);

  // Handle opening a file from the system
  const handleOpenFile = useCallback(() => {
    setIsOpen(false);
    const api = getElectronAPI();
    if (api?.openFile) {
      api.openFile();
    } else {
      // Fallback for web environment
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx,.epub';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement)?.files?.[0];
        if (file) {
          // Handle file opening in web context
          console.log('Selected file:', file.name);
        }
      };
      input.click();
    }
  }, []);

  // Handle browsing all files
  const handleBrowseAllFiles = useCallback(() => {
    setIsOpen(false);
    setIsFileBrowserOpen(true);
  }, []);
  
  return (
    <>
      <div className="ml-2" style={noDragRegion}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild disabled={isLoading}>
            <Button variant="outline" size="sm" className={`gap-1 rounded-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} hover-primary-effect`}>
              <NotebookText className="h-4 w-4" />
              <span>Your cloudnotes</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Open Files</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {sortedTabs.length === 0 ? (
              <div className="py-2 px-2 text-sm text-muted-foreground">
                No files open
              </div>
            ) : (
              sortedTabs.map(tab => (
                <DropdownTabItem
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId}
                  onSelect={handleTabSelect}
                  onClose={handleTabClose}
                />
              ))
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="hover-primary-effect"
              onSelect={(e) => {
                e.preventDefault();
                handleBrowseAllFiles();
              }}>
              <FolderOpenIcon size={16} className="text-blue-500 mr-2" />
              <span>Browse All Files</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* FileBrowser Modal */}
      <FileBrowserModal 
        isOpen={isFileBrowserOpen}
        onClose={() => setIsFileBrowserOpen(false)}
      />
    </>
  );
});

RecentFilesDropdown.displayName = 'RecentFilesDropdown';

const FileReaderTopNavbar = memo(({
  zoomLevel,
  onZoomChange,
  onGoBack,
  onFindText,
  isNotesOpen = false,
  onToggleNotes,
  scrollMode = ScrollMode.PAGE,
  onScrollModeChange,
  isLoading = false,
  searchMetadata = { totalMatches: 0, currentMatch: 0 }
}: FileReaderTopNavbarProps) => {
  const navigate = useNavigate();
  const { openTabs, activeTabId, setActiveTab } = useTabs();
  
  // All state hooks at the top level
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Create a debounced version of the search query with 250ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  
  // Reference to the search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Set up event listeners for window state
  useEffect(() => {
    const api = getElectronAPI();
    if (!api) return;

    // Set up listeners for window maximize state changes
    const unsubscribeMaximize = api.onMaximizeChange?.(
      (isMaximized) => {
        setIsMaximized(isMaximized);
      }
    );

    // Clean up listeners on component unmount
    return () => {
      unsubscribeMaximize?.();
    };
  }, []);

  // Set up keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchActive(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else if (e.key === 'Escape' && isSearchActive) {
        e.preventDefault();
        handleCloseSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchActive]);
  
  // Set up keyboard shortcut for tab switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Tab to open tab switcher
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        setIsTabSwitcherOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Use the debounced search query to trigger searches
  useEffect(() => {
    if (onFindText && typeof onFindText === 'function') {
      if (debouncedSearchQuery.trim().length > 0) {
        onFindText(debouncedSearchQuery, 'forward');
      } else if (isSearchActive) {
        // Clear search results when the field is empty
        onFindText('', 'forward');
      }
    }
  }, [debouncedSearchQuery, onFindText, isSearchActive]);
  
  // All event handlers with useCallback
  const handleGoBack = useCallback(() => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1); // Default behavior: go back in history
    }
  }, [navigate, onGoBack]);
  
  // Window control handlers
  const handleMinimize = useCallback(() => {
    const api = getElectronAPI();
    api?.minimize();
  }, []);

  const handleMaximize = useCallback(() => {
    const api = getElectronAPI();
    api?.maximize();
  }, []);

  const handleClose = useCallback(() => {
    const api = getElectronAPI();
    api?.close();
  }, []);
  
  // Search handlers
  const handleSearchClick = useCallback(() => {
    setIsSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, []);
  
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
    setIsSearchActive(true);
  }, []);
  
  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
    // Don't close search on blur to allow clicking navigation buttons
  }, []);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // The actual search will now be triggered by the useEffect with debouncedSearchQuery
  }, []);
  
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      const timestamp = Date.now();
      console.log(`[${timestamp}] Search enter key pressed`);
      
      if (!onFindText) return;
      
      if (searchMetadata?.totalMatches > 0) {
        // If we already have search results, navigate to the next match
        console.log(`[${timestamp}] Navigating to next match of existing search`);
        onFindText(searchQuery.trim(), 'forward');
      } else {
        // Otherwise perform the initial search
        console.log(`[${timestamp}] Performing initial search for: ${searchQuery}`);
        onFindText(searchQuery.trim());
      }
    }
  }, [onFindText, searchQuery, searchMetadata?.totalMatches]);
  
  const handleCloseSearch = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    
    // Clear search results by calling onFindText with empty string
    // Make sure to explicitly call this to clear all highlights
    if (onFindText && typeof onFindText === 'function') {
      onFindText('', 'forward');
    }
  }, [onFindText]);
  
  // Search navigation handlers
  const handlePrevResult = useCallback(() => {
    if (!onFindText) return;
    
    const timestamp = Date.now();
    console.log(`[${timestamp}] Navigate to previous search result`);
    onFindText(searchQuery.trim(), 'backward');
  }, [onFindText, searchQuery]);
  
  const handleNextResult = useCallback(() => {
    if (!onFindText) return;
    
    const timestamp = Date.now();
    console.log(`[${timestamp}] Navigate to next search result`);
    onFindText(searchQuery.trim(), 'forward');
  }, [onFindText, searchQuery]);
  
  // Handle scroll mode change
  const handleScrollModeChange = useCallback((mode: ScrollMode) => {
    if (onScrollModeChange) {
      onScrollModeChange(mode);
    }
  }, [onScrollModeChange]);
  
  return (
    <>
      <TooltipProvider>
        <header className="flex h-12 bg-sidebar text-sidebar-foreground items-center justify-between select-none" style={dragRegion}>
          {/* Left section - Back button, cloudnotes dropdown */}
          <div className="flex items-center pl-4" style={dragRegion}>
            <NavButton
              icon={<ArrowLeftIcon className="h-5 w-5" style={noDragRegion}/>}
              title="Go back"
              onClick={handleGoBack}
            />
            
            <RecentFilesDropdown isLoading={isLoading} />
          </div>

          {/* Middle section - Edit buttons, Search, View controls, and Zoom */}
          <div className="flex-1 flex items-center justify-center space-x-3" style={dragRegion}>
            {/* Search bar with expanded functionality when active */}
            <div 
              className={cn(
                "relative transition-all duration-200 flex items-center",
                isSearchActive ? "w-2/5 max-w-md" : "w-1/4 max-w-xs"
              )} 
              onClick={!isSearchActive ? handleSearchClick : undefined}
              onKeyDown={!isSearchActive ? (e) => {
                // Trigger click on Enter or Space
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSearchClick();
                }
              } : undefined}
              role={!isSearchActive ? "button" : undefined}
              tabIndex={!isSearchActive ? 0 : undefined}
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/70">
                <Search className="h-4 w-4" />
              </div>
              <Input
                ref={searchInputRef}
                id="document-search"
                placeholder={isSearchActive ? "Search..." : "Find in document..."}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={cn(
                  "h-8 w-full rounded-full py-1.5 pl-10 pr-10 text-sm transition-all duration-200",
                  searchFocused ? "ring-2 ring-sidebar-ring border-sidebar-ring" : "border-muted-foreground/40",
                  "placeholder-sidebar-foreground/60 hover-primary-effect"
                )}
                style={noDragRegion}
                readOnly={!isSearchActive}
              />
              
              {isSearchActive ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <>
                      <div className="text-xs text-muted-foreground mr-1">
                        {searchMetadata.totalMatches > 0 
                          ? `${searchMetadata.currentMatch} of ${searchMetadata.totalMatches}` 
                          : "No results"}
                      </div>
                      <div className="search-navigation flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={handlePrevResult}
                          disabled={searchMetadata.totalMatches === 0 || searchMetadata.currentMatch === 1}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={handleNextResult}
                          disabled={searchMetadata.totalMatches === 0 || searchMetadata.currentMatch === searchMetadata.totalMatches}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover-primary-effect"
                    onClick={handleCloseSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Badge variant="secondary" className="text-[10px] bg-muted border-0 shadow-none">Ctrl+F</Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <ScrollModeSelector 
                currentMode={scrollMode}
                onChange={handleScrollModeChange}
              />
            </div>
            
            <div className="flex items-center">
              <ZoomControl 
                zoomLevel={zoomLevel}
                onZoomChange={onZoomChange}
              />
            </div>
          </div>

          {/* Right section - Window controls */}
          <WindowControls 
            isMaximized={isMaximized}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            onClose={handleClose}
          />
        </header>
      </TooltipProvider>
      
      {/* Tab Switcher Modal */}
      <TabSwitcherModal
        isOpen={isTabSwitcherOpen}
        onClose={() => setIsTabSwitcherOpen(false)}
        tabs={openTabs}
        activeTabId={activeTabId || ''}
        onSelectTab={setActiveTab}
      />
    </>
  );
});

FileReaderTopNavbar.displayName = 'FileReaderTopNavbar';

export default FileReaderTopNavbar; 