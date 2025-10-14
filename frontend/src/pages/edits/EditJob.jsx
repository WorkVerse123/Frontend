import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Loading from '../../components/common/loading/Loading';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet } from '../../services/ApiClient';
import JobForm from '../../components/common/inputs/JobForm';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiGet(ApiEndpoints.JOB_DETAIL(jobId));
        const payload = res?.data ?? res;
        if (!mounted) return;
        setJob(payload?.data ?? payload ?? null);
      } catch (e) {
  // debug removed
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [jobId]);

  if (loading) return (
    <MainLayout>
      <Loading />
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="p-6">Không thể tải dữ liệu công việc.</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <Container maxWidth="lg" className="py-6">
        <Paper className="p-6">
          <Typography variant="h5" component="h1" className="mb-4">Chỉnh sửa tin tuyển dụng</Typography>
          <JobForm initialValues={job} />
        </Paper>
      </Container>
    </MainLayout>
  );
}
