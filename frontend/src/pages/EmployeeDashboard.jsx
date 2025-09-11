import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ProfileCard from '../components/employee/ProfileCard';
import StatsGrid from '../components/employee/StatsGrid';
import ApplicationsList from '../components/employee/ApplicationsList';

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/mocks/JSON_DATA/responses/get_employee_id_dashboard.json', { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = await res.json();
        if (!parsed || !parsed.data) throw new Error('Invalid data');
        setStats(parsed.data.stats || []);
        setApplications(parsed.data.applications || []);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, []);

  if (loading) return (
    <MainLayout role="guest" hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4">Đang tải...</div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout role="guest" hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4 text-red-600">Lỗi khi tải dashboard: {String(error)}</div>
    </MainLayout>
  );

  return (
    <MainLayout role="guest" hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left nav/profile */}
          <aside className="md:col-span-3">
            <ProfileCard name="Tên người dùng" role="Ứng viên" />

            <nav className="bg-white rounded-lg shadow p-3 border">
              <ul className="space-y-2 text-sm">
                <li className="py-2 px-3 rounded bg-[#f3f7fb] font-medium">Tổng quan</li>
                <li className="py-2 px-3 rounded hover:bg-slate-50">Công việc đã ứng tuyển</li>
                <li className="py-2 px-3 rounded hover:bg-slate-50">Công việc yêu thích</li>
                <li className="py-2 px-3 rounded hover:bg-slate-50">Thông báo</li>
                <li className="py-2 px-3 rounded hover:bg-slate-50">Cài đặt</li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="md:col-span-9">
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
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
