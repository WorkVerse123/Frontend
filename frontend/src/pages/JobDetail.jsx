import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { handleAsync } from '../utils/HandleAPIResponse';
import EndpointResolver from '../services/EndpointResolver';
import { get as apiGet } from '../services/ApiClient';
import JobSidebarInfo from '../components/jobs/JobSidebarInfo';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/loading/Loading';
import ApplyJobDialog from '../components/common/modals/ApplyJobDialog';
import ApiEndpoints from '../services/ApiEndpoints';

export default function JobDetail() {
  const { id: routeId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        // Use ApiClient directly to bypass EndpointResolver (and any mock routing)
        const jobId = routeId || 1;
        const res = await handleAsync(apiGet(ApiEndpoints.JOB_DETAIL(jobId), { signal: ac.signal }));
        console.log('Job detail response (raw):', res);

        const extractPayload = (r) => {
          // r is the normalized value returned by handleAsync(api.get())
          // Possible shapes encountered in this app:
          // 1) { data: axiosResponse, success: true } where axiosResponse.data === serverBody
          // 2) { data: serverBody, success: true } where serverBody may contain { data: payload }
          // 3) serverBody directly
          if (!r) return null;

          // If r.data looks like an axios response (has status, headers, data)
          const maybeAxios = r.data;
          if (maybeAxios && typeof maybeAxios === 'object' && ('status' in maybeAxios) && ('data' in maybeAxios)) {
            const serverBody = maybeAxios.data;
            // If serverBody follows { data: payload } pattern
            if (serverBody && typeof serverBody === 'object' && 'data' in serverBody) return serverBody.data;
            return serverBody;
          }

          // If r.data is present and looks like the server body
          if (r.data && typeof r.data === 'object') {
            if ('data' in r.data) return r.data.data;
            return r.data;
          }

          // As a last resort, if r itself is the server body
          if (r && typeof r === 'object' && 'data' in r) return r.data;
          return r;
        };

        const payload = extractPayload(res);
        if (!mounted) return;
        if (!payload) setJob(null);
        else {
          // if job contains employerId, fetch employer info and merge
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
            // ignore employer fetch failures — show job without company details
            // console.error('Failed to fetch employer for job', e);
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
  }, []);

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
                <button onClick={() => setApplyOpen(true)} className="bg-[#2563eb] text-white px-4 py-2 rounded font-semibold">Ứng tuyển ngay</button>
              </div>
            </div>

            <section className="prose prose-sm max-w-none text-gray-700">
              <h3 className='font-semibold'>Mô tả công việc</h3>
              <p>{job.jobDescription}</p>

              <h3 className='font-semibold'>Yêu cầu</h3>
              <p>{job.jobRequirements}</p>

              
            </section>
          </div>

          <div className="lg:col-span-1">
            <JobSidebarInfo job={job} />
          </div>
        </div>
      )}
  <ApplyJobDialog open={applyOpen} onClose={() => setApplyOpen(false)} jobId={job?.jobId} />
    </MainLayout>
  );
}
