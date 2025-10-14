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
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          {/* <MenuItem value="en">English</MenuItem> */}
        </Select>
        <NotificationsPopover />
        <IconButton color="inherit" size="large" aria-label="Lịch" onClick={() => navigate('/calendar')}><CalendarTodayIcon /></IconButton>
      </div>

      {/* Mobile menu trigger */}
      {/* <IconButton className="md:hidden" color="inherit" onClick={() => setMobileOpen(true)} aria-label="menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </IconButton> */}

      {/* show standalone UserMenu only on md+ to avoid duplicate mobile dialogs */}
      <div className="hidden md:block">
        <UserMenu />
      </div>

      {/* <Dialog fullScreen open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>Menu</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setMobileOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          {/* Account summary (merged from UserMenu mobile) */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 64, height: 64 }}>{userName ? userName.charAt(0).toUpperCase() : <AccountCircleIcon />}</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userName || 'Tài khoản'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List>
            <ListItem button component="a" href="/jobs" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Tìm việc" />
            </ListItem>

            <ListItem button onClick={() => { handleProfileMobile(); setMobileOpen(false); }}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary={user?.profileType === 'employee' || user?.role === 'employee' ? 'Tổng quan' : 'Hồ sơ'} />
            </ListItem>

            <ListItem button onClick={() => { handleLogoutMobile(); setMobileOpen(false); }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItem>
          </List>
        </Box> */}
      {/* </Dialog> */}
    </div>
  );
}