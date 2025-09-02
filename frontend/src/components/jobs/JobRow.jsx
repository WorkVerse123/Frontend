import React from 'react';
import { Button, Chip, IconButton, Box, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function JobRow({ job, onViewApplications = () => {}, onOpenMenu = () => {} }) {
  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <Typography variant="h6" component="h3" className="font-medium break-words">
            {job.title}
          </Typography>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {job.location && <Chip label={job.location} size="small" />}
            <span className={`px-2 py-1 rounded text-sm ${job.status === 'opened' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {job.status}
            </span>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-3 sm:mt-1">
          {job.employeeApplyCount ?? 0} ứng viên • Hạn: {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString() : '—'}
        </div>
      </div>

      <Box className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onViewApplications(job)}
          fullWidth
          className="sm:w-auto"
        >
          Xem Đơn Ứng Tuyển
        </Button>

        <IconButton
          size="small"
          onClick={(e) => onOpenMenu(e, job)}
          aria-label="actions"
          className="self-end sm:self-auto"
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
    </div>
  );
}