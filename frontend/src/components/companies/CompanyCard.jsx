import React from 'react';
import { Link } from 'react-router-dom';

export default function CompanyCard({ company }) {
  return (
    <div
      className="rounded-xl shadow p-4 border relative bg-white"
      style={company.isPriority ? { border: '2px solid #facc15' } : {}}
    >
      <div className='flex items-center gap-3'>
        <img src={company.logo} alt={company.name} className="w-12 h-12 rounded" />
        <div>
          <div className="font-semibold text-[#042852]">{company.name}</div>
          <div className="text-sm text-gray-500">{company.location}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">{company.employeeCount ? `${company.employeeCount} nhân viên` : ''}</div>
        <Link to={`/employer/${company.companyId || company.id}`} className="text-sm text-[#2563eb] font-semibold">Xem</Link>
      </div>
    </div>
  );
}
