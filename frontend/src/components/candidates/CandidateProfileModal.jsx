import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import Loading from '../common/loading/Loading';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch (e) {
    return iso;
  }
}

/**
 * CandidateProfileModal
 * Props:
 * - open: boolean
 * - onClose: fn
 * - employeeId: optional (currently ignored; component reads mock file)
 * This component reads mock data from `/mocks/JSON_DATA/responses/get_employee_id.json`
 */
export default function CandidateProfileModal({ open, onClose, employeeId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { get: apiGet } = await import('../../services/ApiClient');
        const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
        // prefer explicit prop, otherwise use authenticated user's employeeId
        const { user } = require('../../contexts/AuthContext').useAuth ? require('../../contexts/AuthContext').useAuth() : { user: null };
        const resolvedEmployeeId = employeeId ?? user?.employeeId ?? user?._raw?.EmployeeId ?? null;
        const path = resolvedEmployeeId ? ApiEndpoints.EMPLOYEE_PROFILE(resolvedEmployeeId) : ApiEndpoints.EMPLOYEE_PROFILE('0');
        const res = await apiGet(path);
        if (!cancelled) setData(res?.data || res || null);
      } catch (err) {
        if (!cancelled) {
          // treat cancellations as non-fatal
          if (err?.name === 'AbortError' || (err?.message && err.message.toLowerCase().includes('cancel'))) return;
          setError(err.message || 'Unknown');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [open, employeeId]);

  return (
    <Dialog open={Boolean(open)} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span />
          <IconButton aria-label="close" onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Loading />
        ) : error ? (
          <Typography color="error">Lỗi: {error}</Typography>
        ) : data ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <Avatar src={data.avatarUrl} sx={{ width: 72, height: 72 }} />
                <Box>
                  <Typography variant="h6">{data.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{data.mode}</Typography>
                </Box>
                
              </Box>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Giới thiệu bản thân</Typography>
                <Typography variant="body2" color="text.secondary">{data.bio}</Typography>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>Kinh nghiệm làm việc</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>{data.workExperience}</Typography>

              <Typography variant="subtitle2" gutterBottom>Kỹ năng</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>{data.skills}</Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventIcon fontSize="small" />
                  <Typography variant="body2">{formatDate(data.dateOfBirth)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">{data.address}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkIcon fontSize="small" />
                  <Typography variant="body2">{data.mode}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="body2">{data.education}</Typography>
                </Box>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2">Thông tin liên hệ</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <MailOutlineIcon fontSize="small" />
                  <Typography variant="body2">{data.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">{data.phoneNumber}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2">Không có dữ liệu</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" color="primary">Nhắn Tin</Button>
        <Button variant="outlined">Phỏng Vấn</Button>
      </DialogActions>
    </Dialog>
  );
}
