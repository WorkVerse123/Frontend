import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/loading/Loading';
import EmployerHeader from '../components/employer-profile/EmployerHeader' 
import EmployerDetails from '../components/employer-profile/EmployerDetails';
import EmployerJobsList from '../components/employer-profile/EmployerJobsList';
import { Container } from '@mui/material';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmployerProfile() {
  const { user } = useAuth();
  const normalizeRole = (r) => {
    if (!r) return 'guest';
    if (typeof r === 'number') {
      if (r === 1) return 'admin';
      if (r === 2) return 'staff';
      if (r === 3) return 'employer';
      if (r === 4) return 'employee';
      return 'guest';
    }
    if (typeof r === 'string') return r.toLowerCase();
    if (typeof r === 'object') {
      const id = r.roleId || r.RoleId || r.role_id || r.roleID;
      if (id) return normalizeRole(Number(id));
      const name = r.role || r.roleName || r.role_name;
      if (name) return String(name).toLowerCase();
    }
    return 'guest';
  };
  const normalizedRole = normalizeRole(user?.roleId || user);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: routeId } = useParams();

  const navigate = useNavigate();


  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    const load = async () => {
      try {
          setLoading(true);
          setError(null);
        const resolvedId = (routeId && routeId !== 'me') ? routeId : (user?.employeeId ? null : (user?.employerId || user?.EmployerId || null));
        const endpointId = resolvedId || (routeId && routeId !== 'me' ? routeId : 'me');
        const res = await apiGet(ApiEndpoints.EMPLOYER(endpointId), { signal: ac.signal });
    
        const server = res?.data ?? res;
        const inner = server?.data ?? server;
        if (!mounted) return;
        const normalizeEmployer = (e) => {
          if (!e || typeof e !== 'object') return null;
          const employerId = e.employerId ?? e.EmployerId ?? e.id ?? null;
          const companyName = e.companyName ?? e.CompanyName ?? e.name ?? '';
          const companyAddress = e.address ?? e.companyAddress ?? e.company_address ?? '';
          const companyWebsite = e.websiteUrl ?? e.companyWebsite ?? e.website ?? '';
          const logoUrl = e.logoUrl ?? e.CompanyLogo ?? e.logo ?? '';
          const description = e.description ?? e.desc ?? e.about ?? '';
          const employerTypeName = e.employerTypeName ?? (e.employerType && (e.employerType.name || e.employerType.employerTypeName)) ?? '';
          return {
            employerId,
            companyName,
            companyAddress,
            companyWebsite,
            logoUrl,
            CompanyLogo: logoUrl,
            description,
            employerTypeName,
            _raw: e
          };
        };

        const normalized = normalizeEmployer(inner);
        setEmployer(normalized);
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
        if (!isCanceled) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; ac.abort(); };
  }, []);

  if (loading) return <Loading />;

  return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <Container maxWidth="lg" className="py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">Không thể tải thông tin nhà tuyển dụng. Vui lòng thử lại.</div>
        )}
        {employer ? (
          <EmployerHeader employer={employer} isOwner={Boolean(user?.employerId && String(user.employerId) === String(employer.employerId))} onEdit={() => {
            // navigate to the dedicated edit page to avoid duplicate inline editors
            const targetId = employer?.employerId || employer?.EmployerId || user?.employerId || user?._raw?.EmployerId;
            if (targetId) navigate(`/employer/${targetId}/edit`);
            else navigate('/employer/setup');
          }} />
        ) : (
          <div className="bg-white rounded-lg p-4 mb-4">&nbsp;</div>
        )}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <EmployerDetails employer={employer} />
          </div>
          <div className="md:col-span-8">
            {employer?.description ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Giới thiệu doanh nghiệp</h3>
                <p className="text-sm text-slate-700 whitespace-pre-line">{employer?.description}</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Giới thiệu doanh nghiệp</h3>
                <p className="text-sm text-slate-700">Chưa có thông tin mô tả.</p>
              </div>
            )}

            <div className="mt-6">
              <EmployerJobsList employerId={employer?.employerId} />
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}