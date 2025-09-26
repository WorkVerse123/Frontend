import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import EmployerForm from '../../components/employer-profile/EmployerForm';
import { handleAsync } from '../../utils/HandleAPIResponse';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet, put as apiPut } from '../../services/ApiClient';

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

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    (async () => {
      try {
        const resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? null;
        if (!resolvedEmployerId) throw new Error('No employer id available');
        const res = await apiGet(ApiEndpoints.EMPLOYER(resolvedEmployerId), { signal: ac.signal });
        if (!mounted) return;
        const parsed = res?.data || res;
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
      const resolvedEmployerId = user?.employerId ?? user?._raw?.EmployerId ?? null;
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
        description: values?.description ?? values?.desc ?? values?.about ?? ''
      };

      // remove null/empty userId if it's not valid (some backends reject userId:0)
      if (payload.userId == null) delete payload.userId;

      await apiPut(ApiEndpoints.EMPLOYER(resolvedEmployerId), payload);
      alert('Đã cập nhật nhà tuyển dụng');
    } catch (err) {
      console.error('EditEmployer save failed', err);
      alert('Lỗi khi cập nhật: ' + (err?.response?.data?.message || err?.message || 'Kiểm tra console'));
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
    </MainLayout>
  );
}
