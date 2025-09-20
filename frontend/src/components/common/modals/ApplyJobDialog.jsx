import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import Loading from '../loading/Loading';
import { handleAsync } from '../../../utils/HandleAPIResponse';
import { useAuth } from '../../../contexts/AuthContext';

export default function ApplyJobDialog({ open, onClose, jobId }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  // const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const doSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // build payload
      const payload = {
        employeeId: user?.employeeId || null,
        jobId,
      };
      console.log('Submitting job application:', payload);
      // POST to mock endpoint via ApiClient (will return parsed response)
      const { post } = await import('../../../services/ApiClient');
      await post('/mocks/JSON_DATA/requests/post_job_id_apply.json', payload);

      onClose?.({ success: true });
    } catch (err) {
      setError('Không thể gửi hồ sơ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={() => onClose?.()} fullWidth maxWidth="sm">
      <DialogTitle>Ứng tuyển vị trí</DialogTitle>

      <DialogContent dividers>
        {submitting && <div className="py-4"><Loading /></div>}

        {!submitting && (
          <div className="space-y-3">
            {<Typography variant="body2" className="text-slate-600">Nhấn nút "Ứng tuyển" để gửi hồ sơ của bạn.</Typography>}

            {/*<TextField label="Họ tên" fullWidth name="name" value={form.name} onChange={handleChange} />
            <TextField label="Email" fullWidth name="email" value={form.email} onChange={handleChange} />
            <TextField label="Số điện thoại" fullWidth name="phone" value={form.phone} onChange={handleChange} />

            <div>
              <input id="cv-file" type="file" accept="application/pdf" onChange={handleFile} />
            </div> */}

            {/* <TextField label="Lời nhắn (tuỳ chọn)" fullWidth multiline minRows={3} name="message" value={form.message} onChange={handleChange} /> */}

            {error && <Typography color="error" className="text-sm">{error}</Typography>}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onClose?.()} variant="outlined">Huỷ</Button>
  <Button onClick={doSubmit} variant="contained" color="primary" disabled={submitting}>Ứng tuyển</Button>
      </DialogActions>
    </Dialog>
  );
}
