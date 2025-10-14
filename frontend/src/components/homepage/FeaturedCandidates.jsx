import { useEffect, useState } from 'react';
import { handleAsync } from '../../utils/HandleAPIResponse';
import InlineLoader from '../common/loading/InlineLoader';
import { Link, useNavigate } from 'react-router-dom';
import MapLink from '../common/MapLink';
import { Card, CardContent, CardActions, Button, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function FeaturedCandidates({ setIsLoading }) {
  const { user } = useAuth();
  // normalize role and premium flag
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

  // Premium flag (IsPremium) can be provided in different shapes; check a few common places
  const isPremium = (() => {
    try {
      const raw = user?.IsPremium ?? user?._raw?.IsPremium ?? user?.isPremium ?? user?.is_premium ?? user?.isPremiumFlag;
      if (raw === true) return true;
      if (typeof raw === 'string') return String(raw).toLowerCase() === 'true';
      return Boolean(raw);
    } catch (e) {
      return false;
    }
  })();

  // Only show candidates to employer users who are premium, or to admin
  const canViewCandidates = (role === 'employer' && isPremium) || role === 'admin';
  const [candidates, setCandidates] = useState([]);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
        // Only fetch if the user is allowed to view candidates
      if (!canViewCandidates) return;
      try {
        setLoading(true);
        if (typeof setIsLoading === 'function') setIsLoading(true);
        const { get: apiGet } = await import('../../services/ApiClient');
        const ApiEndpoints = (await import('../../services/ApiEndpoints')).default;
        const result = await handleAsync(apiGet(ApiEndpoints.JOB_CANDIDATES(1, pageSize)));
        if (!mounted) return;
        // normalize payload similar to FeaturedJobs
        const outer = result?.data ?? result;
        const payload = outer?.data ?? outer;
        const arr = payload?.candidates ?? payload?.data?.candidates ?? payload ?? [];
        const candidateIsPriority = v => v === true || v === 1 || String(v).toLowerCase() === 'true';
        const filtered = Array.isArray(arr) ? arr.filter(x => candidateIsPriority(x.isPriority) || candidateIsPriority(x.is_priority)) : [];
        setCandidates(filtered.slice(0, pageSize));
      } catch (err) {
        if (!mounted) return;
        setCandidates([]);
      } finally {
        setLoading(false);
        if (typeof setIsLoading === 'function') setIsLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [setIsLoading]);

  return (
    <section className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold mb-6 text-[#042852]">Ứng viên nổi bật</h2>
        <div className="mb-4">
          <Link to="/candidates" className="text-sm text-[#2563eb] font-semibold hover:underline">Xem tất cả</Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <InlineLoader text="Đang tải ứng viên..." />
        ) : (
          canViewCandidates ? (
            candidates.map(c => (
              <div key={c.employeeId} className="bg-white rounded-xl shadow p-4 flex items-center justify-between border">
                <div>
                  <div className="font-semibold text-[#2563eb]">{c.fullName}</div>
                  <div className="text-gray-500 text-sm">
                    <span className="inline-block mr-2"><MapLink address={c.employeeLocation} /></span>
                    <span className="mr-2">{c.employeeEducation}</span>
                    <span>{c.gender}</span>
                  </div>
                </div>
                <div>
                  <button onClick={() => navigate(`/candidates/${c.employeeId}`)} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Xem chi tiết</button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 bg-yellow-50 rounded text-sm text-slate-700">Chức năng xem ứng viên chỉ dành cho nhà tuyển dụng gói nâng cấp. Vui lòng nâng cấp để truy cập danh sách ứng viên.</div>
          )
        )}
      </div>
    </section>
  );
}
