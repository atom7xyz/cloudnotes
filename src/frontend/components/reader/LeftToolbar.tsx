import type React from 'react';
import { memo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Hand, 
  Highlighter, 
  StickyNote,
  Pencil,
  Eraser,
  X,
  Undo,
  Redo
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useEditHistoryContext } from '@/lib/contexts/EditHistoryContext';

// Define color palettes
const MARKER_COLORS = [
  { label: 'Yellow', value: 'rgba(255, 255, 0, 0.3)' },
  { label: 'Green', value: 'rgba(0, 255, 0, 0.3)' },
  { label: 'Blue', value: 'rgba(0, 196, 255, 0.3)' },
  { label: 'Pink', value: 'rgba(255, 0, 255, 0.3)' },
  { label: 'Orange', value: 'rgba(255, 165, 0, 0.3)' },
];

const DRAWING_COLORS = [
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#0000FF' },
  { label: 'Green', value: '#00FF00' },
  { label: 'Black', value: '#000000' },
  { label: 'Orange', value: '#FFA500' },
];

// Add an interface for tool object
interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  tooltip: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null;
  showPopover?: boolean;
}

// Interface for the LeftToolbar props
interface LeftToolbarProps {
  activeTool: string;
  onToolChange: (tool: string | null) => void;
  onAddNote: () => void;
  isNotesOpen: boolean;
  selectedMarkerColor: string;
  onMarkerColorChange: (color: string) => void;
  selectedDrawingColor: string;
  onDrawingColorChange: (color: string) => void;
  drawingLineWidth: number;
  onDrawingLineWidthChange: (width: number) => void;
}

const LeftToolbar = memo(({ 
  activeTool, 
  onToolChange, 
  onAddNote, 
  isNotesOpen,
  selectedMarkerColor,
  onMarkerColorChange,
  selectedDrawingColor,
  onDrawingColorChange,
  drawingLineWidth,
  onDrawingLineWidthChange
}: LeftToolbarProps) => {
  const { undo, redo, canUndo, canRedo } = useEditHistoryContext();
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const popoverTriggerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const popoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track whether a popover is open for tooltip control
  const [isAnyPopoverOpen, setIsAnyPopoverOpen] = useState(false);

  // Create base tools array
  const baseTools: Tool[] = [
    { id: 'move', icon: <Hand className="h-4 w-4" />, title: 'Move/drag document', tooltip: 'Click and drag to move around the document\n\nKeybind: M' },
    { 
      id: 'marker', 
      icon: <Highlighter className="h-4 w-4" />, 
      title: 'Marker', 
      tooltip: 'Select text to mark it with highlight color\n\nKeybind: K',
      showPopover: true
    },
    { 
      id: 'pencil', 
      icon: <Pencil className="h-4 w-4" />, 
      title: 'Draw', 
      tooltip: 'Draw directly on the document\n\nKeybind: D',
      showPopover: true
    },
    { id: 'eraser', icon: <Eraser className="h-4 w-4" />, title: 'Erase drawings', tooltip: 'Drag over drawings to erase them\n\nKeybind: E' },
  ];
  
  // Add note tool with conditional rendering based on isNotesOpen state
  const noteTool: Tool = {
    id: 'note',
    icon: isNotesOpen ? <X className="h-4 w-4 text-destructive" /> : <StickyNote className="h-4 w-4" />,
    title: isNotesOpen ? 'Close Notes' : 'Add Note',
    tooltip: isNotesOpen ? 'Close the notes panel and hide all notes\n\nAny unsaved changes to notes will be lost\n\nKeybind: N' : 'Add notes to the document\n\nKeybind: N',
    onClick: onAddNote,
    variant: isNotesOpen ? "destructive" : undefined
  };
  
  // History tools
  const historyTools: Tool[] = [
    { 
      id: 'undo', 
      icon: <Undo className="h-4 w-4" />, 
      title: 'Undo', 
      tooltip: 'Undo last action\n\nKeybind: Ctrl+Z',
      onClick: undo,
      variant: canUndo ? undefined : "ghost"
    },
    { 
      id: 'redo', 
      icon: <Redo className="h-4 w-4" />, 
      title: 'Redo', 
      tooltip: 'Redo last undone action\n\nKeybind: Ctrl+Shift+Z',
      onClick: redo,
      variant: canRedo ? undefined : "ghost"
    },
  ];
  
  // Combine the tools
  const tools: Tool[] = [...baseTools, noteTool];

  // Function to handle tool click with toggle behavior
  const handleToolClick = (toolId: string) => {
    // If clicked on the already active tool, deactivate it (set to null)
    if (activeTool === toolId) {
      onToolChange(null); // Default back to null
    } else {
      onToolChange(toolId); // Otherwise activate the clicked tool
    }
  };

  // Color indicator for marker and pencil tools
  const getColorIndicator = (toolId: string) => {
    if (toolId === 'marker') {
      return (
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background"
          style={{ backgroundColor: selectedMarkerColor }}
        />
      );
    }
    if (toolId === 'pencil') {
      return (
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background"
          style={{ backgroundColor: selectedDrawingColor }}
        />
      );
    }
    return null;
  };

  // Handle popover hover behavior
  const handlePopoverHover = (toolId: string, isHovering: boolean) => {
    // Only show popovers for the active tool or if already open
    if (toolId !== activeTool && openPopover !== toolId) {
      return;
    }
    
    if (popoverTimeoutRef.current) {
      clearTimeout(popoverTimeoutRef.current);
      popoverTimeoutRef.current = null;
    }

    if (isHovering) {
      setOpenPopover(toolId);
      setIsAnyPopoverOpen(true);
    } else {
      // Add a small delay before closing to prevent flickering when moving between button and popover
      popoverTimeoutRef.current = setTimeout(() => {
        setOpenPopover(null);
        setIsAnyPopoverOpen(false);
      }, 300);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (popoverTimeoutRef.current) {
        clearTimeout(popoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border">
      <TooltipProvider delayDuration={300}>
        {/* History tools at top */}
        <div className="flex flex-col items-center space-y-2 mb-4 pt-2 pb-4 border-b border-border w-full">
          {historyTools.map(tool => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={tool.variant || "ghost"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-200",
                    (tool.id === 'undo' && !canUndo) || (tool.id === 'redo' && !canRedo)
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={tool.onClick}
                  aria-label={tool.title}
                  disabled={(tool.id === 'undo' && !canUndo) || (tool.id === 'redo' && !canRedo)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="max-w-[200px]">
                <div>
                  <p className="font-medium">{tool.title}</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{tool.tooltip}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Main tools */}
        {tools.map(tool => (
          <div key={tool.id} className="relative">
            {tool.showPopover && (activeTool === tool.id) ? (
              <Popover 
                open={openPopover === tool.id} 
                onOpenChange={(open) => {
                  if (!open && openPopover === tool.id) {
                    setOpenPopover(null);
                    setIsAnyPopoverOpen(false);
                  } else if (open) {
                    setIsAnyPopoverOpen(true);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div 
                    className="relative"
                    ref={(ref: HTMLDivElement | null) => { popoverTriggerRefs.current[tool.id] = ref; }}
                    onMouseEnter={() => handlePopoverHover(tool.id, true)}
                    onMouseLeave={() => handlePopoverHover(tool.id, false)}
                  >
                    {/* Only hide tooltip when tool is active or popover is open */}
                    <Tooltip open={activeTool === tool.id || openPopover === tool.id ? false : undefined}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={tool.variant || (activeTool === tool.id ? "secondary" : "ghost")}
                          size="icon"
                          className={cn(
                            "h-8 w-8 rounded-full transition-all duration-200",
                            activeTool === tool.id && !tool.variant
                              ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                              : tool.variant === "destructive" 
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "hover:bg-primary/10 hover:text-primary"
                          )}
                          onClick={() => handleToolClick(tool.id)}
                          aria-label={tool.title}
                          aria-pressed={activeTool === tool.id}
                        >
                          {tool.icon}
                          {getColorIndicator(tool.id)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center" className="max-w-[200px]">
                        <div>
                          <p className="font-medium">{tool.title}</p>
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{tool.tooltip}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  side="right" 
                  align="start" 
                  className="w-auto p-2"
                  onMouseEnter={() => handlePopoverHover(tool.id, true)}
                  onMouseLeave={() => handlePopoverHover(tool.id, false)}
                >
                  {tool.id === 'marker' && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Marker Color</p>
                      <div className="flex flex-wrap gap-1">
                        {MARKER_COLORS.map(color => (
                          <Button
                            key={color.value}
                            className={cn(
                              "w-6 h-6 p-0 rounded-full relative",
                              selectedMarkerColor === color.value && "ring-2 ring-primary ring-offset-1"
                            )}
                            style={{ backgroundColor: color.value }}
                            onClick={() => onMarkerColorChange(color.value)}
                            variant={selectedMarkerColor === color.value ? "default" : "ghost"}
                            title={color.label}
                          >
                            {selectedMarkerColor === color.value && (
                              <div className="absolute inset-0 rounded-full border-2 border-primary/50" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {tool.id === 'pencil' && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium mb-1">Drawing Color</p>
                        <div className="flex flex-wrap gap-1">
                          {DRAWING_COLORS.map(color => (
                            <Button
                              key={color.value}
                              className={cn(
                                "w-6 h-6 p-0 rounded-full relative",
                                selectedDrawingColor === color.value && "ring-2 ring-primary ring-offset-1"
                              )}
                              style={{ backgroundColor: color.value }}
                              onClick={() => onDrawingColorChange(color.value)}
                              variant={selectedDrawingColor === color.value ? "default" : "ghost"}
                              title={color.label}
                            >
                              {selectedDrawingColor === color.value && (
                                <div className="absolute inset-0 rounded-full border-2 border-primary/50" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">Line Width</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => onDrawingLineWidthChange(1)}
                            variant={drawingLineWidth === 1 ? "default" : "outline"}
                          >
                            Thin
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => onDrawingLineWidthChange(3)}
                            variant={drawingLineWidth === 3 ? "default" : "outline"}
                          >
                            Medium
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => onDrawingLineWidthChange(5)}
                            variant={drawingLineWidth === 5 ? "default" : "outline"}
                          >
                            Thick
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            ) : (
              <Tooltip open={activeTool === tool.id ? false : undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant={tool.variant || (activeTool === tool.id ? "secondary" : "ghost")}
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all duration-200",
                      activeTool === tool.id && !tool.variant
                        ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                        : tool.variant === "destructive" 
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "hover:bg-primary/10 hover:text-primary"
                    )}
                    onClick={tool.onClick || (() => handleToolClick(tool.id))}
                    aria-label={tool.title}
                    aria-pressed={activeTool === tool.id}
                  >
                    {tool.icon}
                    {getColorIndicator(tool.id)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" className="max-w-[200px]">
                  <div>
                    <p className="font-medium">{tool.title}</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{tool.tooltip}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
});

LeftToolbar.displayName = 'LeftToolbar';

export default LeftToolbar; 