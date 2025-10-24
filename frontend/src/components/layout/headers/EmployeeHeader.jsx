import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Select, MenuItem, Dialog, AppBar, Toolbar, Typography, List, ListItem, ListItemText, useTheme, useMediaQuery, Box, Avatar, Divider, Button, ListItemIcon } from '@mui/material';
import NotificationsPopover from '../../common/notifications/NotificationsPopover';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';
import { deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function EmployeeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // derive display name similar to UserMenu
  const userName = user?.fullName || user?.name || user?.email || user?._raw?.Email || null;

  function handleProfileMobile() {
    // reuse the same routing heuristics as UserMenu
    const roleCandidate = user?.roleId ?? user?.RoleId ?? user?.role ?? user?.Role ?? null;
    const toRole = (() => {
      if (roleCandidate === null || roleCandidate === undefined) return null;
      const n = Number(roleCandidate);
      if (!Number.isNaN(n)) {
        switch (n) {
          case 1: return 'admin';
          case 2: return 'staff';
          case 3: return 'employer';
          case 4: return 'employee';
          default: return null;
        }
      }
      return String(roleCandidate).toLowerCase();
    })();

    try {
      const resolvedEmployerId = (user?.profileType === 'employer' && user?.profileId) ? user.profileId : null;
      const resolvedEmployeeId = (user?.profileType === 'employee' && user?.profileId) ? user.profileId : null;

      if (toRole === 'employer' || resolvedEmployerId) {
        if (resolvedEmployerId) {
          navigate(`/employer/${resolvedEmployerId}`);
          return;
        }
        navigate('/employer/setup');
        return;
      }
      if (toRole === 'employee' || resolvedEmployeeId) {
        navigate('/employee/dashboard');
        return;
      }
    } catch (e) {
      // fall through
    }
    navigate('/profile');
  }

  function handleLogoutMobile() {
    deleteCookie('token');
    deleteCookie('user');
    try { setUser(null); } catch (e) { /* ignore */ }
    navigate('/');
  }
  return (
    <div className="flex items-center gap-4">
      <a href="/jobs" className="text-white hover:underline text-lg md:text-base">Tìm việc</a>
      <Button
        variant="outlined"
        size="small"
        sx={{ color: 'white', borderColor: 'white', ml: 1, display: { xs: 'none', md: 'inline-flex' } }}
        onClick={() => navigate('/employee/dashboard?activeTab=subscription')}
      >Gói đăng ký</Button>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          {/* <MenuItem value="en">English</MenuItem> */}
        </Select>
        <NotificationsPopover />
        {/* <IconButton color="inherit" size="large" aria-label="Lịch" onClick={() => navigate('/calendar')}><CalendarTodayIcon /></IconButton> */}
      </div>
      <div className="hidden md:block">
        <UserMenu />
      </div>
      {/* ...existing code... */}
    </div>
  );
}