/**
 * Dashboard Page
 */

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      margin: 0,
      padding: 0,
    }}>
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            color: '#111827',
            fontSize: '1.875rem',
            fontWeight: '600',
            margin: 0,
          }}>
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          padding: '1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{
            color: '#374151',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginTop: 0,
            marginBottom: '1rem',
          }}>
            User Information
          </h2>
          {user && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                <strong style={{ color: '#374151' }}>Email:</strong> {user.email}
              </p>
              <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                <strong style={{ color: '#374151' }}>Username:</strong> {user.username}
              </p>
              {user.full_name && (
                <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                  <strong style={{ color: '#374151' }}>Full Name:</strong> {user.full_name}
                </p>
              )}
              <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                <strong style={{ color: '#374151' }}>Role:</strong> {user.is_admin ? 'Admin' : 'User'}
              </p>
              <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>
                <strong style={{ color: '#374151' }}>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

