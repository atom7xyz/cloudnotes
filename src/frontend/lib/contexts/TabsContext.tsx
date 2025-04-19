import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FileTab } from '@/components/modals/TabSwitcherModal';

interface TabsContextProps {
  openTabs: FileTab[];
  activeTabId: string | null;
  openTab: (tabInfo: Omit<FileTab, 'id' | 'lastOpened'>) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  isTabOpen: (path: string) => boolean;
  getTabById: (tabId: string) => FileTab | undefined;
  getTabByPath: (path: string) => FileTab | undefined;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

// Asset directory files
const assetFiles = [
  {
    name: 'genesis.pdf',
    path: '/assets/files/genesis.pdf',
  },
  {
    name: 'exodus.pdf',
    path: '/assets/files/exodus.pdf',
  },
  {
    name: 'revelation.pdf',
    path: '/assets/files/revelation.pdf',
  },
];

// Generate initial tabs from asset files
const initialTabs: FileTab[] = assetFiles.map((file, index) => ({
  id: (index + 1).toString(),
  name: file.name,
  path: file.path,
  lastOpened: new Date(Date.now() - 1000 * 60 * (5 * index)), // Staggered times
}));

export const TabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openTabs, setOpenTabs] = useState<FileTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(initialTabs.length > 0 ? initialTabs[0].id : null);
  const [_isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to open a new tab
  const openTab = useCallback((tabInfo: Omit<FileTab, 'id' | 'lastOpened'>): string => {
    // First check if tab is already open
    const existingTab = openTabs.find(tab => tab.path === tabInfo.path);
    
    // Set loading state when switching tabs
    setIsLoading(true);
    
    if (existingTab) {
      setActiveTabId(existingTab.id);
      
      // Update the lastOpened time
      setOpenTabs(tabs => 
        tabs.map(tab => 
          tab.id === existingTab.id 
            ? { ...tab, lastOpened: new Date() } 
            : tab
        )
      );
      
      return existingTab.id;
    }
    
    // Create a new tab if it doesn't exist
    const newTabId = Date.now().toString();
    const newTab: FileTab = {
      ...tabInfo,
      id: newTabId,
      lastOpened: new Date(),
    };
    
    setOpenTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTabId);
    
    return newTabId;
  }, [openTabs]);

  // Load files from assets directory on initialization
  useEffect(() => {
    // We're already loading the files from the asset directory
    // This effect could be used to dynamically fetch files from the backend in the future
    console.log('Loaded files from assets directory:', assetFiles);
  }, []);

  // Function to close a tab
  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(tabs => {
      const filteredTabs = tabs.filter(tab => tab.id !== tabId);
      
      // If closing the active tab, select another one if available
      if (activeTabId === tabId && filteredTabs.length > 0) {
        // Select the most recently used tab
        const sortedTabs = [...filteredTabs].sort((a, b) => 
          b.lastOpened.getTime() - a.lastOpened.getTime()
        );
        setActiveTabId(sortedTabs[0].id);
        setIsLoading(true); // Set loading state when switching tabs
      } else if (filteredTabs.length === 0) {
        setActiveTabId(null);
      }
      
      return filteredTabs;
    });
  }, [activeTabId]);

  // Function to set the active tab
  const setActiveTab = useCallback((tabId: string) => {
    // Skip if loading or tab is already active
    if (isLoading || tabId === activeTabId) return;
    
    setIsLoading(true); // Set loading state when switching tabs
    setActiveTabId(tabId);
    
    // Update the lastOpened time
    setOpenTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, lastOpened: new Date() } 
          : tab
      )
    );
  }, [activeTabId, isLoading]);

  // Function to check if a tab is open
  const isTabOpen = useCallback((path: string) => {
    return openTabs.some(tab => tab.path === path);
  }, [openTabs]);

  // Function to get a tab by ID
  const getTabById = useCallback((tabId: string) => {
    return openTabs.find(tab => tab.id === tabId);
  }, [openTabs]);

  // Function to get a tab by path
  const getTabByPath = useCallback((path: string) => {
    return openTabs.find(tab => tab.path === path);
  }, [openTabs]);

  // Set up keyboard shortcut to open tab switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't open tab switcher if loading
      if (isLoading) {
        if (e.ctrlKey && e.key === 'Tab') {
          e.preventDefault();
          return;
        }
      }
      
      // Ctrl+Tab to open tab switcher
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        setIsTabSwitcherOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading]);

  const contextValue = {
    openTabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    isTabOpen,
    getTabById,
    getTabByPath,
    isLoading,
    setIsLoading,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      {children}
    </TabsContext.Provider>
  );
};

// Custom hook to use the tabs context
export const useTabs = (): TabsContextProps => {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}; 