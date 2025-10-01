import React from 'react';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function formatDateForInput(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

export default function EmployerForm({ values = {}, onChange }) {
  const v = values || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* Logo column on the LEFT */}
        <div className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium mb-2">Logo</label>
            <LogoUploader
              logoUrl={v.logoUrl}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Loại nhà tuyển dụng</label>
            <input
              name="employerTypeName"
              value={v.employerTypeName || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Ngày thành lập</label>
            <input
              type="date"
              name="dateEstablish"
              value={formatDateForInput(v.dateEstablish)}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Main fields to the right */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium">Tên công ty</label>
            <input
              name="companyName"
              value={v.companyName || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Địa chỉ</label>
            <input
              name="address"
              value={v.address || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Website</label>
            <input
              name="websiteUrl"
              value={v.websiteUrl || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              value={v.description || ''}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 min-h-[120px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Email liên hệ</label>
          <input
            name="contactEmail"
            value={v.contactEmail || ''}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">SĐT liên hệ</label>
          <input
            name="contactPhone"
            value={v.contactPhone || ''}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}

function LogoUploader({ logoUrl, onChange }) {
  // lightweight uploader: shows preview and exposes hidden file input; when file chosen it sets a temporary object URL into logoUrl field
  const fileRef = React.useRef(null);
  const objRef = React.useRef(null);

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          if (!f) return;
          try {
            if (objRef.current) { URL.revokeObjectURL(objRef.current); objRef.current = null; }
            const obj = URL.createObjectURL(f);
            objRef.current = obj;
            // trigger parent's onChange with a synthetic event compatible with EditEmployer.handleChange
            onChange({ target: { name: 'logoUrl', value: obj } });
            // also set a hidden field to hold the File object if parent wants to pick it up (name: logoFile)
            onChange({ target: { name: 'logoFile', value: f } });
          } catch (err) {
            // ignore
          }
        }}
      />
      <div className="relative inline-block" style={{ width: 128 }}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current && fileRef.current.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current && fileRef.current.click(); } }}
          className="w-32 h-32 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center cursor-pointer mx-auto"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-sm text-gray-500">No logo</div>
          )}
        </div>

        {/* camera overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full"
          style={{ pointerEvents: 'none' }}
        >
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-150 bg-black/30 w-full h-full rounded-full flex items-center justify-center text-white">
            <PhotoCamera />
          </div>
        </div>
      </div>
    </div>
  );
}
