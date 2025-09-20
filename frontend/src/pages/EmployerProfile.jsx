import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import EmployerHeader from '../components/employer-profile/EmployerHeader' 
import EmployerDetails from '../components/employer-profile/EmployerDetails';
import EmployerJobsList from '../components/employer-profile/EmployerJobsList';
import { Container } from '@mui/material';
import { handleAsync } from '../utils/HandleAPIResponse';
import EndpointResolver from '../services/EndpointResolver';

export default function EmployerProfile() {
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    const load = async () => {
      try {
          setLoading(true);
          setError(null);
        const parsed = await EndpointResolver.get('/mocks/JSON_DATA/responses/get_employer_id.json', { signal: ac.signal });
          const employerObj = parsed?.data?.data ?? parsed?.data ?? parsed ?? null;
          if (!mounted) return;
          setEmployer(employerObj);
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

  // Render layout first. Show loading spinner when initially loading.
  // If there's an error after initial load, show a banner in the content area
  // instead of replacing the entire layout — this matches the requested UX.
  if (loading) return <Loading />;

  return (
    <MainLayout role="guest" hasSidebar={false}>
      <Container maxWidth="lg" className="py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">Không thể tải thông tin nhà tuyển dụng. Vui lòng thử lại.</div>
        )}
        {employer ? (
          <EmployerHeader employer={employer} />
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