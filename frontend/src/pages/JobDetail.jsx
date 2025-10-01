import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import EndpointResolver from '../services/EndpointResolver';
import { get as apiGet } from '../services/ApiClient';
import JobSidebarInfo from '../components/jobs/JobSidebarInfo';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/loading/Loading';
import ApplyJobDialog from '../components/common/modals/ApplyJobDialog';
import DOMPurify from 'dompurify';
import ApiEndpoints from '../services/ApiEndpoints';
import BookmarkButton from '../components/common/bookmark/BookmarkButton';
import { post, del } from '../services/ApiClient';
import { handleAsync } from '../utils/HandleAPIResponse';

export default function JobDetail() {
  const { id: routeId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [appliedForThisJob, setAppliedForThisJob] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(false));
  const [bookmarkId, setBookmarkId] = useState(null);
  const { user } = useAuth();
  const employeeId = user?.id || user?.userId || user?.employeeId || null;

  const [sanitizedDescription, setSanitizedDescription] = useState('');
  const [sanitizedRequirements, setSanitizedRequirements] = useState('');
  const descRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    // Fetch both job detail and employee's applications up-front so the page
    // can render with the correct "applied" state immediately.
    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const jobId = routeId || 1;
        const employeeId = user?.employeeId || null;

        // Start both requests in parallel (apps request is skipped when no employeeId)
        const jobPromise = apiGet(ApiEndpoints.JOB_DETAIL(jobId), { signal: ac.signal });
        const appsPromise = employeeId ? apiGet(ApiEndpoints.EMPLOYEE_APPLICATIONS(employeeId), { signal: ac.signal }) : Promise.resolve(null);

        const [jobRes, appsRes] = await Promise.all([jobPromise, appsPromise]);

        // Determine applied state from appsRes
        try {
          let apps = [];
          if (appsRes) apps = appsRes?.data?.applications || appsRes?.data || appsRes || [];
          const found = Array.isArray(apps) && apps.some(a => String(a.jobId) === String(jobId) || String(a.job_id) === String(jobId));
          if (mounted) setAppliedForThisJob(!!found);
        } catch (e) {
          // swallow errors checking apps — failure to determine applied state shouldn't break job load
        }

        // Normalize job payload (reuse existing extraction logic)
        const extractPayload = (r) => {
          if (!r) return null;
          const maybeAxios = r.data;
          if (maybeAxios && typeof maybeAxios === 'object' && ('status' in maybeAxios) && ('data' in maybeAxios)) {
            const serverBody = maybeAxios.data;
            if (serverBody && typeof serverBody === 'object' && 'data' in serverBody) return serverBody.data;
            return serverBody;
          }
          if (r.data && typeof r.data === 'object') {
            if ('data' in r.data) return r.data.data;
            return r.data;
          }
          if (r && typeof r === 'object' && 'data' in r) return r.data;
          return r;
        };

        const payload = extractPayload(jobRes);
        if (!mounted) return;
        if (!payload) setJob(null);
        else {
          let merged = { ...payload };
          try {
            const empId = payload?.employerId ?? payload?.EmployerId ?? null;
            if (empId) {
              const empRes = await handleAsync(apiGet(ApiEndpoints.EMPLOYER(empId)));
              const empServer = empRes?.data ?? empRes ?? null;
              const empInner = empServer?.data ?? empServer;
              if (empInner && typeof empInner === 'object') {
                const companyName = empInner.companyName ?? empInner.CompanyName ?? empInner.name ?? empInner.company_name ?? '';
                const logoUrl = empInner.logoUrl ?? empInner.CompanyLogo ?? empInner.logo ?? '';
                const companyWebsite = empInner.websiteUrl ?? empInner.companyWebsite ?? empInner.website ?? '';
                merged = { ...merged, companyName, logoUrl, companyWebsite, _employer: empInner };
              }
            }
          } catch (e) {
            // ignore employer fetch failures
          }
          setJob(merged);
        }
      } catch (err) {
        const isCanceled = err?.name === 'AbortError' || (err?.message && String(err.message).toLowerCase().includes('cancel'));
        if (!isCanceled) setJob(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; ac.abort(); };
  }, [routeId, user]);

  // Sanitize and decode any HTML coming from the job payload (Quill HTML, etc.)
  useEffect(() => {
    if (!job) {
      setSanitizedDescription('');
      setSanitizedRequirements('');
      return;
    }
    const decodeHtml = (s = '') => {
      try {
        const t = document.createElement('textarea');
        t.innerHTML = s;
        return t.value;
      } catch (e) {
        return s;
      }
    };
    const rawDesc = job.jobDescription || job.jobDesc || job.description || '';
    const rawReq = job.jobRequirements || job.requirements || '';
    const decodedDesc = decodeHtml(rawDesc);
    const decodedReq = decodeHtml(rawReq);
    try {
      const allowed = {
        ALLOWED_TAGS: ['p','br','ul','ol','li','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','a','img','blockquote','pre','code','span','div','table','thead','tbody','tr','th','td','hr'],
        ALLOWED_ATTR: ['href','target','rel','src','alt','title','class','width','height']
      };
      const cleanDesc = DOMPurify.sanitize(decodedDesc || '', allowed);
      const cleanReq = DOMPurify.sanitize(decodedReq || '', allowed);
      setSanitizedDescription(cleanDesc);
      setSanitizedRequirements(cleanReq);
    } catch (e) {
      setSanitizedDescription(decodedDesc);
      setSanitizedRequirements(decodedReq);
    }
  }, [job]);

  // Add Tailwind classes to lists/strong after innerHTML is set
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

  

  return (
    <MainLayout role={(function(){
      const { user } = useAuth();
      const normalizeRole = (r) => {
        if (!r) return 'guest';
        if (typeof r === 'number') {
          if (r === 1) return 'admin';
          if (r === 2) return 'staff';
          if (r === 3) return 'employer';
          if (r === 4) return 'employee';
          return 'guest';
        }
        if (typeof r === 'string') return r.toLowerCase();
        if (typeof r === 'object') {
          const id = r.roleId || r.RoleId || r.role_id || r.roleID;
          if (id) return normalizeRole(Number(id));
          const name = r.role || r.roleName || r.role_name;
          if (name) return String(name).toLowerCase();
        }
        return 'guest';
      };
      return normalizeRole(user?.roleId || user);
    })()} hasSidebar={false}>
      {loading && <Loading />}

      {!loading && !job && (
        <div className="max-w-4xl mx-auto py-8 px-4">Không tìm thấy công việc.</div>
      )}

      {job && (
        <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-[#042852]">{job.jobTitle}</h1>
                <div className="text-sm text-gray-500">
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs">{job.jobCategory}</span>
                </div>
              </div>
              <div>
                  <div className="flex items-center gap-2">
                    <BookmarkButton bookmarked={bookmarked} onToggle={async (n) => {
                      setBookmarked(Boolean(n));
                      try {
                        if (!employeeId) { setBookmarked(false); return; }
                            if (n) {
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
                        console.error('Bookmark toggle failed', err);
                      }
                    }} size="small" />
                    <button onClick={() => setApplyOpen(true)} className={`${appliedForThisJob ? 'bg-green-600' : 'bg-[#2563eb]'} text-white px-4 py-2 rounded font-semibold`} disabled={appliedForThisJob}>{appliedForThisJob ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}</button>
                  </div>
              </div>
            </div>

            <section className="prose prose-sm max-w-none text-gray-700">
              <h3 className='font-semibold'>Mô tả công việc</h3>
              {sanitizedDescription ? (
                <div ref={descRef} className="text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
              ) : (
                <p>{job.jobDescription || '—'}</p>
              )}

              <h3 className='font-semibold'>Yêu cầu</h3>
              {sanitizedRequirements ? (
                <div ref={reqRef} className="text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizedRequirements }} />
              ) : (
                <p>{job.jobRequirements || '—'}</p>
              )}

            </section>
          </div>

          <div className="lg:col-span-1">
            <JobSidebarInfo job={job} />
          </div>
        </div>
      )}
  <ApplyJobDialog
        open={applyOpen}
        onClose={(result) => {
          // only mark as applied when the dialog reports success
          setApplyOpen(false);
          if (result && result.success) {
            setAppliedForThisJob(true);
          }
        }}
        jobId={job?.jobId}
        employerId={job?._employer?.employerId || job?.employerId}
        initialApplied={appliedForThisJob}
      />
    </MainLayout>
  );
}
