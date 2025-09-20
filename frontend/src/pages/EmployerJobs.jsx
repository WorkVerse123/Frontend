import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Loading from '../components/common/loading/Loading';
import { handleAsync } from '../utils/HandleAPIResponse';
import { Button, Typography } from '@mui/material';
import JobRow from '../components/jobs/JobRow';
import ActionsMenu from '../components/actions/ActionsMenu';
import ApplicationsDialog from '../components/common/modals/ApplicationsDialog';

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [appsOpen, setAppsOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const M = await import('../services/MocksService');
      handleAsync(M.fetchMock('/mocks/JSON_DATA/responses/get_employer_id_jobs.json'))
        .then(res => {
          if (!mounted) return;
          setJobs(res?.data?.jobs || []);
        })
        .finally(() => mounted && setLoading(false));
    })();
    return () => { mounted = false; };
  }, []);

  const viewApplications = async (job) => {
    setAppsOpen(true);
    setAppsLoading(true);
  const M = await import('../services/MocksService');
  const res = await handleAsync(M.fetchMock('/mocks/JSON_DATA/responses/get_employer_id_jobs_id_applications.json'));
    const apps = res?.data?.applications || [];
    setApplications(Array.isArray(apps) ? apps.filter(a => !a.jobId || String(a.jobId) === String(job.jobId)) : []);
    setAppsLoading(false);
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
    <MainLayout role="employer" hasSidebar={true}>
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