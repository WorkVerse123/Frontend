import React, { useEffect, useState } from 'react';
import JobsService from '../../services/JobsService';
import { useAuth } from '../../contexts/AuthContext';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { get as apiGet } from '../../services/ApiClient';
import ApiEndpoints from '../../services/ApiEndpoints';
import { handleAsync } from '../../utils/HandleAPIResponse';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import Loading from '../common/loading/Loading';
import InlineLoader from '../common/loading/InlineLoader';

function ReviewItem({ r, reviewer, onProfile }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">
          {reviewer ? (
            <button onClick={() => onProfile && onProfile(reviewer)} className="text-left text-blue-600 hover:underline">
              {reviewer.fullName || reviewer.full_name || `Employee #${r.employeeId}`}
            </button>
          ) : (
            <span>Employee #{r.employeeId || 'N/A'}</span>
          )}
        </div>
        <div className="text-sm text-yellow-600">Rating: {r.rating}/5</div>
      </div>
      <div className="text-sm text-gray-700">{r.comment}</div>
    </div>
  );
}

export default function JobReviews({ jobId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState({}); // cache employeeId => profile
  const [rating, setRating] = useState(5);
  const [average, setAverage] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });

  const canSubmit = user && user.role === 'employee' && user.profileId;
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await JobsService.fetchReviews(jobId, page, pageSize);
        if (!mounted) return;
        if (!res || !res.success) {
          // debug removed
          setSnack({ open: true, severity: 'error', message: res?.message || 'Không thể tải đánh giá' });
          return;
        }
        const payload = res.data || {};
        const items = payload?.reviews || payload?.data?.reviews || [];
  setReviews(items);
        // compute average rating
        try {
          const nums = (items || []).map(it => Number(it.rating) || 0).filter(n => n > 0);
          if (nums.length > 0) {
            const sum = nums.reduce((s, v) => s + v, 0);
            setAverage((sum / nums.length));
          } else setAverage(null);
        } catch (e) { setAverage(null); }
        const paging = payload?.paging || payload?.data?.paging || {};
        setTotalPages(paging?.totalPages || 1);
        // detect if current employee already reviewed
        try {
          if (user && user.profileId) {
            const found = (items || []).some(it => Number(it.employeeId) === Number(user.profileId));
            setHasReviewed(!!found);
          } else setHasReviewed(false);
        } catch (e) { setHasReviewed(false); }
        // prefetch reviewer profiles (unique employeeIds)
        try {
          const ids = Array.from(new Set((items || []).map(it => Number(it.employeeId)).filter(Boolean)));
          const missing = ids.filter(id => !profiles[id]);
          if (missing.length > 0) {
            // fetch profiles in parallel
            const results = await Promise.all(missing.map(id => handleAsync(apiGet(ApiEndpoints.EMPLOYEE_PROFILE(id)))));
            const next = { ...profiles };
            results.forEach((r, idx) => {
              const id = missing[idx];
              if (r && r.success) next[id] = r.data || r.data?.data || r;
            });
            setProfiles(next);
          }
        } catch (e) {
          // ignore profile fetch errors
        }
      } catch (e) {
  // debug removed
        setSnack({ open: true, severity: 'error', message: 'Lỗi khi tải đánh giá' });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [jobId, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // validation
    if (!comment || comment.trim().length < 2) {
      setSnack({ open: true, severity: 'warning', message: 'Vui lòng nhập nội dung đánh giá (ít nhất 2 ký tự)' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = { employeeId: user.profileId, rating: Number(rating), comment };
      const res = await JobsService.submitReview(jobId, payload);
      if (!res || !res.success) {
        setSnack({ open: true, severity: 'error', message: res?.message || 'Gửi đánh giá thất bại' });
        return;
      }
      setSnack({ open: true, severity: 'success', message: 'Gửi đánh giá thành công' });
      setComment('');
      setRating(5);
      // reload current page and also update derived UI state (average, hasReviewed)
      const refreshed = await JobsService.fetchReviews(jobId, page, pageSize);
      if (refreshed && refreshed.success) {
        const payload = refreshed.data || {};
        const items = payload?.reviews || payload?.data?.reviews || [];
        setReviews(items);
        const paging = payload?.paging || payload?.data?.paging || {};
        setTotalPages(paging?.totalPages || 1);

        // recompute average rating
        try {
          const nums = (items || []).map(it => Number(it.rating) || 0).filter(n => n > 0);
          if (nums.length > 0) {
            const sum = nums.reduce((s, v) => s + v, 0);
            setAverage((sum / nums.length));
          } else setAverage(null);
        } catch (e) { setAverage(null); }

        // detect if current employee already reviewed
        try {
          if (user && user.profileId) {
            const found = (items || []).some(it => Number(it.employeeId) === Number(user.profileId));
            setHasReviewed(!!found);
          } else setHasReviewed(false);
        } catch (e) { setHasReviewed(false); }

        // prefetch any missing reviewer profiles so names show immediately
        try {
          const ids = Array.from(new Set((items || []).map(it => Number(it.employeeId)).filter(Boolean)));
          const missing = ids.filter(id => !profiles[id]);
          if (missing.length > 0) {
            const results = await Promise.all(missing.map(id => handleAsync(apiGet(ApiEndpoints.EMPLOYEE_PROFILE(id)))));
            const next = { ...profiles };
            results.forEach((r, idx) => {
              const id = missing[idx];
              if (r && r.success) next[id] = r.data || r.data?.data || r;
            });
            setProfiles(next);
          }
        } catch (e) {
          // ignore profile fetch errors
        }
      }
    } catch (err) {
  // debug removed
      setSnack({ open: true, severity: 'error', message: 'Có lỗi khi gửi đánh giá' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Reviews</h3>

      {/* Shared rating block: interactive for eligible users, otherwise show average read-only */}
      <div className="mb-3 flex items-center gap-3">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {canSubmit && !hasReviewed ? (
            <Rating name="submit-rating" value={Number(rating)} precision={1} onChange={(e, value) => setRating(Number(value || 0))} />
          ) : (
            average !== null ? <Rating name="read-only" value={average} precision={0.5} readOnly /> : null
          )}
        </Box>
        <div className="text-sm text-gray-600">{average !== null ? `${average.toFixed(1)} / 5 (${reviews.length})` : (reviews.length ? `${reviews.length} reviews` : 'No reviews yet')}</div>
      </div>

      {canSubmit && !hasReviewed ? (
    <form className="mt-4" onSubmit={handleSubmit}>
      {/* container is relative so the submit button can be absolutely positioned over the TextField */}
      <div className="mb-2 relative" style={{ paddingBottom: 48, overflow: 'visible' }}>
        <TextField
          label="Bình luận"
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          // add internal right padding so the text doesn't flow underneath the absolute button
          sx={{ '& .MuiInputBase-root': { pr: '84px' } }}
        />
        <Button
          type="submit"
          variant="text"
          disabled={submitting}
          size="small"
          color="primary"
          aria-label="Gửi bình luận"
          sx={{ position: 'absolute', right: 12, bottom: 12, textTransform: 'none', zIndex: 30, bgcolor: 'transparent', padding: '6px 8px' }}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : 'Gửi'}
        </Button>
      </div>
    </form>
      ) : (
        <div className="mt-4">
          {!user ? (
            <div className="text-center py-4">
              <div className="text-lg font-medium">Vui lòng đăng nhập để đánh giá</div>
              <div className="text-sm text-gray-600 mb-3">Bạn cần tài khoản nhân viên để gửi đánh giá. Bạn có thể đăng nhập hoặc đăng ký.</div>
              <div className="flex justify-center gap-2">
                <Button variant="outlined" onClick={() => navigate('/auth?form=login')}>Đăng nhập</Button>
                <Button variant="contained" onClick={() => navigate('/auth?form=register')}>Đăng ký</Button>
              </div>
            </div>
          ) : (
            <div>
              {hasReviewed ? (
                <div className="mt-2 text-sm text-green-700">Bạn đã gửi đánh giá cho công việc này. Cảm ơn!</div>
              ) : (
                <div className="mt-4 text-sm text-gray-600">Only employees can submit reviews. Employers can view reviews.</div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="my-4 border-t" />
      {loading ? (
        <InlineLoader />
      ) : (
        <div>
          {/* average display removed here because we show a single shared rating block above */}
          {reviews.map((r) => (
            <ReviewItem key={r.reviewId || `${r.employeeId}-${r.comment}` } r={r} reviewer={profiles[r.employeeId]} onProfile={(p) => {
              // navigate to candidate detail (employee profile page)
              const id = p?.employeeId || p?.employee_id || p?.id || r.employeeId;
              if (id) navigate(`/candidates/${id}`);
            }} />
          ))}

          <div className="flex items-center justify-between mt-2">
            <div className="text-sm text-gray-600">Trang {page} / {totalPages}</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
              <button className="px-3 py-1 border rounded" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
            </div>
          </div>
        </div>
      )}

      
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
