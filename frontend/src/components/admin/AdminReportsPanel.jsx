import React, { useEffect, useState } from 'react';
import { get as apiGet, put as apiPut } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import Loading from '../common/loading/Loading';

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
  const rRes = await apiGet(`${ApiEndpoints.REPORTS}?${rQs.toString()}`);

  const fQs = new URLSearchParams();
  fQs.set('pageNumber', String(fbPage));
  fQs.set('pageSize', String(fbPageSize));
  const fRes = await apiGet(`${ApiEndpoints.ADMIN_FEEDBACKS}?${fQs.toString()}`);
        if (!mounted) return;
        const rData = rRes?.data?.data ?? rRes?.data ?? rRes;
        const fData = fRes?.data?.data ?? fRes?.data ?? fRes;

        const reportsList = Array.isArray(rData?.reports) ? rData.reports : (Array.isArray(rData) ? rData : []);
        const feedbackList = Array.isArray(fData?.feedbacks) ? fData.feedbacks : (Array.isArray(fData) ? fData : []);
        setReports(reportsList);
        setFeedbacks(feedbackList);

        const rPaging = rData?.paging ?? rData?.pagingInfo ?? rData;
        if (rPaging) {
          const serverPage = Number(rPaging.pageIndex ?? rPaging.pageNumber ?? rPaging.page ?? page);
          setPage(Number.isFinite(serverPage) ? serverPage : page);
          setPageSize(Number(rPaging.pageSize ?? rPaging.page_size ?? pageSize));
          const calcTotal = Number(rPaging.totalPages ?? Math.max(1, Math.ceil((rPaging.totalRecords ?? rPaging.total ?? 0) / (rPaging.pageSize ?? pageSize))));
          setTotalPages(Number.isFinite(calcTotal) ? calcTotal : 1);
        }

        const fPaging = fData?.paging ?? fData?.pagingInfo ?? fData;
        if (fPaging) {
          const serverPage = Number(fPaging.pageIndex ?? fPaging.pageNumber ?? fPaging.page ?? fbPage);
          setFbPage(Number.isFinite(serverPage) ? serverPage : fbPage);
          setFbPageSize(Number(fPaging.pageSize ?? fPaging.page_size ?? fbPageSize));
          const calcTotalFb = Number(fPaging.totalPages ?? Math.max(1, Math.ceil((fPaging.totalRecords ?? fPaging.total ?? 0) / (fPaging.pageSize ?? fbPageSize))));
          setFbTotalPages(Number.isFinite(calcTotalFb) ? calcTotalFb : 1);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize]);

  if (loading) return <InlineLoader />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-3">Báo cáo người dùng</h3>
        {reports.length === 0 ? <div className="text-sm text-gray-500">Không có báo cáo</div> : (
          <table className="w-full text-sm">
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
                <tr key={r.reportId || r.report_id || r.id} className="border-t">
                  <td className="py-2">{r.reportId || r.report_id || r.id}</td>
                  <td>{r.reporter?.fullName ?? r.reporter?.full_name ?? r.reporter?.name ?? r.reporter?.userId ?? '-'}</td>
                  <td className="flex items-center gap-2">
                    <select
                      value={editingStatus[r.reportId || r.report_id || r.id] ?? r.status}
                      onChange={(e) => setEditingStatus(s => ({ ...s, [r.reportId || r.report_id || r.id]: e.target.value }))}
                      className="p-1 border rounded text-sm"
                    >
                      <option value="pending">pending</option>
                      <option value="resolved">resolved</option>
                      <option value="dismissed">dismissed</option>
                    </select>
                    { (editingStatus[r.reportId || r.report_id || r.id] ?? r.status) !== r.status && (
                      <>
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
                      </>
                    )}
                  </td>
                  <td>{r.target?.type ?? r.type ?? r.target_type ?? '-'}</td>
                  <td>{r.target?.id ?? r.target_id ?? r.targetId ?? '-'}</td>
                  <td>{r.reason}</td>
                  <td>{formatDateToDDMMYYYY(r.reportedAt ?? r.reported_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* pagination controls */}
        <div className="mt-3 flex items-center gap-2 justify-end">
          <button disabled={Number(page) <= 1} onClick={() => setPage(p => Math.max(1, Number(p) - 1))} className="px-3 py-1 bg-gray-100 rounded">Prev</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button disabled={Number(page) >= Number(totalPages)} onClick={() => setPage(p => Math.min(Number(totalPages), Number(p) + 1))} className="px-3 py-1 bg-gray-100 rounded">Next</button>
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
