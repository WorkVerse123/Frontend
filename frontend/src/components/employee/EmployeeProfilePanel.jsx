import React, { useState, useEffect } from 'react';
import { Grid, TextField, Paper, Avatar, IconButton, Button, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';

// A simple editable panel for employee profile. Shows provided `employee` or empty fields.
export default function EmployeeProfilePanel({ employee = null, onSave = () => {} }) {
  const empty = {
    employeeId: '',
    userId: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    avatarUrl: '',
    bio: '',
    skills: '',
    education: '',
    workExperience: '',
    mode: '',
  };

  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm(prev => ({ ...prev, ...{
        employeeId: employee.employeeId || employee.employee_id || employee.employeeId || '',
        userId: employee.userId || employee.user_id || '',
        fullName: employee.fullName || employee.full_name || employee.fullName || '',
        dateOfBirth: employee.dateOfBirth || employee.date_of_birth || '',
        gender: employee.gender || '',
        address: employee.address || '',
        avatarUrl: employee.avatarUrl || employee.avatar_url || '',
        bio: employee.bio || '',
        skills: employee.skills || '',
        education: employee.education || '',
        workExperience: employee.workExperience || employee.work_experience || '',
        mode: employee.mode || '',
      }}));
    } else {
      setForm(empty);
    }
  }, [employee]);

  function change(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSave() {
    // Caller can implement real save; here we just call onSave with form data
    onSave(form);
    setEditing(false);
  }

  return (
    <Paper className="p-6" elevation={1} sx={{ padding: 3 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar src={form.avatarUrl} alt={form.fullName} sx={{ width: 64, height: 64 }}>
            {!form.avatarUrl && <PersonIcon />}
          </Avatar>
          <div>
            <Typography variant="h6">{form.fullName || 'Thông tin cá nhân'}</Typography>
            <Typography variant="body2" color="text.secondary">{form.employeeId ? `ID: ${form.employeeId}` : ''}</Typography>
          </div>
        </div>

        <div>
          {editing ? (
            <>
              <IconButton color="primary" onClick={handleSave} aria-label="save">
                <SaveIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => setEditing(false)} aria-label="cancel">
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setEditing(true)} aria-label="edit">
              <EditIcon />
            </IconButton>
          )}
        </div>
      </div>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Họ và tên" value={form.fullName} onChange={e => change('fullName', e.target.value)} disabled={!editing} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Ngày sinh" type="date" value={form.dateOfBirth} onChange={e => change('dateOfBirth', e.target.value)} disabled={!editing} InputLabelProps={{ shrink: true }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Giới tính" value={form.gender} onChange={e => change('gender', e.target.value)} disabled={!editing} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Địa chỉ" value={form.address} onChange={e => change('address', e.target.value)} disabled={!editing} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label="Tiểu sử (Bio)" value={form.bio} onChange={e => change('bio', e.target.value)} disabled={!editing} multiline rows={3} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Kỹ năng" value={form.skills} onChange={e => change('skills', e.target.value)} disabled={!editing} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Học vấn" value={form.education} onChange={e => change('education', e.target.value)} disabled={!editing} />
        </Grid>

        <Grid item xs={12}>
          <TextField fullWidth label="Kinh nghiệm làm việc" value={form.workExperience} onChange={e => change('workExperience', e.target.value)} disabled={!editing} multiline rows={3} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Phương thức" value={form.mode} onChange={e => change('mode', e.target.value)} disabled={!editing} />
        </Grid>

        <Grid item xs={12} sm={6} className="flex items-center">
          <TextField fullWidth label="Avatar URL" value={form.avatarUrl} onChange={e => change('avatarUrl', e.target.value)} disabled={!editing} />
        </Grid>

        <Grid item xs={12} className="flex justify-end gap-2 mt-2">
          <Button variant="outlined" onClick={() => setForm(empty)} disabled={!editing}>Reset</Button>
          <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave} disabled={!editing}>Lưu</Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
