import React from 'react';
import { Card, Avatar, Button, Box, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import MapLink from '../common/MapLink';

function ensureUrl(raw) {
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export default function EmployerHeader({ employer = {}, isOwner = false, onEdit }) {
  const logo = employer.logoUrl || employer.CompanyLogo || '';
  const name = employer.companyName || employer.CompanyName || 'Công ty';
  const type = employer.employerTypeName || '';
  const address = employer.companyAddress || employer.CompanyAddress || '';
  const website = employer.companyWebsite || employer.CompanyWebsite || '';
  const description = employer.description || employer.CompanyDescription || '';

  return (
    <Card className="p-0 shadow-sm overflow-hidden">
      {/* thin header strip */}
      <div className="w-full h-12 bg-gradient-to-r from-indigo-600 to-sky-500" />

      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          {/* avatar */}
          <div className="flex-shrink-0">
            <Avatar
              src={logo}
              alt={name}
              sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, border: '2px solid rgba(0,0,0,0.06)' }}
              className="bg-white"
            />
          </div>

          {/* main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start md:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-bold truncate flex items-center gap-2">
                  <BusinessIcon fontSize="small" className="text-slate-500" />
                  <span>{name}</span>
                </h2>
                {type && <div className="mt-1"><Chip label={type} size="small" /></div>}
              </div>

              <div className="hidden md:flex items-center gap-2">
                {isOwner && (
                  <Button variant="contained" color="primary" size="small" startIcon={<EditIcon />} onClick={() => onEdit && onEdit()}>
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            {description && (
              <p className="mt-2 text-sm text-slate-600 truncate">{description}</p>
            )}

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <LocationOnIcon fontSize="small" className="text-slate-400" />
                {address ? (
                  <MapLink address={address} className="truncate" />
                ) : (
                  <span className="truncate">Đang cập nhật địa chỉ</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LanguageIcon fontSize="small" className="text-slate-400" />
                {website ? (
                  <a href={ensureUrl(website)} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline truncate">
                    {website}
                  </a>
                ) : (
                  <span className="text-slate-400">Chưa có website</span>
                )}
              </div>
            </div>
          </div>

          {/* actions for mobile and desktop */}
          {/* <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2">
            <Button variant="outlined" color="primary" size="small" className="whitespace-nowrap">
              Xem tuyển dụng
            </Button>
            <Button variant="contained" color="primary" size="small" className="whitespace-nowrap">
              Liên hệ
            </Button>
            {/* mobile owner action */}
            {/* <div className="md:hidden">
              {isOwner && (
                <Button variant="text" size="small" startIcon={<EditIcon />} onClick={() => onEdit && onEdit()}>
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div> */} 
        </div>
      </div>
    </Card>
  );
}