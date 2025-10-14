import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapLink from '../common/MapLink';
import { formatPrice } from '../../utils/formatPrice';

function StatusBadge({ status }) {
  const cls = status === 'Đang công tác' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function ApplicationItem({ app }) {
  const navigate = useNavigate();
  const job = app.job || {};
  const emp = app.employer || {};
  const location = job.location ?? job.jobLocation ?? job.job_location ?? job.address ?? emp.companyAddress ?? emp.company_address ?? null;
  const avatarChar = (emp.companyName && emp.companyName.charAt(0)) || (job.title && job.title.charAt(0)) || '?';

  // Use MapLink component for platform-aware map links

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between bg-white border rounded px-3 py-3 gap-3">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-[#eaf2fb] rounded flex items-center justify-center font-semibold text-[#2563eb]">{avatarChar}</div>
        <div className="min-w-0 overflow-hidden">
          <div className="font-semibold truncate">{job.title}</div>
          <div className="text-sm text-gray-500">Tên doanh nghiệp: {emp.companyName || ''}</div>
          {/* limit address width so it wraps instead of pushing layout; make clickable to open Google Maps */}
          {location ? (
              <div className="text-sm text-gray-500 max-w-[220px] break-words whitespace-normal">
                <span>Địa chỉ: </span>
                <MapLink address={location} />
              </div>
          ) : (
            <div className="text-sm text-gray-500">Địa chỉ: </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-4">
        <div className="text-sm text-gray-700 max-w-[220px] break-words whitespace-normal">{job.jobSalaryMin != null ? formatPrice(job.jobSalaryMin, job.jobSalaryCurrency || 'VND') : '—'}{job.jobSalaryMax != null ? ` - ${formatPrice(job.jobSalaryMax, job.jobSalaryCurrency || 'VND')}` : ''} {job.jobTime ? `• ${job.jobTime}` : ''}</div>
        <StatusBadge status={app.status} />
        <button
          onClick={() => {
            const jobId = job?.jobId || job?.job_id || job?.id || app?.jobId || app?.job_id || app?.id;
            if (jobId) {
              navigate(`/jobs/${jobId}`, { state: { job } });
            }
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >Chi tiết</button>
      </div>
    </div>
  );
}
