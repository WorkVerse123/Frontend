import React from 'react';
import { useNavigate } from 'react-router-dom';

function StatusBadge({ status }) {
  const cls = status === 'Đang công tác' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function AppliedJobs({ items = [], onView = () => {} }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Công việc đã ứng tuyển</div>
        <div className="text-sm text-gray-500">Tổng {items.length}</div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500">Bạn chưa ứng tuyển công việc nào.</div>
        )}

        {items.map(app => {
          const rawJob = app.job || {};
          const emp = app.employer || {};

          // Normalize common fields from different mock shapes
          const title = rawJob.title || rawJob.jobTitle || app.jobTitle || '';
          const location = rawJob.location || rawJob.jobLocation || app.jobLocation || '';
          const companyName = emp.companyName || app.companyName || '';
          const avatar = (companyName && companyName.charAt(0)) || (title && title.charAt(0)) || '?';

          // status may be in different fields
          const status = app.status || app.applicationStatus || 'Chưa có';

          // applied date normalization
          const appliedRaw = app.appliedAt || app.applied_at || app.appliedAt;
          let applied = '';
          if (appliedRaw) {
            try {
              applied = new Date(appliedRaw).toLocaleDateString();
            } catch (e) {
              applied = appliedRaw;
            }
          }

          // salary display fallback
          let salaryDisplay = rawJob.salaryDisplay || rawJob.jobSalaryDisplay || rawJob.salary || '';
          if (!salaryDisplay && rawJob.jobSalaryMin != null && rawJob.jobSalaryMax != null) {
            salaryDisplay = `${rawJob.jobSalaryMin} - ${rawJob.jobSalaryMax} ${rawJob.jobSalaryCurrency || ''} • ${rawJob.jobTime || ''}`.trim();
          }

          // Resolve job id from various shapes: nested job object, top-level fields, or common id fields
          const resolvedJobId = rawJob.jobId || rawJob.job_id || rawJob.id || app.jobId || app.job_id || (rawJob && (rawJob.jobId || rawJob.id));

          const key = app.applicationId || app.application_id || `${resolvedJobId || app.jobId || app.job_id}-${app.employeeId || app.employee_id}`;

          return (
            <div key={key} className="flex items-center justify-between bg-white border rounded px-3 py-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#eaf2fb] rounded flex items-center justify-center font-semibold text-[#2563eb]">{avatar}</div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm text-gray-500">{companyName} • {location}</div>
                  <div className="text-xs text-gray-400 mt-1">Ứng tuyển: {applied}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">{salaryDisplay || ''}</div>
                <StatusBadge status={status} />
                <button
                  onClick={() => {
                    if (resolvedJobId) {
                      onView(resolvedJobId);
                      navigate(`/jobs/${resolvedJobId}`);
                    } else {
                      onView(app);
                    }
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
