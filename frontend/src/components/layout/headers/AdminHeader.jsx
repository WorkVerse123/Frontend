import React from 'react';
import { Button, Select, MenuItem } from '@mui/material';
import UserMenu from './UserMenu';

export default function AdminHeader() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="contained" color="secondary" size="small" href="/admin">Dashboard</Button>
      <a href="/admin/users" className="text-white hover:underline text-lg md:text-base">Người dùng</a>
      <a href="/admin/reports" className="text-white hover:underline text-lg md:text-base">Báo cáo</a>
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