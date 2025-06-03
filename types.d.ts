interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

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
  
  // Authentication API
  auth: {
    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    logout: (token: string) => Promise<AuthResponse>;
    verifyToken: (token: string) => Promise<AuthResponse>;
    getUsers: () => Promise<{ success: boolean; users?: User[]; message?: string }>;
  };
  
  // Window state listeners
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;
  
  // Navigation state listeners
  onNavigationStateChange: (callback: (canGoBack: boolean, canGoForward: boolean) => void) => () => void;
}

interface Window {
  electron: ElectronAPI;
}