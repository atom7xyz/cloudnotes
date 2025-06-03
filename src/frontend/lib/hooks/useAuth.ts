import { useState, useEffect } from 'react';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthError {
  message: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  const [error, setError] = useState<AuthError | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken && window.electron?.auth) {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        try {
          const response = await window.electron.auth.verifyToken(savedToken);
          if (response.success && response.user) {
            setAuthState({
              user: response.user,
              token: savedToken,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('auth_token');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message?: string }> => {
    if (!window.electron?.auth) {
      const errorMsg = 'Electron API not available';
      setError({ message: errorMsg });
      return { success: false, message: errorMsg };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      const response: AuthResponse = await window.electron.auth.login(credentials);
      
      if (response.success && response.user && response.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', response.token);
        
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true, message: response.message };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        const errorMsg = response.message || 'Login failed';
        setError({ message: errorMsg });
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMsg = 'An unexpected error occurred during login';
      setError({ message: errorMsg });
      console.error('Login error:', error);
      return { success: false, message: errorMsg };
    }
  };

  const register = async (userData: RegisterRequest): Promise<{ success: boolean; message?: string }> => {
    if (!window.electron?.auth) {
      const errorMsg = 'Electron API not available';
      setError({ message: errorMsg });
      return { success: false, message: errorMsg };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      const response: AuthResponse = await window.electron.auth.register(userData);
      
      if (response.success && response.user && response.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', response.token);
        
        setAuthState({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true, message: response.message };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        const errorMsg = response.message || 'Registration failed';
        setError({ message: errorMsg });
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMsg = 'An unexpected error occurred during registration';
      setError({ message: errorMsg });
      console.error('Registration error:', error);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async (): Promise<{ success: boolean; message?: string }> => {
    if (!window.electron?.auth || !authState.token) {
      // Just clear local state if no API or token
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      return { success: true };
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response: AuthResponse = await window.electron.auth.logout(authState.token);
      
      // Clear local state regardless of server response
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      return { success: true, message: response.message };
    } catch (error) {
      // Clear local state even if logout request fails
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      console.error('Logout error:', error);
      return { success: true }; // Still return success since we cleared local state
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    ...authState,
    error,
    login,
    register,
    logout,
    clearError
  };
} 