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
  
  // Authentication API
  auth: {
    login: async (data: { email: string; password: string }) => 
      await ipcRenderer.invoke('auth:login', data),
    register: async (data: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password: string; 
      confirmPassword: string; 
      acceptTerms: boolean; 
    }) => await ipcRenderer.invoke('auth:register', data),
    logout: async (token: string) => 
      await ipcRenderer.invoke('auth:logout', token),
    verifyToken: async (token: string) => 
      await ipcRenderer.invoke('auth:verify-token', token),
    getUsers: async () => 
      await ipcRenderer.invoke('auth:get-users')
  },
  
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

