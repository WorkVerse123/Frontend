import React, { useEffect, useState } from 'react';
import ApiEndpoints from '../../services/ApiEndpoints';
import { post as apiPost } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';

export default function AdminIncomeHistoryPanel({ className = '' }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // filter inputs
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');
  const [minAmountInput, setMinAmountInput] = useState('');
  const [maxAmountInput, setMaxAmountInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [typeInput, setTypeInput] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    userId: null,
    planId: null,
    type: null,
    status: null,
    paymentMethod: null,
    fromDate: null,
    toDate: null,
    minAmount: null,
    maxAmount: null,
  });

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true); setError(null);
      try {
        const base = ApiEndpoints.ADMIN_PAYMENTS_FILTER;
        const url = `${base}?pageNumber=${page}&pageSize=${pageSize}`;
        const body = {
          userId: appliedFilters.userId ?? null,
          planId: appliedFilters.planId ?? null,
          type: appliedFilters.type ?? null,
          status: appliedFilters.status ?? null,
          paymentMethod: appliedFilters.paymentMethod ?? null,
          fromDate: appliedFilters.fromDate ?? null,
          toDate: appliedFilters.toDate ?? null,
          minAmount: appliedFilters.minAmount ?? null,
          maxAmount: appliedFilters.maxAmount ?? null,
        };
        const res = await handleAsync(apiPost(url, body, { signal: ac.signal }));
        if (!mounted) return;
        const result = res?.data ?? res;
        let items = [];
        let pageContainer = null;
        if (Array.isArray(result)) {
          items = result;
        } else if (result && typeof result === 'object') {
          if (Array.isArray(result.data)) {
            items = result.data;
            pageContainer = result;
          } else if (Array.isArray(result.data?.data)) {
            items = result.data.data;
            pageContainer = result.data;
          }
        }
  setPayments(Array.isArray(items) ? items : []);
  const pagingSource = pageContainer || result;
  // prefer totalRecords/pageSize when present, fallback to totalPages
  const totalRecords = pagingSource?.totalRecords ?? pagingSource?.totalRecordsCount ?? pagingSource?.total ?? null;
  const maybePageSize = pagingSource?.pageSize || pageSize;
  const tpFromRecords = totalRecords != null ? Math.max(1, Math.ceil(Number(totalRecords) / Number(maybePageSize || pageSize))) : null;
  const tp = tpFromRecords || pagingSource?.totalPages || pagingSource?.paging?.totalPages || pagingSource?.pageIndex || 1;
  setTotalPages(Number(tp) || 1);
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Lỗi khi tải lịch sử giao dịch');
        setPayments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [page, pageSize, appliedFilters]);

  const parseOrNull = (v) => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const applyFilters = () => {
    setPage(1);
    const fromDateISO = fromDateInput?.trim() ? (() => {
      try {
        const d = new Date(fromDateInput);
        return isNaN(d.getTime()) ? null : d.toISOString();
      } catch (e) {
        return null;
      }
    })() : null;
    const toDateISO = toDateInput?.trim() ? (() => {
      try {
        const d = new Date(toDateInput);
        return isNaN(d.getTime()) ? null : d.toISOString();
      } catch (e) {
        return null;
      }
    })() : null;
    setAppliedFilters({
      userId: null,
      planId: null,
      type: parseOrNull(typeInput),
      status: statusInput?.trim() === '' ? null : statusInput.trim(),
      paymentMethod: null,
      fromDate: fromDateISO,
      toDate: toDateISO,
      minAmount: parseOrNull(minAmountInput),
      maxAmount: parseOrNull(maxAmountInput),
    });
  };

  const resetFilters = () => {
    setFromDateInput(''); setToDateInput(''); setMinAmountInput(''); setMaxAmountInput(''); setStatusInput(''); setTypeInput('');
    setPage(1);
    setAppliedFilters({ userId: null, planId: null, type: null, status: null, paymentMethod: null, fromDate: null, toDate: null, minAmount: null, maxAmount: null });
  };

  return (
    <div className={`bg-white rounded shadow p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold mb-2 text-lg">Lịch sử giao dịch</h3>
        <div className="text-sm text-gray-600">Items: {payments.length}</div>
      </div>

      <div className="mb-3 bg-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 ">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">From</label>
              <input type="date" className="border rounded px-2 py-1 text-sm" value={fromDateInput} onChange={e => setFromDateInput(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs text-gray-600">To</label>
              <input type="date" className="border rounded px-2 py-1 text-sm" value={toDateInput} onChange={e => setToDateInput(e.target.value)} />
            </div>
          </div>

          <div className="p-3 ">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Min</label>
              <input type="number" min="0" placeholder="Min" className="border rounded px-2 py-1 text-sm w-28" value={minAmountInput} onChange={e => setMinAmountInput(e.target.value)} />
              <label className="text-xs text-gray-600">Max</label>
              <input type="number" min="0" placeholder="Max" className="border rounded px-2 py-1 text-sm w-28" value={maxAmountInput} onChange={e => setMaxAmountInput(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs text-gray-600">Type</label>
              <select className="border rounded px-2 py-1 text-sm" value={typeInput} onChange={e => setTypeInput(e.target.value)}>
                <option value="">All</option>
                <option value="1">Employee (1)</option>
                <option value="2">Employer (2)</option>
              </select>
              <label className="text-xs text-gray-600">Status</label>
              <select className="border rounded px-2 py-1 text-sm" value={statusInput} onChange={e => setStatusInput(e.target.value)}>
                <option value="">All</option>
                <option value="completed">completed</option>
                <option value="pending">pending</option>
                <option value="failed">failed</option>
              </select>
            </div>
          </div>

          <div className="p-3 flex items-center gap-2 justify-end">
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={applyFilters}>Apply</button>
            <button className="px-3 py-1 border rounded text-sm" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500 mb-2">Loading...</div>}
      {error && <div className="text-sm text-red-600 mb-2">Error: {error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="pr-4">ID</th>
              <th>Date</th>
              <th>User</th>
              <th>Plan</th>
              <th className="text-center">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {payments.map((p) => (
              <tr key={p.paymentId} className="border-t hover:bg-gray-50">
                <td className="py-2 pr-4">{p.paymentId}</td>
                <td className="py-2">{p.paymentDate ? (() => { const d = new Date(p.paymentDate); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })() : ''}</td>
                <td className="py-2">{p.user?.userId ?? p.userId}</td>
                <td className="py-2">{p.plan?.planName ?? p.planId}</td>
                <td className="py-2 text-center">{typeof p.amount === 'number' ? p.amount.toLocaleString() : p.amount}<span> VND</span></td>
                <td className="py-2">
                  <span
                    className={`text-sm px-2 py-0.5 rounded-full font-medium
                      ${p.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                        p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">Showing {payments.length} items</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Prev</button>
          <div className="text-sm">{page} / {totalPages}</div>
          <button className="px-2 py-1 border rounded disabled:opacity-50" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>Next</button>
        </div>
      </div>
    </div>
  );
}
