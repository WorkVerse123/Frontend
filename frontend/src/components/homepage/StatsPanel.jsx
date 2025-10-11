import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';
import InlineLoader from '../common/loading/InlineLoader';

export async function fetchStats() {
  const { get: apiGet } = await import('../../services/ApiClient');
  const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
  return handleAsync(apiGet(ApiEndpoints.APPLICATION_STATS || '/api/applications/stats'));
}

export default function StatsPanel({ setIsLoading }) {
  const [stats, setStats] = useState({
    jobs: 0,
    companies: 0,
    candidates: 0,
    newJobs: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (typeof setIsLoading === 'function') setIsLoading(true);
        const res = await fetchStats();
        if (!mounted) return;
        // Normalize possible shapes: res may already be normalized by ApiClient
        const s = res?.data?.stats ?? res?.stats ?? res?.data ?? res ?? {};
        setStats({
          jobs: s.jobs ?? s.totalJobs ?? 0,
          companies: s.companies ?? s.totalCompanies ?? 0,
          candidates: s.candidates ?? s.totalCandidates ?? 0,
          newJobs: s.newJobs ?? s.newJobsCount ?? 0,
        });
      } catch (e) {
        if (!mounted) return;
        setStats({ jobs: 0, companies: 0, candidates: 0, newJobs: 0 });
      } finally {
        setLoading(false);
        if (typeof setIsLoading === 'function') setIsLoading(false);
      }
    })();

    return () => { mounted = false };
  }, [setIsLoading]);

  return (
    <section className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-4 bg-white rounded-xl">
      {loading ? (
        <div className="col-span-2 md:col-span-4">
          <InlineLoader text="Đang tải thống kê..." />
        </div>
      ) : (
        <>
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
        </>
      )}
    </section>
  );
}