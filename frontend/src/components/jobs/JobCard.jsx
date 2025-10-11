import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapLink from '../common/MapLink';
import { formatPrice } from '../../utils/formatPrice';
import BookmarkButton from '../common/bookmark/BookmarkButton';
import CategoryBadges from '../common/CategoryBadges';
import ApiEndpoints from '../../services/ApiEndpoints';
import { post, del, get as apiGet } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { useAuth } from '../../contexts/AuthContext';

export default function JobCard({ job, onBookmarkToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const employeeId = user?.id || user?.userId || user?.employeeId || null;
  // normalize role to support numeric RoleId, roleId, role, role_id
  const roleRaw = user?.role || user?.RoleId || user?.roleId || user?.role_id || '';
  const role = (() => {
    if (roleRaw === null || roleRaw === undefined || roleRaw === '') return '';
    const n = Number(roleRaw);
    if (!Number.isNaN(n) && n > 0) {
      switch (n) {
        case 1: return 'admin';
        case 2: return 'staff';
        case 3: return 'employer';
        case 4: return 'employee';
        default: return String(roleRaw).toLowerCase();
      }
    }
    return String(roleRaw).toLowerCase();
  })();
  const [bookmarked, setBookmarked] = useState(Boolean(job?.bookmarked));
  const [bookmarkId, setBookmarkId] = useState(job?.bookmarkId || job?.bookmark_id || null);

  // Keep local bookmarked/bookmarkId in sync if parent updates the job prop
  useEffect(() => {
    setBookmarked(Boolean(job?.bookmarked));
    setBookmarkId(job?.bookmarkId || job?.bookmark_id || null);
  }, [job?.bookmarked, job?.bookmarkId, job?.bookmark_id]);

  const handleToggleBookmark = async (next) => {
    setBookmarked(Boolean(next));
    try {
      if (!employeeId) {
  // debug removed
        setBookmarked(false);
        return;
      }
      if (next) {
        const res = await handleAsync(post(ApiEndpoints.EMPLOYEE_BOOKMARK_JOB(employeeId, job.jobId)));
        if (!res.success) {
          const msg = String(res.message || '').toLowerCase();
          if (msg.includes('already exists') || msg.includes('already saved') || msg.includes('exist')) {
            // fetch bookmarks to find the bookmark id
            try {
              const bRes = await handleAsync(apiGet(ApiEndpoints.EMPLOYEE_BOOKMARKS(employeeId)));
              const bList = bRes?.data?.bookmarks || bRes?.data || bRes || [];
              const found = (Array.isArray(bList) ? bList : []).find(b => String(b.jobId || b.job_id || b.job?.jobId || b.job?.id) === String(job.jobId || job.id));
              if (found) setBookmarkId(found.bookmarkId || found.bookmark_id || found.id || null);
            } catch (e) {
              // ignore
            }
          } else {
            throw new Error(res.message || 'Không thể lưu bookmark');
          }
        } else {
          const data = res.data || res;
          const id = data.bookmarkId || data.bookmark_id || data.id || data?.data?.id || null;
          setBookmarkId(id);
        }
      } else {
        if (!bookmarkId) return;
        const url = `${ApiEndpoints.EMPLOYEE_BOOKMARKS(employeeId)}/${bookmarkId}`;
        const res = await handleAsync(del(url));
        if (!res.success) throw new Error(res.message || 'Không thể xóa bookmark');
        setBookmarkId(null);
      }
    } catch (err) {
      setBookmarked((s) => !s);
      // eslint-disable-next-line no-console
  // debug removed
    }
  };
  return (
    <div className="bg-white rounded-xl shadow p-4 border hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {/* <div className="w-14 h-14 flex items-center justify-center bg-[#f3f7fb] rounded-md overflow-hidden">
          {job.logo ? (
            <img src={job.logo} alt={job.companyName || 'logo'} className="w-12 h-12 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-[#2563eb] text-white rounded flex items-center justify-center font-bold">{(job.companyName || 'C').charAt(0)}</div>
          )}
        </div> */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-[#042852]">{job.jobTitle}</div>
              <div className="text-sm text-gray-500"> <MapLink address={job.jobLocation} /></div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700 font-semibold">{job.jobSalaryMin != null ? formatPrice(job.jobSalaryMin, job.jobSalaryCurrency || 'VND') : '—'}{job.jobSalaryMax != null ? ` - ${formatPrice(job.jobSalaryMax, job.jobSalaryCurrency || 'VND')}` : ''}</div>
            </div>
          </div>

            <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryBadges categories={job.jobCategory} />
              {job.jobType && (
                <span className="text-xs text-gray-500">{job.jobType}</span>
              )}
            </div>
              <div className="flex items-center gap-2">
              <BookmarkButton bookmarked={bookmarked} onToggle={(next) => {
                if (typeof onBookmarkToggle === 'function') return onBookmarkToggle(job, next);
                return handleToggleBookmark(next);
              }} size="small" />
              { (role === 'admin' || role === 'staff' || role === 'employer') ? (
                <button onClick={() => navigate(`/jobs/${job.jobId || job.id}`)} className={`bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-semibold`}>Xem</button>
              ) : (
                <button onClick={() => navigate(`/jobs/${job.jobId || job.id}`)} className={`${job.applied ? 'bg-green-600 hover:bg-green-700' : 'bg-[#2563eb] hover:bg-blue-700'} text-white px-3 py-1 rounded text-sm font-semibold`}>{job.applied ? 'Đã ứng tuyển' : 'Ứng Tuyển'}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
