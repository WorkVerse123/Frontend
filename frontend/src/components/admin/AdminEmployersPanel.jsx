import React, { useEffect, useState } from 'react';
import { get as apiGet } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import DOMPurify from 'dompurify';

export default function AdminEmployersPanel() {
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
        // Build a query string compatible with the backend: send pageNumber (1-based) and pageSize
        const qs = new URLSearchParams();
        qs.set('pageNumber', String(page));
        qs.set('pageSize', String(pageSize));
        const requestUrl = `${ApiEndpoints.ADMIN_EMPLOYERS}?${qs.toString()}`;
        try { console.debug('AdminEmployersPanel request url', requestUrl); } catch (e) {}
        const res = await apiGet(requestUrl);
        if (!mounted) return;
        try { console.debug('AdminEmployersPanel raw response', res); } catch (e) {}

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
          // Map server pageIndex/pageNumber to UI page (server uses 1-based indexing in these endpoints)
          const serverPageIndex = paging.pageIndex ?? paging.pageNumber ?? paging.page ?? page;
          const uiPage = serverPageIndex != null ? Number(serverPageIndex) : page;
          setPage(Number.isFinite(uiPage) ? uiPage : page);
          setPageSize(Number(paging.pageSize ?? paging.page_size ?? pageSize));
          const pageSizeForCalc = paging.pageSize ?? paging.page_size ?? pageSize;
          const calcTotal = Number(paging.totalPages ?? Math.max(1, Math.ceil((paging.totalRecords ?? paging.total ?? 0) / pageSizeForCalc)));
          setTotalPages(Number.isFinite(calcTotal) ? calcTotal : 1);
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
      <h3 className="font-semibold mb-3">Nhà tuyển dụng</h3>
      {loading ? <InlineLoader/>: (
        <div className="bg-white rounded shadow p-4">
          {items.length === 0 ? (
            <div className="text-sm text-gray-500">Không có nhà tuyển dụng hoặc dữ liệu chưa đúng định dạng (kiểm tra console)</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th>Id</th>
                    <th>Công ty</th>
                    <th>Địa chỉ</th>
                    <th>Liên hệ</th>
                    <th>Ngày thành lập</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => (
                    <tr key={it.employerId || it.id} className="border-t">
                      <td className="py-2">{it.employerId || it.id}</td>
                      <td>{it.companyName}</td>
                      <td>{it.address}</td>
                      <td>{it.contactEmail || it.contactPhone}</td>
                      <td>{formatDateToDDMMYYYY(it.dateEstablish)}</td>
                      <td>
                        <button onClick={async () => {
                          // fetch employer profile when opening detail modal
                          const id = it.employerId || it.id;
                          if (!id) { setDetail(it); return; }
                          try {
                            setDetailLoading(true);
                            const res = await apiGet(ApiEndpoints.EMPLOYER(id));
                            try { console.debug('AdminEmployersPanel employer profile', res); } catch (e) {}
                            const payload = res?.data ?? res;
                            // server might wrap profile under data
                            const profile = payload?.data ?? payload;
                            setDetail(profile);
                          } catch (e) {
                            // fallback to raw item
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
                <button disabled={Number(page) <= 1} onClick={() => setPage(p => Math.max(1, Number(p) - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
                <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                <button disabled={Number(page) >= Number(totalPages)} onClick={() => setPage(p => Math.min(Number(totalPages), Number(p) + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
              </div>
            </>
          )}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/40 px-4 pt-16 pb-6">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" style={{ maxHeight: 'calc(100vh - 96px)', overflow: 'auto' }}>
            {detailLoading ? (
              <div className="p-6">Đang tải chi tiết...</div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h4 className="font-semibold">{detail.companyName || detail.company_name || detail.name}</h4>
                  <button onClick={() => setDetail(null)} className="text-sm text-gray-600 hover:text-gray-800">Đóng</button>
                </div>

                <div className="p-6 flex-1 overflow-auto text-sm text-gray-700 space-y-4">
                  <div><strong>Địa chỉ:</strong> {detail.address}</div>
                  <div><strong>Website:</strong> {detail.websiteUrl || detail.website_url}</div>
                  <div><strong>Email:</strong> {detail.contactEmail || detail.contact_email}</div>
                  <div><strong>Phone:</strong> {detail.contactPhone || detail.contact_phone}</div>
                  <div><strong>Logo:</strong> {detail.logoUrl ? <img src={detail.logoUrl} alt="logo" className="h-16 w-16 rounded" /> : '-'}</div>
                  <div><strong>Ngày thành lập:</strong> {formatDateToDDMMYYYY(detail.dateEstablish || detail.date_establish)}</div>
                  <div><strong>Mô tả:</strong>
                    <div className="prose mt-1 max-w-none text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify ? DOMPurify.sanitize(detail.description || detail.content || '') : (detail.description || detail.content || '') }} />
                  </div>
                </div>

                <div className="px-6 py-4 border-t text-right">
                  <button onClick={() => setDetail(null)} className="px-3 py-1 bg-gray-100 rounded">Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
