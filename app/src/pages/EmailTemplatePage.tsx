/**
 * Email Template Page
 */

import { Layout } from '../components/Layout/Layout';

export const EmailTemplatePage = () => {
  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{
          color: 'var(--text-color)',
          fontSize: '1.875rem',
          fontWeight: '600',
          marginBottom: '2rem',
        }}>
          Email Template
        </h1>
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          Email Template management UI will be implemented here.
        </div>
      </div>
    </Layout>
  );
};

