import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCookie } from '../services/AuthCookie';

/**
 * NoAuthRoute
 * - Prevents authenticated users from accessing auth pages (login/register)
 * - If not authenticated, render children
 * - If authenticated, redirect to home
 */
export default function NoAuthRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    const token = getCookie('token');
    if (token) return <div className="p-6">Đang kiểm tra thông tin đăng nhập...</div>;
    return children;
  }
  return <Navigate to="/" replace />;
}
