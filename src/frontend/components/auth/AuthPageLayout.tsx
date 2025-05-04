import type { ReactNode } from "react";
import cloudsBackground from "../../assets/clouds3.jpg";

interface AuthPageLayoutProps {
  children: ReactNode;
}

/**
 * Common layout for authentication pages with background image and overlay
 */
export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative h-[calc(100vh-3rem)] flex items-center justify-center p-4">
      {/* Background image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${cloudsBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      
      {/* Gray overlay */}
      <div className="absolute inset-0 z-10 bg-black/15" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-20 w-full max-w-[500px]">
        {children}
      </div>
    </div>
  );
}

export default AuthPageLayout; 