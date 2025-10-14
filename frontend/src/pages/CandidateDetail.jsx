import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useParams } from 'react-router-dom';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import Loading from '../components/common/loading/Loading';
import EmployeeProfilePanel from '../components/employee/EmployeeProfilePanel';
import { useAuth } from '../contexts/AuthContext';
import ReportForm from '../components/common/ReportForm';

export default function CandidateDetail() {
  const { id } = useParams();
  const { user } = useAuth();
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
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_PROFILE(id), { signal: ac.signal }));
        const outer = res?.data ?? res;
        const payload = outer?.data ?? outer;
        const emp = payload ?? {};
        if (mounted && !ac.signal.aborted) setEmployee(emp);
      } catch (err) {
        // ignore
      } finally {
        if (mounted && !ac.signal.aborted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [id]);

  return (
    <MainLayout role={canViewCandidates ? role : null} hasSidebar={false}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {!canViewCandidates ? (
          <div className="p-6 bg-yellow-50 rounded text-sm text-slate-700">Chức năng xem chi tiết ứng viên chỉ dành cho nhà tuyển dụng trả phí (IsPremium). Vui lòng nâng cấp để truy cập.</div>
        ) : (
          (loading ? <Loading /> : (
            <div>
              {/* Action area (consistent placement for report button) */}
              <div className="flex justify-end mb-4">
                {employee && role === 'employee' && Number(employee.userId || employee.user_id || employee.id) !== Number(user?.userId || user?.id) ? (
                  <button onClick={() => setReportOpen(true)} className="text-sm text-red-600 underline">Báo cáo</button>
                ) : null}
              </div>
              <EmployeeProfilePanel employee={employee} readOnly={true} />
            </div>
          ))
        )}
      </div>
      <ReportForm open={!!reportOpen} onClose={() => setReportOpen(false)} initialTargetType="user" initialTargetId={employee?.userId || employee?.user_id || employee?.id} />
    </MainLayout>
  );
}
