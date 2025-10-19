import React from 'react';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { useNavigate } from 'react-router-dom';
import MapLink from '../common/MapLink';

export default function JobSidebarInfo({ job }) {
  const navigate = useNavigate();

  // Robust extraction of employer id from multiple possible shapes
  const employerId = job?.employerId ?? job?.EmployerId ?? job?._employer?.employerId ?? job?._employer?.id ?? job?.employer?.id ?? job?.companyId ?? null;

  const companyName = job?.companyName ?? job?.employerName ?? job?._employer?.companyName ?? job?._employer?.name ?? 'Công ty ABC';
  const logoUrl = job?.logoUrl ?? job?._employer?.logoUrl ?? job?._employer?.logo ?? '';

  const handleViewEmployer = () => {
    if (employerId) navigate(`/employer/${employerId}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 border">
        <h4 className="font-semibold text-[#042852] mb-3">Tổng quan công việc</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <strong>Địa điểm:</strong>{' '}
            {job?.jobLocation ? <MapLink address={job.jobLocation} /> : 'Không rõ'}
          </div>
          <div>
            <strong>Lương:</strong>{' '}
            {job?.jobSalaryMin != null || job?.jobSalaryMax != null ? (
                <span className='font-bold'>{job?.jobSalaryMin != null ? formatPrice(job.jobSalaryMin, job.jobSalaryCurrency || 'VND') : '—'}{job?.jobSalaryMax != null ? ` - ${formatPrice(job.jobSalaryMax, job.jobSalaryCurrency || 'VND')}` : ''} / giờ</span>
            ) : (
              'Thương lượng'
            )}
          </div>
          <div><strong>Loại công việc:</strong> {job?.jobType ?? job?.jobTime ?? 'Không rõ'}</div>
          <div>
            <strong>Hạn ứng tuyển:</strong>{' '}
           <span className='text-green-600 font-semibold'>
             {(() => {
               const raw = job?.jobExpiredAt ?? job?.jobExpireAt ?? job?.jobCreatedAt;
               const formatted = formatDateToDDMMYYYY(raw);
               return formatted || 'Không rõ';
             })()}
           </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <h4 className="font-semibold text-[#042852] mb-3">Thông tin doanh nghiệp</h4>
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">Logo</div>
            )}
            <div className="font-medium">{companyName}</div>
          </div>

          <div className="mt-3">
            <button
              onClick={handleViewEmployer}
              disabled={!employerId}
              className={`w-full px-4 py-2 rounded font-semibold ${employerId ? 'bg-[#E7F0FA] text-[#0A65CC]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
              Xem trang doanh nghiệp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
