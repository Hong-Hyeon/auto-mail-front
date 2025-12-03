/**
 * Admin Route Component - Protects routes that require admin access
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: 'var(--text-color)',
          marginBottom: '1rem',
        }}>
          403 Forbidden
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
        }}>
          You don't have permission to access this page.
        </p>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)',
        }}>
          Admin access is required.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

