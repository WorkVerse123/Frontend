import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from '@mui/material';
import { formatDateToDDMMYYYY, parseDDMMYYYYToISO } from '../../utils/formatDate';

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
  onDelete = null,
  isTimeRangeValid = () => true,
  isStartInPast = () => false,
}) {
  const startError = !!value.start && !!value.end && !isTimeRangeValid();
  const startHelper = isStartInPast()
    ? 'Thời gian bắt đầu không được ở quá khứ'
    : (startError ? 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc' : '');

  // Defensive guard to restore body overflow/padding if other code changes it while this dialog is open
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    const obs = new MutationObserver(() => {
      try {
        if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = prev || '';
          try {
            if (document.body.style.paddingRight !== prevPad) {
              document.body.style.paddingRight = prevPad || '';
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => {
      try { obs.disconnect(); } catch (e) {}
      try { document.body.style.overflow = prev || ''; } catch (e) {}
      try { document.body.style.paddingRight = prevPad || ''; } catch (e) {}
    };
  }, [open]);

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
        {/* Use text input with dd/mm/yyyy display and parse back to ISO for internal value */}
        <TextField
          type="text"
          label="Ngày (dd/mm/yyyy)"
          disabled = {true}
          value={value.date ? formatDateToDDMMYYYY(value.date) : ''}
          onChange={(e) => {
            const txt = e.target.value;
            // try to parse dd/mm/yyyy -> ISO (YYYY-MM-DD)
            const iso = parseDDMMYYYYToISO(txt);
            // if parse succeeded, update with ISO; otherwise update raw input to allow user typing
            if (iso) {
              onChange('date', iso);
            } else {
              // let caller manage invalid state; we still pass the raw text so UI can show it
              onChange('date', txt);
            }
          }}
          fullWidth
          InputLabelProps={{ shrink: true }}
          helperText={value.date && typeof value.date === 'string' && !parseDDMMYYYYToISO(formatDateToDDMMYYYY(value.date)) ? 'Định dạng ngày không hợp lệ (dd/mm/yyyy)' : ''}
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
        {typeof onDelete === 'function' && (value?.id || value?.raw?.busyTimeId || value?.raw?.id) ? (
          <Button color="error" onClick={onDelete}>Xóa</Button>
        ) : null}
        <Button variant="contained" onClick={onSave} disabled={!isTimeRangeValid()}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}