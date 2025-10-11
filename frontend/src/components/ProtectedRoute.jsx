import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCookie } from '../services/AuthCookie';

/**
 * ProtectedRoute
 * - allowedRoles: array of string role names (e.g. ['employer','admin'])
 * - Redirects to /auth if not authenticated
 * - Redirects to / if authenticated but not authorized
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();

  if (!user) {
    const token = getCookie('token');
    if (token) return <div className="p-6">Đang kiểm tra thông tin đăng nhập...</div>;
    return <Navigate to="/auth" replace />;
  }

  const role = (user.role || '').toString().toLowerCase();
  // if allowedRoles empty => allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) return children;
  if (allowedRoles.map(r => r.toString().toLowerCase()).includes(role)) return children;

  // authenticated but not authorized
  return <Navigate to="/" replace />;
}
