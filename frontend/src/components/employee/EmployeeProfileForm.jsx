import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { post, put } from '../../services/ApiClient';
import UploadService from '../../services/UploadService';
import { useAuth } from '../../contexts/AuthContext';
import ApiEndpoints from '../../services/ApiEndpoints';
import { handleAsync } from '../../utils/HandleAPIResponse';

export default function EmployeeProfileForm({ userId, onSaved, mode = 'create', initialData = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  // mode: 'create' | 'update'
  const effectiveMode = mode === 'update' ? 'update' : 'create';
  // Resolve the id used for employee API calls.
  // - For 'update' mode we must call the employee endpoints with the employee's profile id (employeeId),
  //   not the auth UserId. Prefer the normalized user.profileId when present.
  // - For 'create' mode the caller should pass an explicit userId (auth id). If not provided, fall back to auth user id.
  const effectiveUserId = (effectiveMode === 'create')
    ? (userId || user?.id || user?.userId || user?.UserId || null)
    : (userId || user?.profileId || user?.employeeId || user?.id || user?.userId || user?.UserId || null);
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().slice(0,10) : ''); // yyyy-mm-dd for input
  const [gender, setGender] = useState(initialData?.gender || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || initialData?.avatar_url || '');
  const [avatarFileName, setAvatarFileName] = useState('');
  const [avatarInputMode, setAvatarInputMode] = useState('url'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.avatarUrl || initialData?.avatar_url || '');
  const objectUrlRef = useRef(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        try { URL.revokeObjectURL(objectUrlRef.current); } catch (e) {}
        objectUrlRef.current = null;
      }
    };
  }, []);
  const [bio, setBio] = useState(initialData?.bio || '');
  const [skills, setSkills] = useState(initialData?.skills || '');
  const [education, setEducation] = useState(initialData?.education || '');
  const [workExperience, setWorkExperience] = useState(initialData?.workExperience || initialData?.work_experience || '');
  const [modeValue, setModeValue] = useState(initialData?.mode || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // For create mode we require a userId (passed from registration). For update mode, if no id is available show message.
  if (!effectiveUserId) {
    if (effectiveMode === 'create') {
      return <div className="text-red-600">Missing userId — registration create requires a userId prop.</div>;
    }
    return <div className="text-red-600">Missing userId — cannot load or update employee profile without a userId.</div>;
  }

  // If update mode and no initialData was provided, fetch existing profile to populate the form
  const [fetched, setFetched] = useState(false);
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      if (effectiveMode !== 'update') return;
      if (initialData) {
        setFetched(true);
        return;
      }
      try {
        setLoading(true);
        const { get: apiGet } = await import('../../services/ApiClient');
        const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
        const res = await apiGet(ApiEndpoints.EMPLOYEE_PROFILE(effectiveUserId), { signal: ac.signal });
        const emp = res?.data || res;
        if (!mounted) return;
        if (emp) {
          // populate local states from fetched employee
          setFullName(emp.fullName || emp.full_name || '');
          setDateOfBirth((emp.dateOfBirth || emp.date_of_birth || emp.dob || '').slice(0,10));
          setGender(emp.gender || '');
          setAddress(emp.address || '');
          const av = emp.avatarUrl || emp.avatar_url || emp.avatar || '';
          setAvatarUrl(av);
          setPreviewUrl(av);
          setBio(emp.bio || '');
          setSkills(emp.skills || '');
          setEducation(emp.education || '');
          setWorkExperience(emp.workExperience || emp.work_experience || '');
          setModeValue(emp.mode || '');
        }
      } catch (e) {
        // ignore fetch errors; user can still edit blank form
        // eslint-disable-next-line no-console
        console.error('Failed to fetch employee for edit:', e);
      } finally {
        if (mounted) {
          setFetched(true);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [effectiveMode, effectiveUserId, initialData]);

  const toIsoString = (value) => {
    if (!value) return null;
    // if value already ISO-like, return as-is; if it's yyyy-mm-dd convert to ISO start of day
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value).toISOString();
    try { return new Date(value).toISOString(); } catch (e) { return value; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Minimal validation
    if (!fullName.trim()) { setError('Họ và tên là bắt buộc'); return; }

    const payload = {
      fullName: fullName.trim(),
      dateOfBirth: toIsoString(dateOfBirth),
      gender: gender || '',
      address: address || '',
      avatarUrl: avatarUrl || '',
      bio: bio || '',
      skills: skills || '',
      education: education || '',
      workExperience: workExperience || '',
  mode: modeValue || ''
    };

    setLoading(true);
    try {
      // determine backend endpoint early so we can optionally let upload service save payload with avatarUrl
      const endpoint = (effectiveMode === 'update')
        ? ApiEndpoints.EMPLOYEE_PROFILE(effectiveUserId)
        : ApiEndpoints.EMPLOYEE_PROFILE_CREATE(effectiveUserId);

      let res;

      // If a file was selected, upload to Cloudinary. Prefer letting the upload service
      // save the payload (merged with avatarUrl) in one request to backend by using saveToBackend.
      if (selectedFile) {
        try {
          const uploadRes = await UploadService.uploadImageToCloudinary(selectedFile, {
            onProgress: () => {},
            saveToBackend: true,
            backendPath: endpoint,
            dataToSave: payload,
            fieldName: 'avatarUrl',
          });

          // If uploadRes.backend exists, the backend already handled saving and we can use it as result
          if (uploadRes && uploadRes.backend) {
            res = uploadRes.backend;
          } else if (uploadRes && uploadRes.url) {
            // fallback: only got URL, attach and continue to call backend below
            payload.avatarUrl = uploadRes.url;
            setPreviewUrl(uploadRes.url);
            if (objectUrlRef.current) {
              try { URL.revokeObjectURL(objectUrlRef.current); } catch (e) {}
              objectUrlRef.current = null;
            }
          }
        } catch (upErr) {
          setError(upErr?.response?.data?.message || upErr?.message || 'Upload ảnh thất bại');
          setLoading(false);
          return;
        }
      }

      // If not already saved by upload step, save now
      if (!res) {
        if (effectiveMode === 'update') {
          res = await handleAsync(put(endpoint, payload));
        } else {
          res = await handleAsync(post(endpoint, payload));
        }
      }
      if (!res.success) {
        setError(res.message || 'Lưu hồ sơ thất bại');
        return;
      }
      setSuccess('Lưu hồ sơ thành công');
      if (typeof onSaved === 'function') onSaved(res.data || null);
      // Do NOT navigate automatically after save — caller/page should decide when to redirect.
    } catch (err) {
      setError(err?.message || 'Có lỗi khi gọi API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Thông tin ứng viên</h3>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {success && <div className="text-sm text-green-600 mb-2">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField label="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <TextField
          label="Ngày sinh"
          type="date"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl>
          <InputLabel id="gender-label">Giới tính</InputLabel>
          <Select labelId="gender-label" label="Giới tính" value={gender} onChange={e => setGender(e.target.value)} MenuProps={{ disableScrollLock: true }}>
            <MenuItem value="Male">Nam</MenuItem>
            <MenuItem value="Female">Nữ</MenuItem>
            <MenuItem value="Other">Khác</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Địa chỉ" value={address} onChange={e => setAddress(e.target.value)} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button size="small" variant={avatarInputMode === 'url' ? 'contained' : 'outlined'} onClick={() => setAvatarInputMode('url')}>Use URL</Button>
            <Button size="small" variant={avatarInputMode === 'file' ? 'contained' : 'outlined'} onClick={() => setAvatarInputMode('file')}>Upload File</Button>
          </div>

          {avatarInputMode === 'url' ? (
            <TextField label="Avatar URL" value={avatarUrl} onChange={e => { setAvatarUrl(e.target.value); setAvatarFileName(''); }} />
          ) : (
            <div className="flex flex-col gap-2">
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  setAvatarFileName(file.name || '');
                  // revoke previous object URL if any
                  if (objectUrlRef.current) {
                    try { URL.revokeObjectURL(objectUrlRef.current); } catch (e) {}
                    objectUrlRef.current = null;
                  }
                  setSelectedFile(file);
                  // create object URL for preview (avoid base64 conversion)
                  try {
                    const obj = URL.createObjectURL(file);
                    objectUrlRef.current = obj;
                    setPreviewUrl(obj);
                  } catch (err) {
                    setPreviewUrl('');
                  }
                  // clear any existing avatarUrl until upload completes
                  setAvatarUrl('');
                }}
              />
              <div className="flex items-center gap-2">
                <label htmlFor="avatar-file-input">
                  <Button component="span" variant="outlined">Chọn ảnh...</Button>
                </label>
                <div className="text-sm text-gray-600">{avatarFileName || 'Chưa chọn file'}</div>
                {avatarFileName && (
                  <Button size="small" variant="text" onClick={() => { setAvatarFileName(''); setAvatarUrl(''); }}>Xóa</Button>
                )}
              </div>
            </div>
          )}

          {(previewUrl || avatarUrl) && (
            <div className="mt-2">
              <img src={previewUrl || avatarUrl} alt="avatar-preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
            </div>
          )}
        </div>
  <TextField label="Chế độ (mode)" value={modeValue} onChange={e => setModeValue(e.target.value)} />
        <TextField label="Kỹ năng" value={skills} onChange={e => setSkills(e.target.value)} multiline minRows={2} />
        <TextField label="Học vấn" value={education} onChange={e => setEducation(e.target.value)} multiline minRows={2} />
        <TextField label="Kinh nghiệm làm việc" value={workExperience} onChange={e => setWorkExperience(e.target.value)} multiline minRows={2} />
        <TextField label="Tiểu sử (bio)" value={bio} onChange={e => setBio(e.target.value)} multiline minRows={3} className="md:col-span-2" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Lưu hồ sơ'}
        </Button>
        <Button type="button" variant="outlined" onClick={() => {
          // reset form
          setFullName(''); setDateOfBirth(''); setGender(''); setAddress(''); setAvatarUrl(''); setAvatarFileName(''); setAvatarInputMode('url'); setBio(''); setSkills(''); setEducation(''); setWorkExperience(''); setModeValue(''); setError(''); setSuccess('');
        }}>Đặt lại</Button>
      </div>
    </form>
  );
}
