interface ElectronAPI {
  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  setWindowTitle: (title: string) => void;
  updateWindowPreview: () => void;
  
  // Navigation controls
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  navigate: (url: string) => void;
  requestNavigationStateUpdate: () => void;
  
  // File operations
  openFile: () => Promise<string | null>; // Opens file dialog, returns path or null if canceled
  
  // DevTools controls
  toggleDevTools: () => Promise<void>;
  
  // Window state listeners
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
  
  // Navigation state listeners
  onNavigationStateChange: (callback: (canGoBack: boolean, canGoForward: boolean) => void) => () => void;
}

interface Window {
  electron: ElectronAPI;
}