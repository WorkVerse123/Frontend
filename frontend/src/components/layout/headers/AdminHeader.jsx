import React from 'react';
import { Button, Select, MenuItem } from '@mui/material';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminHeader() {
  // mobile handled by Header.jsx
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const userName = user?.fullName || user?.name || user?.email || user?._raw?.Email || null;

  function handleProfileMobile() {
    navigate('/admin');
  }

  function handleLogoutMobile() {
    deleteCookie('token');
    deleteCookie('user');
    try { setUser(null); } catch (e) { /* ignore */ }
    navigate('/');
  }
  return (
    <div className="flex items-center gap-4">
      <Button variant="contained" color="secondary" size="small" href="/admin">Dashboard</Button>
      <a href="/admin/users" className="text-white hover:underline text-lg md:text-base">Người dùng</a>
      <a href="/admin/reports" className="text-white hover:underline text-lg md:text-base">Báo cáo</a>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
      </div>
      <div className="hidden md:block">
        <UserMenu />
      </div>
      {/* mobile menu is handled centrally in Header.jsx to avoid duplication */}
    </div>
  );
}