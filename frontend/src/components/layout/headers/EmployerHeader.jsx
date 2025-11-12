import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Select, MenuItem, Dialog, AppBar, Toolbar, Typography, List, ListItem, ListItemText, Box, Avatar, Divider, ListItemIcon, Button } from '@mui/material';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function EmployerHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const userName = user?.fullName || user?.name || user?.email || user?._raw?.Email || null;

  function handleProfileMobile() {
    // for employers, try to go to employer profile or setup
    const resolvedEmployerId = (user?.profileType === 'employer' && user?.profileId) ? user.profileId : null;
    if (resolvedEmployerId) { navigate(`/employer/${resolvedEmployerId}`); return; }
    navigate('/employer/setup');
  }

  function handleLogoutMobile() {
    deleteCookie('token');
    deleteCookie('user');
    try { setUser(null); } catch (e) { /* ignore */ }
    navigate('/');
  }

  function handleSubscriptionClick() {
    const targetPath = '/employer/jobs';
    const targetQuery = '?activeTab=subscription';
    // If already on jobs page, scroll to top and ensure subscription tab is active
    if (window.location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Optionally trigger tab change if needed
    } else {
      navigate(targetPath + targetQuery);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <a href="/employer/jobs" className="text-white hover:underline text-lg md:text-base">Quản lý tuyển dụng</a>
      <Button
        variant="outlined"
        size="small"
        sx={{ color: 'white', borderColor: 'white', ml: 1, display: { xs: 'none', md: 'inline-flex' } }}
        onClick={handleSubscriptionClick}
      >Gói đăng ký</Button>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          {/* <MenuItem value="en">English</MenuItem> */}
        </Select>
        <IconButton color="inherit" size="large" aria-label="Thông báo"><NotificationsIcon /></IconButton>
        {/* <IconButton color="inherit" size="large" aria-label="Lịch"><CalendarTodayIcon /></IconButton> */}
      </div>
      <div className="hidden md:block">
        <UserMenu />
      </div>
      {/* ...existing code... */}
    </div>
  );
}