import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Divider } from '@mui/material';
import Loading from '../loading/Loading';

export default function ApplicationsDialog({ open, onClose = () => {}, loading = false, applications = [] }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Đơn ứng tuyển</DialogTitle>

      <DialogContent>
        {loading ? (
          <div className="py-6">
            <Loading />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-6 text-center text-gray-500">Không có đơn nào</div>
        ) : (
          <List>
            {applications.map((a) => (
              <React.Fragment key={a.applicationId || `${a.employeeId}-${a.appliedAt}`}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={a.employeeFullName || a.employeeName || 'Ứng viên'}
                    secondary={new Date(a.appliedAt).toLocaleString() || ''}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}