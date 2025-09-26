import React, { useState } from 'react';
import { Button, Chip, IconButton, Box, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BookmarkButton from '../common/bookmark/BookmarkButton';
import ApiEndpoints from '../../services/ApiEndpoints';
import { post, del } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { useAuth } from '../../contexts/AuthContext';

export default function JobRow({ job, onViewApplications = () => {}, onOpenMenu = () => {} }) {
  const { user } = useAuth();
  const employeeId = user?.id || user?.userId || user?.employeeId || null;

  const [bookmarked, setBookmarked] = useState(Boolean(job?.bookmarked));
  const [bookmarkId, setBookmarkId] = useState(job?.bookmarkId || job?.bookmark_id || null);

  const handleToggleBookmark = async (next) => {
    // optimistic update
    setBookmarked(Boolean(next));
    try {
      if (!employeeId) {
        // Not authenticated - can't perform bookmark actions
        console.warn('Attempted to toggle bookmark while not authenticated');
        // rollback optimistic update
        setBookmarked(false);
        return;
      }

      if (next) {
        const res = await handleAsync(post(ApiEndpoints.EMPLOYEE_BOOKMARK_JOB(employeeId, job.jobId)));
        if (!res.success) throw new Error(res.message || 'Không thể lưu bookmark');
        const data = res.data || res;
        const id = data.bookmarkId || data.bookmark_id || data.id || data?.data?.id || null;
        setBookmarkId(id);
      } else {
        if (!bookmarkId) {
          // nothing to delete on server
          return;
        }
        const url = `${ApiEndpoints.EMPLOYEE_BOOKMARKS(employeeId)}/${bookmarkId}`;
        const res = await handleAsync(del(url));
        if (!res.success) throw new Error(res.message || 'Không thể xóa bookmark');
        setBookmarkId(null);
      }
    } catch (err) {
      // rollback
      setBookmarked((s) => !s);
      // eslint-disable-next-line no-console
      console.error('Bookmark toggle failed', err);
    }
  };
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

        <BookmarkButton bookmarked={bookmarked} onToggle={handleToggleBookmark} size="small" />

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