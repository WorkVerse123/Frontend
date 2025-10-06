import React, { useState } from 'react';
import { Button, Chip, Box, Typography } from '@mui/material';
import ApiEndpoints from '../../services/ApiEndpoints';
import { post, del } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { useAuth } from '../../contexts/AuthContext';
import { isJobOpen } from '../../utils/jobStatus';

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
  const formatSalary = (min, max) => {
    const fmt = (v) => (v == null ? null : Number(v).toLocaleString());
    const a = fmt(min); const b = fmt(max);
    if (a && b) return `${a} - ${b} VND`;
    if (a) return `${a} VND`;
    if (b) return `${b} VND`;
    return '';
  };

  return (
    <div className="py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      {/* Left avatar */}
      <div className="flex-shrink-0">
        <Box className="w-12 h-12 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {job.title ? String(job.title).trim().charAt(0).toUpperCase() : '?'}
        </Box>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Typography variant="h6" component="h3" className="font-medium text-lg">
              {job.title}
            </Typography>
            <div className="text-sm text-gray-500 mt-2">
              <span className="inline-block mr-2">•</span>
              <span className="inline-block text-sm text-gray-600">{job.location}</span>
            </div>
            {/* categories */}
            <div className="mt-3 flex flex-wrap gap-2">
              {(Array.isArray(job.jobCategory) ? job.jobCategory : []).slice(0, 8).map((c, i) => (
                <Chip key={`${c}-${i}`} label={c} size="small" className="bg-blue-50 text-blue-700" />
              ))}
            </div>
          </div>

          {/* Right area: status & salary */}
          <div className="flex-shrink-0 text-right">
            {(() => {
              const raw = (job?.jobStatus ?? job?.job_status ?? job?.status ?? '').toString().toLowerCase();
              const label = raw ? String(raw).charAt(0).toUpperCase() + String(raw).slice(1) : '—';
              const badgeClass = raw === 'open' ? 'bg-green-100 text-green-800' : raw === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800';
              return (
                <div className="mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}>{label}</span>
                </div>
              );
            })()}
            <div className="text-sm font-medium text-gray-800">
              {formatSalary(job.salaryMin ?? job.jobSalaryMin, job.salaryMax ?? job.jobSalaryMax)}
            </div>
          </div>
        </div>

          <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{job.employeeApplyCount ?? 0} ứng viên • Hạn: {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString() : '—'}</div>

          <div className="flex items-center gap-2">
            {(() => {
              // allow employers to view applications regardless of open/closed state
              const isEmployer = user && (user.profileType === 'employer' || String(user?.roleId || user?.RoleId || user?.role).toLowerCase() === '3' || String(user?.role).toLowerCase() === 'employer');
              const disabled = !isEmployer && !isJobOpen(job);
                return (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewApplications(job); }}
                    disabled={disabled}
                  >
                    Xem Đơn Ứng Tuyển
                  </Button>
                );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}