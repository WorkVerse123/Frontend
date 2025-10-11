import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/common/loading/Loading';
import MainLayout from '../components/layout/MainLayout';
import CandidateList from '../components/candidates/CandidateList';
import FiltersSidebar from '../components/candidates/FiltersSidebar';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { handleAsync } from '../utils/HandleAPIResponse';

/**
 * CandidatesPage
 * - Loads mock data from public/mocks/.../get_candidates.json
 * - Renders responsive layout: sidebar on desktop, collapsible filters on mobile
 * - Contains small subcomponents (CandidateCard, CandidateList, FiltersSidebar)
 * - Keeps API layer swappable: replace fetchMock() with real API call later
 */
export default function CandidatesPage() {
  const [pageItems, setPageItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('any');
  const [education, setEducation] = useState('any');
  // Draft vs applied filters: allow user to change controls and click "Áp dụng" to fetch
  const [appliedFilters, setAppliedFilters] = useState({ query: '', gender: 'any', education: 'any' });

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
        if (appliedFilters.query) qs.set('q', appliedFilters.query);
        if (appliedFilters.gender && appliedFilters.gender !== 'any') qs.set('gender', appliedFilters.gender);
        if (appliedFilters.education && appliedFilters.education !== 'any') qs.set('education', appliedFilters.education);
        const url = `${ApiEndpoints.JOB_CANDIDATES(page, pageSize)}${appliedFilters.query || appliedFilters.gender !== 'any' || appliedFilters.education !== 'any' ? `&${qs.toString()}` : ''}`;
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
  }, [page, pageSize]);

  // Handlers for FiltersSidebar
  const handleApply = () => {
    setPage(1);
    setAppliedFilters({ query, gender, education });
  };
  const handleReset = () => {
    setQuery(''); setGender('any'); setEducation('any');
    setPage(1);
    setAppliedFilters({ query: '', gender: 'any', education: 'any' });
  };

  return (
    <MainLayout role='employer' hasSidebar={false}>
      <div className="max-w-6xl mx-auto">
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
      </div>
    </MainLayout>
  );
}

