import type React from 'react';
import type { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';

interface MainLayoutProps {
  children: ReactNode;
  useLeftSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, useLeftSidebar = true }) => {
  return (
    <div className="h-screen flex flex-col">
      <TopNavbar />
      <div className="flex-1 flex overflow-hidden">
        {useLeftSidebar && <LeftSidebar />}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 