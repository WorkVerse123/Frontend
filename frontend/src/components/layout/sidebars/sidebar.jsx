import { LAYOUT } from '../../../utils/emun/Enum';
import { useState } from 'react';
import GuestEmployeeSidebar from './GuestEmployeeSidebar';
import StaffAdminSidebar from './StaffAdminSidebar';
import EmployerSidebar from './EmployerSidebar';

export default function Sidebar({ role = 'guest' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  let SidebarContent = null;
  if (role === 'guest' || role === 'employee') {
    SidebarContent = <GuestEmployeeSidebar mobile />;
  } else if (role === 'staff') {
    SidebarContent = <StaffAdminSidebar isAdmin={false} mobile />;
  } else if (role === 'admin') {
    SidebarContent = <StaffAdminSidebar isAdmin={true} mobile />;
  } else if (role === 'employer') {
    SidebarContent = <EmployerSidebar mobile />;
  } else {
    SidebarContent = <GuestEmployeeSidebar mobile />;
  }

  return (
    <>
      <aside
        className="hidden md:flex fixed left-0 z-40 bg-white shadow flex-col px-6"
        style={{
          width: LAYOUT.SIDEBAR_WIDTH,
          top: LAYOUT.HEADER_HEIGHT,
          bottom: LAYOUT.FOOTER_HEIGHT + 52,
          maxHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT}px)`,
          overflowY: 'auto',
        }}
      >
        {role === 'guest' || role === 'employee' ? <GuestEmployeeSidebar /> :
         role === 'staff' ? <StaffAdminSidebar isAdmin={false} /> :
         role === 'admin' ? <StaffAdminSidebar isAdmin={true} /> :
         role === 'employer' ? <EmployerSidebar /> :
         <GuestEmployeeSidebar />}
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
          {/* Sidebar phủ toàn bộ, không có scroll, đè lên header/footer */}
          <div
            className="bg-white shadow flex flex-col gap-6 animate-slide-in-left"
            style={{
              width: LAYOUT.SIDEBAR_WIDTH,
              height: '100vh',
              maxHeight: '100vh',
              overflow: 'hidden',
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