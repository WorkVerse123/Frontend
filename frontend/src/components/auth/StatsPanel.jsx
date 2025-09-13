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
    if (typeof setIsLoading === 'function') setIsLoading(true);
    fetchStats()
      .then((res) => {
        if (res && res.data && res.data.stats) {
          setStats(res.data.stats);
        }
      })
      .catch(() => {
        // giữ giá trị mặc định khi lỗi
      })
      .finally(() => {
        if (typeof setIsLoading === 'function') setIsLoading(false);
      });
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