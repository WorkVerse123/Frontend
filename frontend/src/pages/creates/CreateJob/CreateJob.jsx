import React, { useEffect, useState } from 'react';
import JobForm from '../../../components/common/inputs/JobForm';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../contexts/AuthContext';
import Loading from '../../../components/common/loading/Loading';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CreateJob() {
  const [loading, setLoading] = useState(true);
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
  <MainLayout role={normalizedRole} hasSidebar={false}>
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
