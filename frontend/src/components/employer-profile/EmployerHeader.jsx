import React from 'react';
import { Card, Avatar, Button, Box } from '@mui/material';

export default function EmployerHeader({ employer, isOwner = false, onEdit }) {
  const logo = employer.logoUrl || employer.CompanyLogo || '';
  return (
    <Card className="overflow-visible p-0 shadow-none">
      <div className="w-full h-36 md:h-44 bg-gradient-to-r from-sky-600 to-indigo-700 rounded-lg relative">
        <div className="absolute -bottom-10 left-6 flex items-center gap-4">
          <Avatar
            src={logo}
            alt={employer.companyName}
            sx={{ width: 84, height: 84, border: '3px solid white' }}
            className="shadow"
          />
          <div style={{ flex: 1 }}>
            <h1 className="text-white text-xl md:text-2xl font-semibold">{employer.companyName || employer.CompanyName}</h1>
            <div className="text-sm text-sky-100">{employer.employerTypeName || ''}</div>
          </div>
          {isOwner && (
            <div>
              <Button variant="contained" color="primary" onClick={() => onEdit && onEdit()}>Edit</Button>
            </div>
          )}
        </div>
        <Box className="absolute right-6 bottom-4 md:bottom-6">
          <Button variant="contained" color="primary" size="small">Vị trí tuyển dụng</Button>
        </Box>
      </div>
      <div className="mt-12 px-6 pb-4">
        {/* small meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div>Địa chỉ: {employer.companyAddress}</div>
          <div>|</div>
          <div>Website: <a href={employer.companyWebsite || '#'} className="text-sky-600" target="_blank" rel="noreferrer">{employer.companyWebsite || '---'}</a></div>
        </div>
      </div>
    </Card>
  );
}