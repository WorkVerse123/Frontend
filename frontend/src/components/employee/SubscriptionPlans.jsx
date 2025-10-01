import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import SubscriptionCard from './SubscriptionCard';
import Loading from '../common/loading/Loading';
import InlineLoader from '../common/loading/InlineLoader';

export default function SubscriptionPlans({ apiUrl = null, onSelect = () => {} }) {
  const { plans, loading, error } = useSubscriptionPlans(apiUrl);

  if (loading) return <InlineLoader />;

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-red-600 mb-2">Có lỗi: {error}</div>
        <Button onClick={() => window.location.reload()}>Tải lại</Button>
      </div>
    );
  }

  // demo: activePlanId could come from API/user subscription; hardcode null for now
  const activePlanId = null; // set to 'premium' or plan.id to demo active state
  // normalize plans to an array to avoid runtime errors when API returns an object
  const planList = Array.isArray(plans) ? plans : (plans && Array.isArray(plans.plans) ? plans.plans : []);

  if (!planList || planList.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-600">Chưa có gói đăng ký nào.</div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
  {planList.map(plan => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            highlighted={plan.id === 'premium' || plan.type === 'premium'}
            isActive={activePlanId === plan.id}
            onManage={(p) => console.log('Manage plan', p)}
            onSelect={(p) => {
              onSelect(p);
              // eslint-disable-next-line no-console
              console.log('Selected plan:', p);
            }}
          />
        ))}
      </div>
    </div>
  );
}

SubscriptionPlans.propTypes = {
  apiUrl: PropTypes.string,
  onSelect: PropTypes.func,
};
