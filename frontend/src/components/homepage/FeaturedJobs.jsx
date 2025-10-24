import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { formatPrice } from '../../utils/formatPrice';
import InlineLoader from '../common/loading/InlineLoader';
import { Link } from 'react-router-dom';
import { set } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function FeaturedJobs({ setIsLoading }) {
  const [jobs, setJobs] = useState([]);
  const pageSize = 10;
  
  const [loading, setLoading] = useState(false);
  

  function getDaysLeft(jobExpireAt, jobStatus) {
    if (jobStatus === "closed") return null;
    const expire = new Date(jobExpireAt);
    const now = new Date();
    const diff = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }

  useEffect(() => {
    let mounted = true;
    // Fetch first page with pageSize (10) and keep only priority jobs (max 10)
    (async () => {
      try {
        setLoading(true);
        if (typeof setIsLoading === 'function') setIsLoading(true);
        const { get: apiGet } = await import('../../services/ApiClient');
        const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
        const result = await handleAsync(apiGet(ApiEndpoints.JOBS_LIST(1, pageSize)));
        if (!mounted) return;
        // Server may return wrapped payload: result.data => { statusCode, message, data: { paging, jobs } }
        const arr = Array.isArray(result?.data?.data?.jobs)
          ? result.data.data.jobs
          : Array.isArray(result?.data?.jobs)
          ? result.data.jobs
          : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];
  // Hiển thị cả job isPriority=false và true, style nổi bật cho isPriority=true
  setJobs(arr.slice(0, pageSize));
      } catch (err) {
        if (!mounted) return;
        setJobs([]);
      } finally {
        setLoading(false);
        if (typeof setIsLoading === 'function') setIsLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [setIsLoading]);


  const { user } = useAuth();
  // normalize role to string (handle RoleId, roleId, role, role_id, numeric values)
  const roleRaw = user?.role || user?.RoleId || user?.roleId || user?.role_id || '';
  const role = (() => {
    if (roleRaw === null || roleRaw === undefined || roleRaw === '') return '';
    const n = Number(roleRaw);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return String(roleRaw).toLowerCase();
      }
    }
    return String(roleRaw).toLowerCase();
  })();

  return (
    <section className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold mb-6 text-[#042852]">Việc làm nổi bật</h2>
        <div className="mb-4">
          <Link
            to="/jobs"
            className="text-sm text-[#2563eb] font-semibold hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {loading ? (
          <InlineLoader text="Đang tải việc làm..." />
        ) : (
          jobs
            .filter(job => job.jobStatus === 'open' || job.jobStatus === 'active')
            .map(job => {
              const isPriority = job.isPriority === 1 || job.isPriority === '1' || job.isPriority === true;
              const daysLeft = getDaysLeft(job.jobExpiredAt, job.jobStatus);
              return (
                <div
                  key={job.jobId}
                  className={
                    isPriority
                      ? 'bg-white rounded-xl shadow-2xl p-4 flex items-center justify-between border-2 border-yellow-400'
                      : 'bg-white rounded-xl shadow p-4 flex items-center justify-between border'
                  }
                >
                  <div>
                    <div className={isPriority ? 'font-semibold text-yellow-700 flex items-center' : 'font-semibold text-[#2563eb]'}>
                      {job.jobTitle}
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs ml-2">{job.jobCategory}</span>
                      {isPriority && (
                        <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-yellow-300 text-yellow-900 border border-yellow-500">Ưu tiên</span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {job.jobLocation} • {formatPrice(job.jobSalaryMin, 'VND')} - {formatPrice(job.jobSalaryMax, 'VND')}
                      {daysLeft && (
                        <span className="ml-2 text-xs text-green-600">
                          | Còn {daysLeft} ngày ứng tuyển
                        </span>
                      )}
                    </div>
                  </div>
                  { (role === 'admin' || role === 'staff' || role === 'employer') ? (
                    <Link to={`/jobs/${job.jobId || job.id}`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">Xem</Link>
                  ) : (
                    <button onClick={() => window.location.href = `/jobs/${job.jobId || job.id}`} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Ứng Tuyển Ngay</button>
                  )}
                </div>
              );
            })
        )}
      </div>
      {/* Hiển thị cả tin thường và tin ưu tiên, tin ưu tiên có style nổi bật */}
    </section>
  );
}