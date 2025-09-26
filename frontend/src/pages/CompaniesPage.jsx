import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import Loading from '../components/common/loading/Loading';
import CompanyCard from '../components/companies/CompanyCard';
import Pagination from '@mui/material/Pagination';

export default function CompaniesPage() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [companyType, setCompanyType] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await handleAsync(apiGet(ApiEndpoints.COMPANIES(page, pageSize)));
        if (!mounted) return;
        const data = res?.data?.data || res?.data || res || {};
        const arr = Array.isArray(data?.companies)
          ? data.companies
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        if (Array.isArray(arr)) setAllCompanies(arr);
        const tp = data?.paging?.totalPages || data?.paging?.total || data?.totalPages || 1;
        if (!data?.paging?.totalPages && data?.paging?.total && pageSize) {
          setTotalPages(Math.max(1, Math.ceil(data.paging.total / pageSize)));
        } else if (typeof tp === 'number') {
          setTotalPages(tp);
        } else {
          setTotalPages(1);
        }
      } catch (e) {
        if (mounted) setAllCompanies([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize]);

  const locations = useMemo(() => {
    const set = new Set();
    allCompanies.forEach(c => c.location && set.add(c.location));
    return Array.from(set);
  }, [allCompanies]);

  const types = useMemo(() => {
    const set = new Set();
    allCompanies.forEach(c => {
      const t = c.companyType || c.type || c.industry || c.employerType;
      if (t) set.add(t);
    });
    return Array.from(set);
  }, [allCompanies]);

  const filtered = useMemo(() => {
    return allCompanies.filter(c => {
      if (keyword) {
        const k = keyword.toLowerCase();
        if (!((c.name || '').toLowerCase().includes(k))) return false;
      }
      if (location && c.location !== location) return false;
      if (companyType) {
        const t = c.companyType || c.type || c.industry || c.employerType || '';
        if (t !== companyType) return false;
      }
      return true;
    });
  }, [allCompanies, keyword, location, companyType]);

  function clearFilters() {
    setKeyword('');
    setLocation('');
    setCompanyType('');
  }

  // reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, location, companyType]);

  return (
    <MainLayout hasSidebar={false}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <aside className="col-span-1 bg-white rounded-xl p-4 shadow border">
          <h3 className="font-semibold text-lg mb-3">Bộ lọc</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Từ khóa</label>
            <input value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Tên công ty" />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Khu vực</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Loại hình</label>
            <select value={companyType} onChange={e => setCompanyType(e.target.value)} className="w-full border rounded px-3 py-2">
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
            <h2 className="text-xl font-bold text-[#042852]">Danh sách doanh nghiệp</h2>
            <div className="text-sm text-gray-500">Hiển thị {filtered.length} kết quả</div>
          </div>

          {loading ? (
            <div className="col-span-full p-6 text-center text-gray-500">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map(c => <CompanyCard key={c.companyId || c.id} company={c} />)}
            </div>
          )}

          <div className="mt-6 flex items-center justify-center">
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
