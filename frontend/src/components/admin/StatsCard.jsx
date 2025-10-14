import React from 'react';

export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-3xl text-gray-300">●</div>
    </div>
  );
}
