/**
 * Home Page
 */

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Welcome to Auto Mail</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
      }}>
        <h2>User Information</h2>
        {user && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            {user.full_name && <p><strong>Full Name:</strong> {user.full_name}</p>}
            <p><strong>Role:</strong> {user.is_admin ? 'Admin' : 'User'}</p>
            <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

