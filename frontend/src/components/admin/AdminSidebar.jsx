import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const items = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'create', label: 'Tạo Staff' },
];


export default function AdminSidebar({ active, onChange }) {
  const [expandedIncome, setExpandedIncome] = useState(true); 
  const { user } = useAuth();
  
  // Check if user has finance role (mapped from RoleId 16 in AuthContext)
  const isFinanceOnly = user?.role === 'finance'; 

  const allItems = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'employers', label: 'Nhà tuyển dụng' },
    { key: 'employees', label: 'Ứng viên' },
    { 
      key: 'income', 
      label: 'Tài chính',
      submenu: [
        { key: 'revenue', label: 'Doanh thu' },
        { key: 'transactions', label: 'Giao dịch' },
      ]
    },
    { key: 'create', label: 'Tạo Staff' },
    { key: 'reports', label: 'Báo cáo & Feedback' },
  ];

  // Filter items based on role
  const items = isFinanceOnly 
    ? allItems.filter(item => item.key === 'income') 
    : allItems;

  const handleItemClick = (item) => {
    if (item.submenu) {
      setExpandedIncome(!expandedIncome);
    } else {
      onChange(item.key);
    }
  };

  return (
    <aside className="md:col-span-3">
      <nav className="bg-white rounded-lg shadow p-3 border">
        <ul className="space-y-2 text-sm">
          {items.map(i => (
            <React.Fragment key={i.key}>
              <li
                onClick={() => handleItemClick(i)}
                className={`py-2 px-3 rounded cursor-pointer ${
                  active === i.key || (i.submenu && i.submenu.some(sub => sub.key === active))
                    ? 'bg-[#f3f7fb] font-medium' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{i.label}</span>
                  {i.submenu && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedIncome ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </li>
              {i.submenu && expandedIncome && (
                <ul className="ml-4 space-y-1">
                  {i.submenu.map(sub => (
                    <li
                      key={sub.key}
                      onClick={() => onChange(sub.key)}
                      className={`py-2 px-3 rounded cursor-pointer text-sm ${
                        active === sub.key 
                          ? 'bg-[#e6f0f9] font-medium text-blue-700' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {sub.label}
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
