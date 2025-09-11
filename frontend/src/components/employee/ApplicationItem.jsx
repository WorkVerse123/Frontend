import React from 'react';

function StatusBadge({ status }) {
  const cls = status === 'Đang công tác' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function ApplicationItem({ app }) {
  const job = app.job || {};
  const emp = app.employer || {};
  const avatarChar = (emp.companyName && emp.companyName.charAt(0)) || (job.title && job.title.charAt(0)) || '?';

  return (
    <div className="flex items-center justify-between bg-white border rounded px-3 py-3">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#eaf2fb] rounded flex items-center justify-center font-semibold text-[#2563eb]">{avatarChar}</div>
        <div>
          <div className="font-semibold">{job.title}</div>
          <div className="text-sm text-gray-500">{emp.companyName || ''} • {job.location}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">{job.jobSalaryMin} - {job.jobSalaryMax} {job.jobSalaryCurrency} • {job.jobTime}</div>
        <StatusBadge status={app.status} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Chi tiết</button>
      </div>
    </div>
  );
}
