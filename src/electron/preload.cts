const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  setWindowTitle: (title: string) => ipcRenderer.send('set-window-title', title),
  updateWindowPreview: () => ipcRenderer.send('update-window-preview'),
  
  // Navigation controls
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload-page'),
  navigate: (url: string) => ipcRenderer.send('navigate', url),
  requestNavigationStateUpdate: () => ipcRenderer.send('request-navigation-state-update'),
  
  // DevTools controls
  toggleDevTools: async () => await ipcRenderer.invoke('toggle-dev-tools'),
  
  // Window state listeners
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('maximize-change', (_event: any, isMaximized: boolean) => callback(isMaximized));
    return () => {
      ipcRenderer.removeAllListeners('maximize-change');
    };
  },
  
  // Navigation state listeners
  onNavigationStateChange: (callback: (canGoBack: boolean, canGoForward: boolean) => void) => {
    ipcRenderer.on('navigation-state-change', (_event: any, canGoBack: boolean, canGoForward: boolean) => 
      callback(canGoBack, canGoForward));
    return () => {
      ipcRenderer.removeAllListeners('navigation-state-change');
    };
  }
});

