import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet, put as apiPut } from '../services/ApiClient';
import { Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CreateJobWithSubscription from '../components/employer/CreateJobWithSubscription';
import JobRow from '../components/jobs/JobRow';
import ActionsMenu from '../components/actions/ActionsMenu';
import ApplicationsDialog from '../components/common/modals/ApplicationsDialog';
import { useAuth } from '../contexts/AuthContext';
import StatsGrid from '../components/employee/StatsGrid';
import EmployeeProfilePanel from '../components/employee/EmployeeProfilePanel';
import ApplicationsList from '../components/employee/ApplicationsList';
import EmployerSubscriptionPlans from '../components/employer/EmployerSubscriptionPlans';
import { useNavigate } from 'react-router-dom';

export default function EmployerJobs() {
  const { user } = useAuth();
  const roleCandidate = user?.RoleId || user?.roleId || user?.role || user?.role_id || null;
  const normalizedRole = (() => {
    if (roleCandidate === null || roleCandidate === undefined) return 'guest';
    const n = Number(roleCandidate);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return 'guest';
      }
    }
    return String(roleCandidate).toLowerCase();
  })();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [appsOpen, setAppsOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    setLoading(true);
    (async () => {
      try {
        // prefer normalized profileId/profileType produced by AuthContext.normalizeUser
        // Resolve employer id from several possible fields to be robust when user is normalized differently
        const resolveEmployerId = (u) => {
          if (!u) return null;
          if (u?.profileType === 'employer' && u?.profileId) return u.profileId;
          return u?.employerId ?? u?.employer_id ?? u?.employer?.employerId ?? u?.employer?.id ?? u?.companyId ?? u?.id ?? null;
        };
        const resolvedEmployerId = resolveEmployerId(user);
        if (!resolvedEmployerId) {
          // No employer id yet (user may still be loading) — bail out and wait for user to update
          if (mounted) setLoading(false);
          return;
        }
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYER_JOBS(resolvedEmployerId), { signal: ac.signal }));
        if (!mounted) return;
        // Normalize response shapes. Some API wrappers return { data: {...} }, others return payload directly.
        const outer = res?.data ?? res;
        const payload = outer?.data ?? outer; // supports { data: { jobs: [...] } }

        // Normalize common response shapes into an array
        let list = [];
        if (Array.isArray(payload)) {
          list = payload;
        } else if (payload && Array.isArray(payload.jobs)) {
          list = payload.jobs;
        } else if (payload && Array.isArray(payload.data)) {
          list = payload.data;
        } else if (payload && typeof payload === 'object' && Object.keys(payload).length === 0) {
          list = [];
        } else {
          // if API returned a single job object, wrap it
          if (payload && typeof payload === 'object') list = [payload];
          else list = [];
        }

        // Map backend job fields to the UI's expected fields
        const normalizeJob = (j) => {
          if (!j || typeof j !== 'object') return j;
          const normalized = {
            // ids
            jobId: j.jobId ?? j.id ?? j.job_id ?? j.id_job ?? null,
            // title / labels
            title: j.jobTitle ?? j.title ?? j.name ?? j.job_title ?? '',
            jobTitle: j.jobTitle ?? j.title ?? j.job_title ?? j.title,
            // location
            location: j.jobLocation ?? j.location ?? j.job_location ?? '',
            // expiration
            expiredAt: j.jobExpiredAt ?? j.expiredAt ?? j.expired_at ?? j.jobExpiredAt ?? null,
            jobExpiredAt: j.jobExpiredAt ?? j.expiredAt ?? null,
            // salary
            salaryMin: j.jobSalaryMin ?? j.salaryMin ?? j.jobSalaryMin ?? j.salary_min ?? null,
            salaryMax: j.jobSalaryMax ?? j.salaryMax ?? j.jobSalaryMax ?? j.salary_max ?? null,
            jobSalaryMin: j.jobSalaryMin ?? j.salaryMin ?? null,
            jobSalaryMax: j.jobSalaryMax ?? j.salaryMax ?? null,
            // time / status
            jobTime: j.jobTime ?? j.time ?? null,
            status: (j.jobStatus ?? j.job_status ?? j.status ?? j.state ?? '') ,
            jobStatus: (j.jobStatus ?? j.job_status ?? j.status ?? j.state ?? ''),
            // categories
            jobCategory: j.jobCategory ?? j.categories ?? j.job_category ?? [],
            // counts & flags
            employeeApplyCount: j.employeeApplyCount ?? j.applicationCount ?? j.applies ?? 0,
            featured: Boolean(j.isPriority ?? j.featured ?? false),
            // original payload for debugging/extra fields
            _raw: j,
          };
          return normalized;
        };

        const normalizedList = Array.isArray(list) ? list.map(normalizeJob) : [];
        setJobs(normalizedList || []);
      } catch (e) {
        // ignore — keep jobs empty
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [user]);

    const viewApplications = async (job) => {
      setSelectedJob(job);
      setAppsOpen(true);
      setAppsLoading(true);
      // If job is not open, treat as closed: do not fetch applications and show empty list
      const currentStatus = (job?.jobStatus ?? job?.status ?? '').toString().toLowerCase();
      if (currentStatus !== 'open') {
        setApplications([]);
        setAppsLoading(false);
        return;
      }
      const ac = new AbortController();
  try {
      const resolveEmployerId = (u) => {
        if (!u) return null;
        if (u?.profileType === 'employer' && u?.profileId) return u.profileId;
        return u?.employerId ?? u?.employer_id ?? u?.employer?.employerId ?? u?.employer?.id ?? u?.companyId ?? u?.id ?? null;
      };
      const resolvedEmployerId = resolveEmployerId(user);
      if (!resolvedEmployerId) {
        // cannot fetch applications without employer id
        if (!ac.signal.aborted) setApplications([]);
        return;
      }
      const res = await handleAsync(apiGet(ApiEndpoints.APPLICATIONS_FOR_EMPLOYER_JOB(resolvedEmployerId, job.jobId), { signal: ac.signal }));
    const outer = res?.data ?? res;
    const payload = outer?.data ?? outer; // { data: { applications: [...] } }
    const apps = payload?.applications ?? payload?.data ?? payload ?? [];
    if (!ac.signal.aborted) setApplications(Array.isArray(apps) ? apps.filter(a => !a.jobId || String(a.jobId) === String(job.jobId)) : []);
  } catch (err) {
    // ignore canceled or non-critical errors; keep applications empty
  } finally {
    if (!ac.signal.aborted) setAppsLoading(false);
  }
  };

  const handleViewProfile = (application) => {
    // Fetch application details (may contain employeeId) then navigate to employee profile
    (async () => {
      try {
        const appId = application.applicationId || application.id || null;
        if (!appId) {
          console.debug('No applicationId on application', application);
          return;
        }
        const res = await handleAsync(apiGet(ApiEndpoints.APPLICATION_GET(appId)));
        const outer = res?.data ?? res;
        const payload = outer?.data ?? outer;
        const appDetail = payload ?? {};
        const empId = appDetail.employeeId || appDetail.employee_id || appDetail.employeeIdTemp || null;
        if (empId) {
          // Instead of navigating away, open an in-app profile panel dialog
          // Keep ApplicationsDialog open (do not setAppsOpen(false)) so employer can return to it after closing profile
          setProfileUserId(empId);
          setProfileOpen(true);
        } else {
          console.debug('Application detail has no employee id', appDetail);
          setNotify({ open: true, message: 'Không tìm thấy thông tin hồ sơ ứng viên', severity: 'error' });
        }
      } catch (err) {
        setNotify({ open: true, message: 'Lỗi khi tải thông tin hồ sơ', severity: 'error' });
      }
    })();
  };

  const handleAcceptApplication = async (application) => {
    const appId = application.applicationId || application.id || null;
    if (!appId) return;
    try {
      const body = { status: 'accepted' };
      const res = await handleAsync(apiPut(ApiEndpoints.APPLICATION_STATUS(appId), body));
      if (res && res.success) {
        setApplications(prev => prev.map(a => a.applicationId === application.applicationId ? { ...a, status: 'accepted' } : a));
        setNotify({ open: true, message: 'Đã chấp nhận ứng viên', severity: 'success' });
      } else {
        setNotify({ open: true, message: res?.message ?? 'Chấp nhận thất bại', severity: 'error' });
      }
    } catch (err) {
      setNotify({ open: true, message: 'Lỗi khi chấp nhận ứng viên', severity: 'error' });
    }
  };

  const handleRejectApplication = async (application) => {
    const appId = application.applicationId || application.id || null;
    if (!appId) return;
    try {
      const body = { status: 'rejected' };
      const res = await handleAsync(apiPut(ApiEndpoints.APPLICATION_STATUS(appId), body));
      if (res && res.success) {
        setApplications(prev => prev.map(a => a.applicationId === application.applicationId ? { ...a, status: 'rejected' } : a));
        setNotify({ open: true, message: 'Đã từ chối ứng viên', severity: 'success' });
      } else {
        setNotify({ open: true, message: res?.message ?? 'Từ chối thất bại', severity: 'error' });
      }
    } catch (err) {
      setNotify({ open: true, message: 'Lỗi khi từ chối ứng viên', severity: 'error' });
    }
  };

  

  const handleToggleJobStatus = async (job) => {
    if (!job) return;
    // Resolve employer id same as other functions
    const resolveEmployerId = (u) => {
      if (!u) return null;
      if (u?.profileType === 'employer' && u?.profileId) return u.profileId;
      return u?.employerId ?? u?.employer_id ?? u?.employer?.employerId ?? u?.employer?.id ?? u?.companyId ?? u?.id ?? null;
    };
    const resolvedEmployerId = resolveEmployerId(user);

    // determine current status and the target status
    const current = (job.jobStatus ?? job.status ?? '').toString().toLowerCase();
    const targetPayload = current === 'open' ? 'closed' : 'open'; // payload we send to server
  const targetDisplay = targetPayload === 'open' ? 'Open' : 'Close'; // user-friendly label

    // optimistic update
    setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, jobStatus: targetDisplay, status: targetDisplay } : j));

    if (!resolvedEmployerId) {
      // no employer id available — keep optimistic update only
      return;
    }

    try {
  // Send plain string in the request body as required by the backend (e.g. "open" or "closed")
  const res = await handleAsync(apiPut(ApiEndpoints.EMPLOYER_JOB_STATUS(resolvedEmployerId, job.jobId), targetPayload));
      // res = { data, success, message } from handleAsync
      if (res && res.success) {
        const returned = res.data ?? {};
        const returnedStatus = (returned.status ?? returned.jobStatus ?? targetPayload).toString().toLowerCase();
  const display = returnedStatus === 'open' ? 'Open' : 'Close';
        setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, jobStatus: display, status: display } : j));
      } else {
        // on failure, rollback to previous
  const prevDisplay = current === 'open' ? 'Open' : 'Close';
        setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, jobStatus: prevDisplay, status: prevDisplay } : j));
      }
    } catch (err) {
      // rollback on error
  const prevDisplay = current === 'open' ? 'Open' : 'Close';
      setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, jobStatus: prevDisplay, status: prevDisplay } : j));
    }
  };

  const openMenu = (e, job) => {
    setAnchorEl(e.currentTarget);
    setSelectedJob(job);
  };
  const closeMenu = () => { setAnchorEl(null); setSelectedJob(null); };

  const handleAction = (action, job) => {
    if (!job) return;
    if (action === 'view') return viewApplications(job);
    if (action === 'markExpired') return setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, status: 'closed' } : j));
    if (action === 'feature') return setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, featured: true } : j));
    if (action === 'toggleStatus') return handleToggleJobStatus(job);
  };

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');

  const stats = React.useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter(j => {
      const s = j?.jobStatus ?? j?.job_status ?? j?.status ?? j?.jobStatus;
      return !s || String(s).toLowerCase() === 'open';
    }).length;
    const closed = total - open;
    const featured = jobs.filter(j => j.featured).length;
    return [
      { title: 'Tin tuyển', value: total },
      { title: 'Mở', value: open },
      { title: 'Đóng', value: closed },
      { title: 'Nổi bật', value: featured },
    ];
  }, [jobs]);

  return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left nav (in-page sidebar) */}
          <aside className="md:col-span-3">
            <nav className="bg-white rounded-lg shadow p-3 border">
              <ul className="space-y-2 text-sm">
                <li
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'overview' ? 'bg-[#f3f7fb] font-medium' : ''}`}
                >
                  Tổng quan
                </li>
                {/* <li
                  onClick={() => setActiveTab('jobs')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'jobs' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Tin tuyển dụng
                </li> */}
                {/* <li
                  onClick={() => setActiveTab('applications')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'applications' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Đơn ứng tuyển
                </li> */}
                <li
                  onClick={() => setActiveTab('create')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'create' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Tạo tin tuyển dụng
                </li>
                <li
                  onClick={() => setActiveTab('subscription')}
                  className={`py-2 px-3 rounded cursor-pointer ${activeTab === 'subscription' ? 'bg-[#f3f7fb] font-medium' : 'hover:bg-slate-50'}`}
                >
                  Gói dịch vụ
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="md:col-span-9">
            {activeTab === 'jobs' ? (
              <div className="bg-white shadow rounded p-4 min-h-[160px]">
                {loading ? (
                  <Loading />
                ) : jobs.length === 0 ? (
                  <div className="py-12 text-center">
                    <Typography className="text-gray-600 mb-4">Không có tin tuyển dụng nào.</Typography>
                    <CreateJobWithSubscription onCreated={(job) => setJobs(prev => [job, ...prev])}>
                      <Button variant="contained" color="primary">Đăng Tin Tuyển</Button>
                    </CreateJobWithSubscription>
                  </div>
                ) : (
                  <div className="divide-y">
                    {jobs.map(job => (
                      <JobRow
                        key={job.jobId}
                        job={job}
                        onViewApplications={() => { viewApplications(job); setActiveTab('applications'); }}
                        onOpenMenu={(e, j) => openMenu(e, j || job)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
            //  : activeTab === 'applications' ? (
            //   <div className="bg-white shadow rounded p-4 min-h-[160px]">
            //     <ApplicationsList items={applications} onView={(a) => console.log('view app', a)} />
            //   </div>
            // ) 
            : activeTab === 'subscription' ? (
              <div className="bg-white shadow rounded p-4 min-h-[160px]">
                <div className="mb-4">
                  <h2 className="text-lg font-medium">Gói dịch vụ</h2>
                  {selectedPlan ? (
                    <div className="mt-2 p-3 border rounded bg-gray-50">
                      <div className="font-semibold">{selectedPlan.name ?? selectedPlan.plan_name ?? 'Gói đã chọn'}</div>
                      <div className="text-sm text-gray-600">{selectedPlan.price ? `${selectedPlan.price} đ` : ''}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Chưa chọn gói nào</div>
                  )}
                </div>
                <EmployerSubscriptionPlans apiUrl={null} onSelect={(p) => setSelectedPlan(p)} />
              </div>
            ) : activeTab === 'create' ? (
              <div className="bg-white shadow rounded p-4 min-h-[160px]">
                <div className="mb-4">
                  <h2 className="text-lg font-medium">Tạo tin tuyển dụng mới</h2>
                  <p className="text-sm text-gray-500">Tạo nhanh một tin tuyển kèm chọn gói (nếu muốn)</p>
                </div>
                <CreateJobWithSubscription onCreated={(job) => { setJobs(prev => [job, ...prev]); setActiveTab('jobs'); }} />
              </div>
            ) : (
              // overview
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold">Tổng quan tuyển dụng</h1>
                    <p className="text-sm text-gray-600">Trang tổng quan quản lý tin tuyển dụng của bạn</p>
                  </div>
                  <div>
                    <CreateJobWithSubscription onCreated={(job) => setJobs(prev => [job, ...prev])}>
                      <Button variant="contained" color="primary">Tạo Tin Tuyển</Button>
                    </CreateJobWithSubscription>
                  </div>
                </div>

                <StatsGrid items={stats} />

                <div className="mt-6 bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold">Tin tuyển mới nhất</div>
                    <div className="text-sm text-gray-500">Tất cả →</div>
                  </div>
                  {loading ? <Loading /> : (
                    jobs.length === 0 ? (
                      <div className="py-6 text-center text-gray-500">Chưa có tin tuyển dụng</div>
                    ) : (
                      <div className="divide-y">
                        {jobs.slice(0,3).map(j => (
                          <JobRow key={j.jobId} job={j} onViewApplications={() => viewApplications(j)} onOpenMenu={(e) => openMenu(e, j)} />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <ActionsMenu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={closeMenu}
        onAction={handleAction}
        job={selectedJob}
      />

      <ApplicationsDialog
        open={appsOpen}
        onClose={() => { setAppsOpen(false); setSelectedJob(null); }}
        loading={appsLoading}
        applications={applications}
        job={selectedJob}
        onAccept={handleAcceptApplication}
        onReject={handleRejectApplication}
        onToggleJobStatus={handleToggleJobStatus}
        onViewProfile={handleViewProfile}
      />

      {/* Employee profile modal (opened when clicking Xem hồ sơ) */}
      <Dialog open={profileOpen} onClose={() => { setProfileOpen(false); setProfileUserId(null); }} fullWidth maxWidth="md" ModalProps={{ disableScrollLock: true }}>
        <DialogTitle>Hồ sơ ứng viên</DialogTitle>
        <DialogContent>
          {/* EmployeeProfilePanel will fetch the profile using provided userId. In employer modal we render read-only. */}
          <EmployeeProfilePanel employee={null} userId={profileUserId} readOnly={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setProfileOpen(false); setProfileUserId(null); }} variant="outlined">Đóng</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}