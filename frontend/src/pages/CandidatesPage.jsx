import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/common/loading/Loading';
import MainLayout from '../components/layout/MainLayout';
import CandidateList from '../components/candidates/CandidateList';
import FiltersSidebar from '../components/candidates/FiltersSidebar';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { handleAsync } from '../utils/HandleAPIResponse';
import { useAuth } from '../contexts/AuthContext';

/**
 * CandidatesPage
 * - Loads mock data from public/mocks/.../get_candidates.json
 * - Renders responsive layout: sidebar on desktop, collapsible filters on mobile
 * - Contains small subcomponents (CandidateCard, CandidateList, FiltersSidebar)
 * - Keeps API layer swappable: replace fetchMock() with real API call later
 */
export default function CandidatesPage() {
  const { user } = useAuth();
    const [loadingUser, setLoadingUser] = useState(true);
    useEffect(() => {
      if (user !== undefined && user !== null) setLoadingUser(false);
    }, [user]);
  const roleRaw = user?.role || user?.RoleId || user?.roleId || user?.role_id || '';
  const role = (() => {
    if (roleRaw === null || roleRaw === undefined || roleRaw === '') return '';
    const n = Number(roleRaw);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return String(roleRaw).toLowerCase();
      }
    }
    return String(roleRaw).toLowerCase();
  })();
  const isPremium = (() => {
    try {
      const raw = user?.IsPremium ?? user?._raw?.IsPremium ?? user?.isPremium ?? user?.is_premium;
      if (raw === true) return true;
      if (typeof raw === 'string') return String(raw).toLowerCase() === 'true';
      return Boolean(raw);
    } catch (e) { return false; }
  })();
  const canViewCandidates = (role === 'employer' && isPremium) || role === 'admin';
  const [pageItems, setPageItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  // multi-select filters: arrays of string ids (matching the API numeric codes)
  const [gender, setGender] = useState([]);
  const [education, setEducation] = useState([]);
  const [locations, setLocations] = useState([]);
  // Draft vs applied filters: allow user to change controls and click "Áp dụng" to fetch
  const [appliedFilters, setAppliedFilters] = useState({ query: '', gender: [], education: [], locations: [] });

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true); setError(null);
      try {
        // Build endpoint with applied filters
        const qs = new URLSearchParams();
        qs.set('pageNumber', String(page));
        qs.set('pageSize', String(pageSize));
        // Search -> map to Search param expected by API
        if (appliedFilters.query) qs.set('Search', appliedFilters.query);
        // Multiple employee education -> repeated EmployeeEducation params
        if (Array.isArray(appliedFilters.education) && appliedFilters.education.length > 0) {
          appliedFilters.education.forEach(val => qs.append('EmployeeEducation', String(val)));
        }
        // Multiple gender -> repeated Gender params
        if (Array.isArray(appliedFilters.gender) && appliedFilters.gender.length > 0) {
          appliedFilters.gender.forEach(val => qs.append('Gender', String(val)));
        }
        // Multiple locations -> repeated EmployeeLocation params
        if (Array.isArray(appliedFilters.locations) && appliedFilters.locations.length > 0) {
          appliedFilters.locations.forEach(val => qs.append('EmployeeLocation', String(val)));
        }

        const url = `${ApiEndpoints.JOB_CANDIDATES(page, pageSize)}&${qs.toString()}`;
        const res = await handleAsync(apiGet(url, { signal: ac.signal }));
        if (!mounted) return;
        const outer = res?.data ?? res;
        const payload = outer?.data ?? outer;
        const arr = payload?.candidates ?? payload?.data?.candidates ?? payload ?? [];
        setPageItems(Array.isArray(arr) ? arr : []);
        // try to infer total pages from paging metadata if present
        const total = payload?.totalPages || payload?.paging?.totalPages || 1;
        setTotalPages(Number(total) || 1);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Lỗi khi tải ứng viên');
        setPageItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [page, pageSize, appliedFilters]);

  // Handlers for FiltersSidebar
  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ query, gender, education, locations });
  };
  const handleReset = () => {
    setQuery(''); setGender('any'); setEducation('any');
    setPage(1);
    setGender([]); setEducation([]); setLocations([]);
    setAppliedFilters({ query: '', gender: [], education: [], locations: [] });
  };

  return (
    <MainLayout role={role} hasSidebar={false}>
      <div className="max-w-6xl mx-auto">
        {loadingUser ? (
          <Loading />
        ) : !canViewCandidates ? (
          <div className="p-6 bg-yellow-50 rounded text-sm text-slate-700">Chức năng tìm ứng viên chỉ dành cho nhà tuyển dụng trả phí (IsPremium). Vui lòng nâng cấp để truy cập.</div>
        ) : (
        <div className="flex gap-6">
          {/* Sidebar - hidden on small screens */}
          <div className="hidden md:block w-72">
            <FiltersSidebar
              query={query}
              setQuery={setQuery}
              gender={gender}
              setGender={setGender}
              education={education}
              setEducation={setEducation}
              locations={locations}
              setLocations={setLocations}
              onApply={handleApply}
              onReset={handleReset}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">Tìm ứng viên</h1>
              {/* Mobile filter toggle - simple jump to filters (anchors to top) */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="px-3 py-2 border rounded bg-white text-sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Bộ lọc
                </button>
              </div>
            </div>

            {/* mobile filters at top */}
            <div className="block md:hidden mb-4">
              <FiltersSidebar
                query={query}
                setQuery={setQuery}
                gender={gender}
                setGender={setGender}
                education={education}
                setEducation={setEducation}
                locations={locations}
                setLocations={setLocations}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>

            {loading ? <Loading /> : error ? (
              <div className="p-6 bg-red-50 text-red-700 rounded">Lỗi: {error}</div>
            ) : (
              <>
                <CandidateList items={pageItems} />

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >Trước</button>
                  <div className="text-sm">{page} / {totalPages}</div>
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >Sau</button>
                </div>
              </>
            )}
          </div>
        </div>
        )}
      </div>
    </MainLayout>
  );
}

