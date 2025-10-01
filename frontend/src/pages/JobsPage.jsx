import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JobCard from '../components/jobs/JobCard';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/loading/Loading';
import Pagination from '@mui/material/Pagination';
import JobsFilters from '../components/jobs/JobsFilters';
import InlineLoader from '../components/common/loading/InlineLoader';

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  // new filter states
  const [selectedCategories, setSelectedCategories] = useState([]); // array of ids
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [jobTimeFilter, setJobTimeFilter] = useState('');
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  // appliedFilters holds the active filters used for fetching (set when user clicks Áp dụng)
  const [appliedFilters, setAppliedFilters] = useState({});

  // fetch job categories for the category filter dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await handleAsync(apiGet(ApiEndpoints.JOB_CATEGORIES));
        if (!mounted) return;
        const data = res?.data?.data || res?.data || res || {};
        // prefer data.jobCategories shape from backend sample, fallback to other shapes
        const arr = Array.isArray(data?.jobCategories)
          ? data.jobCategories
          : Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        // normalize to { id, name }
        const opts = arr.map((c) => ({ id: c.categoryId || c.id || c.category_id || c.value || c.key || c, name: c.categoryName || c.name || c.title || String(c) }));
        setCategoriesOptions(opts);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

    // helper: given a freshly fetched jobs array, fetch user's applications and mark applied flags
    async function markAppliedOnJobs(jobsArray, mountedRef = { v: true }) {
      try {
        const employeeId = user?.employeeId || null;
        if (!employeeId) {
          // no user -> just set jobs without applied flags
          if (mountedRef.v) setAllJobs(jobsArray || []);
          return;
        }
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_APPLICATIONS(employeeId)));
        const apps = res?.data?.applications || res?.data || res || [];
        const appliedIds = new Set((Array.isArray(apps) ? apps : []).map(a => String(a.jobId || a.jobId)));
        if (!mountedRef.v) return;
        setAllJobs((jobsArray || []).map(j => ({ ...j, applied: appliedIds.has(String(j.jobId || j.id)) })));
      } catch (e) {
        if (mountedRef.v) setAllJobs(jobsArray || []);
      }
    }

  // fetch jobs using server-side filters (JOB_FILTERS) or paged list when no applied filters
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        const f = appliedFilters || {};
        if (f.keyword) params.append('Search', f.keyword);
        // CategoryId can be multiple
        if (Array.isArray(f.selectedCategories) && f.selectedCategories.length > 0) {
          f.selectedCategories.forEach(id => params.append('CategoryId', String(id)));
        }
        if (f.salaryMin !== undefined && f.salaryMin !== '') params.append('SalaryMin', String(f.salaryMin));
        if (f.salaryMax !== undefined && f.salaryMax !== '') params.append('SalaryMax', String(f.salaryMax));
        if (f.jobTimeFilter !== undefined && f.jobTimeFilter !== '') params.append('JobTime', String(f.jobTimeFilter));

        // Decide which endpoint to call: full list when no filters, otherwise filters endpoint
        const hasFilter = params.toString().length > 0;
        let url;
        if (hasFilter) {
          // add pagination params only when calling the filter endpoint
          if (page) params.append('pageNumber', String(page));
          if (pageSize) params.append('pageSize', String(pageSize));
          url = ApiEndpoints.JOB_FILTERS + `?${params.toString()}`;
        } else {
          url = ApiEndpoints.JOBS_LIST(page, pageSize);
        }
        const res = await handleAsync(apiGet(url));
        if (!mounted) return;
        const data = res?.data?.data || res?.data || res || {};
        const arr = Array.isArray(data?.jobs)
          ? data.jobs
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data)
          ? data
          : [];
        // client-side safety sort: priority first then createdAt desc
        if (Array.isArray(arr)) {
          arr.sort((a, b) => {
            const pa = a?.isPriority ? 1 : 0;
            const pb = b?.isPriority ? 1 : 0;
            if (pa !== pb) return pb - pa; // true first
            const da = new Date(a.jobCreatedAt || a.jobCreatedAt || a.jobCreatedAt || a.createdAt || 0).getTime();
            const db = new Date(b.jobCreatedAt || b.jobCreatedAt || b.createdAt || 0).getTime();
            return db - da;
          });
          // mark applied flags before setting state
          await markAppliedOnJobs(arr, { v: mounted });
        } else {
          await markAppliedOnJobs([], { v: mounted });
        }

        const tp = data?.paging?.totalPages || data?.paging?.total || data?.totalPages || 1;
        if (!data?.paging?.totalPages && data?.paging?.total && pageSize) {
          setTotalPages(Math.max(1, Math.ceil(data.paging.total / pageSize)));
        } else if (typeof tp === 'number') {
          setTotalPages(tp);
        } else {
          setTotalPages(1);
        }
      } catch (e) {
        if (mounted) setAllJobs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize, appliedFilters]);

  // After job list loaded, fetch employee applications and mark applied jobs
  const { user } = useAuth();
  useEffect(() => {
    if (!allJobs || allJobs.length === 0) return;
    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const employeeId = user?.employeeId || null;
        if (!employeeId) return;
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_APPLICATIONS(employeeId), { signal: ac.signal }));
        const apps = res?.data?.applications || res?.data || res || [];
        const appliedIds = new Set((Array.isArray(apps) ? apps : []).map(a => String(a.jobId || a.jobId)));
        if (!mounted) return;
        setAllJobs(prev => prev.map(j => ({ ...j, applied: appliedIds.has(String(j.jobId || j.id)) })));
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [allJobs.length, user]);

  // location filter removed

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
      if (category && j.jobCategory !== category) return false;
      if (type && j.jobType !== type) return false;
      return true;
    });
  }, [allJobs, keyword, category, type]);

  function clearFilters() {
    setKeyword('');
    setCategory('');
    setType('');
    setSelectedCategories([]);
    setSalaryMin('');
    setSalaryMax('');
    setJobTimeFilter('');
    // clear applied filters to fetch the full jobs list
    setAppliedFilters({});
  }

  // called when user clicks Áp dụng in JobsFilters — copy current UI filter values into appliedFilters
  function onApply() {
    setAppliedFilters({
      keyword,
      selectedCategories,
      salaryMin,
      salaryMax,
      jobTimeFilter,
      category,
      type,
    });
    setPage(1);
  }

  // reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, category, type]);

  return (
    <MainLayout hasSidebar={false}>
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar filters (extracted to component) */}
        <aside className="col-span-1">
          <JobsFilters
            keyword={keyword}
            setKeyword={setKeyword}
            category={category}
            setCategory={setCategory}
            type={type}
            setType={setType}
            types={types}
            categoriesOptions={categoriesOptions}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            salaryMin={salaryMin}
            setSalaryMin={setSalaryMin}
            salaryMax={salaryMax}
            setSalaryMax={setSalaryMax}
            jobTimeFilter={jobTimeFilter}
            setJobTimeFilter={setJobTimeFilter}
            onApply={onApply}
            onClear={clearFilters}
          />
        </aside>

        {/* Main results */}
        <div className="col-span-1 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#042852]">Tìm việc</h2>
            <div className="text-sm text-gray-500">Hiển thị {filtered.length} kết quả</div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="col-span-full p-6 text-center text-gray-500"><InlineLoader /></div>
            ) : (
              filtered.map(job => <JobCard key={job.jobId} job={job} />)
            )}
          </div>

          <div className="mt-6 flex items-center justify-center">
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
