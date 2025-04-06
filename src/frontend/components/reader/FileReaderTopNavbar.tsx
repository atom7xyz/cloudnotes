import React, { useState, CSSProperties, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  Search,
  Undo2,
  Redo2,
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
  MonitorSmartphone
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
import DocumentSearchModal from '@/components/modals/DocumentSearchModal';
import TabSwitcherModal, { FileTab } from '@/components/modals/TabSwitcherModal';
import { useTabs } from '@/lib/contexts/TabsContext';
import { cn } from '@/lib/utils';
import { ScrollMode } from '@/components/viewer/PDFViewer';

// Custom CSS properties for Electron window drag regions
interface ElectronCSSProperties extends CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

interface FileReaderTopNavbarProps {
  zoomLevel: number;
  onZoomChange: (value: number[]) => void;
  onGoBack?: () => void;
  onFindText?: (text: string, direction: 'forward' | 'backward') => void;
  onFindAllText?: (text: string) => void;
  isNotesOpen?: boolean;
  onToggleNotes?: () => void;
  scrollMode?: ScrollMode;
  onScrollModeChange?: (mode: ScrollMode) => void;
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
          ? "bg-primary/20 text-primary hover:bg-primary/30" 
          : "hover:bg-primary/10 hover:text-primary"
    )}
    title={title}
    disabled={disabled}
    onClick={onClick}
  >
    {icon}
  </Button>
));

NavButton.displayName = 'NavButton';

// Compact Zoom Control component
const CompactZoomControl = memo(({ 
  zoomLevel, 
  onZoomOut, 
  onZoomIn 
}: { 
  zoomLevel: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
}) => {
  return (
    <div className="flex items-center gap-1">
      <NavButton
        icon={<ZoomOut className="h-4 w-4" />}
        title="Zoom out"
        onClick={onZoomOut}
      />
      
      <Badge variant="outline" className="text-xs font-medium h-6 px-2 py-0 flex items-center">
        {zoomLevel}%
      </Badge>
      
      <NavButton
        icon={<ZoomIn className="h-4 w-4" />}
        title="Zoom in"
        onClick={onZoomIn}
      />
    </div>
  );
});

CompactZoomControl.displayName = 'CompactZoomControl';

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
    <div className="flex items-center h-full w-[150px]" style={noDragRegion}>
      <Button 
        onClick={onMinimize}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover:bg-primary/10 hover:text-primary transition-all duration-200"
        title="Minimize"
      >
        <MinusIcon size={16} />
      </Button>
      
      <Button 
        onClick={onMaximize}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover:bg-primary/10 hover:text-primary transition-all duration-200" 
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? <SquareIcon size={16} /> : <MaximizeIcon size={16} />}
      </Button>
      
      <Button 
        onClick={onClose}
        variant="ghost"
        size="icon"
        className="h-12 w-[50px] rounded-none hover:bg-destructive hover:text-white transition-all duration-200"
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
      className={`flex gap-2 items-center py-2 ${
        isActive ? 'bg-muted' : ''
      }`}
      onSelect={(e) => {
        // Prevent the default behavior to avoid closing the dropdown immediately
        e.preventDefault();
        handleSelect();
      }}
    >
      <button
        className="flex-1 flex items-center text-left" 
        onClick={handleSelect}
      >
        <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="flex-1 truncate">{tab.name}</span>
      </button>
      <button
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
  isNotesOpen,
  onToggleNotes
}: {
  currentMode: ScrollMode;
  onChange: (mode: ScrollMode) => void;
  isNotesOpen: boolean;
  onToggleNotes: () => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 rounded-full">
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
            className={`flex gap-2 items-center ${currentMode === ScrollMode.PAGE ? 'bg-muted' : ''}`}
            onClick={() => onChange(ScrollMode.PAGE)}
          >
            <MonitorSmartphone className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Page Scrolling</span>
              <span className="text-xs text-muted-foreground">Show one page at a time</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className={`flex gap-2 items-center ${currentMode === ScrollMode.VERTICAL ? 'bg-muted' : ''}`}
            onClick={() => onChange(ScrollMode.VERTICAL)}
          >
            <ScrollText className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Vertical Scrolling</span>
              <span className="text-xs text-muted-foreground">Show all pages in a column</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className={`flex gap-2 items-center ${currentMode === ScrollMode.HORIZONTAL ? 'bg-muted' : ''}`}
            onClick={() => onChange(ScrollMode.HORIZONTAL)}
          >
            <MoveHorizontal className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Horizontal Scrolling</span>
              <span className="text-xs text-muted-foreground">Show all pages in a row</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

ScrollModeSelector.displayName = 'ScrollModeSelector';

// Memoized RecentFilesDropdown component
const RecentFilesDropdown = memo(() => {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useTabs();
  
  // Get the tabs sorted by most recently opened
  const sortedTabs = useMemo(() => {
    return [...openTabs].sort((a, b) => 
      b.lastOpened.getTime() - a.lastOpened.getTime()
    );
  }, [openTabs]);
  
  // Memoize the handlers to prevent recreating functions
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, [setActiveTab]);
  
  const handleTabClose = useCallback((tabId: string) => {
    closeTab(tabId);
  }, [closeTab]);
  
  return (
    <div className="ml-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 rounded-full">
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
          <DropdownMenuItem>
            <Button variant="ghost" size="sm" className="w-full justify-start p-0">
              Open File...
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button variant="ghost" size="sm" className="w-full justify-start p-0">
              Browse All Files
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

RecentFilesDropdown.displayName = 'RecentFilesDropdown';

const FileReaderTopNavbar = memo(({
  zoomLevel,
  onZoomChange,
  onGoBack,
  onFindText,
  onFindAllText,
  isNotesOpen = false,
  onToggleNotes = () => {},
  scrollMode = ScrollMode.VERTICAL,
  onScrollModeChange = () => {}
}: FileReaderTopNavbarProps) => {
  const navigate = useNavigate();
  const { openTabs, activeTabId, setActiveTab } = useTabs();
  
  // All state hooks at the top level
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  
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
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
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
    setIsSearchModalOpen(true);
  }, []);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);
  
  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);
  
  // Edit handlers
  const handleUndoClick = useCallback(() => {
    // Implement undo functionality
    console.log('Undo action');
  }, []);
  
  const handleRedoClick = useCallback(() => {
    // Implement redo functionality
    console.log('Redo action');
  }, []);
  
  // Toggle notes handler
  const handleToggleNotes = useCallback(() => {
    onToggleNotes();
  }, [onToggleNotes]);
  
  // Handle scroll mode change
  const handleScrollModeChange = useCallback((mode: ScrollMode) => {
    onScrollModeChange(mode);
  }, [onScrollModeChange]);
  
  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(200, zoomLevel + 10);
    onZoomChange([newZoom]);
  }, [zoomLevel, onZoomChange]);
  
  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(50, zoomLevel - 10);
    onZoomChange([newZoom]);
  }, [zoomLevel, onZoomChange]);
  
  // Search modal handlers
  const handleSaveRecentSearch = useCallback((search: string) => {
    setRecentSearches(prev => {
      if (prev.includes(search)) {
        return prev;
      }
      return [search, ...prev].slice(0, 5);
    });
  }, []);
  
  const handleCloseSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
  }, []);
  
  const handleFind = useCallback((text: string, direction: 'forward' | 'backward') => {
    if (onFindText) {
      onFindText(text, direction);
    }
  }, [onFindText]);
  
  const handleFindAll = useCallback((text: string) => {
    if (onFindAllText) {
      onFindAllText(text);
    }
  }, [onFindAllText]);
  
  return (
    <>
      <TooltipProvider>
        <header className="flex h-12 bg-sidebar text-sidebar-foreground items-center justify-between select-none" style={dragRegion}>
          {/* Left section - Back button, cloudnotes dropdown */}
          <div className="flex items-center pl-4" style={noDragRegion}>
            <NavButton
              icon={<ArrowLeftIcon className="h-5 w-5" />}
              title="Go back"
              onClick={handleGoBack}
            />
            
            <RecentFilesDropdown />
          </div>

          {/* Middle section - Edit buttons, Search, View controls, and Zoom */}
          <div className="flex-1 flex items-center justify-center space-x-3" style={noDragRegion}>
            <div className="flex items-center space-x-2">
              <NavButton
                icon={<Undo2 className="h-4 w-4" />}
                title="Undo"
                onClick={handleUndoClick}
              />
              
              <NavButton
                icon={<Redo2 className="h-4 w-4" />}
                title="Redo"
                onClick={handleRedoClick}
              />
            </div>
            
            <div className="relative w-1/4 max-w-xs" onClick={handleSearchClick}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/70">
                <Search className="h-4 w-4" />
              </div>
              <Input
                id="document-search"
                placeholder="Find in document..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onClick={handleSearchClick}
                className={cn(
                  "h-8 w-full rounded-full py-1.5 pl-10 pr-10 text-sm transition-all duration-200",
                  searchFocused ? "ring-2 ring-sidebar-ring border-sidebar-ring" : "border-muted-foreground/40",
                  "placeholder-sidebar-foreground/60 hover:border-primary/30"
                )}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Badge variant="secondary" className="text-[10px] bg-muted border-0 shadow-none">Ctrl+F</Badge>
              </div>
            </div>
            
            <div className="flex items-center">
              <ScrollModeSelector 
                currentMode={scrollMode}
                onChange={handleScrollModeChange}
                isNotesOpen={isNotesOpen}
                onToggleNotes={handleToggleNotes}
              />
            </div>
            
            <div className="flex items-center">
              <CompactZoomControl 
                zoomLevel={zoomLevel}
                onZoomOut={handleZoomOut}
                onZoomIn={handleZoomIn}
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
      
      {/* Search Modal */}
      <DocumentSearchModal 
        isOpen={isSearchModalOpen}
        onClose={handleCloseSearchModal}
        onFind={handleFind}
        onFindAll={handleFindAll}
        recentSearches={recentSearches}
        saveRecentSearch={handleSaveRecentSearch}
      />
      
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