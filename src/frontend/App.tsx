import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/pages/Register';
import Login from './components/pages/Login';
import Tos from './components/pages/Tos';
import ForgotPassword from './components/pages/ForgotPassword';
import ResetPassword from './components/pages/ResetPassword';
import ResetPasswordSuccess from './components/pages/ResetPasswordSuccess';
import VerifyOTP from './components/pages/VerifyOTP';
import MainLayout from './components/layout/MainLayout';
import ModalsDemoPage from './components/pages/ModalsDemoPage';
import TabletPage from './components/pages/TabletPage';

function App() {
  return (
    <Router basename="/ext/cloudnotes/">
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
        
        {/* Non-auth routes with MainLayout */}
        <Route path="/tablet" element={
          <MainLayout>
            <TabletPage />
          </MainLayout>
        } />
        
        {/* Unified Modal Demo route */}
        <Route path="/demos" element={
          <MainLayout>
            <ModalsDemoPage />
          </MainLayout>
        } />
        
        {/* Default route */}
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;