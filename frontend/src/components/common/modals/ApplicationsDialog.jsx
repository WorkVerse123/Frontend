import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Divider, Button, Box, Chip } from '@mui/material';
import Loading from '../loading/Loading';

export default function ApplicationsDialog({ open, onClose = () => {}, loading = false, applications = [], job = null, onViewProfile = () => {}, onAccept = () => {}, onReject = () => {}, onToggleJobStatus = () => {} }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" ModalProps={{ disableScrollLock: true }}>
      <DialogTitle className="flex items-center justify-between">
        <span>Đơn ứng tuyển</span>
        <div>
          <Button size="small" variant="outlined" onClick={() => onToggleJobStatus(job)}>
            {job && (job.jobStatus || job.status || '').toLowerCase() === 'open' ? 'Đóng đơn' : 'Mở đơn'}
          </Button>
        </div>
      </DialogTitle>

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
                <ListItem alignItems="flex-start" className="flex items-center justify-between">
                  <ListItemText
                    primary={(
                      <div className="flex items-center gap-2">
                        <span>{a.employeeFullName || a.employeeName || 'Ứng viên'}</span>
                        <Chip label={String(a.status || a.applicationStatus || '').toUpperCase()} size="small" />
                      </div>
                    )}
                    secondary={new Date(a.appliedAt).toLocaleString() || ''}
                  />
                  <Box className="flex items-center gap-2">
                    <Button size="small" variant="outlined" onClick={() => onViewProfile(a)}>Xem hồ sơ</Button>
                    {/* Always show accept/reject but disable when not pending */}
                    {(() => {
                      const st = String(a.status || a.applicationStatus || '').toLowerCase();
                      const isPending = st === 'pending';
                      return (
                        <>
                          <Button size="small" variant="contained" color="primary" onClick={() => onAccept(a)} disabled={!isPending}>Chấp nhận</Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => onReject(a)} disabled={!isPending}>Từ chối</Button>
                        </>
                      );
                    })()}
                  </Box>
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