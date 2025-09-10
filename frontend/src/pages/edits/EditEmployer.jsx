import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import EmployerForm from '../../components/employer-profile/EmployerForm';
import { handleAsync } from '../../utils/HandleAPIResponse';

export default function EditEmployer() {
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/mocks/JSON_DATA/responses/get_employer_id.json')
      .then(r => r.json())
      .then(parsed => {
        if (parsed && parsed.data) setValues(parsed.data);
      }).catch(() => setValues(null)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setValues(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/mocks/JSON_DATA/requests/put_employer_id.json', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
      });
      alert('Đã cập nhật nhà tuyển dụng (mock)');
    } catch (err) {
      alert('Lỗi khi cập nhật (mock)');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!values) return <div className="p-8 text-red-600">Không tìm thấy thông tin nhà tuyển dụng.</div>;

  return (
    <MainLayout role="guest" hasSidebar={false}>
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
