import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import EmployerHeader from '../components/employer-profile/EmployerHeader' 
import EmployerDetails from '../components/employer-profile/EmployerDetails';
import EmployerJobsList from '../components/employer-profile/EmployerJobsList';
import { Container } from '@mui/material';
import { handleAsync } from '../utils/HandleAPIResponse';

export default function EmployerProfile() {
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/mocks/JSON_DATA/responses/get_employer_id.json', { signal: ac.signal });

        if (!res.ok) {
          // try to parse body for message, otherwise throw status text
          const body = await res.text();
          throw new Error(body || `HTTP ${res.status}`);
        }

        // use handleAsync to normalise the JSON response shape
        const parsed = await handleAsync(res.json());
        if (!parsed.success) throw new Error(parsed.message || 'Lỗi khi tải dữ liệu');

        setEmployer(parsed.data || null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, []);

  if (loading) return <Loading />;
  if (error || !employer) return (
    <MainLayout role="guest" hasSidebar={false}>
      <Container className="py-10">
        <div className="text-red-600">Không thể tải thông tin nhà tuyển dụng. Vui lòng thử lại.</div>
      </Container>
    </MainLayout>
  );

  return (
    <MainLayout role="guest" hasSidebar={false}>
      <Container maxWidth="lg" className="py-6">
        <EmployerHeader employer={employer} />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <EmployerDetails employer={employer} />
          </div>
          <div className="md:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Giới thiệu doanh nghiệp</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">{employer.description}</p>
            </div>

            <div className="mt-6">
              <EmployerJobsList employerId={employer.employerId} />
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}