import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { FolderOpenIcon, FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define FileTab type for tab management
export interface FileTab {
  id: string;
  name: string;
  path: string;
  preview?: string; // URL or base64 for thumbnail preview
  lastOpened: Date;
}

interface TabSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: FileTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  isLoading?: boolean; // Add isLoading prop
}

const TabSwitcherModal: React.FC<TabSwitcherModalProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  isLoading = false // Default to false
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

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
          setSelectedIndex(prev => (prev - 1 + tabs.length) % tabs.length);
        } else {
          // TAB goes forward
          setSelectedIndex(prev => (prev + 1) % tabs.length);
        }
      }
      
      // Enter or Space to select
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (tabs[selectedIndex]) {
          onSelectTab(tabs[selectedIndex].id);
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
        if (tabs[selectedIndex]) {
          onSelectTab(tabs[selectedIndex].id);
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
  }, [isOpen, tabs, selectedIndex, onSelectTab, onClose, isLoading]);

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
      <DialogContent className="w-auto max-w-3xl p-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Switch between open files</h2>
        </div>
        <ScrollArea className="max-h-[70vh]">
          <div 
            ref={modalRef}
            className="grid grid-cols-3 gap-4 p-4 focus:outline-none" 
            tabIndex={0}
          >
            {tabs.map((tab, index) => (
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
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TabSwitcherModal; 