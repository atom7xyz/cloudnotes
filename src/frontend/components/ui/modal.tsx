import React, { useEffect } from "react";
import { Button } from "./button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Modal stack management for handling ESC key press
let modalStack: string[] = [];

export interface ModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean;
  /** Function to call when the modal should close */
  onClose: () => void;
  /** Modal title displayed in the header (optional) */
  title?: React.ReactNode;
  /** Content to display in the modal body */
  children: React.ReactNode;
  /** Optional custom actions to display in the header alongside the close button */
  headerActions?: React.ReactNode;
  /** Whether to include a sticky header with title and close button */
  showHeader?: boolean;
  /** Additional class names to apply to the modal container */
  className?: string;
  /** Additional class names to apply to the modal content area */
  contentClassName?: string;
  /** Whether to make the modal take up the full screen */
  fullScreen?: boolean;
  /** Max width class for the modal (defaults to max-w-lg) */
  maxWidth?: string;
  /** Max height class or value for the modal content (defaults to max-h-[calc(90vh-8rem)]) */
  maxHeight?: string;
  /** Whether body scroll should be locked when modal is open (default: true) */
  lockScroll?: boolean;
  /** Whether Escape key should close the modal (default: true) */
  closeOnEscape?: boolean;
  /** Background color/opacity class (default: "bg-black/50 backdrop-blur-sm") */
  backdropClassName?: string;
  /** Additional content to render after the main modal content (like a footer) */
  footer?: React.ReactNode;
  /** Whether the close button should appear in the header (default: true) */
  showCloseButton?: boolean;
  /** Whether the modal body should have scrolling enabled (default: true) */
  scrollBody?: boolean;
  /** A unique ID for this modal (used for stacking) */
  id?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  showHeader = true,
  className,
  contentClassName,
  fullScreen = false,
  maxWidth = "max-w-lg",
  maxHeight,
  lockScroll = true,
  closeOnEscape = true,
  backdropClassName = "bg-black/50 backdrop-blur-sm",
  footer,
  showCloseButton = true,
  scrollBody = true,
  id = "modal-" + Math.random().toString(36).substr(2, 9),
}: ModalProps) {
  // Generate a unique ID for this modal instance if not provided

  // Register and unregister modal in the stack
  useEffect(() => {
    if (isOpen) {
      // Add this modal to the stack when opened
      modalStack = [...modalStack, id];
    } else {
      // Remove this modal from the stack when closed
      modalStack = modalStack.filter(modalId => modalId !== id);
    }

    return () => {
      // Clean up when component unmounts
      modalStack = modalStack.filter(modalId => modalId !== id);
    };
  }, [isOpen, id]);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && lockScroll) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, lockScroll]);

  // Handle escape key to close modal ONLY if this is the topmost modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEscape) {
        // Only close if this is the topmost modal
        if (modalStack[modalStack.length - 1] === id) {
          onClose();
        }
      }
    };

    if (closeOnEscape) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose, closeOnEscape, id]);

  if (!isOpen) return null;

  // Determine content max height based on fullScreen and the presence of header and footer
  let contentMaxHeight = "max-h-full";
  if (!fullScreen) {
    if (maxHeight) {
      contentMaxHeight = maxHeight;
    } else {
      const headerHeight = showHeader ? "3rem" : "0px";
      const footerHeight = footer ? "3.5rem" : "0px";
      contentMaxHeight = `max-h-[calc(90vh-${headerHeight}-${footerHeight})]`;
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto",
        backdropClassName
      )}
    >
      <div 
        className={cn(
          "bg-background rounded-lg shadow-xl flex flex-col w-full",
          maxWidth,
          fullScreen ? "h-screen max-h-screen" : "max-h-[90vh]",
          className
        )}
      >
        {showHeader && (
          <div className="shrink-0 sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center select-none">
            {title && (
              <h2 className="text-xl font-bold">{title}</h2>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {headerActions}
              {showCloseButton && (
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <XIcon size={18} />
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div 
          className={cn(
            scrollBody ? "overflow-y-auto" : "overflow-y-hidden",
            "grow", 
            contentMaxHeight,
            contentClassName
          )}
        >
          {children}
        </div>
        
        {footer && (
          <div className="shrink-0 border-t p-4 bg-background sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
} 