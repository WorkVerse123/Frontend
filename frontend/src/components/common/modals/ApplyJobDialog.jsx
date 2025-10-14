import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import Loading from '../loading/Loading';
import { handleAsync } from '../../../utils/HandleAPIResponse';
import { useAuth } from '../../../contexts/AuthContext';
import ApiEndpoints from '../../../services/ApiEndpoints';
import { useNavigate } from 'react-router-dom';

export default function ApplyJobDialog({ open, onClose, jobId, employerId, initialApplied = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', note: '' });
  // const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(!!initialApplied);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // const handleFile = (e) => setFile(e.target.files?.[0] || null);

  const doSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // build payload
      const payload = { employeeId: user?.employeeId || null, jobId };
      console.log('Submitting job application:', payload);

      // POST to real API endpoint via ApiClient
      const { post } = await import('../../../services/ApiClient');
      // Use EMPLOYEE_APPLICATIONS endpoint: /api/employees/{employeeId}/applications
      const employeeId = user?.employeeId || null;
      if (!employeeId) {
        // Instead of throwing an error that surfaces as text, prompt user to login/register
        setShowAuthPrompt(true);
        setSubmitting(false);
        return;
      }

      const endpoint = (ApiEndpoints.EMPLOYEE_APPLICATIONS) ? ApiEndpoints.EMPLOYEE_APPLICATIONS(employeeId) : `/api/employees/${employeeId}/applications`;
      // Body must be { jobId, coverLetter }
      const body = { jobId, coverLetter: form.note || '' };
      await post(endpoint, body);

      setApplied(true);
      setSnackbarMsg('Ứng tuyển thành công.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onClose?.({ success: true });
    } catch (err) {
      // Try to extract a useful message from common error shapes (axios, fetch, custom)
      let msg = 'Không thể gửi hồ sơ. Vui lòng thử lại.';
      try {
        if (!err) msg = 'Không thể gửi hồ sơ. Vui lòng thử lại.';
        // axios style: err.response.data.message or err.response.data.error
        else if (err.response && err.response.data) {
          const d = err.response.data;
          if (typeof d === 'string') msg = d;
          else if (d.message) msg = d.message;
          else if (d.error) msg = d.error;
          else msg = JSON.stringify(d);
          if (err.response.status) msg = `(${err.response.status}) ${msg}`;
        } else if (err.message) {
          msg = err.message;
        } else {
          msg = String(err);
        }
      } catch (e) {
        msg = 'Không thể gửi hồ sơ. Vui lòng thử lại.';
      }

      setError(msg);
      setSnackbarMsg(msg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
  <Dialog open={!!open} onClose={() => onClose?.()} fullWidth maxWidth="sm" ModalProps={{ disableScrollLock: true }}>
      <DialogTitle>Ứng tuyển vị trí</DialogTitle>

      <DialogContent dividers>
        {submitting && <div className="py-4"><Loading /></div>}

        {!submitting && (
          <div className="space-y-3">
            {showAuthPrompt ? (
              <div className="text-center py-4">
                <Typography variant="h6">Vui lòng đăng nhập hoặc đăng ký</Typography>
                <Typography variant="body2" className="text-slate-600 mt-2">Bạn cần đăng nhập để gửi hồ sơ ứng tuyển. Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục.</Typography>
              </div>
            ) : (
              <>
                <Typography variant="body2" className="text-slate-600">Nhấn nút "Ứng tuyển" để gửi hồ sơ của bạn.</Typography>

                {/*<TextField label="Họ tên" fullWidth name="name" value={form.name} onChange={handleChange} />
                <TextField label="Email" fullWidth name="email" value={form.email} onChange={handleChange} />
                <TextField label="Số điện thoại" fullWidth name="phone" value={form.phone} onChange={handleChange} />

                <div>
                  <input id="cv-file" type="file" accept="application/pdf" onChange={handleFile} />
                </div> */}

                <TextField label="Ghi chú" fullWidth multiline minRows={3} name="note" value={form.note} onChange={handleChange} placeholder="Viết ghi chú hoặc thư xin việc ngắn (tùy chọn)" />

                {error && <Typography color="error" className="text-sm">{error}</Typography>}
              </>
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        {showAuthPrompt ? (
          <>
            <Button onClick={() => { setShowAuthPrompt(false); onClose?.(); }} variant="outlined">Đóng</Button>
            <Button onClick={() => { navigate('/auth'); }} variant="contained" color="primary">Đăng nhập / Đăng ký</Button>
          </>
        ) : (
          <>
            <Button onClick={() => onClose?.()} variant="outlined">Huỷ</Button>
            <Button onClick={doSubmit} variant="contained" color={applied ? 'success' : 'primary'} disabled={submitting || applied}>{applied ? 'Đã ứng tuyển' : 'Ứng tuyển'}</Button>
          </>
        )}
      </DialogActions>
    
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
