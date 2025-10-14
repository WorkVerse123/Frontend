import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCookie } from '../../services/AuthCookie';

/**
 * AdminRoute
 * - Allows access if user.role is 'admin' or 'staff'
 * - Redirects to /auth if not logged in
 * - Redirects to / (home) if logged in but not authorized
 */
export default function AdminRoute({ children }) {
  const { user } = useAuth();

  // If user is null, AuthProvider may still be initializing (reading cookies, token)
  // Check if a token cookie exists — if so, render a small loading placeholder
  // instead of redirecting to /auth. This prevents a reload from bouncing to login
  // before AuthProvider finishes parsing the token.
  if (!user) {
    const token = getCookie('token');
    if (token) {
      // token present; wait for AuthProvider to populate `user`
      return <div className="p-6">Đang kiểm tra thông tin đăng nhập...</div>;
    }
    // no token -> not authenticated
    return <Navigate to="/auth" replace />;
  }

  const role = (user.role || '').toString().toLowerCase();
  if (role === 'admin' || role === 'staff') {
    return children;
  }

  // authenticated but not admin/staff
  return <Navigate to="/" replace />;
}
