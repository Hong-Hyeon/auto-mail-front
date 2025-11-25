/**
 * Dashboard Page
 */

import { Navigate } from 'react-router-dom';

export const DashboardPage = () => {
  // 기본적으로 Users 페이지로 리다이렉트
  return <Navigate to="/dashboard/users" replace />;
};

