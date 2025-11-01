import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import useSubscriptionPlans from '../../hooks/useSubscriptionPlans';
import SubscriptionCard from './SubscriptionCard';
import Loading from '../common/loading/Loading';
import InlineLoader from '../common/loading/InlineLoader';
import { handleAsync } from '../../utils/HandleAPIResponse';
import ApiEndpoints from '../../services/ApiEndpoints';
import { get as apiGet, post as apiPost } from '../../services/ApiClient';
import { useAuth } from '../../contexts/AuthContext';


export default function SubscriptionPlans({ apiUrl = null, onSelect = () => {} }) {
  const { plans, loading, error } = useSubscriptionPlans(apiUrl);
  const { user, setUser } = useAuth();
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentStep, setPaymentStep] = useState('confirm');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');

  // message listener to handle postMessage from payment popup
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
              const uid = Number(localStorage.getItem('resolvedUserId') || 0);
              const pid = Number(selectedPlan?.planId ?? data?.planId ?? 0);
              if (!Number.isFinite(uid) || uid <= 0) {
                setPaymentStep('pending');
                return;
              }
              if (!Number.isFinite(pid) || pid <= 0) {
                setPaymentStep('pending');
                return;
              }
              const params = [`userId=${encodeURIComponent(uid)}`, `planId=${encodeURIComponent(pid)}`];
              const registerUrl = `${ApiEndpoints.SUBSCRIPTION_REGISTER}?${params.join('&')}`;
              const regRes = await handleAsync(apiPost(registerUrl, {}));
              setPaymentStep('success');
              // update AuthContext and cookie
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
            } catch (err) {
              setPaymentStep('pending');
            }
          })();
        }
        if (data?.type === 'payment:cancel') setPaymentStep('failed');
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [selectedPlan, setUser, user]);


  if (loading) return <InlineLoader />;

  if (error) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-red-600 mb-2">Có lỗi: {error}</div>
        <Button onClick={() => window.location.reload()}>Tải lại</Button>
      </div>
    );
  }

  // demo: activePlanId could come from API/user subscription; hardcode null for now
  const activePlanId = null; // set to 'premium' or plan.id to demo active state
  // normalize plans to an array to avoid runtime errors when API returns an object
  const planList = Array.isArray(plans) ? plans : (plans && Array.isArray(plans.plans) ? plans.plans : []);

  if (!planList || planList.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-600">Chưa có gói đăng ký nào.</div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center">
        {planList.map(plan => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            highlighted={plan.id === 'premium' || plan.type === 'premium'}
            isActive={false}
            onManage={(p) => { /* debug removed */ }}
            onSelect={(p) => {
              // open payment for selected employee plan
              setSelectedPlan(p);
              setPaymentStep('confirm');
              // create payment immediately
              (async () => {
                try {
                  setPaymentLoading(true);
                  const pid = Number(p.planId ?? p.id ?? 0);
                  const paymentIntentData = {
                    planId: pid,
                    planName: p.planName ?? p.name ?? '',
                    type: Number(p.typeNum ?? p.type ?? 0) || 0,
                    description: p.description ?? '',
                    price: Number(p.price ?? 0) || 0,
                    durationDays: Number(p.durationDays ?? p.duration ?? 0) || 0,
                    features: Array.isArray(p.features) ? p.features.join(';') : String(p.features ?? '')
                  };
                  const paymentRes = await handleAsync(apiPost(ApiEndpoints.PAYMENT_INTENT, paymentIntentData));
                  const paymentData = paymentRes?.data ?? paymentRes;
                  if (!paymentData || paymentData.success === false) {
                    throw new Error(paymentData?.message || 'Tạo liên kết thanh toán thất bại');
                  }
                  const checkoutUrl = paymentData?.data?.checkoutUrl ?? paymentData?.checkoutUrl ?? null;
                  const serverPaymentId = paymentData?.data?.paymentId ?? paymentData?.data?.id ?? paymentData?.paymentId ?? paymentData?.id ?? null;
                  const popup = window.open('', '_blank', 'width=900,height=700');
                  if (!popup) throw new Error('Không thể mở cửa sổ thanh toán. Vui lòng cho phép popup.');
                  try { popup.document.write('<html><head><title>Thanh toán</title></head><body style="font-family: Arial, sans-serif; display:flex;align-items:center;justify-content:center;height:100vh;"></body></html>'); popup.document.close(); } catch (e) {}
                  try { popup.location.href = checkoutUrl; try { popup.focus(); } catch (e) {} } catch (e) { try { popup.location = checkoutUrl; } catch (err) { try { if (!popup.closed) popup.close(); } catch (ee) {} throw new Error('Không thể điều hướng tới cổng thanh toán.'); } }
                  // polling fallback
                  if (serverPaymentId) {
                    let attempts = 0;
                    const maxAttempts = 60;
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
                          setPaymentStep('success');
                          // also update user
                          try {
                            if (setUser) {
                              const updated = { ...(user || {}), IsPremium: true, isPremium: true };
                              setUser(updated);
                              const { setCookie } = await import('../../services/AuthCookie');
                              setCookie('user', JSON.stringify(updated), 30);
                            }
                          } catch (e) {}
                          return;
                        }
                        if (s === 'failed' || s === 'cancelled' || s === 'canceled') {
                          clearInterval(poller);
                          try { if (!popup.closed) popup.close(); } catch (e) {}
                          setPaymentStep('failed');
                          return;
                        }
                      } catch (err) {}
                      if (attempts >= maxAttempts) {
                        clearInterval(poller);
                        setPaymentStep('pending');
                      }
                    }, pollInterval);
                  }
                } catch (err) {
                  setPaymentErrorMsg(err?.message || 'Lỗi tạo thanh toán');
                  setPaymentStep('failed');
                } finally {
                  setPaymentLoading(false);
                }
              })();
            }}
          />
        ))}
      </div>
    </div>
  );
}

SubscriptionPlans.propTypes = {
  apiUrl: PropTypes.string,
  onSelect: PropTypes.func,
};
