import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * useCandidates
 * - Handles loading candidates (mock or via passed apiFetch)
 * - Provides filter state (query, gender, education) and pagination
 * - Keeps API fetch swappable by passing `apiFetch` which should return a parsed json
 */
export default function useCandidates({ pageSize = 10, apiFetch } = {}) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [gender, setGender] = useState('any');
  const [education, setEducation] = useState('any');

  const [page, setPage] = useState(1);
  const [reloadCounter, setReloadCounter] = useState(0);

  const refresh = useCallback(() => setReloadCounter((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (apiFetch) {
          const data = await apiFetch();
          if (!cancelled) setAll(data?.data?.candidates || []);
        } else {
          const { get: apiGet } = await import('../services/ApiClient');
          const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
          const json = await apiGet(ApiEndpoints.JOBS + '/candidates', { signal: ac.signal });
          if (!cancelled) setAll(json?.data?.candidates || json?.data || json || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; ac.abort(); };
  }, [apiFetch, reloadCounter]);

  const filtered = useMemo(() => {
    return (all || []).filter((c) => {
      if (gender !== 'any' && (c.gender || '').toLowerCase() !== String(gender || '').toLowerCase()) return false;

      if (education !== 'any') {
        const candidateEdu = String(c.employeeEducation || '').toLowerCase().trim();
        const filterEdu = String(education || '').toLowerCase().trim();
        if (!candidateEdu.includes(filterEdu)) return false;
      }

      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${c.jobTitle || ''} ${c.employeeLocation || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, gender, education, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const items = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  return {
    items,
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
    refresh,
  };
}
