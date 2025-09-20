import React, { useEffect, useState } from 'react';
import { Card, Box, Typography } from '@mui/material';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { formatSalary } from '../../utils/formatSalary';
import JobDetailDialog from '../../components/common/modals/JobDetailDialog';
import M from '../../services/MocksService';

export default function EmployerJobsList({ employerId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    // If no employerId provided yet, skip loading — avoids spurious errors while parent loads
    if (!employerId) {
      setJobs([]);
      setLoading(false);
      return () => {};
    }

    const load = async () => {
      try {
        setLoading(true);
        const parsed = await M.fetchMock('/mocks/JSON_DATA/responses/get_employer_id_jobs.json', { signal: ac.signal });
        setJobs((parsed?.data && parsed.data.jobs) || parsed?.jobs || []);
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
        if (!isCanceled) setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ac.abort();
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
        {jobs.map((job) => (
          <Card
            key={job.jobId}
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
                <div className="text-sm text-slate-600">{job.title}</div>
                <div className="text-xs text-slate-500 mt-1">{job.location} • {job.status}</div>
                <div className="text-xs text-slate-500 mt-1">Mức lương: {formatSalary(job.jobSalaryMin, job.jobSalaryMax, job.jobSalaryCurrency, job.jobTime)}</div>
                <div className="text-xs text-slate-400 mt-1">Ứng viên đã ứng tuyển: {job.employeeApplyCount}</div>
              </div>
              <div className="text-sm font-medium text-sky-600">
                {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString() : ''}
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