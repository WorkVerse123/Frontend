import React from 'react';
import { Menu, MenuItem, Dialog, DialogTitle, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';

export default function ActionsMenu({ anchorEl, open, onClose = () => {}, onAction = () => {}, job = null }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handle = (action) => {
    onAction(action, job);
    onClose();
  };

  if (isMobile) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Hành động</DialogTitle>
        <List>
          <ListItem button onClick={() => handle('feature')}>
            <ListItemText primary="Đăng tin nổi bật" />
          </ListItem>
          <ListItem button onClick={() => handle('view')}>
            <ListItemText primary="Xem chi tiết" />
          </ListItem>
          <ListItem button onClick={() => handle('markExpired')}>
            <ListItemText primary="Đóng đơn" />
          </ListItem>
        </List>
      </Dialog>
    );
  }

  // Desktop: shift menu to the left of the anchor to prevent overflow
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      getContentAnchorEl={null}
    >
      <MenuItem onClick={() => handle('feature')}>Đăng tin nổi bật</MenuItem>
      <MenuItem onClick={() => handle('view')}>Xem chi tiết</MenuItem>
      <MenuItem onClick={() => handle('markExpired')}>Đóng đơn</MenuItem>
    </Menu>
  );
}