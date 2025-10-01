import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Select, MenuItem, Dialog, AppBar, Toolbar, Typography, List, ListItem, ListItemText, Box, Avatar, Divider, ListItemIcon } from '@mui/material';
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
  return (
    <div className="flex items-center gap-4">
      <a href="/employer/jobs" className="text-white hover:underline text-lg md:text-base">Quản lý tin tuyển dụng</a>
      <a href="/candidates" className="text-white hover:underline text-lg md:text-base">Ứng viên</a>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
        <IconButton color="inherit" size="large" aria-label="Thông báo"><NotificationsIcon /></IconButton>
        <IconButton color="inherit" size="large" aria-label="Lịch"><CalendarTodayIcon /></IconButton>
      </div>
      <div className="hidden md:block">
        <UserMenu />
      </div>
      <IconButton className="md:hidden" color="inherit" onClick={() => setMobileOpen(true)} aria-label="menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </IconButton>

  <Dialog fullScreen open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ disableScrollLock: true }}>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>Menu</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setMobileOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 64, height: 64 }}>{userName ? userName.charAt(0).toUpperCase() : <AccountCircleIcon />}</Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userName || 'Tài khoản'}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <List>
            <ListItem button component="a" href="/employer/jobs" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Quản lý tin tuyển dụng" />
            </ListItem>
            <ListItem button component="a" href="/candidates" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Ứng viên" />
            </ListItem>
            <ListItem button onClick={() => { handleProfileMobile(); setMobileOpen(false); }}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="Hồ sơ" />
            </ListItem>
            <ListItem button onClick={() => { handleLogoutMobile(); setMobileOpen(false); }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItem>
          </List>
        </Box>
      </Dialog>
    </div>
  );
}