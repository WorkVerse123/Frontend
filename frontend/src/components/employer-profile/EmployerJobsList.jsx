import React, { useEffect, useState } from 'react';
import { Card, Box, Typography } from '@mui/material';
import { handleAsync } from '../../utils/HandleAPIResponse';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet } from '../../services/ApiClient';
import { formatSalary } from '../../utils/formatSalary';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import JobDetailDialog from '../../components/common/modals/JobDetailDialog';
import EndpointResolver from '../../services/EndpointResolver';

export default function EmployerJobsList({ employerId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    // If no employerId provided yet, skip loading — avoids spurious errors while parent loads
    if (!employerId) {
      setJobs([]);
      setLoading(false);
      return () => { mounted = false; ac.abort(); };
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYER_JOBS(employerId)));
        if (!mounted) return;
        const parsed = res?.data ?? res;
        // Normalize various possible API shapes into an array of jobs
        let jobList = [];
        if (Array.isArray(parsed)) {
          jobList = parsed;
        } else if (Array.isArray(parsed?.jobs)) {
          jobList = parsed.jobs;
        } else if (Array.isArray(parsed?.data)) {
          jobList = parsed.data;
        } else if (Array.isArray(parsed?.items)) {
          jobList = parsed.items;
        } else if (parsed && typeof parsed === 'object') {
          // Sometimes API returns an object with numeric keys or a single job
          // If it's a single job object, wrap it
          const possibleJob = parsed.job || parsed.jobDetail || parsed.jobData || parsed;
          if (Array.isArray(possibleJob)) jobList = possibleJob;
          else if (possibleJob && typeof possibleJob === 'object' && Object.keys(possibleJob).length) jobList = [possibleJob];
        }
        setJobs(jobList);
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || (err?.message && err.message.toLowerCase().includes('cancel'));
        if (!isCanceled) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; ac.abort(); };
  }, [employerId]);



  if (loading) {
    return <div className="text-sm text-slate-600">Đang tải vị trí tuyển dụng...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">Không tải được danh sách việc làm.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Typography variant="h6" className="font-semibold">Các vị trí tuyển dụng</Typography>
        <Typography variant="body2" color="textSecondary">Tổng: {jobs.length}</Typography>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {jobs.map((job, idx) => (
          <Card
            key={job.jobId ?? job.id ?? job._id ?? idx}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setSelectedJobId(job.jobId); setJobDialogOpen(true); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedJobId(job.jobId);
                setJobDialogOpen(true);
              }
            }}
          >
            <Box className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-600 font-bold">{job.jobTitle}</div>
                <div className="text-xs text-slate-500 mt-1">Địa điểm: {job.jobLocation} </div>
                <div className="text-xs text-slate-500 mt-1 font-semibold">Trạng thái: {job.jobStatus || '—'}</div>
                <div className="text-xs text-slate-500 mt-1">Mức lương: {formatSalary(job.jobSalaryMin, job.jobSalaryMax, job.jobSalaryCurrency, job.jobTime)}</div>
                <div className="text-xs text-slate-400 mt-1">Ứng viên đã ứng tuyển: {job.employeeApplyCount}</div>
              </div>
              <div className="text-sm font-medium text-sky-600">
                {formatDateToDDMMYYYY(job.expiredAt)}
              </div>
            </Box>
          </Card>
        ))}
      </div>
      {/* Job detail dialog */}
      <JobDetailDialog
        jobId={selectedJobId}
        open={jobDialogOpen}
        onClose={() => { setJobDialogOpen(false); setSelectedJobId(null); }}
      />
    </div>
  );
}