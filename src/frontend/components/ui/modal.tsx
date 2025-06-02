import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { XIcon, RefreshCwIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Modal stack management for handling ESC key press
let modalStack: string[] = [];

export interface ModalActionButton {
  /** Text to display on the button */
  text: string;
  /** Function to call when button is clicked */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant (default: "default") */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Loading text to show when isLoading is true */
  loadingText?: string;
  /** Icon to show on the button */
  icon?: React.ReactNode;
}

export interface ModalSuccessConfig {
  /** Title for the success modal */
  title: React.ReactNode;
  /** Content for the success modal */
  content: React.ReactNode;
  /** Icon for the success modal (default: CheckCircleIcon) */
  icon?: React.ReactNode;
  /** Text for the close button (default: "Close") */
  closeButtonText?: string;
  /** Background color for the icon container */
  iconBgColor?: string;
  /** Icon color */
  iconColor?: string;
}

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
  /** Whether to enable the pop-up animation (default: true) */
  enableAnimation?: boolean;
  /** Cancel button configuration */
  cancelButton?: {
    text?: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  /** Main action button configuration */
  actionButton?: ModalActionButton;
  /** Whether the action button is currently loading */
  isLoading?: boolean;
  /** Success modal configuration */
  successConfig?: ModalSuccessConfig;
  /** Whether to show the success modal */
  showSuccess?: boolean;
  /** Function to call when success modal is closed */
  onSuccessClose?: () => void;
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
  id = `modal-${Math.random().toString(36).substr(2, 9)}`,
  enableAnimation = true,
  cancelButton,
  actionButton,
  isLoading = false,
  successConfig,
  showSuccess = false,
  onSuccessClose,
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Register and unregister modal in the stack with enhanced animation
  useEffect(() => {
    if (isOpen || showSuccess) {
      setIsMounted(true);
      modalStack = [...modalStack, id];
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      // Start closing animation
      setIsVisible(false);
      // Wait for animation to complete before removing from stack and unmounting
      const timeout = setTimeout(() => {
        modalStack = modalStack.filter(modalId => modalId !== id);
        setIsMounted(false);
      }, enableAnimation ? 300 : 0); // Extended duration for smoother animation
      return () => clearTimeout(timeout);
    }

    return () => {
      modalStack = modalStack.filter(modalId => modalId !== id);
    };
  }, [isOpen, showSuccess, id, enableAnimation]);
  
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

  // Create the integrated footer if buttons are provided
  const integratedFooter = (cancelButton || actionButton) ? (
    <div className="flex justify-end items-center gap-3">
      {cancelButton && (
        <Button 
          variant="outline" 
          onClick={cancelButton.onClick || onClose}
          disabled={cancelButton.disabled || isLoading}
          className="hover-primary-effect rounded-full cursor-pointer"
        >
          {cancelButton.text || "Cancel"}
        </Button>
      )}
      {actionButton && (
        <Button 
          variant={actionButton.variant || "default"}
          onClick={actionButton.onClick}
          disabled={actionButton.disabled || isLoading}
          className="gap-2 rounded-full cursor-pointer shadow-md"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">
                <RefreshCwIcon size={14} />
              </span>
              {actionButton.loadingText || "Processing..."}
            </>
          ) : (
            <>
              {actionButton.icon}
              {actionButton.text}
            </>
          )}
        </Button>
      )}
    </div>
  ) : null;

  // Use integrated footer if available, otherwise use the provided footer
  const finalFooter = integratedFooter || footer;

  if (!isMounted) return null;

  // Show success modal if configured
  if (showSuccess && successConfig) {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto",
          enableAnimation && "transition-all duration-300 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
          backdropClassName
        )}
      >
        <div 
          className={cn(
            "bg-background rounded-lg shadow-xl flex flex-col w-full",
            enableAnimation && "transform transition-all duration-300 ease-out",
            isVisible 
              ? "scale-100 opacity-100 translate-y-0" 
              : "scale-90 opacity-0 translate-y-4",
            maxWidth,
            "max-h-[90vh]"
          )}
        >
          {showHeader && (
            <div className="shrink-0 sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center select-none">
              {successConfig.title && (
                <h2 className="text-xl font-bold">{successConfig.title}</h2>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {showCloseButton && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover-primary-effect"
                    onClick={onSuccessClose || onClose}
                    aria-label="Close"
                  >
                    <XIcon size={18} />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className={cn("overflow-y-auto grow max-h-[calc(90vh-8rem)]")}>
            <div className="p-8 select-none">
              <div className="space-y-6">
                {successConfig.content}
              </div>
            </div>
          </div>
          
          <div className="shrink-0 border-t p-4 bg-background sticky bottom-0">
            <div className="flex justify-end">
              <Button 
                onClick={onSuccessClose || onClose}
                className="rounded-full cursor-pointer"
              >
                {successConfig.closeButtonText || "Close"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine content max height based on fullScreen and the presence of header and footer
  let contentMaxHeight = "max-h-full";
  if (!fullScreen) {
    if (maxHeight) {
      contentMaxHeight = maxHeight;
    } else {
      const headerHeight = showHeader ? "3rem" : "0px";
      const footerHeight = finalFooter ? "3.5rem" : "0px";
      contentMaxHeight = `max-h-[calc(90vh-${headerHeight}-${footerHeight})]`;
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto",
        enableAnimation && "transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        backdropClassName
      )}
    >
      <div 
        className={cn(
          "bg-background rounded-lg shadow-xl flex flex-col w-full",
          enableAnimation && "transform transition-all duration-300 ease-out",
          isVisible 
            ? "scale-100 opacity-100 translate-y-0" 
            : "scale-90 opacity-0 translate-y-4",
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
                  className="h-9 w-9 rounded-full hover-primary-effect"
                  onClick={onClose}
                  aria-label="Close"
                  disabled={isLoading}
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
        
        {finalFooter && (
          <div className="shrink-0 border-t p-4 bg-background sticky bottom-0">
            {finalFooter}
          </div>
        )}
      </div>
    </div>
  );
} 