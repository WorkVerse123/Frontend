import React from 'react';
import { Card } from '@mui/material';

export default function EmployerDetails({ employer }) {
  const hours = employer.companyOpeningHours || [];
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Thông tin liên hệ</h4>
        <div className="text-sm text-slate-700">
          <div><strong>Email:</strong> {employer.contactEmail}</div>
          <div className="mt-1"><strong>Điện thoại:</strong> {employer.contactPhone}</div>
          <div className="mt-1"><strong>Địa chỉ:</strong> {employer.companyAddress}</div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Thông tin cơ bản</h4>
        <div className="text-sm text-slate-700">
          <div><strong>Thành lập:</strong> {employer.dateEstablished}</div>
          <div className="mt-1"><strong>Loại:</strong> {employer.employerTypeName}</div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-md font-medium mb-2">Giờ mở cửa</h4>
        <ul className="text-sm text-slate-700 space-y-1">
          {hours.length === 0 && <li>Không có thông tin giờ mở cửa</li>}
          {hours.map((h) => (
            <li key={h.dayOfWeek}>
              <span className="font-medium">{h.dayOfWeek}:</span> {h.startTime} - {h.endTime}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}