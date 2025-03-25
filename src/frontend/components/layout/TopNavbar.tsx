import React, { useEffect, useState, CSSProperties } from 'react';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  RotateCwIcon, 
  MinusIcon, 
  SquareIcon,
  MaximizeIcon, 
  XIcon,
  SearchIcon
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Define the Electron interface for TypeScript
declare global {
  interface Window {
    electron?: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      goBack: () => void;
      goForward: () => void;
      reload: () => void;
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
      onNavigationStateChange: (callback: (canGoBack: boolean, canGoForward: boolean) => void) => () => void;
    };
  }
}

// Custom CSS properties for Electron window drag regions
interface ElectronCSSProperties extends CSSProperties {
  WebkitAppRegion?: 'drag' | 'no-drag';
}

const TopNavbar: React.FC = () => {
  // State for navigation and window controls
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true); // Default to true as we maximize on startup

  // CSS style objects
  const dragRegion: ElectronCSSProperties = { WebkitAppRegion: 'drag' };
  const noDragRegion: ElectronCSSProperties = { WebkitAppRegion: 'no-drag' };

  useEffect(() => {
    // Set up listeners for navigation state changes
    const unsubscribeNavigation = window.electron?.onNavigationStateChange?.(
      (canGoBack, canGoForward) => {
        setCanGoBack(canGoBack);
        setCanGoForward(canGoForward);
      }
    );

    // Set up listeners for window maximize state changes
    const unsubscribeMaximize = window.electron?.onMaximizeChange?.(
      (isMaximized) => {
        setIsMaximized(isMaximized);
      }
    );

    // Clean up listeners on component unmount
    return () => {
      unsubscribeNavigation?.();
      unsubscribeMaximize?.();
    };
  }, []);

  // Window control functions
  const handleMinimize = () => {
    if (window.electron) {
      window.electron.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.maximize();
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.close();
    }
  };

  // Navigation functions
  const handleGoBack = () => {
    if (window.electron && canGoBack) {
      window.electron.goBack();
    }
  };

  const handleGoForward = () => {
    if (window.electron && canGoForward) {
      window.electron.goForward();
    }
  };

  const handleReload = () => {
    if (window.electron) {
      window.electron.reload();
    }
  };

  return (
    <header className="flex h-12 bg-sidebar text-sidebar-foreground items-center justify-between select-none" style={dragRegion}>
      {/* Spacer for left side to balance window controls */}
      <div className="w-[120px]"></div>

      {/* Middle section - Navigation and Search */}
      <div className="flex items-center space-x-2 flex-1 justify-center">
        <div className="flex items-center space-x-1 mr-2" style={noDragRegion}>
          <Button 
            variant="ghost"
            size="icon"
            className={`p-1 h-8 w-8 rounded-full transition-all duration-200 ${
              canGoBack 
                ? "hover:bg-primary/10 hover:text-primary" 
                : "opacity-50 cursor-default"
            }`}
            title="Go back"
            disabled={!canGoBack}
            onClick={handleGoBack}
          >
            <ArrowLeftIcon size={16} />
          </Button>
          
          <Button 
            variant="ghost"
            size="icon"
            className={`p-1 h-8 w-8 rounded-full transition-all duration-200 ${
              canGoForward 
                ? "hover:bg-primary/10 hover:text-primary" 
                : "opacity-50 cursor-default"
            }`}
            title="Go forward"
            disabled={!canGoForward}
            onClick={handleGoForward}
          >
            <ArrowRightIcon size={16} />
          </Button>
          
          <Button 
            variant="ghost"
            size="icon"
            className="p-1 h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
            title="Reload"
            onClick={handleReload}
          >
            <RotateCwIcon size={16} />
          </Button>
        </div>
        
        <div className="relative w-2/5 max-w-md" style={noDragRegion}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/70">
            <SearchIcon size={16} />
          </div>
          <Input
            type="text"
            placeholder="Search documents..."
            className="h-8 w-full bg-sidebar-accent/30 border border-sidebar-border/50 rounded-full py-1.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sidebar-ring focus:border-sidebar-ring placeholder-sidebar-foreground/60 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right section - Window controls */}
      <div className="flex items-center h-full w-[150px]" style={noDragRegion}>
        <Button 
          onClick={handleMinimize}
          variant="ghost"
          size="icon"
          className="h-12 w-[50px] rounded-none hover:bg-primary/10 hover:text-primary transition-all duration-200"
          title="Minimize"
        >
          <MinusIcon size={16} />
        </Button>
        
        <Button 
          onClick={handleMaximize}
          variant="ghost"
          size="icon"
          className="h-12 w-[50px] rounded-none hover:bg-primary/10 hover:text-primary transition-all duration-200" 
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <SquareIcon size={16} /> : <MaximizeIcon size={16} />}
        </Button>
        
        <Button 
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="h-12 w-[50px] rounded-none hover:bg-destructive hover:text-white transition-all duration-200"
          title="Close"
        >
          <XIcon size={16} />
        </Button>
      </div>
    </header>
  );
};

export default TopNavbar; 