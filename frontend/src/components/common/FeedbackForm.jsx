import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { post } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { useAuth } from '../../contexts/AuthContext';

export default function FeedbackForm({ open, onClose }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!content || saving) return;
    setSaving(true);
    try {
      const rawId = user?.UserId ?? user?.id ?? 0;
      const parsedId = Number(rawId);
      const userId = Number.isFinite(parsedId) && !Number.isNaN(parsedId) ? parsedId : 0;
      const payload = { userId, content };
      await post(ApiEndpoints.FEEDBACKS, payload);
      setContent('');
      onClose?.();
    } catch (e) {
      console.error('Feedback submit failed', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gửi phản hồi</DialogTitle>
      <DialogContent>
        <div className="mt-2">
          <TextField
            label="Nội dung phản hồi"
            multiline
            minRows={4}
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving || !content}>Gửi</Button>
      </DialogActions>
    </Dialog>
  );
}
