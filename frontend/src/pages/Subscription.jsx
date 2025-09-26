import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SubscriptionPlans from '../components/employee/SubscriptionPlans';
import EmployerSubscriptionPlans from '../components/employer/EmployerSubscriptionPlans';
import { Box, Typography } from '@mui/material';

export default function Subscription() {
  // toggle role to preview employee/employer
  // You can use a numeric RoleId (1=Admin,2=Staff,3=Employer,4=Employee) or a role name string
  const pageRole = 'employer'; // change to 'employee' or to 3 or '3' to preview employer plans

  const normalizedRole = (() => {
    if (pageRole === null || pageRole === undefined) return 'guest';
    const n = Number(pageRole);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1:
          return 'admin';
        case 2:
          return 'staff';
        case 3:
          return 'employer';
        case 4:
          return 'employee';
        default:
          return 'guest';
      }
    }
    return String(pageRole).toLowerCase();
  })();

  return (
    <MainLayout role={normalizedRole} hasSidebar={true}>
      <Box className="max-w-4xl mx-auto py-8 px-4">
        <Typography variant="h5" component="h1" className="font-semibold mb-4 text-[#042852]">
          {normalizedRole === 'employee' ? 'Gói đăng ký cho Ứng viên' : 'Gói đăng ký cho Nhà tuyển dụng'}
        </Typography>

        {normalizedRole === 'employee' ? (
          <SubscriptionPlans apiUrl={null} onSelect={(plan) => console.log('Employee selected plan:', plan)} />
        ) : (
          <EmployerSubscriptionPlans apiUrl={null} onSelect={(plan) => console.log('Employer selected plan:', plan)} />
        )}
      </Box>
    </MainLayout>
  );
}
