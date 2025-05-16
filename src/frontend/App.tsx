import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Tos from './components/pages/Tos';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import ResetPasswordSuccess from './components/pages/ResetPasswordSuccess';
import VerifyOTP from './components/pages/VerifyOTP';
import MainLayout from './components/layout/MainLayout';
import { toggleDevTools } from './lib/utils';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import FileReader from './components/pages/FileReader';
import ApplicationSplash from './components/modals/ApplicationSplash';
import { AnimatePresence } from 'framer-motion';
import { AppLockProvider } from './lib/contexts/AppLockContext';
import ScreenLockModal from './components/modals/ScreenLockModal';

// Key for session storage to check if app has been loaded before
const APP_LOADED_KEY = 'cloudnotes-app-loaded';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Handle application loading state
  useEffect(() => {
    // Check if this is the first load of the app in this session
    const hasLoadedBefore = sessionStorage.getItem(APP_LOADED_KEY);
    
    if (hasLoadedBefore) {
      // If app has been loaded before in this session, skip the loading screen
      setIsLoading(false);
    } else {
      // First load in this session - show loading for 10 seconds
      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
        // Mark app as loaded for this session
        sessionStorage.setItem(APP_LOADED_KEY, 'true');
      }, 8000);
      
      return () => clearTimeout(loadingTimer);
    }
  }, []);

  // Add keyboard listeners for development tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alternative way to toggle dev tools with Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        toggleDevTools();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AppLockProvider>
      {/* Splash screen with animation */}
      <AnimatePresence>
        {isLoading && <ApplicationSplash isOpen={true} />}
      </AnimatePresence>

      {/* Application Lock Screen Modal */}
      <ScreenLockModal />

      {/* Render the app regardless of loading state, but it will be hidden behind the splash screen */}
      <div className={isLoading ? 'invisible' : 'visible'}>
        <Router>
          <Routes>
            {/* Auth routes without MainLayout */}
            <Route path="/register" element={
              <MainLayout>
                <Register />
              </MainLayout>
            } />
            <Route path="/login" element={
              <MainLayout>
                <Login />
              </MainLayout>
            } />
            <Route path="/tos" element={
              <MainLayout>
                <Tos />
              </MainLayout>
            } />
            <Route path="/privacy-policy" element={
              <MainLayout>
                <PrivacyPolicy />
              </MainLayout>
            } />
            <Route path="/forgot-password" element={
              <MainLayout>
                <ForgotPassword />
              </MainLayout>
            } />
            <Route path="/verify-otp" element={
              <MainLayout>
                <VerifyOTP />
              </MainLayout>
            } />
            <Route path="/reset-password" element={
              <MainLayout>
                <ResetPassword />
              </MainLayout>
            } />
            <Route path="/reset-password-success" element={
              <MainLayout>
                <ResetPasswordSuccess />
              </MainLayout>
            } />
            
            {/* FileReader route without MainLayout */}
            <Route path="/reader" element={<FileReader />} />
            
            {/* Default route */}
            <Route path="*" element={<Navigate to="/register" replace />} />
          </Routes>
        </Router>
      </div>
    </AppLockProvider>
  );
}

// Function to manually trigger the loading screen (will be exported and used in LeftSidebar)
export function triggerLoadingScreen() {
  // Clear the loaded flag so next refresh will show the loading screen
  sessionStorage.removeItem(APP_LOADED_KEY);
  
  // Reload the page to show the loading screen
  window.location.reload();
}

export default App;