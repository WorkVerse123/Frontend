import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/common/loading/Loading';
import MainLayout from '../components/layout/MainLayout';
import CandidateList from '../components/candidates/CandidateList';
import FiltersSidebar from '../components/candidates/FiltersSidebar';
import useCandidates from '../hooks/useCandidates';

/**
 * CandidatesPage
 * - Loads mock data from public/mocks/.../get_candidates.json
 * - Renders responsive layout: sidebar on desktop, collapsible filters on mobile
 * - Contains small subcomponents (CandidateCard, CandidateList, FiltersSidebar)
 * - Keeps API layer swappable: replace fetchMock() with real API call later
 */
export default function CandidatesPage() {
  const {
    items: pageItems,
    loading,
    error,
    page,
    setPage,
    totalPages,
    query,
    setQuery,
    gender,
    setGender,
    education,
    setEducation,
  } = useCandidates();

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

