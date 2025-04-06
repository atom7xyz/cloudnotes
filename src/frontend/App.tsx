import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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

function App() {
  // Add keyboard listeners for development tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alternative way to toggle dev tools with Ctrl+Shift+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        console.log('Keyboard shortcut detected: Ctrl+Shift+I');
        toggleDevTools();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
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
  );
}

export default App;