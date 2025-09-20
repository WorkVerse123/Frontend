import { useEffect, useState } from 'react';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { fetchStats } from '../homepage/StatsPanel';

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
        const EndpointResolver = (await import('../../services/EndpointResolver')).default;
        const parsed = await EndpointResolver.get('/mocks/JSON_DATA/responses/get_stats.json', { signal: ac.signal });
        if (!mounted) return;
        setStats(parsed?.data || parsed || {});
      } catch (err) {
        if (!mounted) return;
        setStats({});
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