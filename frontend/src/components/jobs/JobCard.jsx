import React from 'react';

export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 flex items-center justify-center bg-[#f3f7fb] rounded-md overflow-hidden">
          {job.logo ? (
            <img src={job.logo} alt={job.companyName || 'logo'} className="w-12 h-12 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-[#2563eb] text-white rounded flex items-center justify-center font-bold">{(job.companyName || 'C').charAt(0)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-[#042852]">{job.jobTitle}</div>
              <div className="text-sm text-gray-500">{job.companyName} • {job.jobLocation}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700 font-semibold">{job.jobSalaryMin} - {job.jobSalaryMax} {job.jobSalaryCurrency}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {job.jobCategory && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{job.jobCategory}</span>
              )}
              {job.jobType && (
                <span className="text-xs text-gray-500">{job.jobType}</span>
              )}
            </div>
            <button className="bg-[#2563eb] text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700">Ứng Tuyển</button>
          </div>
        </div>
      </div>
    </div>
  );
}
