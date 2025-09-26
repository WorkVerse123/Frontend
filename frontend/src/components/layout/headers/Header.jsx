import { LAYOUT } from '../../../utils/emun/Enum';
import GuestHeader from './GuestHeader';
import EmployeeHeader from './EmployeeHeader';
import EmployerHeader from './EmployerHeader';
import StaffHeader from './StaffHeader';
import AdminHeader from './AdminHeader';
import { useState } from 'react';
import { getCookie } from '../../../services/AuthCookie';

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
      {/* Drawer menu cho mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu"
          />
          <div className="bg-[#042852] w-64 h-full p-6 flex flex-col gap-6 animate-slide-in-right">
            <button
              className="self-end text-white text-2xl mb-4"
              onClick={() => setDrawerOpen(false)}
              aria-label="Đóng menu"
            >
              ×
            </button>
            {RoleHeader}
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