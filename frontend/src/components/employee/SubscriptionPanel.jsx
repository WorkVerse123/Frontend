import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet, post as apiPost } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatPrice';

export default function SubscriptionPanel() {
  const { user } = useAuth();
  // Prefer explicit UserId from token (UserId / userId), fallback to other ids
  const userId = user?.UserId || user?.userId || user?.id || user?.profileId || user?.employeeId || user?.employerId || user?.user_id || null;
  const userRole = user?.role || user?.roleId || null; // 'employee' | 'employer' | 'admin' | 'staff' | 'guest'

  // local notification state (replace alert())
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifySeverity, setNotifySeverity] = useState('info');
  const showNotify = (msg, severity = 'info') => {
    setNotifyMsg(msg);
    setNotifySeverity(severity);
    setNotifyOpen(true);
  };

  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // helper: normalize plan object shapes
  const normalizePlan = (x) => {
    if (!x || typeof x !== 'object') return x;
    const planId = Number(x.planId ?? x.id ?? x.plan_id ?? x.PlanId ?? x.Id ?? x.ID ?? 0) || 0;
    return {
      planId,
      planName: x.planName ?? x.name ?? x.plan_name ?? x.PlanName ?? '',
      type: Number(x.type ?? x.planType ?? x.t ?? 0) || 0,
      description: x.description ?? x.desc ?? x.note ?? '',
      price: Number(x.price ?? x.amount ?? 0) || 0,
      durationDays: Number(x.durationDays ?? x.duration_days ?? x.duration ?? 0) || 0,
      features: x.features ?? x.featureHtml ?? x.featuresHtml ?? x.html ?? '',
      _raw: x,
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const pRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS));
        const pParsed = pRes?.data ?? pRes;
        if (!mounted) return;
  const allPlans = Array.isArray(pParsed?.data) ? pParsed.data : (pParsed || []);
  const normalizedPlans = Array.isArray(allPlans) ? allPlans.map(normalizePlan) : [];
  // eslint-disable-next-line no-console
  console.debug('Fetched subscription plans (normalized):', normalizedPlans);
  setPlans(normalizedPlans);

        if (userId) {
          const uRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(userId)));
          const uParsed = uRes?.data ?? uRes;
          if (!mounted) return;
          const cp = uParsed?.data ?? uParsed ?? null;
          const normalizedCp = cp ? normalizePlan(cp) : null;
          // eslint-disable-next-line no-console
          console.debug('Fetched current plan (normalized):', normalizedCp);
          setCurrentPlan(normalizedCp);
          // ensure plans list contains the current plan so UI can show 'Đang sử dụng'
          if (normalizedCp && normalizedCp.planId) {
            setPlans(prev => {
              if (Array.isArray(prev) && prev.some(p => Number(p.planId) === Number(normalizedCp.planId))) return prev;
              return [normalizedCp, ...(prev || [])];
            });
          }
        }
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  async function handleSubscribe(plan) {
    if (!userId) {
      // user not resolved yet - show friendly UI message instead of alert
      showNotify('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại hoặc thử tải lại trang.', 'warning');
      // also log for debugging
      // eslint-disable-next-line no-console
      console.warn('Subscription attempted but no userId resolved for user:', user);
      return;
    }

    // Payment flow placeholder: in real app integrate payment SDK (Stripe/PayPal)
  const confirmPay = window.confirm(`Thanh toán ${formatPrice(plan.price, 'VND')} cho gói ${plan.planName}?`);
    if (!confirmPay) return;

    try {
      // Simulate a payment success, then register subscription
  const uid = Number(userId);
      const pid = Number(plan.planId ?? plan.planId);
      if (!Number.isFinite(uid) || uid <= 0) {
        showNotify('userId không hợp lệ để đăng ký gói.', 'error');
        console.warn('Invalid userId when subscribing:', userId);
        return;
      }
      if (!Number.isFinite(pid) || pid <= 0) {
        showNotify('planId không hợp lệ.', 'error');
        console.warn('Invalid planId when subscribing:', plan);
        return;
      }
      // Server expects params in query string (e.g. /register?userId=31&planId=13)
      // Build query URL and POST an empty body (backend will read query params)
      const registerUrl = `${ApiEndpoints.SUBSCRIPTION_REGISTER}?userId=${encodeURIComponent(uid)}&planId=${encodeURIComponent(pid)}`;
      // If you need to include employee/employer ids in query as well, we can append them here.
      const empId = Number(user?.employeeId ?? user?.EmployeeId ?? user?.profileId ?? null);
      const emplrId = Number(user?.employerId ?? user?.EmployerId ?? null);
      const params = [];
      if (Number.isFinite(empId) && empId > 0) params.push(`employeeId=${encodeURIComponent(empId)}`);
      if (Number.isFinite(emplrId) && emplrId > 0) params.push(`employerId=${encodeURIComponent(emplrId)}`);
      const finalUrl = params.length ? registerUrl + '&' + params.join('&') : registerUrl;
      const res = await handleAsync(apiPost(finalUrl, {}));
      const parsed = res?.data ?? res;
      if (res && res.success === false) throw new Error(res.message || 'Đăng ký thất bại');
  // Refresh current plan (use numeric uid)
  const uRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(uid)));
      const uParsed = uRes?.data ?? uRes;
      const refreshed = uParsed?.data ?? uParsed ?? null;
      const normalizedRef = refreshed ? normalizePlan(refreshed) : null;
      setCurrentPlan(normalizedRef);
      if (normalizedRef && normalizedRef.planId) {
        setPlans(prev => {
          if (Array.isArray(prev) && prev.some(p => Number(p.planId) === Number(normalizedRef.planId))) return prev;
          return [normalizedRef, ...(prev || [])];
        });
      }
      showNotify('Đăng ký thành công', 'success');
    } catch (err) {
      console.error('Subscription error', err);
      showNotify('Đăng ký thất bại: ' + String(err?.message || err), 'error');
    }
  }

  if (loading) return <div>Đang tải gói đăng ký...</div>;
  if (error) return <div className="text-red-600">Lỗi khi tải gói: {String(error)}</div>;

  return (
    <div className="space-y-4">
      {/* Debug banner: logged-in user but profile id not resolved */}
      {user && !userId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800">
          Bạn đang đăng nhập nhưng hệ thống chưa tìm thấy profileId trong token/cookie. Vui lòng đăng xuất và đăng nhập lại nếu vấn đề vẫn xảy ra.
          <div className="mt-2 text-xs text-gray-600">Thông tin user (debug): <code>{JSON.stringify(user)}</code></div>
        </div>
      )}
      <h3 className="text-xl font-semibold">Gói đăng ký</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans
          // Filter plans by type according to current user role: 1=employee, 2=employer
          .filter(p => {
            if (!userRole) return true;
            if (String(userRole).toLowerCase() === 'employee') return Number(p.type) === 1;
            if (String(userRole).toLowerCase() === 'employer') return Number(p.type) === 2;
            return true;
          })
          .map((p) => (
          <div key={p.planId} className={`border rounded p-4 ${currentPlan && currentPlan.planId === p.planId ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.planName}</div>
                <div className="text-sm text-gray-600">{p.description}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{formatPrice(p.price, 'VND')}</div>
                <div className="text-sm text-gray-500">{p.durationDays} ngày</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: p.features }} />
            <div className="mt-4">
              {Number(currentPlan?.planId) === Number(p.planId) ? (
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled>Đang sử dụng</button>
              ) : (
                <button onClick={() => handleSubscribe(p)} className="px-4 py-2 bg-blue-600 text-white rounded">Đăng ký</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Snackbar open={notifyOpen} autoHideDuration={4000} onClose={() => setNotifyOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotifyOpen(false)} severity={notifySeverity} sx={{ width: '100%' }}>
          {notifyMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

