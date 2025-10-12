import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { post } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { useAuth } from '../../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { getCookie } from '../../services/AuthCookie';

export default function ReportForm({ open, onClose, initialTargetType = 'user', initialTargetId = 0 }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });

  // Log when modal opens to help debugging
  React.useEffect(() => {
    if (open) {
      // modal opened
    }
  }, [open, initialTargetType, initialTargetId, user]);

  // Safe JWT payload parser (handles base64url and unicode like AuthContext)
  function parseJwtPayload(token) {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      let payload = parts[1];
      // base64url -> base64
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      // pad with '='
      while (payload.length % 4) payload += '=';
      // atob may throw for unicode, try decodeURIComponent trick
      try {
        const json = decodeURIComponent(atob(payload).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(json);
      } catch (e) {
        try {
          const raw = atob(payload);
          return JSON.parse(raw);
        } catch (err) {
          return null;
        }
      }
    } catch (e) {
      return null;
    }
  }

  // We require the parent page to pass the exact target (type + id).
  // Do not render inputs for targetType/targetId — they must be provided by the caller.
  const handleSubmit = async () => {
    if (submitting) return;
    // validate that initialTargetId is present
    const parsedTargetId = Number(initialTargetId || 0);
    if (!Number.isFinite(parsedTargetId) || Number.isNaN(parsedTargetId) || parsedTargetId === 0) {
      return;
    }

    setSubmitting(true);
    try {
      // Prefer user id from auth context, fallback to token cookie parsing when necessary
      const rawUserId = user?.userId ?? user?.id ?? null;
      let parsedUserId = Number(rawUserId);
      if ((!Number.isFinite(parsedUserId) || Number.isNaN(parsedUserId) || parsedUserId === 0) || parsedUserId === null) {
        // try parse user id from token cookie (safe base64 decode)
        try {
          const token = getCookie('token');
          if (token) {
            const parts = token.split('.');
            if (parts.length >= 2) {
              try {
                const payloadRaw = atob(parts[1]);
                const payload = JSON.parse(payloadRaw);
                // token payload may contain user id under various keys or nested structures
                const pickId = (p) => {
                  if (!p || typeof p !== 'object') return null;
                  return p.UserId ?? p.userId ?? p.id ?? p.user_id ?? p.sub ?? null;
                };
                let candidateId = pickId(payload) ?? null;
                if (!candidateId && payload.user) candidateId = pickId(payload.user) ?? null;
                if (!candidateId && payload.data) candidateId = pickId(payload.data) ?? null;
                parsedUserId = Number(candidateId ?? 0);
              } catch (e) {
                // ignore parse errors
              }
            }
          }
        } catch (e) {}
      }
      const userId = Number.isFinite(parsedUserId) && !Number.isNaN(parsedUserId) ? parsedUserId : 0;
      const finalTargetId = parsedTargetId;
      const payload = {
        userId,
        targetType: initialTargetType || 'user',
        targetId: finalTargetId,
        reason: reason || '',
      };
  await post(ApiEndpoints.REPORTS, payload);
      setReason('');
      setSnack({ open: true, severity: 'success', message: 'Gửi báo cáo thành công.' });
      onClose?.();
    } catch (e) {
      // show specific message when server indicates duplicate report (400)
      try {
        const status = e?.response?.status;
        if (status === 400) {
          setSnack({ open: true, severity: 'warning', message: 'Bạn đã báo cáo rồi, không thể báo cáo lại.' });
        } else {
          setSnack({ open: true, severity: 'error', message: 'Lỗi khi gửi báo cáo. Vui lòng thử lại.' });
        }
      } catch (err) {
        // fallback
        setSnack({ open: true, severity: 'error', message: 'Lỗi khi gửi báo cáo.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Báo cáo</DialogTitle>
      <DialogContent>
        <div className="space-y-3 mt-2">

          {/* Target type and id are provided by the caller via props and are not editable here. */}

          <TextField
            label="Lý do"
            multiline
            minRows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            variant="outlined"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || !reason}>Gửi báo cáo</Button>
      </DialogActions>
      </Dialog>
      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
      <MuiAlert elevation={6} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity}>
        {snack.message}
      </MuiAlert>
      </Snackbar>
      </>
  );
}
