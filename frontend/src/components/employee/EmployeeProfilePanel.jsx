import React, { useState, useEffect, useRef } from 'react';
import { Grid, TextField, Paper, Avatar, IconButton, Button, Typography, CircularProgress, Box, MenuItem } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadService from '../../services/UploadService';
import { useAuth } from '../../contexts/AuthContext';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { formatDateToDDMMYYYY } from '../../utils/formatDate';
import InlineLoader from '../common/loading/InlineLoader';

// A simple editable panel for employee profile. Shows provided `employee` or empty fields.
export default function EmployeeProfilePanel({ employee = null, onSave = () => {}, userId = null, initialForceCreate = false }) {
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

  const [loading, setLoading] = useState(!employee);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const bioRef = useRef(null);
  const skillsRef = useRef(null);
  const educationRef = useRef(null);
  const workRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // If parent provided an employee, just populate the form from it.
    if (employee) {
      setForm(prev => ({ ...prev, ...{
        employeeId: employee.employeeId || employee.employee_id || '',
        userId: employee.userId || employee.user_id || '',
        fullName: employee.fullName || employee.full_name || '',
        dateOfBirth: (employee.dateOfBirth || employee.date_of_birth || '').slice(0,10),
        gender: employee.gender || '',
        address: employee.address || '',
        avatarUrl: employee.avatarUrl || employee.avatar_url || '',
        bio: employee.bio || '',
        skills: employee.skills || '',
        education: employee.education || '',
        workExperience: employee.workExperience || employee.work_experience || '',
        mode: employee.mode || '',
      }}));
      setLoading(false);
      return;
    }

    // No employee prop: fetch real employee profile
    // If initialForceCreate is true (coming from registration flow), skip fetching — we expect a fresh profile create
    if (initialForceCreate) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const controller = new AbortController();

  async function load() {
      setLoading(true);
      try {
        const { get: apiGet } = await import('../../services/ApiClient');
        const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
  // Prefer explicit userId prop, otherwise prefer normalized profileId/employeeId from AuthContext,
  // finally fall back to 'me' which the server may resolve from the auth token.
  const idToFetch = userId || user?.profileId || user?.employeeId || 'me';
        const res = await apiGet(ApiEndpoints.EMPLOYEE_PROFILE(idToFetch), { signal: controller.signal });
        const emp = res?.data || res;
        if (!mounted) return;
        setForm(prev => ({ ...prev, ...{
          employeeId: emp.employeeId || emp.employee_id || emp.id || '',
          userId: emp.userId || emp.user_id || '',
          fullName: emp.fullName || emp.full_name || emp.fullName || '',
          dateOfBirth: (emp.dateOfBirth || emp.date_of_birth || emp.dob || '').slice(0,10),
          gender: emp.gender || '',
          address: emp.address || '',
          avatarUrl: emp.avatarUrl || emp.avatar_url || emp.avatar || '',
          bio: emp.bio || '',
          skills: emp.skills || '',
          education: emp.education || '',
          workExperience: emp.workExperience || emp.work_experience || '',
          mode: emp.mode || '',
        }}));
      } catch (err) {
        // keep console error for local debugging; UI stays with empty form
        // eslint-disable-next-line no-console
        console.error('Failed to load employee profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [employee, userId, initialForceCreate, user]);

  // Panel is update-only; creation flow should be handled elsewhere.

  function change(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    if (editing) {
      // Small delay to ensure DOM updated, then focus bio editor so user can type immediately
      setTimeout(() => {
        try {
          bioRef.current?.getEditor?.()?.focus?.();
        } catch (e) {
          // ignore focus errors
        }
      }, 50);
    }
  }, [editing]);

  async function handleSave() {
    setSaveError('');
    setSaveSuccess('');
    setSaving(true);
    try {
      const { post, put } = await import('../../services/ApiClient');
      const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;

      // Build a local payload so we can merge the Cloudinary URL and avoid sending
      // the preview blob URL (state updates are async and `form` may be stale).
      let payload = { ...form };

      // If a file was selected, upload it to Cloudinary (unsigned) and merge returned url
      if (selectedFile) {
        try {
          const uploadRes = await UploadService.uploadImageToCloudinary(selectedFile, { onProgress: () => {} });
          const returnedUrl = (uploadRes && (uploadRes.url || uploadRes.raw?.secure_url || uploadRes.secure_url)) || null;
          if (returnedUrl) {
            payload = { ...payload, avatarUrl: returnedUrl };
            // keep local state in sync for UI
            setForm(f => ({ ...f, avatarUrl: returnedUrl }));
          }
        } catch (upErr) {
          // fail early if upload fails
          throw new Error(upErr?.response?.data?.message || upErr?.message || 'Upload ảnh thất bại');
        }
      }

      if (payload.employeeId) {
        // update existing employee profile
        const res = await handleAsync(put(ApiEndpoints.EMPLOYEE_PROFILE(payload.employeeId), payload));
        if (!res || !res.success) throw new Error(res?.message || 'Cập nhật hồ sơ thất bại');
        setSaveSuccess('Cập nhật hồ sơ thành công');
      } else {
        // create new employee profile — requires an auth user id
        const authUserId = user?.id || user?.userId || user?.UserId || user?._raw?.UserId || null;
        if (!authUserId) throw new Error('Không có userId để tạo hồ sơ');
        const res = await handleAsync(post(ApiEndpoints.EMPLOYEE_PROFILE_CREATE(authUserId), payload));
        if (!res || !res.success) throw new Error(res?.message || 'Tạo hồ sơ thất bại');
        const created = res.data || res;
        const newEmployeeId = created?.employeeId || created?.employee_id || created?.id || null;
        if (newEmployeeId) setForm(f => ({ ...f, employeeId: newEmployeeId }));
        setSaveSuccess('Tạo hồ sơ thành công');
      }

      if (typeof onSave === 'function') onSave(form);
      setEditing(false);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save employee profile:', err);
      setSaveError(err?.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <InlineLoader />
    );
  }

  return (
    <Paper className="p-6" elevation={1} sx={{ padding: 3 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                setSelectedFile(f);
                // create preview URL
                if (objectUrlRef.current) {
                  try { URL.revokeObjectURL(objectUrlRef.current); } catch (err) {}
                  objectUrlRef.current = null;
                }
                try {
                  const obj = URL.createObjectURL(f);
                  objectUrlRef.current = obj;
                  setForm(prev => ({ ...prev, avatarUrl: obj }));
                } catch (err) {
                  // ignore
                }
              }}
            />

            <div
              role={editing ? 'button' : undefined}
              tabIndex={editing ? 0 : -1}
              aria-label={editing ? 'Thay ảnh đại diện' : undefined}
              title={editing ? 'Nhấn để thay ảnh đại diện' : ''}
              onClick={() => { if (editing && fileInputRef.current) fileInputRef.current.click(); }}
              onKeyDown={(e) => { if (editing && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fileInputRef.current && fileInputRef.current.click(); } }}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onFocus={() => setAvatarHover(true)}
              onBlur={() => setAvatarHover(false)}
              style={{ cursor: editing ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', position: 'relative' }}
            >
              <Avatar src={form.avatarUrl} alt={form.fullName} sx={{ width: 72, height: 72 }}>
                {!form.avatarUrl && <PersonIcon />}
              </Avatar>
              {editing && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.35)',
                    color: '#fff',
                    borderRadius: '50%',
                    opacity: avatarHover ? 1 : 0,
                    transition: 'opacity 150ms ease',
                    pointerEvents: 'none'
                  }}
                >
                  <PhotoCamera />
                </div>
              )}
            </div>
          </div>
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
          {editing ? (
            <TextField fullWidth label="Họ và tên" value={form.fullName} onChange={e => change('fullName', e.target.value)} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.98rem' }}>Họ và tên:</Typography>
              <Typography sx={{ color: '#000' }}>{form.fullName || '—'}</Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          {editing ? (
            <TextField fullWidth label="Ngày sinh" type="date" value={form.dateOfBirth} onChange={e => change('dateOfBirth', e.target.value)} InputLabelProps={{ shrink: true }} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.98rem' }}>Ngày sinh:</Typography>
              <Typography sx={{ color: '#000' }}>{formatDateToDDMMYYYY(form.dateOfBirth) || '—'}</Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} sm={6}>
          {editing ? (
            <TextField
              select
              fullWidth
              label="Giới tính"
              value={form.gender}
              onChange={e => change('gender', e.target.value)}
              SelectProps={{ native: false }}
            >
              <MenuItem value="">-- Chọn --</MenuItem>
              <MenuItem value="Male">Nam</MenuItem>
              <MenuItem value="Female">Nữ</MenuItem>
              <MenuItem value="Other">Khác</MenuItem>
              <MenuItem value="Prefer not to say">Không muốn tiết lộ</MenuItem>
            </TextField>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.98rem' }}>Giới tính:</Typography>
              <Typography sx={{ color: '#000' }}>{
                form.gender === 'Male' ? 'Nam' : form.gender === 'Female' ? 'Nữ' : form.gender === 'Other' ? 'Khác' : form.gender === 'Prefer not to say' ? 'Không muốn tiết lộ' : '—'
              }</Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          {editing ? (
            <TextField fullWidth label="Địa chỉ" value={form.address} onChange={e => change('address', e.target.value)} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.98rem' }}>Địa chỉ:</Typography>
              <Typography sx={{ color: '#000' }}>{form.address || '—'}</Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, fontSize: '1.05rem' }}>Tiểu sử (Bio)</Typography>
          <Paper
            variant={editing ? 'outlined' : 'elevation'}
            sx={{
              p: 1,
              minHeight: 140,
              border: editing ? undefined : 'none',
              boxShadow: editing ? undefined : 'none',
              '& .ql-editor': { pointerEvents: editing ? 'auto' : 'none', minHeight: 110, color: '#000' }
            }}
          >
            <ReactQuill
              key={editing ? 'bio-edit' : 'bio-view'}
              value={form.bio || ''}
              onChange={value => change('bio', value)}
              readOnly={!editing}
              ref={bioRef}
              theme={editing ? 'snow' : 'bubble'}
              modules={{ toolbar: editing ? [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['link']] : false }}
              style={{ minHeight: 110, background: 'transparent' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, fontSize: '1.05rem' }}>Kỹ năng</Typography>
          <Paper
            variant={editing ? 'outlined' : 'elevation'}
            sx={{
              p: 1,
              minHeight: 120,
              border: editing ? undefined : 'none',
              boxShadow: editing ? undefined : 'none',
              '& .ql-editor': { pointerEvents: editing ? 'auto' : 'none', minHeight: 90, color: '#000' }
            }}
          >
            <ReactQuill
              key={editing ? 'skills-edit' : 'skills-view'}
              value={form.skills || ''}
              onChange={value => change('skills', value)}
              readOnly={!editing}
              ref={skillsRef}
              theme={editing ? 'snow' : 'bubble'}
              modules={{ toolbar: editing ? [['bold', 'italic'], [{ list: 'bullet' }]] : false }}
              style={{ minHeight: 90, background: 'transparent' }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, fontSize: '1.05rem' }}>Học vấn</Typography>
          <Paper
            variant={editing ? 'outlined' : 'elevation'}
            sx={{
              p: 1,
              minHeight: 120,
              border: editing ? undefined : 'none',
              boxShadow: editing ? undefined : 'none',
              '& .ql-editor': { pointerEvents: editing ? 'auto' : 'none', minHeight: 90, color: '#000' }
            }}
          >
            <ReactQuill
              key={editing ? 'education-edit' : 'education-view'}
              value={form.education || ''}
              onChange={value => change('education', value)}
              readOnly={!editing}
              ref={educationRef}
              theme={editing ? 'snow' : 'bubble'}
              modules={{ toolbar: editing ? [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }]] : false }}
              style={{ minHeight: 90, background: 'transparent' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, fontSize: '1.05rem' }}>Kinh nghiệm làm việc</Typography>
          <Paper
            variant={editing ? 'outlined' : 'elevation'}
            sx={{
              p: 1,
              minHeight: 140,
              border: editing ? undefined : 'none',
              boxShadow: editing ? undefined : 'none',
              '& .ql-editor': { pointerEvents: editing ? 'auto' : 'none', minHeight: 110, color: '#000' }
            }}
          >
            <ReactQuill
              key={editing ? 'work-edit' : 'work-view'}
              value={form.workExperience || ''}
              onChange={value => change('workExperience', value)}
              readOnly={!editing}
              ref={workRef}
              theme={editing ? 'snow' : 'bubble'}
              modules={{ toolbar: editing ? [['bold', 'italic'], [{ list: 'ordered' }, { list: 'bullet' }], ['link']] : false }}
              style={{ minHeight: 110, background: 'transparent' }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Phương thức"
            value={form.mode}
            onChange={e => change('mode', e.target.value)}
            disabled={!editing}
            SelectProps={{ native: false, MenuProps: { disableScrollLock: true } }}
          >
            <MenuItem value="">-- Chọn --</MenuItem>
            <MenuItem value="public">Công khai</MenuItem>
            <MenuItem value="private">Riêng tư</MenuItem>
          </TextField>
        </Grid>

       
        <Grid item xs={12} className="flex justify-end gap-2 mt-2">
          <Button variant="contained" color="primary" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={!editing || saving}>Lưu</Button>
        </Grid>
      </Grid> 
    </Paper>
  );
}
