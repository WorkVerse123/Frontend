import React, { useEffect, useState } from 'react';
import JobForm from '../../../components/common/inputs/JobForm';
import MainLayout from '../../../components/layout/MainLayout';
import Loading from '../../../components/common/loading/Loading';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CreateJob() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate small load (or wait for data from child if you prefer)
    const id = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(id);
  }, []);

  if (loading) return (
    <MainLayout>
      <Loading />
    </MainLayout>
  );

  return (
    <MainLayout role="employer" hasSidebar={false}>
      <Container maxWidth="lg" className="py-6">
        <Paper className="p-6">
          <Typography variant="h5" component="h1" className="mb-4">
            Đăng tin tuyển dụng
          </Typography>
          <JobForm />
        </Paper>
      </Container>
    </MainLayout>
  );
}
