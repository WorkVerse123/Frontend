import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import SalaryInput from '../../../components/common/inputs/SalaryInput';
import ApiEndpoints from '../../../services/ApiEndpoints';
import { get as apiGet } from '../../../services/ApiClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import RichTextEditor from '../../../pages/creates/CreateJob/RichTextEditor';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';

export default function JobForm({ initialValues = null, onSuccess = null, packageId = null }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const showSnackbar = (msg, severity = 'success') => { setSnackbarMsg(msg); setSnackbarSeverity(severity); setSnackbarOpen(true); };
  const [form, setForm] = useState({
    jobTitle: '',
    jobDescription: '',
    jobRequirements: '',
    jobLocation: '',
    jobSalaryMin: '',
    jobSalaryMax: '',
    jobSalaryCurrency: 'VND',
    jobTime: 'FullTime',
    jobCreateAt: new Date(),
    jobExpireAt: new Date(),
    jobStatus: 'active',
  });
  const [salaryErrors, setSalaryErrors] = useState({ minError: false, maxError: false, minHelper: '', maxHelper: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isPriority, setIsPriority] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Resolve employer id consistently: prefer normalized profileId when user is an employer,
  // otherwise fall back to common variants that might exist on the user object.
  const resolvedEmployerId = (user?.profileType === 'employer' && user?.profileId)
    ? user.profileId
    : (user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null);
  const [employerError, setEmployerError] = useState('');

  // No mock fetch here — form starts from initial state and will POST current state on submit.
  // If you want dev-only prefill, fetch only when process.env.NODE_ENV === 'development'.

  useEffect(() => {
    if (initialValues) {
      // map incoming shape to local form keys
      setForm((s) => ({
        ...s,
        jobTitle: initialValues.jobTitle || initialValues.title || s.jobTitle,
        jobDescription: initialValues.jobDescription || initialValues.description || s.jobDescription,
        jobRequirements: initialValues.jobRequirements || initialValues.requirements || s.jobRequirements,
        jobLocation: initialValues.jobLocation || initialValues.location || s.jobLocation,
        jobSalaryMin: initialValues.jobSalaryMin ?? initialValues.salaryMin ?? s.jobSalaryMin,
        jobSalaryMax: initialValues.jobSalaryMax ?? initialValues.salaryMax ?? s.jobSalaryMax,
        jobSalaryCurrency: initialValues.jobSalaryCurrency || initialValues.salaryCurrency || s.jobSalaryCurrency,
        jobTime: initialValues.jobTime || initialValues.jobTime || s.jobTime,
        jobExpireAt: initialValues.jobExpiredAt ? new Date(initialValues.jobExpiredAt) : (initialValues.expiredAt ? new Date(initialValues.expiredAt) : s.jobExpireAt),
        jobStatus: initialValues.jobStatus || initialValues.status || s.jobStatus,
      }));
      setSelectedCategories(Array.isArray(initialValues.categoryIds || initialValues.jobCategory) ? (initialValues.categoryIds || initialValues.jobCategory) : []);
      setIsPriority(Boolean(initialValues.isPriority));
    }

    let mounted = true;
    (async () => {
      try {
        const { get } = await import('../../../services/ApiClient');
        const res = await get(ApiEndpoints.JOB_CATEGORIES);
        if (!mounted) return;
        // API returns { data: { jobCategories: [ { categoryId, categoryName } ] } }
        const list = res?.data?.data?.jobCategories || res?.data?.jobCategories || res?.data || [];
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load job categories', e);
        setCategories([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // When category list is loaded, normalize any selectedCategories that are names
  // (e.g. initialValues.jobCategory = ['IT','Design']) into numeric ids so the
  // Select shows correctly and the payload can send numeric ids.
  useEffect(() => {
    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) return;
    if (!Array.isArray(categories) || categories.length === 0) return;
    const needsMapping = selectedCategories.some(v => !(typeof v === 'number' || /^\d+$/.test(String(v))));
    if (!needsMapping) return;
    const mapped = selectedCategories.map(v => {
      if (v == null) return v;
      if (typeof v === 'number' || /^\d+$/.test(String(v))) return Number(v);
      const low = String(v).toLowerCase();
      const found = categories.find(c => {
        const name = (c.categoryName ?? c.name ?? c.label ?? '').toString().toLowerCase();
        return name === low;
      });
      return found ? Number(found.categoryId ?? found.id ?? found.category_id) : v;
    });
    // If any were converted to numbers, update selection so Select shows properly
    if (mapped.some(m => typeof m === 'number')) setSelectedCategories(mapped);
  }, [categories]);

  // Helper to resolve selected category values (names or ids) into numeric ids.
  async function resolveCategoryIds(values) {
    const list = Array.isArray(categories) && categories.length ? categories : (async () => {
      try {
        const res = await apiGet(ApiEndpoints.JOB_CATEGORIES);
        const fetched = res?.data?.data?.jobCategories || res?.data?.jobCategories || res?.data || [];
        if (Array.isArray(fetched)) setCategories(fetched);
        return Array.isArray(fetched) ? fetched : [];
      } catch (e) {
        return [];
      }
    })();
    const catList = Array.isArray(list) ? list : await list;
    return (Array.isArray(values) ? values : []).map(v => {
      if (v == null) return null;
      if (typeof v === 'number' || /^\d+$/.test(String(v))) return Number(v);
      const low = String(v).toLowerCase();
      const found = (catList || []).find(c => {
        const name = (c.categoryName ?? c.name ?? c.label ?? '').toString().toLowerCase();
        return name === low;
      });
      return found ? Number(found.categoryId ?? found.id ?? found.category_id) : null;
    }).filter(x => x != null);
  }

  function onChange(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleAsync(payload) {
    try {
      const { post } = await import('../../../services/ApiClient');
      const data = await post('/api/jobs', payload);
      showSnackbar('Tạo tin thành công', 'success');
      return data;
    } catch (err) {
      console.error(err);
      showSnackbar('Tạo tin thất bại: ' + (err.message || 'Lỗi'), 'error');
      throw err;
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setEmployerError('');
    if (!resolvedEmployerId) {
      setEmployerError('Bạn cần đăng nhập bằng tài khoản nhà tuyển dụng (employer) để đăng tin.');
      return;
    }
    // salary validations: non-negative and min <= max
    const minVal = form.jobSalaryMin === '' ? null : Number(form.jobSalaryMin);
    const maxVal = form.jobSalaryMax === '' ? null : Number(form.jobSalaryMax);
    const newErrors = { minError: false, maxError: false, minHelper: '', maxHelper: '' };
    if (minVal != null && Number.isNaN(minVal)) {
      newErrors.minError = true; newErrors.minHelper = 'Không hợp lệ';
    } else if (minVal != null && minVal < 0) {
      newErrors.minError = true; newErrors.minHelper = 'Phải >= 0';
    }
    if (maxVal != null && Number.isNaN(maxVal)) {
      newErrors.maxError = true; newErrors.maxHelper = 'Không hợp lệ';
    } else if (maxVal != null && maxVal < 0) {
      newErrors.maxError = true; newErrors.maxHelper = 'Phải >= 0';
    }
    if (minVal != null && maxVal != null && minVal > maxVal) {
      newErrors.minError = true; newErrors.maxError = true;
      newErrors.minHelper = 'Lương tối thiểu không được lớn hơn lương tối đa';
      newErrors.maxHelper = 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu';
    }
    setSalaryErrors(newErrors);
    if (newErrors.minError || newErrors.maxError) return;
    const now = new Date();
    const resolvedCategoryIds = await resolveCategoryIds(selectedCategories);
    const payload = {
      jobId: 0,
      employerId: resolvedEmployerId,
      title: form.jobTitle,
      categoryIds: resolvedCategoryIds,
      description: form.jobDescription,
      requirements: form.jobRequirements,
      location: form.jobLocation,
      salaryMin: form.jobSalaryMin !== '' ? Number(form.jobSalaryMin) : 0,
      salaryMax: form.jobSalaryMax !== '' ? Number(form.jobSalaryMax) : 0,
      jobTime: form.jobTime,
      isPriority: !!isPriority,
      createdAt: now.toISOString(),
      expiredAt: form.jobExpireAt ? form.jobExpireAt.toISOString() : null,
      status: form.jobStatus || 'Open'
    };
    // If parent provided a packageId (subscription plan), include it in the payload
    if (packageId) {
      // include both camelCase and snake_case to be safe with backend conventions
      payload.packageId = packageId;
      payload.package_id = packageId;
    }
    try {
      const { post, put } = await import('../../../services/ApiClient');
      // If editing (initialValues has jobId), attempt to PUT to update endpoint
  if (initialValues && (initialValues.jobId || initialValues.id)) {
        const id = initialValues.jobId || initialValues.id;
        // Use employer-scoped endpoint for updates: EMPLOYER_JOBS(employerId)/:id
        const updateEndpoint = (ApiEndpoints.EMPLOYER_JOBS && resolvedEmployerId)
          ? `${ApiEndpoints.EMPLOYER_JOBS(resolvedEmployerId)}/${id}`
          : (ApiEndpoints.JOB_UPDATE ? ApiEndpoints.JOB_UPDATE(id) : `/api/jobs/${id}`);
        // Ensure payload carries the job id for update
        payload.jobId = id;
        const res = await put(updateEndpoint, payload);
        showSnackbar('Cập nhật tin thành công', 'success');
        if (typeof onSuccess === 'function') {
          try { onSuccess(res); } catch (e) { /* allow parent to handle */ }
        } else {
          if (resolvedEmployerId) navigate(`/employer/${resolvedEmployerId}`); else navigate('/jobs');
        }
        return res;
      }

      const endpoint = ApiEndpoints.EMPLOYER_JOBS(resolvedEmployerId) || '/api/jobs';
      const res = await post(endpoint, payload);
      showSnackbar('Tạo tin thành công', 'success');
      if (typeof onSuccess === 'function') {
        try { onSuccess(res); } catch (e) { /* no-op */ }
      } else {
        if (resolvedEmployerId) navigate(`/employer/${resolvedEmployerId}`); else navigate('/jobs');
      }
      return res;
    } catch (err) {
      console.error('Create/Update job failed', err);
      showSnackbar('Tạo/Cập nhật tin thất bại: ' + (err?.response?.data?.message || err.message || 'Lỗi'), 'error');
      throw err;
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Tiêu đề"
          value={form.jobTitle}
          onChange={(e) => onChange('jobTitle', e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="currency-label">Loại tiền</InputLabel>
          <Select
            labelId="currency-label"
            label="Loại tiền"
            value={form.jobSalaryCurrency}
            onChange={(e) => onChange('jobSalaryCurrency', e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="VND">VND</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="jobtype-label">Loại công việc</InputLabel>
          <Select
            labelId="jobtype-label"
            label="Loại công việc"
            value={form.jobTime}
            onChange={(e) => onChange('jobTime', e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="FullTime">Toàn thời gian</MenuItem>
            <MenuItem value="PartTime">Bán thời gian</MenuItem>
            <MenuItem value="Contract">Hợp đồng</MenuItem>
            <MenuItem value="Internship">Thực tập</MenuItem>
          </Select>
        </FormControl>
      </div>

      <SalaryInput
        min={form.jobSalaryMin}
        max={form.jobSalaryMax}
        onChange={(min, max) => {
          onChange('jobSalaryMin', min);
          onChange('jobSalaryMax', max);
        }}
            minError={salaryErrors.minError}
            maxError={salaryErrors.maxError}
            minHelper={salaryErrors.minHelper}
            maxHelper={salaryErrors.maxHelper}
      />

      <TextField
        label="Địa điểm"
        value={form.jobLocation}
        onChange={(e) => onChange('jobLocation', e.target.value)}
        fullWidth
      />

      <FormControl fullWidth>
            <InputLabel id="categories-label">Danh mục</InputLabel>
            <Select
              labelId="categories-label"
              label="Danh mục"
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(e.target.value)}
              renderValue={(selected) => selected.map(id => {
                const found = categories.find(c => Number(c.categoryId) === Number(id));
                return found ? found.categoryName : String(id);
              }).join(', ')}
              MenuProps={{ disableScrollLock: true }}
            >
              {categories.map((c) => (
                <MenuItem key={c.categoryId} value={Number(c.categoryId)}>
                  {c.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormControl fullWidth>
          <InputLabel id="status-label">Trạng thái</InputLabel>
          <Select
            labelId="status-label"
            label="Trạng thái"
            value={form.jobStatus}
            onChange={(e) => onChange('jobStatus', e.target.value)}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="Open">Open</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Hạn nộp hồ sơ"
            value={form.jobExpireAt}
            onChange={(val) => onChange('jobExpireAt', val)}
            disablePast
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mô tả công việc</label>
        <RichTextEditor
          value={form.jobDescription}
          onChange={(val) => onChange('jobDescription', val)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Yêu cầu / Trách nhiệm</label>
        <RichTextEditor
          value={form.jobRequirements}
          onChange={(val) => onChange('jobRequirements', val)}
        />
      </div>

        <div className="flex items-center space-x-3">
          <Button variant="contained" color="primary" type="submit" disabled={!resolvedEmployerId}>
              {initialValues ? 'Chỉnh sửa' : 'Đăng Tin'}
            </Button>
          {!initialValues ? (
            <Button
              variant="outlined"
              onClick={() => {
                setForm((s) => ({ ...s, jobTitle: '', jobDescription: '' }));
              }}
            >
              Reset
            </Button>
          ) : null}
      </div>
        {employerError ? (
          <div className="pt-2">
            <Alert severity="warning">{employerError}</Alert>
          </div>
        ) : null}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
    </form>
  );
}
