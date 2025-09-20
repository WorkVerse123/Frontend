import React, { useEffect, useState } from 'react';
import { handleAsync } from '../utils/HandleAPIResponse';
import EndpointResolver from '../services/EndpointResolver';
import JobSidebarInfo from '../components/jobs/JobSidebarInfo';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import ApplyJobDialog from '../components/common/modals/ApplyJobDialog';

async function fetchJob(id = 1) {
  return handleAsync(EndpointResolver.get(`/mocks/JSON_DATA/responses/get_job_id.json`));
}

export default function JobDetail() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const res = await handleAsync(EndpointResolver.get(`/mocks/JSON_DATA/responses/get_job_id.json`, { signal: ac.signal }));
        if (!mounted) return;
        if (!res) setJob(null);
        else if (res.data) setJob(res.data);
        else setJob(res);
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || (err?.message && String(err.message).toLowerCase().includes('cancel'));
        if (!isCanceled) setJob(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, []);

  return (
    <MainLayout role="guest" hasSidebar={false}>
      {loading && <Loading />}

      {!loading && !job && (
        <div className="max-w-4xl mx-auto py-8 px-4">Không tìm thấy công việc.</div>
      )}

      {job && (
        <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#042852]">{job.jobTitle}</h1>
                <div className="text-sm text-gray-500">
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{job.jobCategory}</span>
                </div>
              </div>
              <div>
                <button onClick={() => setApplyOpen(true)} className="bg-[#2563eb] text-white px-4 py-2 rounded font-semibold">Ứng tuyển ngay</button>
              </div>
            </div>

            <section className="prose prose-sm max-w-none text-gray-700">
              <h3 className='font-semibold'>Mô tả công việc</h3>
              <p>{job.jobDescription}</p>

              <h3 className='font-semibold'>Yêu cầu</h3>
              <p>{job.jobRequirements}</p>

              
            </section>
          </div>

          <div className="lg:col-span-1">
            <JobSidebarInfo job={job} />
          </div>
        </div>
      )}
  <ApplyJobDialog open={applyOpen} onClose={() => setApplyOpen(false)} jobId={job?.jobId} />
    </MainLayout>
  );
}
