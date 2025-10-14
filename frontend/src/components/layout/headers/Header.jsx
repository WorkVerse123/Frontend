import { LAYOUT } from '../../../utils/emun/Enum';
import GuestHeader from './GuestHeader';
import EmployeeHeader from './EmployeeHeader';
import EmployerHeader from './EmployerHeader';
import StaffHeader from './StaffHeader';
import AdminHeader from './AdminHeader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Divider, List, ListItem, ListItemText, ListItemIcon, Box, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteCookie, getCookie } from '../../../services/AuthCookie';

// Map numeric RoleId in token to string role used by UI
const ROLE_MAP = {
  '1': 'admin',
  '2': 'staff',
  '3': 'employer',
  '4': 'employee',
};

function mapRoleIdToName(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return ROLE_MAP[String(num)] || null;
}

function parseRoleFromToken() {
  try {
    const raw = getCookie('token') || getCookie('user');
    if (!raw) return null;

    const decodePayload = (payload) => {
      try {
        return JSON.parse(decodeURIComponent(atob(payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
      } catch (e) {
        return null;
      }
    };

    // If token looks like JWT (three parts separated by .), decode payload
    if (raw.split && raw.split('.').length === 3) {
      const payload = raw.split('.')[1];
      const decoded = decodePayload(payload);
      if (decoded) {
        const roleId = decoded?.RoleId || decoded?.roleId;
        if (roleId) return mapRoleIdToName(roleId);
        const roleStr = decoded?.role || decoded?.role_name || decoded?.roleName || decoded?.role_id;
        if (roleStr) return String(roleStr).toLowerCase();
      }
      return null;
    }

    // Otherwise, if it's a JSON string with token/user object, try parse
    let obj = null;
    try { obj = JSON.parse(raw); } catch (e) { obj = null; }
    if (obj) {
      // token inside object
      const token = obj.token || obj.accessToken;
      if (token && token.split && token.split('.').length === 3) {
        const payload = token.split('.')[1];
        const decoded = decodePayload(payload);
        if (decoded) {
          const roleId = decoded?.RoleId || decoded?.roleId;
          if (roleId) return mapRoleIdToName(roleId);
          const roleStr = decoded?.role || decoded?.role_name || decoded?.roleName;
          if (roleStr) return String(roleStr).toLowerCase();
        }
      }

      // direct fields on object
      const roleId = obj.RoleId || obj.roleId || (obj.user && (obj.user.RoleId || obj.user.roleId));
      if (roleId) return mapRoleIdToName(roleId);
      const roleStr = obj.role || obj.roleName || obj.role_name || (obj.user && (obj.user.role || obj.user.roleName));
      if (roleStr) return String(roleStr).toLowerCase();
    }
  } catch (e) {
    // ignore parse errors
  }
  return null;
}

export default function Header({ role = 'guest' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  // If a valid role can be parsed from token, prefer it over passed prop
  const detected = parseRoleFromToken();

  const normalizeRoleProp = (r) => {
    if (r === null || r === undefined) return 'guest';
    // numeric RoleId -> name
    const n = Number(r);
    if (!Number.isNaN(n) && n > 0) return mapRoleIdToName(n) || 'guest';
    // object shape
    if (typeof r === 'object') {
      const candidate = r.RoleId || r.roleId || (r.user && (r.user.RoleId || r.user.roleId));
      if (candidate) return mapRoleIdToName(candidate) || 'guest';
      const str = r.role || r.roleName || r.role_name;
      if (str) return String(str).toLowerCase();
      return 'guest';
    }
    return String(r).toLowerCase();
  };

  const finalRole = detected || normalizeRoleProp(role) || 'guest';

  const Common = (
    <div className="flex items-center gap-2 md:gap-4">
      <a href="/" className="block">
        <img
          src="/image/Group 2.png"
          alt="Logo"
          className="w-16 h-12 md:w-40 md:h-16 object-contain"
          style={{ minWidth: 48, minHeight: 48 }}
        />
      </a>
    </div>
  );

  let RoleHeader = null;
  switch (finalRole) {
    case 'employee':
      RoleHeader = <EmployeeHeader />;
      break;
    case 'employer':
      RoleHeader = <EmployerHeader />;
      break;
    case 'staff':
      RoleHeader = <StaffHeader />;
      break;
    case 'admin':
      RoleHeader = <AdminHeader />;
      break;
    default:
      RoleHeader = <GuestHeader />;
  }

  return (
    <header
      className="w-full fixed left-0 z-50 bg-[#042852] shadow flex flex-col"
      style={{ top: 0, height: LAYOUT.HEADER_HEIGHT, minHeight: LAYOUT.HEADER_HEIGHT }}
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-8 py-2 h-full">
        {Common}
        <div className="flex-1 flex justify-end">
          <div className="flex gap-6 items-center flex-wrap">
            {RoleHeader}
          </div>
        </div>
      </div>
      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-10 py-2 h-full">
        <a href="/" className="block">
          <img
            src="/image/WorkVerseLogoCycle 1.png"
            alt="Logo"
            className="w-12 h-12 object-contain"
            style={{ minWidth: 48, minHeight: 48 }}
          />
        </a>
        <button className="text-white text-2xl focus:outline-none" onClick={() => setDrawerOpen(!drawerOpen)}>
          ☰
        </button>
      </div>
      {/* Drawer menu cho mobile: unified role links + account actions to avoid nested hamburgers */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="bg-[#042852] w-64 h-full p-4 flex flex-col gap-2 animate-slide-in-right text-white">
            <button
              className="self-end text-white text-2xl mb-2"
              onClick={() => setDrawerOpen(false)}
              aria-label="Đóng menu"
            >
              ×
            </button>

            {/* Account summary */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar sx={{ width: 56, height: 56 }}>{(user && (user.fullName || user.name)) ? (user.fullName || user.name).charAt(0).toUpperCase() : <AccountCircleIcon />}</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>{user?.fullName || user?.name || 'Tài khoản'}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.email || ''}</Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mb: 1 }} />

            {/* Role-specific links */}
            <List sx={{ color: 'white' }}>
              {finalRole === 'employee' && (
                  <>
                    <ListItem button component="a" href="/jobs" onClick={() => setDrawerOpen(false)}>
                      <ListItemText primary="Tìm việc" />
                    </ListItem>
                    <ListItem button onClick={() => { navigate('/notifications'); setDrawerOpen(false); }}>
                      <ListItemText primary="Thông báo" />
                    </ListItem>
                    <ListItem button onClick={() => { navigate('/calendar'); setDrawerOpen(false); }}>
                      <ListItemText primary="Lịch" />
                    </ListItem>
                  </>
                )}

              {finalRole === 'employer' && (
                <>
                  <ListItem button component="a" href="/employer/jobs" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Quản lý tuyển dụng" />
                  </ListItem>
                  <ListItem button component="a" href="/candidates" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Ứng viên" />
                  </ListItem>
                  <ListItem button onClick={() => { 
                    const resolvedEmployerId = (user?.profileType === 'employer' && user?.profileId) ? user.profileId : (user?.employerId ?? user?._raw?.EmployerId ?? null);
                    if (resolvedEmployerId) navigate(`/employer/${resolvedEmployerId}`); else navigate('/employer/setup');
                    setDrawerOpen(false);
                  }}>
                    <ListItemText primary="Hồ sơ" />
                  </ListItem>
                </>
              )}

              {finalRole === 'staff' && (
                <>
                  <ListItem button component="a" href="/staff/hr" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Quản lý nhân sự" />
                  </ListItem>
                  <ListItem button component="a" href="/staff/reports" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Báo cáo" />
                  </ListItem>
                  <ListItem button component="a" href="/staff/account" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Tài khoản" />
                  </ListItem>
                </>
              )}

              {finalRole === 'admin' && (
                <>
                  <ListItem button component="a" href="/admin" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                </>
              )}

              {finalRole === 'guest' && (
                <>
                  <ListItem button component="a" href="/jobs" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Việc làm" />
                  </ListItem>
                  <ListItem button component="a" href="/companies" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Nhà tuyển dụng" />
                  </ListItem>
                </>
              )}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

            {/* Account actions: show profile/logout only when logged in; otherwise show login/register */}
            <List>
              {user ? (
                <>
                  <ListItem button onClick={() => {
                    try {
                      const roleCandidate = (user && (user.roleId || user.RoleId)) || null;
                      const n = roleCandidate ? Number(roleCandidate) : null;
                      if (n === 3 || user?.profileType === 'employer') {
                        const resolvedEmployerId = (user?.profileType === 'employer' && user?.profileId) ? user.profileId : (user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null);
                        if (resolvedEmployerId) { navigate(`/employer/${resolvedEmployerId}`); setDrawerOpen(false); return; }
                        navigate('/employer/setup'); setDrawerOpen(false); return;
                      }
                      if (n === 4 || user?.profileType === 'employee') {
                        navigate('/employee/dashboard'); setDrawerOpen(false); return;
                      }
                    } catch (e) { /* ignore */ }
                    navigate('/profile'); setDrawerOpen(false);
                  }}>
                    <ListItemIcon><AccountCircleIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary={user?.profileType === 'employee' || user?.role === 'employee' ? 'Tổng quan' : 'Hồ sơ'} />
                  </ListItem>

                  <ListItem button onClick={() => {
                    deleteCookie('token'); deleteCookie('user'); try { setUser(null); } catch (e) { }
                    navigate('/');
                    setDrawerOpen(false);
                  }}>
                    <ListItemIcon><LogoutIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary="Đăng xuất" />
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem button onClick={() => { setDrawerOpen(false); navigate('/auth?form=login'); }}>
                    <ListItemText primary="Đăng nhập" />
                  </ListItem>
                  <ListItem button onClick={() => { setDrawerOpen(false); navigate('/auth?form=register'); }}>
                    <ListItemText primary="Đăng ký" />
                  </ListItem>
                </>
              )}
            </List>
          </div>
        </div>
      )}
      <style>
        {`
    .animate-slide-in-right {
      animation: slideInRight 0.2s;
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `}
      </style>
    </header>
  );
}