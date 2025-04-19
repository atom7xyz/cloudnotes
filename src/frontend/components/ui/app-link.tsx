import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppNavigate } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { isElectron, getElectronAPI } from "@/lib/navigation";

interface AppLinkProps extends React.HTMLAttributes<HTMLAnchorElement | HTMLSpanElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  preventNavigation?: boolean;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLSpanElement>;
  tabIndex?: number;
}

/**
 * A component that wraps links to use our app navigation system.
 * For empty forms, it uses a direct Link component to avoid unsaved changes dialog.
 * For forms with data, it renders a span that triggers our navigation system with confirm dialog.
 * 
 * @param href The URL to navigate to
 * @param children The link content
 * @param className Additional classes for styling
 * @param preventNavigation If true, renders a regular Link component that bypasses our navigation system
 * @param external If true, opens the link in a new tab
 * @param disabled If true, disables the link
 * @param onClick Additional onClick handler
 * @param tabIndex Tab index for the link
 */
export function AppLink({
  href,
  children,
  className,
  preventNavigation = false,
  external = false,
  disabled = false,
  onClick,
  tabIndex = 0,
  ...props
}: AppLinkProps) {
  const appNavigate = useAppNavigate();
  const navigate = useNavigate();

  // Handle post-navigation updates for Electron
  const updateElectronNavState = () => {
    if (isElectron()) {
      const api = getElectronAPI();
      // Use a small timeout to ensure the navigation has completed
      setTimeout(() => {
        api?.requestNavigationStateUpdate();
      }, 20);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Call any additional onClick handler
    if (onClick) {
      onClick(e);
    }

    // If this is a regular link or external link, let it behave normally
    if (preventNavigation || external) {
      return;
    }

    // For all other links, use our navigation system
    e.preventDefault();
    
    // Use direct React Router navigation for better performance
    if (href.startsWith('/')) {
      navigate(href);
      updateElectronNavState();
    } else {
      // For non-internal links, use the appNavigate method
      appNavigate(href);
    }
  };

  // For external links, use a regular anchor tag
  if (external) {
    return (
      <a
        href={href}
        className={cn(
          "font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Use React Router's Link component for standard internal navigation
  // This provides better performance than the span-based approach
  if (href.startsWith('/') && !disabled) {
    return (
      <Link
        to={href}
        className={cn(
          "font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        onClick={(e) => {
          if (onClick) onClick(e);
          if (!preventNavigation) {
            e.preventDefault();
            navigate(href);
            updateElectronNavState();
          }
        }}
        tabIndex={disabled ? -1 : tabIndex}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // For disabled links or special cases, use a span
  return (
    <span
      className={cn(
        "font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      tabIndex={disabled ? -1 : tabIndex}
      role="link"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
        }
      }}
      {...props}
    >
      {children}
    </span>
  );
} 