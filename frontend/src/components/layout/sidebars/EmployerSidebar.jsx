// START: EmployerSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

export default function EmployerSidebar({ mobile }) {
  const baseMobile = mobile ? 'text-lg py-2 text-center' : '';
  // Match GuestEmployeeSidebar: left aligned, no horizontal padding on items
  const baseCommon = 'block w-full py-2 rounded-md transition-colors text-left';
  const linkClass = (isActive) => {
    if (isActive) return `${baseCommon} bg-blue-50 text-[#2563eb] font-semibold ${baseMobile}`;
    return `${baseCommon} text-gray-700 hover:bg-slate-100 ${baseMobile}`;
  };

  const { user } = useAuth();
  const resolvedEmployerId = user?.profileType === 'employer' && user?.profileId ? user.profileId : (user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null);
  const overviewTo = resolvedEmployerId ? `/employer/${resolvedEmployerId}` : '/employer/setup';

  const jobsTo = resolvedEmployerId ? `/employer/${resolvedEmployerId}` : '/employer/jobs';
  const setupTo = resolvedEmployerId ? `/employer/${resolvedEmployerId}/edit` : '/employer/setup';

  const links = [
    { to: overviewTo, label: 'Tổng quan' },
    { to: '/jobs/create', label: 'Tạo tin tuyển dụng' },
    { to: jobsTo, label: 'Tin tuyển dụng của tôi' },
    { to: '/candidates', label: 'Ứng viên đã lưu' },
    { to: '/subscription', label: 'Gói dịch vụ & thanh toán' },
    { to: setupTo, label: 'Thiết lập doanh nghiệp' },
  ];

  // add a little top offset on desktop so sidebar sits lower near content
  const navTopClass = mobile ? 'mt-8 px-2' : 'mt-6';

  return (
    <nav className={`${navTopClass}`} aria-label="Employer navigation">
      <div className="bg-white rounded-lg shadow p-3 border">
        <ul className="space-y-2 text-sm">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => `py-2 px-3 rounded cursor-pointer block ${isActive ? 'bg-[#f3f7fb] font-medium text-[#042852]' : 'text-gray-700 hover:bg-slate-50'}`}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
// END: EmployerSidebar.jsx