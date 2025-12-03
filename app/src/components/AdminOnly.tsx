/**
 * AdminOnly Component - Renders children only if user is admin
 */

import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminOnly = ({ children, fallback = null }: AdminOnlyProps) => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

