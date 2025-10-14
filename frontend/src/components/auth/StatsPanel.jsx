import { useEffect, useState } from 'react';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';

export default function StatsPanel({ setIsLoading }) {
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
    newJobs: 0,
  });

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    if (typeof setIsLoading === 'function') setIsLoading(true);
    (async () => {
      try {
        const res = await handleAsync(apiGet(ApiEndpoints.APPLICATION_STATS, { signal: ac.signal }));
        if (!mounted) return;
        const body = res?.data ?? res ?? {};
        const payload = body?.data ?? body?.stats ?? body;

        const jobs = Number(payload?.jobs ?? payload?.totalJobs ?? payload?.jobCount ?? 0) || 0;
        const companies = Number(payload?.companies ?? payload?.companyCount ?? 0) || 0;
        const candidates = Number(payload?.candidates ?? payload?.candidateCount ?? 0) || 0;
        const newJobs = Number(payload?.newJobs ?? payload?.newJobsThisWeek ?? payload?.recentJobs ?? 0) || 0;

        setStats({ jobs, companies, candidates, newJobs });
      } catch (err) {
        if (!mounted) return;
        setStats({ jobs: 0, companies: 0, candidates: 0, newJobs: 0 });
      } finally {
        if (typeof setIsLoading === 'function') setIsLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [setIsLoading]);

  return (
    <div className="flex flex-col justify-center items-center h-full text-white">
      <div className="text-2xl font-bold mb-8 text-center drop-shadow-lg">
        {Number(stats.candidates).toLocaleString()}+ Ứng viên đang<br />chờ việc làm
      </div>
      <div className="flex gap-12">
        <div className="flex flex-col items-center">
          <AssignmentIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">{Number(stats.jobs).toLocaleString()}</span>
          <span className="text-sm">Tuyển Nhân Sự</span>
        </div>
        <div className="flex flex-col items-center">
          <BusinessIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">{Number(stats.companies).toLocaleString()}</span>
          <span className="text-sm">Công ty / Doanh Nghiệp</span>
        </div>
        <div className="flex flex-col items-center">
          <WorkIcon sx={{ fontSize: 32, mb: 1 }} />
          <span className="text-xl font-bold">{Number(stats.newJobs).toLocaleString()}</span>
          <span className="text-sm">Công việc mới mỗi tuần</span>
        </div>
      </div>
    </div>
  );
}