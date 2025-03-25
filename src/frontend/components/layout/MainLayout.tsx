import React, { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      <div className="flex flex-col flex-grow">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Main Content */}
        <main className="flex-grow overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 