import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';

export async function fetchStats() {
  const M = await import('../../services/MocksService');
  return M.fetchMock('/mocks/JSON_DATA/responses/get_stats.json');
}

export default function StatsPanel({ setIsLoading }) {
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
    newJobs: 0,
  });
  useEffect(() => {
    let mounted = true;
    fetchStats()
      .then(res => {
        if (!mounted) return;
        setStats(res.data?.stats || res?.stats || res || {});
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setStats({ jobs: 0, companies: 0, candidates: 0, newJobs: 0 });
        setIsLoading(false);
      });
    return () => { mounted = false };
  }, [setIsLoading]);

  return (
    <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-4">
      <div className="bg-[#eaf2fb] rounded-xl p-6 text-center">
        <div className="text-2xl font-bold text-[#2563eb]">{stats.jobs}</div>
        <div className="text-gray-600">Việc làm</div>
      </div>
      <div className="bg-[#eaf2fb] rounded-xl p-6 text-center">
        <div className="text-2xl font-bold text-[#2563eb]">{stats.companies}</div>
        <div className="text-gray-600">Doanh nghiệp</div>
      </div>
      <div className="bg-[#eaf2fb] rounded-xl p-6 text-center">
        <div className="text-2xl font-bold text-[#2563eb]">{stats.candidates}</div>
        <div className="text-gray-600">Ứng viên</div>
      </div>
      <div className="bg-[#eaf2fb] rounded-xl p-6 text-center">
        <div className="text-2xl font-bold text-[#2563eb]">{stats.newJobs}</div>
        <div className="text-gray-600">Việc làm mới</div>
      </div>
    </section>
  );
}