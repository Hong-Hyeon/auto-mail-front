/**
 * Header Component
 */

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--header-bg)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Left: SixtyPay Logo */}
      <div>
        <span style={{
          color: '#2563eb',
          fontSize: '1.25rem',
          fontWeight: '700',
          letterSpacing: '-0.5px',
        }}>
          SixtyPay
        </span>
      </div>

      {/* Right: Welcome Message + Theme Toggle + User Info + Logout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
      }}>
        {/* Welcome Message */}
        {user && (
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: '400',
          }}>
            Welcome, <strong style={{ color: 'var(--text-color)', fontWeight: '600' }}>
              {user.full_name || user.username}
            </strong>
          </span>
        )}

        {/* Theme Toggle with Slide Animation */}
        <div style={{
          position: 'relative',
          width: '64px',
          height: '32px',
          backgroundColor: theme === 'light' ? '#e5e7eb' : '#374151',
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }} onClick={toggleTheme}>
          <div style={{
            position: 'absolute',
            top: '4px',
            left: theme === 'light' ? '4px' : '36px',
            width: '24px',
            height: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            transition: 'left 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}>
            {theme === 'light' ? '☀️' : '🌙'}
          </div>
        </div>

        {/* Logout Button */}
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
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

