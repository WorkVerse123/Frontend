import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';
import InlineLoader from '../common/loading/InlineLoader';
import { Link } from 'react-router-dom';
import { set } from 'date-fns';

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
  // keep only priority jobs and cap to pageSize (10)
  const priority = arr.filter(j => (j.isPriority === 1 || j.isPriority === '1' || j.isPriority === true));
  setJobs(priority.slice(0, pageSize));
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
          .filter(job => (job.isPriority === 1 || job.isPriority === '1' || job.isPriority === true) && (job.jobStatus === 'opened' || job.jobStatus === 'active'))
          .map(job => {
            const daysLeft = getDaysLeft(job.jobExpireAt, job.jobStatus);
            return (
              <div key={job.jobId} className="bg-white rounded-xl shadow p-4 flex items-center justify-between border">
                <div>
                  <div className="font-semibold text-[#2563eb]">
                    {job.jobTitle}
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs ml-2">{job.jobCategory}</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {job.jobLocation} • {job.jobSalaryMin} - {job.jobSalaryMax} {job.jobSalaryCurrency}
                    {daysLeft && (
                      <span className="ml-2 text-xs text-green-600">
                        | Còn {daysLeft} ngày ứng tuyển
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => window.location.href = `/jobs/${job.jobId || job.id}`} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Ứng Tuyển Ngay</button>
              </div>
            );
          })
        )}
      </div>
      {/* No pagination — showing up to 10 priority jobs */}
    </section>
  );
}