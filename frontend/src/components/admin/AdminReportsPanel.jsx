import React, { useEffect, useState } from 'react';
import { get as apiGet, put as apiPut } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import Loading from '../common/loading/Loading';
import InlineLoader from '../common/loading/InlineLoader';

export default function AdminReportsPanel() {
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // feedback paging
  const [fbPage, setFbPage] = useState(1);
  const [fbPageSize, setFbPageSize] = useState(10);
  const [fbTotalPages, setFbTotalPages] = useState(1);
  const [updating, setUpdating] = useState(null); // reportId being updated
  const [editingStatus, setEditingStatus] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const rQs = new URLSearchParams();
        rQs.set('pageNumber', String(page));
        rQs.set('pageSize', String(pageSize));
        // Use admin reports endpoint for admin panel
        const rRes = await apiGet(`${ApiEndpoints.REPORTS}?${rQs.toString()}`);
        const fQs = new URLSearchParams();
        fQs.set('pageNumber', String(fbPage));
        fQs.set('pageSize', String(fbPageSize));
        const fRes = await apiGet(`${ApiEndpoints.FEEDBACKS}?${fQs.toString()}`);
        if (!mounted) return;

        // Normalize response shapes: prefer res.data, but sometimes API nests data under data
        const rPayload = rRes?.data ?? rRes;
        // New API shape: { data: { paging: {...}, reports: [...] } }
        const rDataObj = rPayload?.data ?? rPayload;
        // Prefer explicit reports array at data.reports or dataObj.reports
        let reportsList = [];
        if (Array.isArray(rPayload?.reports)) reportsList = rPayload.reports;
        else if (Array.isArray(rDataObj?.reports)) reportsList = rDataObj.reports;
        else if (Array.isArray(rDataObj?.data)) reportsList = rDataObj.data;
        else if (Array.isArray(rPayload?.data)) reportsList = rPayload.data;
        else if (Array.isArray(rPayload)) reportsList = rPayload;
        else if (Array.isArray(rDataObj)) reportsList = rDataObj;
        setReports(reportsList);

        // Determine paging info for reports (server may put it at data.paging or payload.data)
        let rPaging = null;
        const looksLikePaging = (o) => !!(o && (o.pageIndex !== undefined || o.pageNumber !== undefined || o.page !== undefined || o.totalPages !== undefined || o.totalRecords !== undefined || o.total !== undefined || o.pageSize !== undefined));
        if (rPayload?.paging && looksLikePaging(rPayload.paging)) rPaging = rPayload.paging;
        else if (rDataObj?.paging && looksLikePaging(rDataObj.paging)) rPaging = rDataObj.paging;
        else if (looksLikePaging(rPayload)) rPaging = rPayload;
        else if (looksLikePaging(rDataObj)) rPaging = rDataObj;
        else if (rPayload?.data && typeof rPayload.data === 'object' && !Array.isArray(rPayload.data) && looksLikePaging(rPayload.data)) rPaging = rPayload.data;

        if (rPaging) {
          const serverPageIndex = rPaging.pageIndex ?? rPaging.page ?? rPaging.pageNumber ?? page;
          const uiPage = serverPageIndex != null ? Number(serverPageIndex) : page;
          setPage(uiPage);
          const ps = rPaging.pageSize ?? rPaging.page_size ?? pageSize;
          setPageSize(ps);
          const pageSizeForCalc = ps || pageSize;
          setTotalPages(rPaging.totalPages ?? Math.max(1, Math.ceil((rPaging.totalRecords ?? rPaging.total ?? 0) / pageSizeForCalc)));
        }

        // Feedbacks: normalize similarly. New API shape: { data: { paging: {...}, feedbacks: [...] } }
        const fPayload = fRes?.data ?? fRes;
        const fDataObj = fPayload?.data ?? fPayload;
        let feedbackList = [];
        if (Array.isArray(fPayload?.feedbacks)) feedbackList = fPayload.feedbacks;
        else if (Array.isArray(fDataObj?.feedbacks)) feedbackList = fDataObj.feedbacks;
        else if (Array.isArray(fDataObj?.data)) feedbackList = fDataObj.data;
        else if (Array.isArray(fPayload?.data)) feedbackList = fPayload.data;
        else if (Array.isArray(fPayload)) feedbackList = fPayload;
        else if (Array.isArray(fDataObj)) feedbackList = fDataObj;
        setFeedbacks(feedbackList);

        let fPaging = null;
        if (fPayload?.paging && looksLikePaging(fPayload.paging)) fPaging = fPayload.paging;
        else if (fDataObj?.paging && looksLikePaging(fDataObj.paging)) fPaging = fDataObj.paging;
        else if (looksLikePaging(fPayload)) fPaging = fPayload;
        else if (looksLikePaging(fDataObj)) fPaging = fDataObj;
        else if (fPayload?.data && typeof fPayload.data === 'object' && !Array.isArray(fPayload.data) && looksLikePaging(fPayload.data)) fPaging = fPayload.data;

        if (fPaging) {
          const serverPageIndex = fPaging.pageIndex ?? fPaging.page ?? fPaging.pageNumber ?? fbPage;
          const uiPage = serverPageIndex != null ? Number(serverPageIndex) : fbPage;
          setFbPage(uiPage);
          const ps = fPaging.pageSize ?? fPaging.page_size ?? fbPageSize;
          setFbPageSize(ps);
          const pageSizeForCalc = ps || fbPageSize;
          setFbTotalPages(fPaging.totalPages ?? Math.max(1, Math.ceil((fPaging.totalRecords ?? fPaging.total ?? 0) / pageSizeForCalc)));
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize, fbPage, fbPageSize]);

  if (loading) return <InlineLoader />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3 text-lg">Báo cáo người dùng</h3>
        {reports.length === 0 ? <div className="text-sm text-gray-500">Không có báo cáo</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>Id</th>
                <th>Người báo cáo</th>
                <th>Trạng thái</th>
                <th>Loại</th>
                <th>Target</th>
                <th>Lý do</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.reportId || r.report_id || r.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 pr-4">{r.reportId || r.report_id || r.id}</td>
                  <td className="py-3">{r.reporter?.fullName ?? r.reporter?.full_name ?? r.reporter?.name ?? r.reporter?.userId ?? '-'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <select
                        value={editingStatus[r.reportId || r.report_id || r.id] ?? r.status}
                        onChange={(e) => setEditingStatus(s => ({ ...s, [r.reportId || r.report_id || r.id]: e.target.value }))}
                        className={`p-1 border rounded text-sm
                          ${((editingStatus[r.reportId || r.report_id || r.id] ?? r.status) === 'resolved')
                            ? 'bg-green-100 text-green-800'
                            : ((editingStatus[r.reportId || r.report_id || r.id] ?? r.status) === 'dismissed')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                      { (editingStatus[r.reportId || r.report_id || r.id] ?? r.status) !== r.status && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const id = r.reportId || r.report_id || r.id;
                              const newStatus = editingStatus[id];
                              setUpdating(id);
                              try {
                                await apiPut(ApiEndpoints.REPORT_BY_ID(id), { status: newStatus });
                                setReports(prev => prev.map(p => ((p.reportId || p.report_id || p.id) === id ? { ...p, status: newStatus } : p)));
                                setEditingStatus(s => { const t = { ...s }; delete t[id]; return t; });
                              } catch (err) {
                                // optionally show error
                              } finally {
                                setUpdating(null);
                              }
                            }}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          >{updating === (r.reportId || r.report_id || r.id) ? '...' : 'Save'}</button>
                          <button onClick={() => setEditingStatus(s => { const t = { ...s }; delete t[r.reportId || r.report_id || r.id]; return t; })} className="px-2 py-1 bg-gray-100 rounded text-xs">Cancel</button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3">{r.target?.type ?? r.type ?? r.target_type ?? '-'}</td>
                  <td className="py-3 text-blue-600">{r.target?.title ?? r.target?.name ?? r.target_title ?? r.target?.id ?? r.target_id ?? r.targetId ?? '-'}</td>
                  <td className="py-3">{r.reason}</td>
                  <td className="py-3 text-sm text-gray-600">{formatDateToDDMMYYYY(r.reportedAt ?? r.reported_at)}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
        {/* pagination controls */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <button disabled={Number(page) <= 1} onClick={() => setPage(p => Math.max(1, Number(p) - 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button disabled={Number(page) >= Number(totalPages)} onClick={() => setPage(p => Math.min(Number(totalPages), Number(p) + 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Feedback</h3>
        {feedbacks.length === 0 ? <div className="text-sm text-gray-500">Không có feedback</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th>Id</th>
                <th>Người</th>
                <th>Nội dung</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(f => (
                <tr key={f.feedback_id || f.id || f.feedbackId} className="border-t">
                  <td className="py-2">{f.feedback_id || f.id || f.feedbackId}</td>
                  <td>{f.user?.fullName ?? f.user?.name ?? f.userId ?? f.user_id ?? '-'}</td>
                  <td>{f.content}</td>
                  <td>{formatDateToDDMMYYYY(f.created_at || f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* feedback pagination */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <button disabled={Number(fbPage) <= 1} onClick={() => setFbPage(p => Math.max(1, Number(p) - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          <span className="text-sm text-gray-600">{fbPage} / {fbTotalPages}</span>
          <button disabled={Number(fbPage) >= Number(fbTotalPages)} onClick={() => setFbPage(p => Math.min(Number(fbTotalPages), Number(p) + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
