/**
 * Users Page
 */

import { Layout } from '../components/Layout/Layout';

export const UsersPage = () => {
  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{
          color: 'var(--text-color)',
          fontSize: '1.875rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}>
          Users
        </h1>
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Users page content will be here...
          </p>
        </div>
      </div>
    </Layout>
  );
};

