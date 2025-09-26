import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, Avatar, Tooltip } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../../../services/AuthCookie';
import { useAuth } from '../../../contexts/AuthContext';

export default function UserMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { setUser, user } = useAuth();
  const open = Boolean(anchorEl);

  let userName = null;
  try {
    const raw = getCookie('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      userName = parsed?.fullName || parsed?.name || parsed?.email || null;
    }
  } catch (e) {
    // ignore parse
  }

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
      const resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? user?.EmployerId ?? null;
      if (toRole === 'employer' || resolvedEmployerId) {
        // employer profile — navigate to canonical employer route
        if (resolvedEmployerId) {
          navigate(`/employer/${resolvedEmployerId}`);
          return;
        }
        // fallback to setup page
        navigate('/employer/setup');
        return;
      }
      if (toRole === 'employee' || user?.employeeId) {
        // employee profile
        navigate('/employee/profile');
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
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Hồ sơ
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </div>
  );
}
