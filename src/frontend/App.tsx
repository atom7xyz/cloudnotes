import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import ApplicationSplash from './components/modals/ApplicationSplash';
import { AnimatePresence } from 'framer-motion';

// Key for session storage to check if app has been loaded before
const APP_LOADED_KEY = 'cloudnotes-app-loaded';
// Key for tracking actual app load time
const APP_LOAD_START_TIME = 'cloudnotes-load-start-time';

// Check if this is the very first load and record the time
if (!sessionStorage.getItem(APP_LOAD_START_TIME)) {
  sessionStorage.setItem(APP_LOAD_START_TIME, Date.now().toString());
}

// Lazy load all other components
const Register = lazy(() => import('./components/pages/Register'));
const Login = lazy(() => import('./components/pages/Login'));
const Tos = lazy(() => import('./components/pages/Tos'));
const ForgotPassword = lazy(() => import('./components/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/pages/ResetPassword'));
const ResetPasswordSuccess = lazy(() => import('./components/pages/ResetPasswordSuccess'));
const VerifyOTP = lazy(() => import('./components/pages/VerifyOTP'));
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const PrivacyPolicy = lazy(() => import('./components/pages/PrivacyPolicy'));
const FileReader = lazy(() => import('./components/pages/FileReader'));
const ScreenLockModal = lazy(() => import('./components/modals/ScreenLockModal'));
const Home = lazy(() => import('./components/pages/Home'));
const AppLockProvider = lazy(() => import('./lib/contexts/AppLockContext').then(module => ({ default: module.AppLockProvider })));
const ThemeProvider = lazy(() => import('./lib/contexts/ThemeContext').then(module => ({ default: module.ThemeProvider })));

// Utility function loaded later
const LazyLoadUtils = lazy(() => 
  import('./lib/utils').then(module => {
    // Store the toggleDevTools function for later use
    window._toggleDevTools = module.toggleDevTools;
    return { default: () => null };
  })
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [startLoadingApp, setStartLoadingApp] = useState(false);

  // First effect: show splash screen immediately
  useEffect(() => {
    // Show splash screen for a short time before starting to load app
    // This ensures the splash screen appears before any heavy components load
    const initialDelay = setTimeout(() => {
      setStartLoadingApp(true);
    }, 800); // Short delay to ensure splash screen renders first
    
    return () => clearTimeout(initialDelay);
  }, []);

  // Second effect: handle application loading state
  useEffect(() => {
    // Only start this effect after we've decided to start loading the app
    if (!startLoadingApp) return;
    
    // Set a maximum time the splash screen should be shown (30 seconds)
    const MAX_SPLASH_DURATION = 30000; // 30 seconds
    
    // Check if this is the first load of the app in this session
    const hasLoadedBefore = sessionStorage.getItem(APP_LOADED_KEY);
    const loadStartTime = Number.parseInt(sessionStorage.getItem(APP_LOAD_START_TIME) || Date.now().toString());
    const timeElapsed = Date.now() - loadStartTime;
    
    if (hasLoadedBefore) {
      // If app has been loaded before in this session, skip the loading screen
      setIsLoading(false);
      setAppReady(true);
    } else {
      // Signal that the application content is ready to be displayed
      // This happens after React has mounted and rendered the initial components
      const appReadyTimer = setTimeout(() => {
        setAppReady(true);
        
        // Calculate remaining time to keep splash screen visible
        // We want to ensure the splash screen is visible for at least 3 seconds
        // after the app is ready for a smooth transition
        const MIN_SPLASH_AFTER_READY = 3000; // 3 seconds minimum splash after ready
        
        // Time left before reaching MAX_SPLASH_DURATION
        const remainingMaxTime = Math.max(0, MAX_SPLASH_DURATION - timeElapsed);
        // We'll use the smaller of MIN_SPLASH_AFTER_READY or remainingMaxTime
        const splashRemainingTime = Math.min(MIN_SPLASH_AFTER_READY, remainingMaxTime);
        
        // Hide splash screen after determined time
        const hideTimer = setTimeout(() => {
          setIsLoading(false);
          // Mark app as loaded for this session
          sessionStorage.setItem(APP_LOADED_KEY, 'true');
        }, splashRemainingTime);
        
        return () => clearTimeout(hideTimer);
      }, 1000); // Small delay to ensure components have a chance to mount
      
      // Safety timeout - ensure splash screen doesn't stay longer than MAX_SPLASH_DURATION
      const maxSplashTimer = setTimeout(() => {
        setIsLoading(false);
        setAppReady(true);
        sessionStorage.setItem(APP_LOADED_KEY, 'true');
      }, Math.max(0, MAX_SPLASH_DURATION - timeElapsed));
      
      return () => {
        clearTimeout(appReadyTimer);
        clearTimeout(maxSplashTimer);
      };
    }
  }, [startLoadingApp]);

  // Add keyboard listeners for development tools
  useEffect(() => {
    if (!startLoadingApp) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alternative way to toggle dev tools with Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I' && window._toggleDevTools) {
        window._toggleDevTools();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [startLoadingApp]);

  // Always render the splash screen
  // Only render the application content after startLoadingApp is true
  return (
    <>
      {/* Splash screen with animation - always render first */}
      <AnimatePresence>
        {isLoading && <ApplicationSplash isOpen={true} message={appReady ? "Almost there..." : "Getting things ready..."} />}
      </AnimatePresence>

      {/* Only start loading the app content after splash screen is shown */}
      {startLoadingApp && (
        <Suspense fallback={null}>
          <LazyLoadUtils />
          <div className={isLoading ? 'invisible' : 'visible'}>
            <Suspense fallback={null}>
              <ThemeProvider>
                <AppLockProvider>
                  {/* Application Lock Screen Modal */}
                  <ScreenLockModal />

                  <Router>
                    <Routes>
                      {/* Auth routes with MainLayout */}
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
                      
                      {/* Home route */}
                      <Route path="/home" element={
                        <MainLayout>
                          <Home />
                        </MainLayout>
                      } />
                      
                      {/* FileReader route without MainLayout */}
                      <Route path="/reader" element={<FileReader />} />
                      
                      {/* Default route */}
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                  </Router>
                </AppLockProvider>
              </ThemeProvider>
            </Suspense>
          </div>
        </Suspense>
      )}
    </>
  );
}

// Extend window interface to allow storing the toggleDevTools function
declare global {
  interface Window {
    _toggleDevTools?: () => void;
  }
}

// Function to manually trigger the loading screen (will be exported and used in LeftSidebar)
export function triggerLoadingScreen() {
  // Clear the loaded flag so next refresh will show the loading screen
  sessionStorage.removeItem(APP_LOADED_KEY);
  sessionStorage.removeItem(APP_LOAD_START_TIME);
  
  // Reload the page to show the loading screen
  window.location.reload();
}

export default App;