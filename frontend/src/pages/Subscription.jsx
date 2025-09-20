import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SubscriptionPlans from '../components/employee/SubscriptionPlans';
import EmployerSubscriptionPlans from '../components/employer/EmployerSubscriptionPlans';
import { Box, Typography } from '@mui/material';

export default function Subscription() {
  // toggle role to preview employee/employer
  const pageRole = 'employer'; // change to 'employee' to preview employee plans

  return (
    <MainLayout role={pageRole} hasSidebar={true}>
      <Box className="max-w-4xl mx-auto py-8 px-4">
        <Typography variant="h5" component="h1" className="font-semibold mb-4 text-[#042852]">
          {pageRole === 'employee' ? 'Gói đăng ký cho Ứng viên' : 'Gói đăng ký cho Nhà tuyển dụng'}
        </Typography>

        {pageRole === 'employee' ? (
          <SubscriptionPlans apiUrl={null} onSelect={(plan) => console.log('Employee selected plan:', plan)} />
        ) : (
          <EmployerSubscriptionPlans apiUrl={null} onSelect={(plan) => console.log('Employer selected plan:', plan)} />
        )}
      </Box>
    </MainLayout>
  );
}
