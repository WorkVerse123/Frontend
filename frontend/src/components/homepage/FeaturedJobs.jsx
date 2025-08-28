import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';

export async function fetchFeaturedJobs() {
  return handleAsync(
    fetch('/mocks/JSON_DATA/responses/get_jobs.json')
      .then(res => res.json())
  );
}

export default function FeaturedJobs({ setIsLoading }) {
  const [jobs, setJobs] = useState([]);

  function getDaysLeft(jobExpireAt, jobStatus) {
    if (jobStatus === "closed") return null;
    const expire = new Date(jobExpireAt);
    const now = new Date();
    const diff = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  }

  useEffect(() => {
    fetchFeaturedJobs().then(result => {
      // result.data là object, cần lấy ra jobs
      setJobs(result.data.jobs);
      setIsLoading(false);
    })
    .catch(() => {
      setJobs([]);
    });
  }, [setIsLoading]);


  return (
    <section className="max-w-6xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-[#042852]">Việc làm nổi bật</h2>
      <div className="flex flex-col gap-4">
        {jobs
        .filter(job => job.jobStatus === 'opened')
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
              <button className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Ứng Tuyển Ngay</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}