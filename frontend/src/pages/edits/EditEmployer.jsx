import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import EmployerForm from '../../components/employer-profile/EmployerForm';
import { handleAsync } from '../../utils/HandleAPIResponse';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet, put as apiPut } from '../../services/ApiClient';
import UploadService from '../../services/UploadService';
import { Snackbar, Alert } from '@mui/material';

export default function EditEmployer() {
  const { user } = useAuth();
  const normalizeRole = (r) => {
    if (!r) return 'guest';
    if (typeof r === 'number') {
      if (r === 1) return 'admin';
      if (r === 2) return 'staff';
      if (r === 3) return 'employer';
      if (r === 4) return 'employee';
      return 'guest';
    }
    if (typeof r === 'string') return r.toLowerCase();
    if (typeof r === 'object') {
      const id = r.roleId || r.RoleId || r.role_id || r.roleID;
      if (id) return normalizeRole(Number(id));
      const name = r.role || r.roleName || r.role_name;
      if (name) return String(name).toLowerCase();
    }
    return 'guest';
  };
  const normalizedRole = normalizeRole(user?.roleId || user);
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const showSnackbar = (msg, severity = 'success') => { setSnackbarMsg(msg); setSnackbarSeverity(severity); setSnackbarOpen(true); };

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      try {
        const resolvedEmployerId = user?.profileId ?? user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null;
        if (!resolvedEmployerId) throw new Error('No employer id available');
        const res = await apiGet(ApiEndpoints.EMPLOYER(resolvedEmployerId), { signal: ac.signal });
        if (!mounted) return;
        const server = res?.data ?? res;
        const inner = server?.data ?? server;
        // normalize to the API example shape
        const normalize = (e) => {
          if (!e || typeof e !== 'object') return null;
          return {
            employerId: e.employerId ?? e.EmployerId ?? e.id ?? null,
            companyName: e.companyName ?? e.CompanyName ?? e.name ?? '',
            employerTypeName: e.employerTypeName ?? (e.employerType && (e.employerType.name || e.employerType.employerTypeName)) ?? '',
            employerType: e.employerType ?? e.employerTypeId ?? null,
            address: e.address ?? e.companyAddress ?? e.company_address ?? '',
            websiteUrl: e.websiteUrl ?? e.companyWebsite ?? e.website ?? '',
            logoUrl: e.logoUrl ?? e.CompanyLogo ?? e.logo ?? '',
            dateEstablish: e.dateEstablish ?? e.dateEstablish ?? e.dateEstablished ?? e.date_establish ?? null,
            description: e.description ?? e.desc ?? e.about ?? '',
            contactEmail: e.contactEmail ?? e.contact_email ?? e.email ?? '',
            contactPhone: e.contactPhone ?? e.contact_phone ?? e.phone ?? '',
            _raw: e
          };
        };
        const parsed = normalize(inner);
        setValues(parsed || null);
      } catch (err) {
        if (!mounted) setValues(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, []);

  const handleChange = (e) => setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const resolvedEmployerId = user?.profileId ?? user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null;
      if (!resolvedEmployerId) throw new Error('No employer id available');
      // build payload with backend-expected keys
      const pickPositive = (v) => {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : null;
      };
      const resolvedUserId = pickPositive(values?.userId ?? values?.UserId ?? user?.userId ?? user?.id ?? user?._raw?.UserId ?? user?._raw?.userId);
      const derivedEmployerType = pickPositive(
        values?.employerType ?? values?.employerTypeId ?? values?._raw?.employerType ?? values?._raw?.employerTypeId ?? null
      );
      const payload = {
        ...(resolvedUserId ? { userId: resolvedUserId } : {}),
        companyName: values?.companyName ?? values?.CompanyName ?? values?.name ?? '',
        // backend expects 'employerType' as a positive number (not employerTypeId)
        ...(derivedEmployerType ? { employerType: derivedEmployerType } : {}),
        address: values?.address ?? values?.companyAddress ?? values?.company_address ?? '',
        websiteUrl: values?.websiteUrl ?? values?.companyWebsite ?? values?.website ?? '',
        logoUrl: values?.logoUrl ?? values?.CompanyLogo ?? values?.logo ?? '',
        dateEstablish: values?.dateEstablish ?? values?.dateEstablished ?? values?.date_establish ?? null,
        description: values?.description ?? values?.desc ?? values?.about ?? '',
        // contact fields (backend validation requires ContactEmail/ContactPhone in some flows)
        contactEmail: values?.contactEmail ?? values?.email ?? values?._raw?.contactEmail ?? '',
        contactPhone: values?.contactPhone ?? values?.phone ?? values?._raw?.contactPhone ?? ''
      };

      // remove null/empty userId if it's not valid (some backends reject userId:0)
      if (payload.userId == null) delete payload.userId;

      // If a local File was selected for logo (values.logoFile), upload first and replace logoUrl
      if (values?.logoFile && typeof UploadService?.uploadImageToCloudinary === 'function') {
        try {
          const up = await UploadService.uploadImageToCloudinary(values.logoFile, { onProgress: () => {} });
          const returnedUrl = (up && (up.url || up.secure_url || up.raw?.secure_url)) || null;
          if (returnedUrl) payload.logoUrl = returnedUrl;
        } catch (upErr) {
          // debug removed
          throw new Error(upErr?.response?.data?.message || upErr?.message || 'Upload logo thất bại');
        }
      }

      await apiPut(ApiEndpoints.EMPLOYER(resolvedEmployerId), payload);
      showSnackbar('Đã cập nhật nhà tuyển dụng', 'success');
    } catch (err) {
  // debug removed
      showSnackbar('Lỗi khi cập nhật: ' + (err?.response?.data?.message || err?.message || 'Kiểm tra console'), 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!values) return <div className="p-8 text-red-600">Không tìm thấy thông tin nhà tuyển dụng.</div>;

  return (
    <MainLayout role={normalizedRole} hasSidebar={false}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-4">Chỉnh sửa nhà tuyển dụng</h2>
        <div className="bg-white p-6 rounded-lg border">
          <EmployerForm values={values} onChange={handleChange} />
          <div className="mt-4">
            <button onClick={handleSave} className="bg-[#2563eb] text-white px-4 py-2 rounded" disabled={saving}>Lưu thay đổi</button>
          </div>
        </div>
      </div>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMsg}</Alert>
      </Snackbar>
    </MainLayout>
  );
}
