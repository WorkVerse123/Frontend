import React from 'react';

export default function EmployerForm({ values, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Tên công ty</label>
        <input className="w-full border rounded px-3 py-2" name="companyName" value={values.companyName || ''} onChange={onChange} />
      </div>

      <div>
        <label className="block text-sm font-medium">Địa chỉ</label>
        <input className="w-full border rounded px-3 py-2" name="companyAddress" value={values.companyAddress || ''} onChange={onChange} />
      </div>

      <div>
        <label className="block text-sm font-medium">Mô tả</label>
        <textarea className="w-full border rounded px-3 py-2" name="description" value={values.description || ''} onChange={onChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Email liên hệ</label>
          <input className="w-full border rounded px-3 py-2" name="contactEmail" value={values.contactEmail || ''} onChange={onChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">SĐT liên hệ</label>
          <input className="w-full border rounded px-3 py-2" name="contactPhone" value={values.contactPhone || ''} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
