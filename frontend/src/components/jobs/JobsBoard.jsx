import React, { useEffect, useState } from 'react';
import JobCard from './JobCard';
import { handleAsync } from '../../utils/HandleAPIResponse';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet } from '../../services/ApiClient';

async function fetchJobs(page = 1, size = 10) {
  return handleAsync(apiGet(ApiEndpoints.JOBS_LIST(page, size)));
}

export default function JobsBoard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchJobs().then(res => {
      if (!mounted) return;
      const maybe = res?.data?.jobs || res?.data || res;
      if (Array.isArray(maybe)) setJobs(maybe);
    }).catch(() => { if (mounted) setJobs([]); }).finally(() => { /* no loading state here but keep mounted guard */ });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#042852]">Tìm việc</h2>
        <div className="text-sm text-gray-500">Hiển thị {jobs.length} kết quả</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => (
          <JobCard key={job.jobId} job={job} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center">
        <nav className="inline-flex items-center gap-2">
          <button className="px-3 py-1 rounded-full bg-white border">&lt;</button>
          <button className="px-3 py-1 rounded-full bg-[#2563eb] text-white">1</button>
          <button className="px-3 py-1 rounded-full bg-white border">2</button>
          <button className="px-3 py-1 rounded-full bg-white border">3</button>
          <button className="px-3 py-1 rounded-full bg-white border">&gt;</button>
        </nav>
      </div>
    </section>
  );
}
