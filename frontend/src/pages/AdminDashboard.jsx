import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewPanel from '../components/admin/OverviewPanel';
import UsersTable from '../components/admin/UsersTable';
import CreateStaffAccount from '../components/admin/CreateStaffAccount';
import AdminReportsPanel from '../components/admin/AdminReportsPanel';
import AdminEmployersPanel from '../components/admin/AdminEmployersPanel';
import AdminEmployeesPanel from '../components/admin/AdminEmployeesPanel';
import AdminIncomePanel from '../components/admin/AdminIncomePanel';
import AdminIncomeHistoryPanel from '../components/admin/AdminIncomeHistoryPanel';
import { useAuth } from '../contexts/AuthContext';


export default function AdminDashboard() {
  const { user } = useAuth();
  // Check if user has finance role (mapped from RoleId 16 in AuthContext)
  const isFinanceOnly = user?.role === 'finance';
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set default panel based on role
  const [activePanel, setActivePanel] = useState(isFinanceOnly ? 'revenue' : 'overview');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // keep an initial stats fetch for header badges; panels fetch their own data
        const { get: apiGet } = await import('../services/ApiClient');
        const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
        const res = await apiGet(ApiEndpoints.ADMIN_STATS);
        if (!mounted) return;
        setStats(res?.data || res);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
  <MainLayout showFooter={false}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          {isFinanceOnly ? 'Quản lý tài chính' : 'Trang quản trị'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <AdminSidebar active={activePanel} onChange={setActivePanel} />

          <main className="md:col-span-9">
            {/* Only show panels that user has permission to access */}
            {!isFinanceOnly && activePanel === 'overview' && <OverviewPanel />}
            {!isFinanceOnly && activePanel === 'employers' && (
              <div>
                <AdminEmployersPanel />
              </div>
            )}
            {activePanel === 'transactions' && (
              <div>
                <AdminIncomeHistoryPanel />
              </div>
            )}
            {activePanel === 'revenue' && (
              <div>
                <AdminIncomePanel />
              </div>
            )}
            {!isFinanceOnly && activePanel === 'employees' && (
              <div>
                <AdminEmployeesPanel />
              </div>
            )}
            {!isFinanceOnly && activePanel === 'reports' && (
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Báo cáo & Feedback</h2>
                <AdminReportsPanel />
              </div>
            )}
            {!isFinanceOnly && activePanel === 'create' && (
              <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-3">Tạo tài khoản Staff</h2>
                <CreateStaffAccount />
              </div>
            )}
            
            {/* Show message if RoleId 8 tries to access unauthorized panel */}
            {isFinanceOnly && !['revenue', 'transactions'].includes(activePanel) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800">Bạn không có quyền truy cập chức năng này.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
