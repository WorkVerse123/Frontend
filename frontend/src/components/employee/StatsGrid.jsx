import React from 'react';

export default function StatsGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {items.map(s => (
        <div key={s.label} className="bg-white rounded-lg p-4 border shadow-sm">
          <div className="text-sm text-gray-500">{s.label}</div>
          <div className="text-2xl font-bold text-[#042852] mt-2">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
