import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

/**
 * Props:
 *  - open, value, onChange(field, value), onClose, onSave, isTimeRangeValid, isStartInPast
 */
export default function EventDialog({
  open,
  value = {},
  onChange = () => {},
  onClose = () => {},
  onSave = () => {},
  isTimeRangeValid = () => true,
  isStartInPast = () => false,
}) {
  const startError = !!value.start && !!value.end && !isTimeRangeValid();
  const startHelper = isStartInPast()
    ? 'Thời gian bắt đầu không được ở quá khứ'
    : (startError ? 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc' : '');

  return (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" ModalProps={{ disableScrollLock: true }}>
      <DialogTitle>Thêm / Chỉnh sửa sự kiện</DialogTitle>
      <DialogContent className="space-y-4">
        <TextField
          label="Tiêu đề"
          value={value.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          fullWidth
        />
        <TextField
          type="date"
          label="Ngày"
          value={value.date || ''}
          onChange={(e) => onChange('date', e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Bắt đầu"
            value={value.start || ''}
            onChange={(e) => onChange('start', e.target.value)}
            type="time"
            error={startError || isStartInPast()}
            helperText={startHelper}
          />
          <TextField
            label="Kết thúc"
            value={value.end || ''}
            onChange={(e) => onChange('end', e.target.value)}
            type="time"
            error={startError}
            helperText={startError ? 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu' : ''}
          />
        </div>

        <TextField label="Loại" value="Bận" fullWidth variant="outlined" disabled />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSave} disabled={!isTimeRangeValid()}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}