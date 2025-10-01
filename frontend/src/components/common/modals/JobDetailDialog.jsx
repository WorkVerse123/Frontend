import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import Loading from '../loading/Loading';
import { handleAsync } from '../../../utils/HandleAPIResponse';
import { formatSalary } from '../../../utils/formatSalary';
import { formatDateToDDMMYYYY } from '../../../utils/formatDate';
import { useAuth } from '../../../contexts/AuthContext';
import { get as apiGet } from '../../../services/ApiClient';
import ApiEndpoints from '../../../services/ApiEndpoints';

export default function JobDetailDialog({ jobId, open, onClose }) {
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!open || !jobId) return;

    const ac = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

  const { get: apiGet } = await import('../../../services/ApiClient');
  const ApiEndpoints = (await import('../../../services/ApiEndpoints')).default;
  const parsed = await apiGet(ApiEndpoints.JOB_DETAIL(jobId), { signal: ac.signal });
  // parsed may be axios response-like or normalized by handleAsync upstream; try common shapes
  const payload = parsed?.data ?? parsed;
  setJob(payload?.data ?? payload ?? null);
      } catch (err) {
        // treat abort/cancel as non-fatal
        if (err?.name && err.name === 'AbortError') return;
        if (err?.message && err.message.toLowerCase().includes('cancel')) return;
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ac.abort();
  }, [jobId, open]);

  // determine whether current user already applied to this job
  useEffect(() => {
    let mounted = true;
    if (!job || !user?.employeeId) {
      setApplied(false);
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const res = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_APPLICATIONS(user.employeeId)));
        if (!mounted) return;
        const apps = res?.data?.applications || res?.data || res || [];
        const found = (Array.isArray(apps) ? apps : []).some(a => String(a.jobId || a.jobId) === String(job.jobId || job.id));
        setApplied(Boolean(found));
      } catch (e) {
        if (mounted) setApplied(false);
      }
    })();

    return () => { mounted = false; };
  }, [job, user]);

  const handleClose = () => {
    setJob(null);
    setError(null);
    onClose?.();
  };

  return (
  <Dialog open={!!open} onClose={handleClose} fullWidth maxWidth="md" ModalProps={{ disableScrollLock: true }}>
      <DialogTitle>
        {loading ? 'Đang tải...' : job ? job.jobTitle || 'Chi tiết công việc' : 'Chi tiết công việc'}
      </DialogTitle>

      <Divider />

      <DialogContent dividers className="space-y-4">
        {loading && <div className="py-8"><Loading /></div>}

        {!loading && error && (
          <Typography color="error" className="text-sm">
            Không thể tải chi tiết công việc.
          </Typography>
        )}

        {!loading && job && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="h6" className="font-medium">{job.jobTitle}</Typography>
                <Typography variant="body2" className="text-slate-600">{job.jobCategory} • {job.jobLocation}</Typography>
              </div>
              <div className="flex items-center gap-2">
                <Chip label={job.jobStatus || job.status || '—'} size="small" color={job.jobStatus === 'opened' || job.status === 'opened' ? 'success' : 'default'} />
                <Typography variant="body2" className="text-slate-500 font-semibold">
                  Hạn nộp: <span className='text-green-500'>{formatDateToDDMMYYYY(job.jobExpiredAt) || '—'}</span>
                </Typography>
              </div>
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Mức lương</Typography>
              <Typography className="text-sm text-slate-600">
                {formatSalary(job.jobSalaryMin, job.jobSalaryMax, job.jobSalaryCurrency, job.jobTime)}
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Mô tả công việc</Typography>
              <Typography className="text-sm text-slate-600 whitespace-pre-line">{job.jobDescription || job.jobDesc || job.description || '—'}</Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Yêu cầu</Typography>
              <Typography className="text-sm text-slate-600 whitespace-pre-line">{job.jobRequirements || job.requirements || '—'}</Typography>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div>Ngày tạo: {formatDateToDDMMYYYY(job.jobCreatedAt) || (job.jobCreatedAt || '—')}</div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Đóng</Button>
        <Button
          onClick={() => navigate(`/jobs/${job.jobId || job.id}`)}
          variant="contained"
          color={applied ? 'success' : 'primary'}
          disabled={applied}
        >
          {applied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}