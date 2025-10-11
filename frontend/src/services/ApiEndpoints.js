// Centralized API endpoint paths generated from swagger.json
const ApiEndpoints = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // Admin
  ADMIN_CREATE_ACCOUNT: '/api/Admin/create-account',
  ADMIN_USERS: '/api/Admin/users',
  ADMIN_USER_STATUS: (id) => `/api/Admin/user/${id}/status`,
  ADMIN_USER_BY_ID: (id) => `/api/Admin/users/${id}`,
  ADMIN_EMPLOYEES: '/api/Admin/employee',
  ADMIN_EMPLOYEE_BY_ID: (id) => `/api/Admin/employee/${id}`,
  ADMIN_EMPLOYERS: '/api/Admin/employer',
  ADMIN_EMPLOYER_BY_ID: (id) => `/api/Admin/employer/${id}`,
  ADMIN_STAFF: '/api/Admin/staff',
  ADMIN_STAFF_BY_ID: (id) => `/api/Admin/staff/${id}`,
  ADMIN_REPORTS: '/api/Admin/reports',
  ADMIN_REPORT_BY_ID: (id) => `/api/Admin/reports/${id}`,
  ADMIN_FEEDBACKS: '/api/Admin/feedbacks',
  ADMIN_FEEDBACK_BY_ID: (id) => `/api/Admin/feedbacks/${id}`,
  ADMIN_JOBS: '/api/Admin/jobs',
  ADMIN_JOB_BY_ID: (id) => `/api/Admin/jobs/${id}`,
  ADMIN_APPLICATIONS: '/api/Admin/applications',
  ADMIN_APPLICATION_BY_ID: (id) => `/api/Admin/applications/${id}`,
  ADMIN_STATS: '/api/Admin/stats',
  ADMIN_CHART: '/api/Admin/chart',



  // Jobs
  JOBS: '/api/jobs',
  JOB_DETAIL: (id) => `/api/jobs/${id}`,
  JOBS_LIST: (page = 1, size = 10) => `/api/jobs?pageNumber=${page}&pageSize=${size}`,
  JOB_CANDIDATES: (page = 1, size = 10) => `/api/jobs/candidates?pageNumber=${page}&pageSize=${size}`,
  JOB_REVIEWS: (id) => `/api/jobs/${id}/reviews`,
  JOB_CATEGORIES: '/api/jobs/categories',
  JOB_FILTERS: '/job-filter',

  // Employer
  EMPLOYER_TYPES: '/api/EmployerType/types',
  EMPLOYER: (id) => `/api/employer/${id}`,
  EMPLOYER_JOBS: (id) => `/api/employer/${id}/jobs`,
  EMPLOYER_JOB: (id, jobId) => `/api/employer/${id}/jobs/${jobId}`,
  EMPLOYER_JOB_STATUS: (id, jobId) => `/api/employer/${id}/jobs/${jobId}/status`,
  EMPLOYERS_FILTERS: '/employers-filter',

  // Employee
  EMPLOYEE_PROFILE_CREATE: (userId) => `/api/employees/${userId}`,
  EMPLOYEE_PROFILE: (id) => `/api/employees/${id}`,
  EMPLOYEE_BUSY_TIMES: (id) => `/api/employees/${id}/busy-times`,
  EMPLOYEE_BUSY_TIME: (id, busyTimeId) => `/api/employees/${id}/busy-times/${busyTimeId}`,
  EMPLOYEE_BOOKMARKS: (id) => `/api/employees/${id}/bookmarks`,
  EMPLOYEE_BOOKMARK_JOB: (id, jobId) => `/api/employees/${id}/bookmarks/jobs/${jobId}`,
  EMPLOYEE_APPLICATIONS: (id) => `/api/employees/${id}/applications`,

  // Applications
  APPLICATION_GET: (id) => `/api/applications/${id}`,
  APPLICATION_WITHDRAW: (id) => `/api/applications/${id}/withdrawn`,
  APPLICATION_STATUS: (id) => `/api/applications/${id}/status`,
  APPLICATIONS_FOR_EMPLOYER_JOB: (employerId, jobId) => `/api/employer/${employerId}/job/${jobId}/applications`,
  APPLICATION_STATS: '/api/applications/stats',

  // Blogs
  BLOGS: '/api/blogs',
  BLOGS_PUBLISHED: '/api/blogs-published',
  BLOG_BY_SLUG: (slug) => `/api/blogs/${slug}`,
  BLOG_BY_ID: (id) => `/api/blogs/${id}`,

  // Companies
  COMPANIES: (page = 1, pageSize = 10) => `/api/companies?pageNumber=${page}&pageSize=${pageSize}`,
  COMPANY_SETUP: '/api/companies/company-setup',

  // Feedbacks
  FEEDBACKS: '/api/feedbacks',
  FEEDBACK_HANDLE: (id) => `/api/feedbacks/${id}/handle`,

  // Reports
  REPORTS: '/api/reports',
  REPORT_BY_ID: (id) => `/api/reports/${id}`,

  // Misc / Employee dashboard
  EMPLOYEE_DASHBOARD: (id) => `/employee-dashboard/${id}`,



  //AI chat
  AI_CHAT_EMPLOYEE: '/api/chatbot-ai/employee',
  AI_CHAT_EMPLOYER: '/api/chatbot-ai/employer',


  //subscription plans
  SUBSCRIPTION_PLANS: '/api/subscriptions/plans',
  SUBSCRIPTION_PLANS_BY_ID: (id) => `/api/subscriptions/user/${id}`,
  SUBSCRIPTION_REGISTER: `/api/subscriptions/register`,

 //otp
  OTP_REQUEST: '/api/auth/otp/send',
  OTP_VERIFY: '/api/auth/otp/verify',

  //payments 
  PAYMENT_INTENT: '/api/payment',
  PAYMENT_WEBHOOK: '/api/payment/webhook',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel',
  PAYMENT: (id) => `/api/payment/${id}`,
};



export default ApiEndpoints;
