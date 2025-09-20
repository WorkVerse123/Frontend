// Centralized API endpoint paths. Update as your backend grows.
const ApiEndpoints = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  // Users
  ME: '/me',
  // Subscription
  SUBSCRIPTION_PLANS: '/subscription/plans',
  USER_SUBSCRIPTION: '/subscription/user',
  // Jobs (examples)
  JOBS: '/jobs',
  JOB_DETAIL: (id) => `/jobs/${id}`,
};

export default ApiEndpoints;
