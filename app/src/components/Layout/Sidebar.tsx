/**
 * Sidebar Component
 */

import { useLocation, useNavigate } from 'react-router-dom';

interface MenuItem {
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Users', path: '/dashboard/users' },
  { label: 'Companies', path: '/dashboard/companies' },
  { label: 'Email History', path: '/dashboard/email-history' },
  { label: 'Email Template', path: '/dashboard/email-template' },
  { label: 'Action', path: '/dashboard/action' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 0',
      overflow: 'auto',
    }}>
      <nav>
        {menuItems.map((item) => (
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

