import React from 'react';
import SubscriptionPlans from './SubscriptionPlans';

export default function SubscriptionPanel(props) {
  // Minimal passthrough wrapper so SubscriptionPlans can be embedded safely.
  return <SubscriptionPlans {...props} />;
}
