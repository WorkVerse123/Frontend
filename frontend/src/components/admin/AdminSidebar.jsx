import React from 'react';

const items = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'users', label: 'Người dùng' },
  { id: 'create', label: 'Tạo Staff' },
];


export default function AdminSidebar({ active, onChange }) {
  const items = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'employers', label: 'Nhà tuyển dụng' },
    { key: 'employees', label: 'Ứng viên' },
    { key: 'income', label: 'Giao dịch' },
    { key: 'create', label: 'Tạo Staff' },
      { key: 'reports', label: 'Báo cáo & Feedback' },
  ];

  return (
    <aside className="md:col-span-3">
      <nav className="bg-white rounded-lg shadow p-3 border">
        <ul className="space-y-2 text-sm">
          {items.map(i => (
            <li
              key={i.key}
              onClick={() => onChange(i.key)}
              className={`py-2 px-3 rounded cursor-pointer ${active === i.key ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
            >
              {i.label}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
