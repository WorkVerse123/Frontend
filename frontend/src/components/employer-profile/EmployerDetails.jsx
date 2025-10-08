import React from 'react';
import { Card } from '@mui/material';
import MapLink from '../common/MapLink';

export default function EmployerDetails({ employer }) {
  // Guard against null/undefined employer prop to prevent runtime errors
  // Fallback to a simple "No data" view when employer is not provided yet
  if (!employer) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="text-md font-medium mb-2">Thông tin liên hệ</h4>
          <div className="text-sm text-slate-700">Chưa có thông tin nhà tuyển dụng</div>
        </Card>

        <Card className="p-4">
          <h4 className="text-md font-medium mb-2">Thông tin cơ bản</h4>
          <div className="text-sm text-slate-700">Chưa có thông tin</div>
        </Card>

        {/* <Card className="p-4">
          <h4 className="text-md font-medium mb-2">Giờ mở cửa</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>Không có thông tin giờ mở cửa</li>
          </ul>
        </Card> */}
      </div>
    );
  }

  // const hours = employer?.companyOpeningHours || [];
  const dateEstablished = employer?._raw?.dateEstablish ?? employer?.dateEstablished ?? employer?.dateEstablish ?? null;
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Thông tin liên hệ</h4>
        <div className="text-sm text-slate-700">
          <div><strong>Email:</strong> {employer.contactEmail || '---'}</div>
          <div className="mt-1"><strong>Điện thoại:</strong> {employer.contactPhone || '---'}</div>
          <div className="mt-1"><strong>Địa chỉ:</strong>{' '}{employer.companyAddress ? <MapLink address={employer.companyAddress} /> : '---'}</div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Thông tin cơ bản</h4>
        <div className="text-sm text-slate-700">
          <div><strong>Thành lập:</strong> {dateEstablished ? new Date(dateEstablished).toLocaleDateString() : '---'}</div>
          <div className="mt-1"><strong>Loại:</strong> {employer.employerTypeName || '---'}</div>
        </div>
      </Card>

      {/* <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Giờ mở cửa</h4>
        <ul className="text-sm text-slate-700 space-y-1">
          {hours.length === 0 && <li>Không có thông tin giờ mở cửa</li>}
          {hours.map((h) => (
            <li key={h.dayOfWeek}>
              <span className="font-medium">{h.dayOfWeek}:</span> {h.startTime} - {h.endTime}
            </li>
          ))}
        </ul>
      </Card> */}
    </div>
  );
}