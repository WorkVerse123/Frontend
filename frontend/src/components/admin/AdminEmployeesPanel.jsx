import React, { useEffect, useState } from 'react';
import { get as apiGet } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import DOMPurify from 'dompurify';
import EmployeeProfilePanel from '../employee/EmployeeProfilePanel';

export default function AdminEmployeesPanel() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
  // Build a query string compatible with the backend: send pageIndex/pageNumber/page (1-based) and pageSize
  const qs = new URLSearchParams();
  qs.set('pageNumber', String(page));
  qs.set('pageSize', String(pageSize));
  const res = await apiGet(`${ApiEndpoints.ADMIN_EMPLOYEES}?${qs.toString()}`);
        if (!mounted) return;
        try { console.debug('AdminEmployeesPanel raw response', res); } catch (e) {}

        const payload = res?.data ?? res;
        const pageObj = payload?.data ?? payload;
        let list = [];
        if (Array.isArray(pageObj?.data)) list = pageObj.data;
        else if (Array.isArray(payload?.data)) list = payload.data;
        else if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(pageObj)) list = pageObj;

        setItems(list);

        // Determine paging info: server may return metadata at top-level (payload) or inside payload.data
        let paging = null;
        const looksLikePaging = (o) => !!(o && (o.pageIndex !== undefined || o.pageNumber !== undefined || o.page !== undefined || o.totalPages !== undefined || o.totalRecords !== undefined || o.total !== undefined));
        if (looksLikePaging(payload)) paging = payload;
        else if (looksLikePaging(pageObj)) paging = pageObj;
        else if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data) && looksLikePaging(payload.data)) paging = payload.data;

        if (paging) {
          // Map server pageIndex directly (server uses 1-based pageIndex like employer endpoint)
          const serverPageIndex = paging.pageIndex;
          const uiPage = serverPageIndex != null ? Number(serverPageIndex) : (paging.page ?? paging.pageNumber ?? page);
          setPage(uiPage);
          setPageSize(paging.pageSize ?? paging.page_size ?? pageSize);
          const pageSizeForCalc = paging.pageSize ?? paging.page_size ?? pageSize;
          setTotalPages(paging.totalPages ?? Math.max(1, Math.ceil((paging.totalRecords ?? paging.total ?? 0) / pageSizeForCalc)));
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize]);

  return (
    <div>
      <h3 className="font-semibold mb-3">Ứng viên</h3>
      {loading ? <InlineLoader/> : (
        <div className="bg-white rounded shadow p-4">
          {items.length === 0 ? <div className="text-sm text-gray-500">Không có ứng viên</div> : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th>Id</th>
                    <th>Họ tên</th>
                    <th>Giới tính</th>
                    <th>Địa chỉ</th>
                    <th>Avatar</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.employeeId || it.id} className="border-t">
                      <td className="py-2">{it.employeeId || it.id}</td>
                      <td>{it.fullName}</td>
                      <td>{it.gender}</td>
                      <td>{it.address}</td>
                      <td>{it.avatarUrl ? <img src={it.avatarUrl} alt="a" className="h-8 w-8 rounded" /> : '-'}</td>
                      <td>
                        <button onClick={async () => {
                          const id = it.employeeId || it.id || it.userId;
                          if (!id) { setDetail(it); return; }
                          try {
                            setDetailLoading(true);
                            const res = await apiGet(ApiEndpoints.EMPLOYEE_PROFILE(id));
                            try { console.debug('AdminEmployeesPanel employee profile', res); } catch (e) {}
                            const payload = res?.data ?? res;
                            const profile = payload?.data ?? payload;
                            setDetail(profile);
                          } catch (e) {
                            setDetail(it);
                          } finally {
                            setDetailLoading(false);
                          }
                        }} className="px-2 py-1 text-xs bg-gray-100 rounded">Xem</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 flex items-center gap-2 justify-end">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/40 px-4 pt-16 pb-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl" style={{ maxHeight: 'calc(100vh - 96px)', overflow: 'auto' }}>
            {detailLoading ? (
              <div className="p-6">Đang tải chi tiết...</div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Thông tin ứng viên</h3>
                  <button onClick={() => setDetail(null)} aria-label="Đóng" className="text-sm text-gray-600 hover:text-gray-800">Đóng</button>
                </div>

                <div className="p-6 flex-1 overflow-auto">
                  {/* Reuse the existing EmployeeProfilePanel in read-only mode */}
                  <EmployeeProfilePanel employee={detail} readOnly={true} />
                </div>

                <div className="px-6 py-4 border-t text-right">
                  <button onClick={() => setDetail(null)} className="px-4 py-2 bg-gray-100 rounded">Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
