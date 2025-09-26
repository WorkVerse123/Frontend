import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import { handleAsync } from '../utils/HandleAPIResponse';
import ApiEndpoints from '../services/ApiEndpoints';
import { get as apiGet } from '../services/ApiClient';
import { Button, Typography } from '@mui/material';
import JobRow from '../components/jobs/JobRow';
import ActionsMenu from '../components/actions/ActionsMenu';
import ApplicationsDialog from '../components/common/modals/ApplicationsDialog';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    setLoading(true);
    (async () => {
      try {
        const resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? null;
        if (!resolvedEmployerId) throw new Error('No employer id available for current user');
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYER_JOBS(resolvedEmployerId), { signal: ac.signal }));
        if (!mounted) return;
        const data = res?.data ?? res;
        // Normalize common response shapes into an array
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.jobs)) {
          list = data.jobs;
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
          list = [];
        } else {
          // if API returned a single job object, wrap it
          if (data && typeof data === 'object') list = [data];
          else list = [];
        }
        setJobs(list);
      } catch (e) {
        // ignore — keep jobs empty
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, []);

    const viewApplications = async (job) => {
    setAppsOpen(true);
    setAppsLoading(true);
  const ac = new AbortController();
  try {
    const resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? null;
    if (!resolvedEmployerId) throw new Error('No employer id available for current user');
    const res = await handleAsync(apiGet(ApiEndpoints.APPLICATIONS_FOR_EMPLOYER_JOB(resolvedEmployerId, job.jobId), { signal: ac.signal }));
    const apps = res?.data?.applications || res?.data || res || [];
    if (!ac.signal.aborted) setApplications(Array.isArray(apps) ? apps.filter(a => !a.jobId || String(a.jobId) === String(job.jobId)) : []);
  } catch (err) {
    // ignore canceled or non-critical errors; keep applications empty
  } finally {
    if (!ac.signal.aborted) setAppsLoading(false);
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
  };

  return (
    <MainLayout role={normalizedRole} hasSidebar={true}>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold">Tổng quan tuyển dụng</h1>
          <div className="w-full sm:w-auto">
            <Button fullWidth variant="contained" color="primary" className="sm:inline-flex">Đăng Tin Tuyển</Button>
          </div>
        </div>

        {/* content */}
        <div className="bg-white shadow rounded p-4 min-h-[160px]">
          {loading ? (
            <Loading />
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center">
              <Typography className="text-gray-600 mb-4">Không có tin tuyển dụng nào.</Typography>
              <Button variant="contained" color="primary">Đăng Tin Tuyển</Button>
            </div>
          ) : (
            <div className="divide-y">
              {jobs.map(job => (
                <JobRow
                  key={job.jobId}
                  job={job}
                  onViewApplications={() => viewApplications(job)}
                  onOpenMenu={(e, j) => openMenu(e, j || job)}
                />
              ))}
            </div>
          )}
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
        onClose={() => setAppsOpen(false)}
        loading={appsLoading}
        applications={applications}
      />
    </MainLayout>
  );
}