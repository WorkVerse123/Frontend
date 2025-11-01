import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SubscriptionCard from '../employee/SubscriptionCard';
import { useAuth } from '../../contexts/AuthContext';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../common/loading/Loading';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet, post as apiPost } from '../../services/ApiClient';
import { handleAsync } from '../../utils/HandleAPIResponse';

// Render employer plans but only those whose numeric `type === 2`.
export default function EmployerSubscriptionPlans({ apiUrl = null, onSelect = () => {} }) {
  const { plans, loading, error } = useSubscriptionPlans(apiUrl);
  const { user, setUser } = useAuth();
  const userIsPremium = (() => {
    try {
      const raw = user?.IsPremium ?? user?._raw?.IsPremium ?? user?.isPremium ?? user?.is_premium ?? user?.Is_Premium ?? user?.isPremiumFlag;
      if (raw === true) return true;
      if (typeof raw === 'string') return String(raw).toLowerCase() === 'true';
      return Boolean(raw);
    } catch (e) {
      return false;
    }
  })();
  const [activePlanId, setActivePlanId] = useState(null);

  // load current user's subscription (if available) to determine which exact plan is active
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) return;
        const uid = user.profileId ?? user.employerId ?? user.userId ?? user.id ?? null;
        if (!uid) return;
        const { get: apiGet } = await import('../../services/ApiClient');
        const res = await apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(uid));
        if (!mounted || !res) return;
        // attempt to find active plan id in response
        const raw = res?.data ?? res ?? {};
        // common shapes: { planId: X }, { data: { planId: X } }, { subscription: { planId: X } }
        const candidate = raw.planId ?? raw.data?.planId ?? raw.subscription?.planId ?? raw.data?.subscription?.planId ?? raw.plan?.planId ?? null;
        if (candidate) setActivePlanId(Number(candidate));
      } catch (err) {
        // ignore — keep null
      }
    })();
    return () => { mounted = false; };
  }, [user]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('confirm'); // 'confirm' | 'processing' | 'success' | 'failed' | 'pending'
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');

  // when payment finishes successfully, show a short success UI then close modal
  useEffect(() => {
    if (paymentStep === 'success') {
      try {
        // optimistically mark the selected plan as active locally
        if (selectedPlan) {
          const p = Number(selectedPlan.planId ?? selectedPlan.id ?? 0);
          if (Number.isFinite(p) && p > 0) setActivePlanId(p);
        }
      } catch (e) {}
      const t = setTimeout(() => {
        try { closePaymentModal(); } catch (e) {}
      }, 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [paymentStep]);

  // payment message listener: must be registered unconditionally (hooks order must remain stable)
  useEffect(() => {
    function onMessage(e) {
      try {
        const host = window.location.host;
        if (!e?.origin || !e.origin.endsWith(host)) return;
        const data = e.data || {};
              if (data?.type === 'payment:completed') {
                (async () => {
                  try {
                    setPaymentStep('processing');
                    const uid = Number(localStorage.getItem('resolvedUserId') || user?.profileId || user?.employerId || user?.userId || user?.id || 0);
                    const pid = Number(selectedPlan?.planId ?? data?.planId ?? 0);
                    if (!Number.isFinite(uid) || uid <= 0) {
                      setPaymentStep('pending');
                      return;
                    }
                    if (!Number.isFinite(pid) || pid <= 0) {
                      setPaymentStep('pending');
                      return;
                    }
                    // call register endpoint
                    const params = [`userId=${encodeURIComponent(uid)}`, `planId=${encodeURIComponent(pid)}`];
                    const registerUrl = `${ApiEndpoints.SUBSCRIPTION_REGISTER}?${params.join('&')}`;
                    const regRes = await handleAsync(apiPost(registerUrl, {}));
                    // mark success
                    setPaymentStep('success');
                    // update auth user in-memory and cookie so UI reflects premium immediately
                    try {
                      if (setUser) {
                        const updated = { ...(user || {}), IsPremium: true, isPremium: true };
                        setUser(updated);
                        try {
                          const { setCookie } = await import('../../services/AuthCookie');
                          setCookie('user', JSON.stringify(updated), 30);
                        } catch (e) {}
                      }
                    } catch (e) {}
                    // update auth user in-memory and cookie so UI reflects premium immediately
                    try {
                      if (setUser) {
                        const updated = { ...(user || {}), IsPremium: true, isPremium: true };
                        setUser(updated);
                        // persist user cookie for future reloads
                        try {
                          const { setCookie } = await import('../../services/AuthCookie');
                          setCookie('user', JSON.stringify(updated), 30);
                        } catch (e) {
                          // ignore cookie set failures
                        }
                      }
                    } catch (e) {
                      // ignore
                    }
                  } catch (err) {
                    setPaymentStep('pending');
                  }
                })();
              }
        if (data?.type === 'payment:cancel') {
          setPaymentStep('failed');
        }
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [selectedPlan]);

  // fallback demo plans
  const employerMock = [
    { planId: 1, planName: 'Free', type: 1, description: 'Gói miễn phí', price: 0, durationDays: 30, features: 'Basic features' },
    { planId: 2, planName: 'Basic', type: 1, description: 'Gói cơ bản', price: 50, durationDays: 30, features: 'Apply filters;Priority listing' },
    { planId: 3, planName: 'Pro', type: 2, description: 'Gói chuyên nghiệp', price: 200, durationDays: 90, features: 'Premium support;Highlighted' },
    { planId: 6, planName: 'SMB', type: 2, description: 'Gói cho doanh nghiệp nhỏ', price: 300, durationDays: 180, features: 'Advanced reports' },
  ];

  if (loading) return <Loading />;
  if (error) return (<div className="w-full text-center py-8"><div className="text-red-600 mb-2">Có lỗi: {error}</div><Button onClick={() => window.location.reload()}>Tải lại</Button></div>);

  // support multiple shapes: direct array, { data: [...] }, or { plans: [...] }
  const rawList = Array.isArray(plans) ? plans : (plans && Array.isArray(plans.data) ? plans.data : (plans && Array.isArray(plans.plans) ? plans.plans : []));
  const baseList = rawList && rawList.length ? rawList : employerMock;

  // normalize to the SubscriptionCard shape
  const normalizePlan = (p) => {
    const planObj = p || {};
    const id = planObj.planId ?? planObj.id ?? String(planObj.planName ?? planObj.name ?? 'plan').toLowerCase().replace(/\s+/g, '_');
    const name = planObj.planName ?? planObj.name ?? planObj.plan_name ?? planObj.description ?? 'Gói';
    // coerce price: accept numbers or strings like '10.000 US$' or '200 US$'
    let rawPrice = planObj.price ?? planObj.amount ?? 0;
    let price = 0;
    if (typeof rawPrice === 'number') price = rawPrice;
    else if (typeof rawPrice === 'string') {
      // remove non-digit, non-dot, non-comma characters (currency labels)
      const cleaned = rawPrice.replace(/[^0-9.,\-]/g, '').trim();
      // replace dot thousand separators with empty and comma decimal with dot if present
      const normalized = cleaned.indexOf(',') > -1 && cleaned.indexOf('.') > -1
        ? cleaned.replace(/\./g, '').replace(/,/g, '.')
        : cleaned.replace(/\./g, '');
      const n = Number(normalized);
      price = Number.isNaN(n) ? 0 : n;
    } else {
      price = Number(rawPrice) || 0;
    }
  // Force display currency to VND (backend may return varied currency labels like 'US$')
  const currency = 'VND';
    const duration = planObj.durationDays ?? planObj.duration ?? null;
    const period = duration ? (duration === 30 ? ' / tháng' : ` / ${duration} ngày`) : (planObj.period ?? ' / tháng');
    const features = planObj.features ?? planObj.featureList ?? planObj.description ?? '';
    // derive numeric type when possible: prefer explicit numeric field, then _raw.type, or map string type
    let typeNum = null;
    if (typeof planObj.type === 'number') typeNum = planObj.type;
    else if (planObj._raw && typeof planObj._raw.type === 'number') typeNum = planObj._raw.type;
    else if (typeof planObj.type === 'string') {
      const t = String(planObj.type).toLowerCase();
      if (t === 'premium') typeNum = 2;
      else if (t === 'basic' || t === '1') typeNum = 1;
    }
    const type = typeNum === 2 ? 'premium' : (planObj.typeName ?? planObj.planType ?? (String(name).toLowerCase().includes('pro') ? 'premium' : 'standard'));
    return { id, planId: planObj.planId ?? id, planName: planObj.planName ?? name, name, price, currency, period, features, description: planObj.description ?? '', durationDays: duration ?? 0, type, typeNum };
  };

  const normalized = baseList.map(normalizePlan);

  // Only show plans with numeric type === 2
  const filtered = normalized.filter(p => Number(p.typeNum) === 2);

  // payment helpers (simplified and adapted from SubscriptionPanel)

  async function handlePayment() {
    if (!selectedPlan) return;
    setPaymentLoading(true);
    setPaymentStep('processing');
    setPaymentErrorMsg('');
    try {
      const pid = Number(selectedPlan.planId ?? 0);
      const popup = window.open('', '_blank', 'width=900,height=700');
      if (!popup) throw new Error('Không thể mở cửa sổ thanh toán. Vui lòng cho phép popup.');
      try { popup.document.write('<html><head><title>Thanh toán</title></head><body style="font-family: Arial, sans-serif; display:flex;align-items:center;justify-content:center;height:100vh;"></body></html>'); popup.document.close(); } catch (e) {}

      const paymentIntentData = {
        planId: pid,
        planName: selectedPlan.planName ?? selectedPlan.name ?? '',
        type: Number(selectedPlan.typeNum ?? selectedPlan.type ?? 0) || 0,
        description: selectedPlan.description ?? '',
        price: Number(selectedPlan.price ?? 0) || 0,
        durationDays: Number(selectedPlan.duration ?? selectedPlan.durationDays ?? 0) || 0,
        features: Array.isArray(selectedPlan.features) 
          ? selectedPlan.features.join(';') 
          : String(selectedPlan.features ?? '')
      };

  const paymentRes = await handleAsync(apiPost(ApiEndpoints.PAYMENT_INTENT, paymentIntentData));
  const paymentData = paymentRes?.data ?? paymentRes;
      if (!paymentData || paymentData.success === false) {
        const errMsg = paymentData?.message || 'Tạo liên kết thanh toán thất bại';
        setPaymentErrorMsg(errMsg);
        try { if (!popup.closed) popup.document.body.innerHTML = `<div style="font-family:Arial,sans-serif;padding:24px;text-align:center;"><h3 style=\"color:#c53030;\">Lỗi tạo liên kết thanh toán</h3><p>${errMsg}</p></div>`; } catch (e) {}
        throw new Error(errMsg);
      }

      const checkoutUrl = paymentData?.data?.checkoutUrl ?? paymentData?.checkoutUrl ?? null;
  const serverPaymentId = paymentData?.data?.paymentId ?? paymentData?.data?.id ?? paymentData?.paymentId ?? paymentData?.id ?? null;
      if (!checkoutUrl) {
        const errMsg = 'Không tìm thấy checkoutUrl từ máy chủ.';
        setPaymentErrorMsg(errMsg);
        try { if (!popup.closed) popup.document.body.innerHTML = `<div style="font-family:Arial,sans-serif;padding:24px;text-align:center;"><h3 style=\"color:#c53030;\">Lỗi phản hồi từ máy chủ</h3><p>${errMsg}</p><pre style=\"text-align:left;white-space:pre-wrap;max-height:200px;overflow:auto;border:1px solid #eee;padding:8px;margin-top:8px;\">${JSON.stringify(paymentData, null, 2)}</pre></div>`; } catch (e) {}
        throw new Error(errMsg);
      }

      try { popup.location.href = checkoutUrl; try { popup.focus(); } catch (e) {} } catch (e) { try { popup.location = checkoutUrl; } catch (err) { try { if (!popup.closed) popup.close(); } catch (ee) {} throw new Error('Không thể điều hướng tới cổng thanh toán.'); } }
      // start a short polling as fallback in case postMessage from payment provider is not delivered
      if (serverPaymentId) {
        let attempts = 0;
        const maxAttempts = 60; // poll up to ~2 minutes (60 * 2s)
        const pollInterval = 2000;
        const poller = setInterval(async () => {
          attempts += 1;
          try {
            const statusRes = await handleAsync(apiGet(ApiEndpoints.PAYMENT(serverPaymentId)));
            const statusData = statusRes?.data ?? statusRes;
            const state = (statusData && (statusData.status ?? statusData.state ?? statusData.paymentStatus)) || (statusData?.data && (statusData.data.status ?? statusData.data.state));
            const s = state ? String(state).toLowerCase() : null;
            if (s === 'completed' || s === 'success' || s === 'paid') {
              clearInterval(poller);
              try { if (!popup.closed) popup.close(); } catch (e) {}
              // call subscription register to finalize on server and update local user
              try {
                const uid = Number(localStorage.getItem('resolvedUserId') || user?.profileId || user?.employerId || user?.userId || user?.id || 0);
                const pidLocal = Number(pid || selectedPlan?.planId || 0);
                if (Number.isFinite(uid) && uid > 0 && Number.isFinite(pidLocal) && pidLocal > 0) {
                  const params = [`userId=${encodeURIComponent(uid)}`, `planId=${encodeURIComponent(pidLocal)}`];
                  const registerUrl = `${ApiEndpoints.SUBSCRIPTION_REGISTER}?${params.join('&')}`;
                  await handleAsync(apiPost(registerUrl, {}));
                  // update user in-memory and cookie
                  try {
                    if (setUser) {
                      const updated = { ...(user || {}), IsPremium: true, isPremium: true };
                      setUser(updated);
                      try { const { setCookie } = await import('../../services/AuthCookie'); setCookie('user', JSON.stringify(updated), 30); } catch (e) {}
                    }
                  } catch (e) {}
                }
              } catch (err) {
                // ignore register errors — still mark success client-side
              }
              setPaymentStep('success');
              return;
            }
            if (s === 'failed' || s === 'cancelled' || s === 'canceled') {
              clearInterval(poller);
              try { if (!popup.closed) popup.close(); } catch (e) {}
              setPaymentStep('failed');
              return;
            }
          } catch (err) {
            // ignore transient errors
          }
          if (attempts >= maxAttempts) {
            clearInterval(poller);
            // give up polling — leave popup open for user and mark pending
            setPaymentStep('pending');
          }
        }, pollInterval);
      }
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Lỗi khi xử lý thanh toán.';
      setPaymentErrorMsg(msg);
      setPaymentStep('failed');
    } finally {
      setPaymentLoading(false);
    }
  }

  function openPaymentModal(plan) {
    setSelectedPlan(plan);
    setPaymentStep('confirm');
    setPaymentModal(true);
  }

  function closePaymentModal() {
    setPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStep('confirm');
    setPaymentLoading(false);
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {filtered.length === 0 ? (
        <div className="w-full text-center text-gray-600 py-8">Không có gói cho loại này.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-stretch">
          {filtered.map(plan => (
            <div key={plan.id} className="w-full">
              <SubscriptionCard
                plan={plan}
                highlighted={plan.type === 'premium' || (plan.id && String(plan.id).includes('premium'))}
                // prefer exact activePlanId from server when available, otherwise fall back to userIsPremium
                isActive={activePlanId ? Number(plan.planId ?? plan.id) === Number(activePlanId) : (userIsPremium && (Number(plan.typeNum) === 2 || String(plan.type).toLowerCase() === 'premium'))}
                onManage={() => {}}
                onSelect={(p) => openPaymentModal(p)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Payment confirmation dialog */}
      <Dialog open={paymentModal} onClose={(e, reason) => { if (reason === 'backdropClick' || reason === 'escapeKeyDown') return; closePaymentModal(); }} maxWidth="sm" fullWidth disableEscapeKeyDown>
        <DialogTitle className="text-center">
          {paymentStep === 'confirm' && 'Xác nhận thanh toán'}
          {paymentStep === 'processing' && 'Đang xử lý thanh toán...'}
          {paymentStep === 'success' && 'Thanh toán thành công!'}
          {paymentStep === 'failed' && 'Thanh toán thất bại'}
        </DialogTitle>
        <DialogContent>
          {paymentStep === 'confirm' && selectedPlan && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Gói đăng ký:</span>
                  <span>{selectedPlan.planName ?? selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Thời hạn:</span>
                  <span>{selectedPlan.durationDays ?? selectedPlan.duration ?? ''} ngày</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-blue-600">{formatPrice(selectedPlan.price ?? 0, selectedPlan.currency ?? 'VND')}</span>
                </div>
              </div>
            </div>
          )}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <CircularProgress size={48} className="mb-4" />
              <p className="text-gray-600">Đang xử lý thanh toán của bạn...</p>
            </div>
          )}
          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.414 7.414a1 1 0 01-1.414 0L3.293 9.414a1 1 0 011.414-1.414L8 11.293l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-green-700 font-semibold">Thanh toán thành công! Cảm ơn bạn.</p>
              <p className="text-gray-600 text-sm mt-2">Đang cập nhật trạng thái, cửa sổ sẽ đóng tự động.</p>
            </div>
          )}
          {paymentStep === 'failed' && (
            <div className="text-center text-red-600 py-6">{paymentErrorMsg || 'Lỗi khi xử lý thanh toán.'}</div>
          )}
        </DialogContent>
        <DialogActions>
          {paymentStep === 'confirm' && (
            <>
              <Button onClick={closePaymentModal}>Hủy</Button>
              <Button onClick={() => handlePayment()} variant="contained" color="primary">Thanh toán</Button>
            </>
          )}
          {paymentStep === 'processing' && (
            <Button disabled>Đang xử lý...</Button>
          )}
          {paymentStep === 'failed' && (
            <Button onClick={closePaymentModal}>Đóng</Button>
          )}
          {paymentStep === 'success' && (
            <Button onClick={closePaymentModal}>Đóng</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

EmployerSubscriptionPlans.propTypes = {
  apiUrl: PropTypes.string,
  onSelect: PropTypes.func,
};
