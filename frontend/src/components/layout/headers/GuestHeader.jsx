import React from 'react';
import { Button, MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function GuestHeader() {
  const navigate = useNavigate();
  return (
    <nav className="flex gap-4 items-center">
      <a href="/jobs" className="text-white hover:underline text-lg md:text-base">Việc làm</a>
      <a href="/companies" className="text-white hover:underline text-lg md:text-base">Nhà tuyển dụng</a>
      <div className="flex items-center gap-3">
        <Select value="vi" size="small" displayEmpty sx={{ color: 'white', '.MuiSelect-icon': { color: 'white' } }} MenuProps={{ disableScrollLock: true }}>
          <MenuItem value="vi">Tiếng Việt</MenuItem>
        </Select>
        <Button variant="outlined" color='primary' onClick={() => navigate('/auth?form=login')}>Đăng nhập</Button>
        <Button variant="contained" color="primary" onClick={() => navigate('/auth?form=register')}>Đăng ký</Button>
      </div>
    </nav>
  );
}