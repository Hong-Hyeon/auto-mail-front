/**
 * Main Layout Component
 */

import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <Header />
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <Sidebar />
        <main style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: 'var(--bg-color)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

