import React from 'react';
import PropTypes from 'prop-types';
import SubscriptionCard from '../employee/SubscriptionCard';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import { Button } from '@mui/material';
import Loading from '../common/loading/Loading';

// Employer-specific subscription plans. Layout mirrors employee but data differs.
export default function EmployerSubscriptionPlans({ apiUrl = null, onSelect = () => {} }) {
  // reuse hook but allow fallback to employer mock inside hook consumer
  const { plans, loading, error } = useSubscriptionPlans(apiUrl);

  // If hook returned null (no api and no mock), provide employer-specific fallback
  const employerMock = [
    {
      id: 'employer_free',
      name: 'Miễn phí',
      price: 0,
      currency: '$',
      period: ' / tháng',
      features: [
        'Đăng 1 tin miễn phí',
        'Quản lý ứng viên cơ bản',
        'Hỗ trợ qua email'
      ]
    },
    {
      id: 'employer_premium',
      name: 'Cao cấp',
      price: 99,
      currency: '$',
      period: ' / tháng',
      features: [
        'Đăng tin không giới hạn',
        'Ưu tiên hiển thị',
        'Quản lý ứng viên nâng cao',
        'Hỗ trợ 24/7'
      ],
      type: 'premium'
    }
  ];

  const data = plans && plans.length ? plans : employerMock;

  if (loading) return <Loading />;
  if (error) return (<div className="w-full text-center py-8"><div className="text-red-600 mb-2">Có lỗi: {error}</div><Button onClick={() => window.location.reload()}>Tải lại</Button></div>);

  // demo: assume employer already purchased 'employer_premium'
  const activePlanId = 'premium';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
        {data.map(plan => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            highlighted={plan.type === 'premium' || plan.id.includes('premium')}
            isActive={activePlanId === plan.id}
            onManage={(p) => console.log('Manage employer plan', p)}
            onSelect={(p) => { onSelect(p); console.log('Employer selected plan', p); }}
          />
        ))}
      </div>
    </div>
  );
}

EmployerSubscriptionPlans.propTypes = {
  apiUrl: PropTypes.string,
  onSelect: PropTypes.func
};
