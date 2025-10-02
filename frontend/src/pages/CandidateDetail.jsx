import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useParams } from 'react-router-dom';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import Loading from '../components/common/loading/Loading';
import EmployeeProfilePanel from '../components/employee/EmployeeProfilePanel';

export default function CandidateDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <MainLayout role={null} hasSidebar={false}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {loading ? <Loading /> : (
          <EmployeeProfilePanel employee={employee} readOnly={true} />
        )}
      </div>
    </MainLayout>
  );
}
