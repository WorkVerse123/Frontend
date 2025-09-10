import React from 'react';

export default function JobSidebarInfo({ job }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border">
        <h4 className="font-semibold text-[#042852] mb-3">Tổng quan công việc</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div><strong>Địa điểm:</strong> {job.jobLocation}</div>
          <div><strong>Lương:</strong> {job.jobSalaryMin} - {job.jobSalaryMax} {job.jobSalaryCurrency} / {job.jobTime}</div>
          <div><strong>Loại công việc:</strong> {job.jobType || 'Part-time'}</div>
          <div><strong>Hạn ứng tuyển:</strong> {new Date(job.jobExpireAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <h4 className="font-semibold text-[#042852] mb-3">Thông tin doanh nghiệp</h4>
        <div className="text-sm text-gray-600">
          <div>Tên doanh nghiệp: {job.companyName || 'Công ty A'}</div>
          <div>Địa chỉ: {job.jobLocation}</div>
          <div className="mt-3">
            <button className="w-full bg-[#E7F0FA] text-[#0A65CC] px-4 py-2 rounded font-semibold">Xem trang doanh nghiệp</button>
          </div>
        </div>
      </div>
    </div>
  );
}
