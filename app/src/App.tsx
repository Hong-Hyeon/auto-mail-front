import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { EmailHistoryPage } from './pages/EmailHistoryPage';
import { EmailTemplatePage } from './pages/EmailTemplatePage';
import { CompanyCrawlingPage } from './pages/CompanyCrawlingPage';
import { ActionPage } from './pages/ActionPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/dashboard/companies"
              element={
                <ProtectedRoute>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/email-history"
              element={
                <ProtectedRoute>
                  <EmailHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/email-template"
              element={
                <ProtectedRoute>
                  <EmailTemplatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/company-crawling"
              element={
                <ProtectedRoute>
                  <CompanyCrawlingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/action"
              element={
                <ProtectedRoute>
                  <ActionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
