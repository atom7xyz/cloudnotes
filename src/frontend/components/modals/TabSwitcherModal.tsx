import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { FolderOpenIcon, FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Define FileTab type for tab management
export interface FileTab {
  id: string;
  name: string;
  path: string;
  preview?: string; // URL or base64 for thumbnail preview
  lastOpened: Date;
}

// Function to generate a thumbnail preview for a file
const generateThumbnail = async (filePath: string): Promise<string | undefined> => {
  try {
    // Check if the file is a PDF
    if (filePath.toLowerCase().endsWith('.pdf')) {
      // In a real implementation, we would use a PDF library to render the first page
      // For now, we'll use a generic PDF icon as a placeholder
      return '/assets/icons/pdf-preview.svg';
    }
    
    // Return undefined for unsupported file types
    return undefined;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return undefined;
  }
};

interface TabSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: FileTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  isLoading?: boolean; // Add isLoading prop
}

// Custom DialogContent without the default close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* Default close button removed */}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = "CustomDialogContent";

const TabSwitcherModal: React.FC<TabSwitcherModalProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  isLoading = false // Default to false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabsWithPreviews, setTabsWithPreviews] = useState<FileTab[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Generate thumbnails for tabs that don't have previews
  useEffect(() => {
    if (!isOpen) return;

    const updateTabPreviews = async () => {
      const updatedTabs = await Promise.all(
        tabs.map(async (tab) => {
          // Skip if tab already has a preview
          if (tab.preview) return tab;
          
          // Generate thumbnail for the tab
          const preview = await generateThumbnail(tab.path);
          return {
            ...tab,
            preview: preview || undefined
          };
        })
      );
      
      setTabsWithPreviews(updatedTabs);
    };
    
    updateTabPreviews();
  }, [isOpen, tabs]);

  // Find the initial selected index based on active tab
  useEffect(() => {
    if (isOpen) {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
      setSelectedIndex(activeIndex >= 0 ? activeIndex : 0);
    }
  }, [isOpen, tabs, activeTabId]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process tab navigation if loading
      if (isLoading) {
        if (e.key === 'Tab' && e.ctrlKey) {
          e.preventDefault(); // Prevent tab switching during loading
          return;
        }
      }
      
      // Prevent default to avoid browser shortcuts
      if (e.key === 'Tab') {
        e.preventDefault();
        
        if (e.shiftKey) {
          // SHIFT+TAB goes backward
          setSelectedIndex(prev => (prev - 1 + tabsWithPreviews.length) % tabsWithPreviews.length);
        } else {
          // TAB goes forward
          setSelectedIndex(prev => (prev + 1) % tabsWithPreviews.length);
        }
      }
      
      // Enter or Space to select
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (tabsWithPreviews[selectedIndex]) {
          onSelectTab(tabsWithPreviews[selectedIndex].id);
          onClose();
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Keep tracking ctrl key state
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        // When Ctrl is released, confirm selection
        if (tabsWithPreviews[selectedIndex]) {
          onSelectTab(tabsWithPreviews[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOpen, tabsWithPreviews, selectedIndex, onSelectTab, onClose, isLoading]);

  // Focus the modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Skip opening the modal if loading
  if (isLoading) return null;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CustomDialogContent className="w-auto max-w-3xl p-0">
        <div className="p-4 border-b relative">
          <h2 className="text-lg font-medium">Switch between open files</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
        <ScrollArea className="max-h-[70vh]">
          <div 
            ref={modalRef}
            className="grid grid-cols-3 gap-4 p-4 focus:outline-none" 
            tabIndex={0}
          >
            {tabsWithPreviews.length > 0 ? tabsWithPreviews.map((tab, index) => (
              <div
                key={tab.id}
                className={cn(
                  "p-2 rounded-lg border cursor-pointer transition-all",
                  selectedIndex === index 
                    ? "ring-2 ring-primary border-primary bg-primary/5" 
                    : "bg-card hover:bg-accent"
                )}
                onClick={() => {
                  setSelectedIndex(index);
                  onSelectTab(tab.id);
                  onClose();
                }}
              >
                <div className="flex flex-col items-center space-y-2">
                  {tab.preview ? (
                    <div className="w-32 h-40 bg-muted rounded overflow-hidden">
                      <img 
                        src={tab.preview} 
                        alt={tab.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-40 bg-muted rounded flex items-center justify-center">
                      <FileIcon className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="text-sm font-medium truncate max-w-full">
                    {tab.name}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 p-8 text-center text-muted-foreground">
                No files are currently open
              </div>
            )}
          </div>
        </ScrollArea>
      </CustomDialogContent>
    </Dialog>
  );
};

export default TabSwitcherModal; 