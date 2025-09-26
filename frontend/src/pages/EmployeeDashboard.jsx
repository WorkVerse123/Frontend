import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileCard from '../components/employee/ProfileCard';
import StatsGrid from '../components/employee/StatsGrid';
import ApplicationsList from '../components/employee/ApplicationsList';
import AppliedJobs from '../components/employee/AppliedJobs';
import SavedJobs from '../components/employee/SavedJobs';
import Loading from '../components/common/loading/Loading';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { handleAsync } from '../utils/HandleAPIResponse';
import EmployeeProfilePanel from '../components/employee/EmployeeProfilePanel';
import { useAuth } from '../contexts/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const roleCandidate = user?.RoleId || user?.roleId || user?.role || user?.role_id || null;
  const normalizedRole = (() => {
    if (roleCandidate === null || roleCandidate === undefined) return 'guest';
    const n = Number(roleCandidate);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return 'guest';
      }
    }
    return String(roleCandidate).toLowerCase();
  })();

  const roleLabel = normalizedRole === 'employee' ? 'Ứng viên' : normalizedRole === 'employer' ? 'Nhà Tuyển Dụng' : normalizedRole === 'admin' ? 'Admin' : normalizedRole === 'staff' ? 'Staff' : 'Khách';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
  const resolvedEmployeeId = user?.employeeId ?? user?._raw?.EmployeeId ?? null;
  if (!resolvedEmployeeId) throw new Error('No employee id available for current user');
  const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_DASHBOARD(resolvedEmployeeId), { signal: ac.signal }));
  const parsed = res?.data || res;
  if (!parsed) throw new Error('Invalid data');
        if (!mounted) return;
        setStats(parsed.stats || []);
        setApplications(parsed.applications || []);
        // try to also fetch bookmarks (non-blocking)
        try {
          const bRes = await apiGet(ApiEndpoints.EMPLOYEE_BOOKMARKS(resolvedEmployeeId), { signal: ac.signal });
          const bParsed = bRes?.data || bRes;
          if (!mounted) return;
          setBookmarks((bParsed && bParsed.bookmarks) || []);
        } catch (e) {
          // swallow bookmark fetch errors - non-critical
        }
      } catch (err) {
        // Treat cancellation as non-fatal: some fetch utilities throw CanceledError
        // instead of the standard AbortError. Ignore canceled requests so the
        // UI doesn't display an error when the component unmounts.
        const errName = err && err.name;
        const errMsg = err && err.message ? String(err.message).toLowerCase() : '';
        const isCanceled = errName === 'AbortError' || errName === 'CanceledError' || errMsg.includes('cancel');
        if (!isCanceled) setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; ac.abort(); };
  }, []);

  if (loading) return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <Loading />
    </MainLayout>
  );

  if (error) return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4 text-red-600">Lỗi khi tải dashboard: {String(error)}</div>
    </MainLayout>
  );

  return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left nav/profile */}
          <aside className="md:col-span-3">
            <ProfileCard name="Tên người dùng" role={roleLabel} />

            <nav className="bg-white rounded-lg shadow p-3 border">
              <ul className="space-y-2 text-sm">
                <li
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'overview' ? 'bg-[#f3f7fb] font-medium' : ''}`}
                >
                  Tổng quan
                </li>
                <li
                  onClick={() => setActiveTab('applied')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'applied' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Công việc đã ứng tuyển
                </li>
                <li
                  onClick={() => setActiveTab('saved')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'saved' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Công việc đã lưu
                </li>
                <li
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'profile' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Thông tin cá nhân
                </li>
                <li className="py-2 px-3 rounded hover:bg-slate-50">Cài đặt</li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="md:col-span-9">
            {activeTab === 'applied' ? (
              <AppliedJobs items={applications} onView={(app) => console.log('view', app)} />
            ) : activeTab === 'saved' ? (
              <SavedJobs
                items={bookmarks}
                onOpen={(b) => console.log('open bookmark', b)}
                onRemove={(b) => setBookmarks(prev => prev.filter(x => x.bookmarkId !== b.bookmarkId))}
              />
            ) : activeTab === 'profile' ? (
              <EmployeeProfilePanel employee={null} onSave={(data) => console.log('save profile', data)} />
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#042852]">Xin chào, Tên người dùng</h2>
                  <p className="text-sm text-gray-600">Đây chính là trang tổng quan về hồ sơ cá nhân của bạn</p>
                </div>

                <StatsGrid items={stats} />

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Hồ sơ của bạn chưa được hoàn thiện</div>
                    <div className="text-sm text-gray-600">Hoàn thiện việc chỉnh sửa hồ sơ cá nhân của bạn để tăng khả năng ứng tuyển</div>
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded">Tùy chỉnh</button>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold">Công việc ứng tuyển gần đây</div>
                    <div className="text-sm text-gray-500">Tất cả →</div>
                  </div>

                  <ApplicationsList items={applications} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
