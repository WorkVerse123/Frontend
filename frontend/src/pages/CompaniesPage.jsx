import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet, post as apiPost } from '../services/ApiClient';
import Loading from '../components/common/loading/Loading';
import CompanyCard from '../components/companies/CompanyCard';
import Pagination from '@mui/material/Pagination';

export default function CompaniesPage() {
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // filters
  const [keyword, setKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(''); // single id
  const [selectedEmployerType, setSelectedEmployerType] = useState(''); // single id

  const EMPLOYER_TYPE_OPTIONS = [
    { id: 1, label: 'Cá nhân' },
    { id: 2, label: 'Công ty' },
  ];

  const LOCATION_OPTIONS = [
    { id: 1, label: 'Hà Nội' },
    { id: 2, label: 'Hồ Chí Minh' },
    { id: 3, label: 'Hải Phòng' },
    { id: 4, label: 'Đà Nẵng' },
    { id: 5, label: 'Cần Thơ' },
    { id: 6, label: 'An Giang' },
    { id: 7, label: 'Bà Rịa - Vũng Tàu' },
    { id: 8, label: 'Bắc Giang' },
    { id: 9, label: 'Bắc Ninh' },
    { id: 10, label: 'Bình Dương' },
    { id: 11, label: 'Bình Định' },
    { id: 12, label: 'Bình Phước' },
    { id: 13, label: 'Bình Thuận' },
    { id: 14, label: 'Cà Mau' },
    { id: 15, label: 'Đắk Lắk' },
    { id: 16, label: 'Đắk Nông' },
    { id: 17, label: 'Đồng Nai' },
    { id: 18, label: 'Đồng Tháp' },
    { id: 19, label: 'Gia Lai' },
    { id: 20, label: 'Hà Nam' },
    { id: 21, label: 'Hà Tĩnh' },
    { id: 22, label: 'Hải Dương' },
    { id: 23, label: 'Hòa Bình' },
    { id: 24, label: 'Hưng Yên' },
    { id: 25, label: 'Khánh Hòa' },
    { id: 26, label: 'Kiên Giang' },
    { id: 27, label: 'Kon Tum' },
    { id: 28, label: 'Lâm Đồng' },
    { id: 29, label: 'Long An' },
    { id: 30, label: 'Nam Định' },
    { id: 31, label: 'Nghệ An' },
    { id: 32, label: 'Ninh Bình' },
    { id: 33, label: 'Ninh Thuận' },
    { id: 34, label: 'Phú Thọ' },
  ];

  // fetch employers from server using EMPLOYERS_FILTERS endpoint
  const fetchEmployers = async (opts = {}) => {
    const { p = page, s = pageSize } = opts;
    let mounted = true;
    try {
      setLoading(true);

      // Build query params for GET request. Backend expects pageNumber/pageSize and optional filters.
      const params = new URLSearchParams();
      params.set('pageNumber', String(p || 1));
      params.set('pageSize', String(s || pageSize));
      if (keyword && String(keyword).trim()) params.set('Search', String(keyword).trim());
      if (selectedEmployerType) params.set('EmployerTypeId', String(selectedEmployerType));
      if (selectedLocation) params.set('Locations', String(selectedLocation));

      const url = `${ApiEndpoints.EMPLOYERS_FILTERS}?${params.toString()}`;

      const res = await handleAsync(apiGet(url));
      const data = res?.data?.data || res?.data || res || {};
      const employersArr = data?.employers || data?.items || data?.companies || [];
      // Normalize backend employer objects to shape expected by CompanyCard
      const normalized = Array.isArray(employersArr)
        ? employersArr.map(e => ({
            // CompanyCard expects: logo, name, location, companyId (or id)
            companyId: e.employerId ?? e.companyId ?? e.id,
            id: e.employerId ?? e.companyId ?? e.id,
            name: e.companyName ?? e.name ?? '',
            logo: e.logoUrl ?? e.logo ?? '',
            location: e.address ?? e.location ?? '',
            employeeCount: e.employeeCount ?? e.size ?? null,
            // keep original raw object in case other components need it
            raw: e,
          }))
        : [];
      if (mounted) {
        setAllCompanies(normalized);
        // paging may contain page, pageSize, totalPages
        const paging = data?.paging || {};
        const tp = paging?.totalPages ?? 1;
        setTotalPages(typeof tp === 'number' ? tp : 1);
        // totalResults not always provided; fallback to employers length
        setTotalResults(paging?.total ?? employersArr.length);
      }
    } catch (e) {
      setAllCompanies([]);
      setTotalPages(1);
      setTotalResults(0);
    } finally {
      if (mounted) setLoading(false);
    }
    return () => { mounted = false; };
  };

  useEffect(() => {
    fetchEmployers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // we use server-side filters; available options come from constants above
  const keywordRef = useRef(null);

  function clearFilters() {
    // clear UI controls
  if (keywordRef.current) keywordRef.current.value = '';
  setKeyword('');
  setSelectedLocation('');
  setSelectedEmployerType('');
    // reset paging and fetch full list
    setPage(1);
    fetchEmployers({ p: 1 });
  }

  return (
    <MainLayout hasSidebar={false}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters */}
        <aside className="col-span-1 bg-white rounded-xl p-4 shadow border h-fit">
          <h3 className="font-semibold text-lg mb-3">Bộ lọc</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Từ khóa</label>
            <input ref={keywordRef} defaultValue={keyword} onChange={e => setKeyword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Tên công ty" />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Khu vực</label>
            <select value={String(selectedLocation || '')} onChange={e => setSelectedLocation(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {LOCATION_OPTIONS.map(loc => <option key={loc.id} value={loc.id}>{loc.label}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Loại hình</label>
            <select value={String(selectedEmployerType || '')} onChange={e => setSelectedEmployerType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Tất cả</option>
              {EMPLOYER_TYPE_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="text-xs text-gray-500 mt-1">1 = Cá nhân, 2 = Công ty</div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => { setPage(1); fetchEmployers({ p: 1 }); }} className="flex-1 bg-[#2563eb] text-white px-3 py-2 rounded font-semibold">Áp dụng</button>
            <button onClick={clearFilters} className="flex-1 border rounded px-3 py-2">Xóa</button>
          </div>
        </aside>

        {/* Main results */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#042852]">Danh sách doanh nghiệp</h2>
            <div className="text-sm text-gray-500">Hiển thị {totalResults} kết quả</div>
          </div>

          {loading ? (
            <div className="col-span-full p-6 text-center text-gray-500">Đang tải...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allCompanies.map(c => <CompanyCard key={c.employerId || c.companyId || c.id} company={c} />)}
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
