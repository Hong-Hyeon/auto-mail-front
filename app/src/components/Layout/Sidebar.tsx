/**
 * Sidebar Component
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/dashboard/users', adminOnly: true },
  { label: 'Companies', path: '/dashboard/companies' },
  { label: 'Email History', path: '/dashboard/email-history' },
  { label: 'Email Template', path: '/dashboard/email-template' },
  { label: 'Company Crawling', path: '/dashboard/company-crawling' },
  { label: 'Action', path: '/dashboard/action' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Filter menu items based on admin status
  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 0',
      overflow: 'auto',
    }}>
      <nav>
        {visibleMenuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              backgroundColor: isActive(item.path) ? 'var(--active-bg)' : 'transparent',
              color: isActive(item.path) ? 'var(--active-color)' : 'var(--text-color)',
              border: 'none',
              borderLeft: isActive(item.path) ? '3px solid var(--active-color)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: isActive(item.path) ? '600' : '400',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

