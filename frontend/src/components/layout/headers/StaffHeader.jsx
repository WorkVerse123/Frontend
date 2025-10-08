import React from 'react';
import { Select, MenuItem } from '@mui/material';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function StaffHeader() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const userName = user?.fullName || user?.name || user?.email || user?._raw?.Email || null;

  function handleProfileMobile() {
    // simple navigate to account page for staff
    navigate('/staff/account');
  }

  function handleLogoutMobile() {
    deleteCookie('token');
    deleteCookie('user');
    try { setUser(null); } catch (e) { /* ignore */ }
    navigate('/');
  }
  return (
    <div className="flex items-center gap-4">
      <a href="/staff/hr" className="text-white hover:underline text-lg md:text-base">Quản lý nhân sự</a>
      <a href="/staff/reports" className="text-white hover:underline text-lg md:text-base">Báo cáo</a>
      <a href="/staff/account" className="text-white hover:underline text-lg md:text-base">Tài khoản</a>
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