import React, { useEffect, useState } from 'react';
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

export default function JobDetailDialog({ jobId, open, onClose }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !jobId) return;

    const ac = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // NOTE: mock file is static in public; real API would use jobId
        const res = await fetch('/mocks/JSON_DATA/responses/get_job_id.json', { signal: ac.signal });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || `HTTP ${res.status}`);
        }

        const parsed = await handleAsync(res.json());
        if (!parsed.success) throw new Error(parsed.message || 'Lỗi khi tải chi tiết công việc');

        // handleAsync returns { data: <parsedData>, success, message }
        setJob(parsed.data || null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => ac.abort();
  }, [jobId, open]);

  const handleClose = () => {
    setJob(null);
    setError(null);
    onClose?.();
  };

  return (
    <Dialog open={!!open} onClose={handleClose} fullWidth maxWidth="md">
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
                <Typography variant="body2" className="text-slate-500">
                  Hạn nộp: {job.jobExpireAt ? new Date(job.jobExpireAt).toLocaleDateString() : job.expiredAt ? new Date(job.expiredAt).toLocaleDateString() : '—'}
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
              <div>Ngày tạo: {job.jobCreateAt ? new Date(job.jobCreateAt).toLocaleDateString() : (job.jobCreateAt || '—')}</div>
              <div>Trạng thái: {job.jobStatus || job.status || '—'}</div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Đóng</Button>
        <Button onClick={() => { /* placeholder: apply action */ }} variant="contained" color="primary">Ứng tuyển</Button>
      </DialogActions>
    </Dialog>
  );
}