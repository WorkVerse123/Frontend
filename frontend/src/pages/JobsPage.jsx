import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JobCard from '../components/jobs/JobCard';
import { handleAsync } from '../utils/HandleAPIResponse';
import EndpointResolver from '../services/EndpointResolver';
import Loading from '../components/common/loading/Loading';

async function fetchJobs() {
  return handleAsync(EndpointResolver.get('/mocks/JSON_DATA/responses/get_jobs.json'));
}

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchJobs().then(res => {
      if (!mounted) return;
      if (res && res.data && Array.isArray(res.data.jobs)) setAllJobs(res.data.jobs);
    }).catch(() => { if (mounted) setAllJobs([]); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const locations = useMemo(() => {
    const set = new Set();
    allJobs.forEach(j => j.jobLocation && set.add(j.jobLocation));
    return Array.from(set);
  }, [allJobs]);

  const categories = useMemo(() => {
    const set = new Set();
    allJobs.forEach(j => j.jobCategory && set.add(j.jobCategory));
    return Array.from(set);
  }, [allJobs]);

  const types = useMemo(() => {
    const set = new Set();
    allJobs.forEach(j => j.jobType && set.add(j.jobType));
    return Array.from(set);
  }, [allJobs]);

  const filtered = useMemo(() => {
    return allJobs.filter(j => {
      if (keyword) {
        const k = keyword.toLowerCase();
        if (!((j.jobTitle || '').toLowerCase().includes(k) || (j.companyName || '').toLowerCase().includes(k))) return false;
      }
      if (location && j.jobLocation !== location) return false;
      if (category && j.jobCategory !== category) return false;
      if (type && j.jobType !== type) return false;
      return true;
    });
  }, [allJobs, keyword, location, category, type]);

  function clearFilters() {
    setKeyword('');
    setLocation('');
    setCategory('');
    setType('');
  }

  return (
    <MainLayout hasSidebar={false}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <aside className="col-span-1 bg-white rounded-xl p-4 shadow border">
          <h3 className="font-semibold text-lg mb-3">Bộ lọc</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Từ khóa</label>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Chức danh hoặc công ty" />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Khu vực</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Ngành nghề</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Loại hình</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => {}} className="flex-1 bg-[#2563eb] text-white px-3 py-2 rounded font-semibold">Áp dụng</button>
            <button onClick={clearFilters} className="flex-1 border rounded px-3 py-2">Xóa</button>
          </div>
        </aside>

        {/* Main results */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#042852]">Tìm việc</h2>
            <div className="text-sm text-gray-500">Hiển thị {filtered.length} kết quả</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full p-6 text-center text-gray-500">Đang tải...</div>
            ) : (
              filtered.map(job => <JobCard key={job.jobId} job={job} />)
            )}
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
        </div>
      </div>
    </MainLayout>
  );
}
