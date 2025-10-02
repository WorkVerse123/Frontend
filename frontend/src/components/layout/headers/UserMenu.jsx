import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, Avatar, Tooltip, Dialog, DialogTitle, List, ListItem, ListItemText, useMediaQuery, useTheme, AppBar, Toolbar, Divider, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function UserMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { setUser, user } = useAuth();
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Defensive: if other code sets document.body.style.overflow = 'hidden' while the menu is open,
  // restore it so the page doesn't become scroll-locked unexpectedly.
  React.useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const obs = new MutationObserver(() => {
      try {
        if (document.body.style.overflow === 'hidden') {
          // restore overflow and any paddingRight that other code added
          document.body.style.overflow = prev || '';
          try {
            if (document.body.style.paddingRight !== prevPad) {
              document.body.style.paddingRight = prevPad || '';
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) {/* ignore */}
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => {
      try { obs.disconnect(); } catch (e) {}
      try { document.body.style.overflow = prev || ''; } catch (e) {}
      try { document.body.style.paddingRight = prevPad || ''; } catch (e) {}
    };
  }, [open]);

  // derive display name from normalized user object (AuthContext)
  const userName = user?.fullName || user?.name || user?.email || user?._raw?.Email || null;

  function handleOpen(e) {
    setAnchorEl(e.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  function handleProfile() {
    handleClose();
    // route to different profile pages depending on role / available ids
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
      // Resolve profile ids robustly: prefer the explicit employerId/employeeId fields
      // Use profileId only when profileType explicitly matches the expected type.
      let resolvedEmployerId = null;
      if (user?.profileType === 'employer' && user?.profileId) resolvedEmployerId = user.profileId;
      else resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null;

      let resolvedEmployeeId = null;
      if (user?.profileType === 'employee' && user?.profileId) resolvedEmployeeId = user.profileId;
      else resolvedEmployeeId = user?.employeeId ?? user?._raw?.EmployeeId ?? null;

      if (toRole === 'employer' || resolvedEmployerId) {
        if (resolvedEmployerId) {
          navigate(`/employer/${resolvedEmployerId}`);
          return;
        }
        navigate('/employer/setup');
        return;
      }
      if (toRole === 'employee' || resolvedEmployeeId) {
        // For employees, route to dashboard overview rather than profile edit page
        navigate('/employee/dashboard');
        return;
      }
    } catch (e) {
      // fall through to generic
    }
    navigate('/profile');
  }

  function handleLogout() {
    // remove client-side cookies and redirect to home
    deleteCookie('token');
    deleteCookie('user');
    handleClose();
    navigate('/');
    // update in-memory auth state instead of full reload
    try { setUser(null); } catch (e) { /* ignore */ }
  }

  return (
    <div>
      <Tooltip title={userName || 'Tài khoản'}>
        <IconButton size="large" color="inherit" onClick={handleOpen} aria-controls={open ? 'user-menu' : undefined} aria-haspopup="true">
          {userName ? <Avatar sx={{ width: 32, height: 32 }}>{userName.charAt(0).toUpperCase()}</Avatar> : <AccountCircleIcon fontSize="inherit" />}
        </IconButton>
      </Tooltip>

      {isMobile ? (
  <Dialog open={open} onClose={handleClose} fullScreen ModalProps={{ disableScrollLock: true }} >
          <AppBar position="relative" color="primary" sx={{ position: 'sticky' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>Tài khoản</Typography>
              <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 64, height: 64 }}>{userName ? userName.charAt(0).toUpperCase() : <AccountCircleIcon />}</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userName || 'Tài khoản'}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <List>
              <ListItem button onClick={() => { handleProfile(); handleClose(); }}>
                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                <ListItemText primary={user?.profileType === 'employee' || user?.role === 'employee' ? 'Tổng quan' : 'Hồ sơ'} />
              </ListItem>

              <ListItem button onClick={() => { handleLogout(); handleClose(); }}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              <Button fullWidth variant="outlined" onClick={handleClose}>Đóng</Button>
            </Box>
          </Box>
        </Dialog>
      ) : (
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          ModalProps={{ disableScrollLock: true }}
        >
          <MenuItem onClick={handleProfile} >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            {user?.profileType === 'employee' || user?.role === 'employee' ? 'Tổng quan' : 'Hồ sơ'}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>
      )}
    </div>
  );
}
