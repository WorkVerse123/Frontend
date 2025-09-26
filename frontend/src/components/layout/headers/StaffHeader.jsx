import React from 'react';
import { Select, MenuItem } from '@mui/material';
import UserMenu from './UserMenu';

export default function StaffHeader() {
  return (
    <div className="flex items-center gap-4">
      <a href="/staff/hr" className="text-white hover:underline text-lg md:text-base">Quản lý nhân sự</a>
      <a href="/staff/reports" className="text-white hover:underline text-lg md:text-base">Báo cáo</a>
      <a href="/staff/account" className="text-white hover:underline text-lg md:text-base">Tài khoản</a>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
      </div>
      <UserMenu />
    </div>
  );
}