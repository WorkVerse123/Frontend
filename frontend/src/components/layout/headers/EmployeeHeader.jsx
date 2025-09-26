import React from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { IconButton, Select, MenuItem } from '@mui/material';
import UserMenu from './UserMenu';

export default function EmployeeHeader() {
  return (
    <div className="flex items-center gap-4">
      <a href="/my-jobs" className="text-white hover:underline text-lg md:text-base">Việc của tôi</a>
      <div className="hidden md:flex items-center gap-2">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
          <MenuItem value="en">English</MenuItem>
        </Select>
        <IconButton color="inherit" size="large" aria-label="Thông báo"><NotificationsIcon /></IconButton>
        <IconButton color="inherit" size="large" aria-label="Lịch"><CalendarTodayIcon /></IconButton>
      </div>
      <UserMenu />
    </div>
  );
}