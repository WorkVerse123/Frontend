import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import Loading from '../loading/Loading';
import InlineLoader from '../loading/InlineLoader';
import { handleAsync } from '../../../utils/HandleAPIResponse';
import { formatSalary } from '../../../utils/formatSalary';
import { formatDateToDDMMYYYY } from '../../../utils/formatDate';
import { useAuth } from '../../../contexts/AuthContext';
import { get as apiGet } from '../../../services/ApiClient';
import ApiEndpoints from '../../../services/ApiEndpoints';
import DOMPurify from 'dompurify';
import { useRef } from 'react';
import CategoryBadges from '../../common/CategoryBadges';
import { isJobOpen } from '../../../utils/jobStatus';

export default function JobDetailDialog({ job, employerId, open, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sanitizedDescription, setSanitizedDescription] = useState('');
  const [sanitizedRequirements, setSanitizedRequirements] = useState('');
  const { user } = useAuth();
  const [localJob, setLocalJob] = useState(job);
  const descRef = useRef(null);
  const reqRef = useRef(null);

  // When job is provided as prop we don't fetch; just sanitize its HTML below

  // When job content loads, sanitize HTML (if present) and store safe HTML strings
  useEffect(() => {
    let mounted = true;
    if (!localJob) {
      setSanitizedDescription('');
      setSanitizedRequirements('');
      return () => { mounted = false; };
    }

    (async () => {
  const rawDesc = localJob.jobDescription || localJob.jobDesc || localJob.description || '';
  const rawReq = localJob.jobRequirements || localJob.requirements || '';
      // decode HTML entities if API returned encoded HTML (e.g. &lt;ul&gt;)
      const decodeHtml = (s = '') => {
        try {
          if (typeof document !== 'undefined') {
            const txt = document.createElement('textarea');
            txt.innerHTML = s;
            return txt.value;
          }
        } catch (e) {
          // ignore
        }
        return s;
      };
      const decodedDesc = decodeHtml(rawDesc);
      const decodedReq = decodeHtml(rawReq);
      let cleanDesc = rawDesc;
      let cleanReq = rawReq;
      // Prefer using DOMPurify if it's loaded on window (e.g., via CDN or added to the bundle).
      // Avoid static dynamic-import so Vite doesn't fail when the package isn't installed.
      try {
        if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
          // Allow common Quill output tags & attributes so markup renders as authored
          const purifyConfig = {
            ALLOWED_TAGS: ['p','br','ul','ol','li','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','a','img','blockquote','pre','code','span','div','table','thead','tbody','tr','th','td','hr'],
            ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','width','height']
          };
          cleanDesc = DOMPurify.sanitize(decodedDesc || '', purifyConfig);
          cleanReq = DOMPurify.sanitize(decodedReq || '', purifyConfig);
        }
      } catch (e) {
        // fallback: remove script/style tags to avoid obvious XSS, but keep basic markup
        const stripDanger = (s = '') => s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
        cleanDesc = stripDanger(decodedDesc || '');
        cleanReq = stripDanger(decodedReq || '');
      }
      if (!mounted) return;
      // If cleaned content still contains HTML entities like &lt;, try decode+sanitize again
      const looksEncoded = (s = '') => /&lt;|&gt;|&amp;/.test(s);
      if (looksEncoded(cleanDesc)) {
        const decoded = (function decode(s){ try { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; } catch(e){ return s; } })(cleanDesc);
  try { cleanDesc = DOMPurify.sanitize(decoded, { ALLOWED_TAGS: ['p','br','ul','ol','li','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','a','img','blockquote','pre','code','span','div','table','thead','tbody','tr','th','td','hr'], ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','width','height'] }); } catch(e) { /* ignore */ }
      }
      if (looksEncoded(cleanReq)) {
        const decoded = (function decode(s){ try { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; } catch(e){ return s; } })(cleanReq);
  try { cleanReq = DOMPurify.sanitize(decoded, { ALLOWED_TAGS: ['p','br','ul','ol','li','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','a','img','blockquote','pre','code','span','div','table','thead','tbody','tr','th','td','hr'], ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','style','width','height'] }); } catch(e) { /* ignore */ }
      }
      setSanitizedDescription(cleanDesc);
      setSanitizedRequirements(cleanReq);
    })();

    return () => { mounted = false; };
  }, [localJob, open]);

  // Post-process DOM inside description/requirements to ensure lists and strong tags render with proper spacing
  useEffect(() => {
    const applyListStyles = (root) => {
      if (!root) return;
      try {
        const uls = root.querySelectorAll('ul, ol');
        uls.forEach(u => {
          u.classList.add('list-disc', 'pl-5', 'ml-4', 'space-y-1');
        });
        const strongs = root.querySelectorAll('strong');
        strongs.forEach(s => s.classList.add('font-semibold'));
      } catch (e) {
        // noop
      }
    };
    applyListStyles(descRef.current);
    applyListStyles(reqRef.current);
  }, [sanitizedDescription, sanitizedRequirements]);

  // keep localJob in sync with incoming prop. Also re-run when `open` changes so
  // reopening the dialog refreshes localJob even if the parent passed the same
  // object reference (some parents toggle `open` without changing the job prop).
  useEffect(() => {
    if (open && job) setLocalJob(job);
  }, [job, open]);

  // Always fetch latest job details when the dialog opens to avoid stale/missing data
  useEffect(() => {
    let mounted = true;
    if (!open) return () => { mounted = false; };

    // Prefer id from incoming prop (job), fallback to existing localJob id
    const id = job?.jobId || job?.id || localJob?.jobId || localJob?.id;
    if (!id) return () => { mounted = false; };

    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await apiGet(ApiEndpoints.JOB_DETAIL(id), { signal: ac.signal });
        const payload = res?.data ?? res;
        if (!mounted) return;
        const detailed = payload?.data ?? payload ?? null;
        if (detailed) setLocalJob(prev => ({ ...(prev || {}), ...detailed }));
      } catch (e) {
        // ignore fetch errors here
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; ac.abort(); };
  }, [open, job?.jobId, job?.id]);

  // Owner check: compare normalized employer id values
  const userEmployerId = user?.profileId ?? user?.employerId ?? user?._raw?.EmployerId ?? user?.id ?? null;
  const isOwner = user?.profileType === 'employer' && userEmployerId != null && Number(userEmployerId) === Number(employerId);

  // Employee check and applied state (use a few common field names as fallbacks)
  const isEmployee = Boolean(user && (user.profileType === 'employee' || user.profileType === 'candidate' || user.role === 'employee' || user.role === 'candidate'));
  const hasApplied = Boolean(localJob?.employeeApplied || localJob?.hasApplied || localJob?.applied || localJob?.isApplied || localJob?.alreadyApplied);

  const handleClose = () => {
    setError(null);
    onClose?.();
  };

  // Derived display values (use localJob)
  const isOpenStatus = isJobOpen(localJob);
  const expiredDisplay = localJob ? (formatDateToDDMMYYYY(localJob.jobExpiredAt || localJob.jobExpiredDate || localJob.expiredAt) || '—') : '—';
  const createdDisplay = localJob ? (formatDateToDDMMYYYY(localJob.jobCreatedAt || localJob.createdAt || localJob.jobCreatedAt) || '—') : '—';
  const applyCount = localJob?.employeeApplyCount ?? localJob?.applicantCount ?? 0;

  return (
  <Dialog open={!!open} onClose={handleClose} fullWidth maxWidth="md" ModalProps={{ disableScrollLock: true }}>
      <DialogTitle>
        {loading ? 'Đang tải...' : localJob ? localJob.jobTitle || 'Chi tiết công việc' : 'Chi tiết công việc'}
      </DialogTitle>

      <Divider />

      <DialogContent dividers className="space-y-4">
  {loading && <div className="py-8"><InlineLoader text="Đang tải chi tiết..." /></div>}

        {!loading && error && (
          <Typography color="error" className="text-sm">
            Không thể tải chi tiết công việc.
          </Typography>
        )}

        {!loading && localJob && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mt-2">
                  <CategoryBadges categories={localJob.jobCategory} />
                  {/* If jobLocation exists, render as a link to Google Maps (opens in new tab) */}
                  <div className="text-sm text-slate-600 mt-2 font-semibold">
                    {localJob.jobLocation ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(localJob.jobLocation))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                        title={`Mở địa điểm trên Google Maps: ${localJob.jobLocation}`}
                      >
                        {localJob.jobLocation}
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Chip label={localJob.jobStatus || localJob.status || '—'} size="small" color={isOpenStatus ? 'success' : 'default'} />
                <Typography variant="body2" className="text-slate-500 font-semibold">
                  Hạn nộp: <span className='text-green-500'>{expiredDisplay}</span>
                </Typography>
              </div>
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Mức lương</Typography>
              <Typography className="text-sm text-slate-600">
                {formatSalary(localJob.jobSalaryMin, localJob.jobSalaryMax, localJob.jobSalaryCurrency, localJob.jobTime)}
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Mô tả công việc</Typography>
              {sanitizedDescription ? (
                <div ref={descRef} className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
              ) : (
                <Typography className="text-sm text-slate-600">—</Typography>
              )}
            </div>

            <div>
              <Typography variant="subtitle2" className="text-slate-700 mb-1">Yêu cầu</Typography>
              {sanitizedRequirements ? (
                <div ref={reqRef} className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: sanitizedRequirements }} />
              ) : (
                <Typography className="text-sm text-slate-600">—</Typography>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div>Ngày tạo: {createdDisplay}</div>
              <div>Ứng viên đã ứng tuyển: {applyCount}</div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined">Đóng</Button>

        {/* Employee apply button: show either 'Ứng tuyển' or disabled 'Đã ứng tuyển' */}
        {!isOwner && isEmployee ? (
          (() => {
            const id = localJob?.jobId || localJob?.id;
            const handleApply = () => {
              handleClose();
              // navigate to job page and request the page to open apply flow if supported
              if (id) navigate(`/jobs/${id}`, { state: { openApply: true } });
              else navigate('/jobs');
            };
            return hasApplied ? (
              <Button disabled variant="outlined">Đã ứng tuyển</Button>
            ) : (
              <Button onClick={handleApply} variant="contained" color="primary">Ứng tuyển</Button>
            );
          })()
        ) : null}

        {isOwner ? (
          <Button
            onClick={() => {
              // navigate to edit page, pass jobId
              handleClose();
              navigate(`/jobs/edit/${localJob?.jobId || localJob?.id}`);
            }}
            variant="contained"
            color="primary"
          >
            Chỉnh sửa
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}