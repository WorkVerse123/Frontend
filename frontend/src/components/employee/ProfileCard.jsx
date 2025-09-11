import React from 'react';

export default function ProfileCard({ name = 'Tên người dùng', role = 'Ứng viên' }) {
  const initial = (name && name.charAt(0)) || 'A';
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#e6f0fb] flex items-center justify-center font-bold text-[#042852]">{initial}</div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{role}</div>
        </div>
      </div>
    </div>
  );
}
