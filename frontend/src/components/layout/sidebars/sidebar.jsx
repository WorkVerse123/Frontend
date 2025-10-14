import { LAYOUT } from '../../../utils/emun/Enum';
import { useState, useRef, useEffect } from 'react';
import GuestEmployeeSidebar from './GuestEmployeeSidebar';
import StaffAdminSidebar from './StaffAdminSidebar';
import EmployerSidebar from './EmployerSidebar';

export default function Sidebar({ role = 'guest' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const normalizedRole = (() => {
    if (role === null || role === undefined) return 'guest';
    const n = Number(role);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return 'guest';
      }
    }
    if (typeof role === 'object') {
      const candidate = role.RoleId || role.roleId || (role.user && (role.user.RoleId || role.user.roleId));
      if (candidate) {
        const num = Number(candidate);
        if (!Number.isNaN(num)) return num === 1 ? 'admin' : num === 2 ? 'staff' : num === 3 ? 'employer' : num === 4 ? 'employee' : 'guest';
      }
      const str = role.role || role.roleName || role.role_name;
      if (str) return String(str).toLowerCase();
      return 'guest';
    }
    return String(role).toLowerCase();
  })();

  let SidebarContent = null;
  if (normalizedRole === 'guest' || normalizedRole === 'employee') {
    SidebarContent = <GuestEmployeeSidebar mobile />;
  } else if (normalizedRole === 'staff') {
    SidebarContent = <StaffAdminSidebar isAdmin={false} mobile />;
  } else if (normalizedRole === 'admin') {
    SidebarContent = <StaffAdminSidebar isAdmin={true} mobile />;
  } else if (normalizedRole === 'employer') {
    SidebarContent = <EmployerSidebar mobile />;
  } else {
    SidebarContent = <GuestEmployeeSidebar mobile />;
  }

  return (
    <>
      {/* Desktop sidebar: render in normal flow so it scrolls with page content */}
      <aside
        className="hidden md:block"
        style={{
          width: LAYOUT.SIDEBAR_WIDTH,
        }}
        aria-label="Sidebar"
      >
        <div className="bg-white rounded-lg shadow p-4">
          {SidebarContent}
        </div>
      </aside>
      <button
        className="md:hidden fixed top-20 left-4 z-50 text-blue-500"
        onClick={() => setDrawerOpen(true)}
        aria-label="Mở menu sidebar"
      >
        ☰
      </button>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Mobile drawer — cho phép scroll nội dung nếu dài */}
          <div
            className="bg-white shadow flex flex-col gap-6 animate-slide-in-left overflow-auto"
            style={{
              width: LAYOUT.SIDEBAR_WIDTH,
              maxHeight: '100vh',
            }}
          >
            {SidebarContent}
          </div>
          <div
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Đóng menu"
          />
        </div>
      )}
      <style>
        {`
          .animate-slide-in-left {
            animation: slideInLeft 0.2s;
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </>
  );
}