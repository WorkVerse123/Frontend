import React, { useState } from 'react';
import { Button, MenuItem, Select, IconButton, Dialog, AppBar, Toolbar, Typography, List, ListItem, ListItemText, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

export default function GuestHeader() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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

      <IconButton className="md:hidden" color="inherit" onClick={() => setMobileOpen(true)} aria-label="menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </IconButton>

  <Dialog fullScreen open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ disableScrollLock: true }}>
        <AppBar position="relative">
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>Menu</Typography>
            <IconButton edge="end" color="inherit" onClick={() => setMobileOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <List>
            <ListItem button component="a" href="/jobs" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Việc làm" />
            </ListItem>
            <ListItem button component="a" href="/companies" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Nhà tuyển dụng" />
            </ListItem>
            <ListItem button onClick={() => { setMobileOpen(false); navigate('/auth?form=login'); }}>
              <ListItemText primary="Đăng nhập" />
            </ListItem>
            <ListItem button onClick={() => { setMobileOpen(false); navigate('/auth?form=register'); }}>
              <ListItemText primary="Đăng ký" />
            </ListItem>
          </List>
        </Box>
      </Dialog>
    </nav>
  );
}