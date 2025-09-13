import { LAYOUT } from '../../../utils/emun/Enum';
import { useState, useRef, useEffect } from 'react';
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
        className="hidden md:block h-full"
        style={{
          width: LAYOUT.SIDEBAR_WIDTH,
          position: 'sticky',
          // dịch xuống nhiều hơn so với header
          top: 100,
          // lệch sang phải một chút
          marginLeft: 50,
        }}
        aria-label="Sidebar"
      >
        {/* Card wrapper — cao bằng nội dung bên trong */}
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