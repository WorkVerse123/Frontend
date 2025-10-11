import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
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

  // Payment modal states
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('confirm'); // 'confirm' | 'processing' | 'success' | 'failed'
  // possible new step: 'pending' = transaction created, waiting for webhook/callback
  const [paymentErrorMsg, setPaymentErrorMsg] = useState('');

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
  // debug removed
  setPlans(normalizedPlans);

        if (userId) {
          const uRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(userId)));
          const uParsed = uRes?.data ?? uRes;
          if (!mounted) return;
          const cp = uParsed?.data ?? uParsed ?? null;
          const normalizedCp = cp ? normalizePlan(cp) : null;
          // eslint-disable-next-line no-console
          // debug removed
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

  // Listen for messages from payment popup (when redirect returns to frontend)
  useEffect(() => {
    function onMessage(e) {
      try {
        // Accept messages coming from the same host (allows http/https mismatch during local dev)
        const host = window.location.host; // includes port
        if (!e?.origin || !e.origin.endsWith(host)) {
          // eslint-disable-next-line no-console
          // debug removed
          return;
        }
        const data = e.data || {};
        // debug
        // eslint-disable-next-line no-console
  // debug removed
        if (data?.type === 'payment:completed') {
          // When payment completes, call subscription register endpoint to activate the plan
          (async () => {
            try {
              // set processing and inform user
              setPaymentStep('processing');
              showNotify('Nhận callback từ cổng thanh toán. Đang xác nhận...', 'info');
              const uid = Number(userId);
              const pid = Number(selectedPlan?.planId ?? data?.planId ?? 0);
              const orderCode = data?.orderCode ?? data?.order_code ?? null;
              // debug
              // eslint-disable-next-line no-console
              // debug removed
              if (!Number.isFinite(uid) || uid <= 0) {
                showNotify('Không tìm thấy userId để kích hoạt gói. Vui lòng thử lại.', 'error');
                setPaymentStep('pending');
                return;
              }
              if (!Number.isFinite(pid) || pid <= 0) {
                // if no plan id available, mark pending and let user retry/check
                showNotify('Thanh toán thành công nhưng không xác định được gói. Vui lòng kiểm tra lại.', 'warning');
                setPaymentStep('pending');
                return;
              }
              const registered = await registerSubscription(uid, pid);
              if (registered) {
                showNotify('Thanh toán thành công', 'success');
                setPaymentStep('success');
              } else {
                // don't mark outright failed: may require webhook processing; set pending so user can 'Kiểm tra lại'
                showNotify('Thanh toán đã hoàn tất nhưng kích hoạt gói chưa xác nhận. Vui lòng kiểm tra lại sau.', 'info');
                setPaymentStep('pending');
                // eslint-disable-next-line no-console
                // debug removed
              }
            } catch (err) {
              // eslint-disable-next-line no-console
              // debug removed
              showNotify('Lỗi khi xử lý callback thanh toán. Vui lòng thử lại.', 'error');
              setPaymentStep('pending');
            }
          })();
        }
        if (data?.type === 'payment:cancel') {
          setPaymentStep('failed');
          showNotify('Thanh toán bị hủy', 'info');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error handling payment postMessage', err);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [userId]);

  // Helper: call SUBSCRIPTION_REGISTER to activate subscription on backend after successful payment
  async function registerSubscription(uid, pid) {
    try {
      const empId = Number(user?.employeeId ?? user?.EmployeeId ?? user?.profileId ?? null);
      const emplrId = Number(user?.employerId ?? user?.EmployerId ?? null);
      const params = [`userId=${encodeURIComponent(uid)}`, `planId=${encodeURIComponent(pid)}`];
      if (Number.isFinite(empId) && empId > 0) params.push(`employeeId=${encodeURIComponent(empId)}`);
      if (Number.isFinite(emplrId) && emplrId > 0) params.push(`employerId=${encodeURIComponent(emplrId)}`);
      const registerUrl = `${ApiEndpoints.SUBSCRIPTION_REGISTER}?${params.join('&')}`;
      const subscriptionRes = await handleAsync(apiPost(registerUrl, {}));
      if (subscriptionRes && subscriptionRes.success === false) {
        // eslint-disable-next-line no-console
        console.warn('Subscription register failed', subscriptionRes);
        return false;
      }

      // refresh current plan
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
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('registerSubscription error', err);
      return false;
    }
  }

  // Open payment modal
  function handleSubscribe(plan) {
    if (!userId) {
      showNotify('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại hoặc thử tải lại trang.', 'warning');
      console.warn('Subscription attempted but no userId resolved for user:', user);
      return;
    }
    setSelectedPlan(plan);
    setPaymentStep('confirm');
    setPaymentModal(true);
  }

  // Handle payment process
  async function handlePayment() {
    if (!selectedPlan || !userId) return;

  setPaymentLoading(true);
  setPaymentStep('processing');
  setPaymentErrorMsg('');

    try {
      const uid = Number(userId);
      const pid = Number(selectedPlan.planId);
      
      if (!Number.isFinite(uid) || uid <= 0) {
        throw new Error('userId không hợp lệ để đăng ký gói.');
      }
      if (!Number.isFinite(pid) || pid <= 0) {
        throw new Error('planId không hợp lệ.');
      }

      // Open a placeholder popup synchronously to avoid browser popup blockers
      const popup = window.open('', '_blank', 'width=900,height=700');
      if (!popup) {
        throw new Error('Không thể mở cửa sổ thanh toán. Vui lòng cho phép popup cho trang này.');
      }
      // write a simple loading state into the popup
      try {
        popup.document.write('<html><head><title>Thanh toán</title></head><body style="font-family: Arial, sans-serif; display:flex;align-items:center;justify-content:center;height:100vh;"><div style="text-align:center;"><h3>Đang chuyển tới cổng thanh toán...</h3><p>Vui lòng chờ trong giây lát.</p></div></body></html>');
        popup.document.close();
        try { popup.focus(); } catch (e) {}
      } catch (e) {
        // ignore write errors for cross-origin restrictions
      }

      // Step 1: Create payment intent
      // Backend expects the full plan shape (SubscriptionPlanDTORequest)
      const paymentIntentData = {
        planId: pid,
        planName: selectedPlan.planName ?? '',
        type: Number(selectedPlan.type ?? 0) || 0,
        description: selectedPlan.description ?? '',
        price: Number(selectedPlan.price ?? 0) || 0,
        durationDays: Number(selectedPlan.durationDays ?? 0) || 0,
        features: selectedPlan.features ?? ''
      };

      const paymentRes = await handleAsync(apiPost(ApiEndpoints.PAYMENT_INTENT, paymentIntentData));
      const paymentData = paymentRes?.data ?? paymentRes;

      // Debug log the full response so we can inspect shapes in runtime
      // eslint-disable-next-line no-console
      console.debug('paymentRes', paymentRes, 'paymentData', paymentData);

      if (!paymentData || paymentData.success === false) {
        const errMsg = paymentData?.message || 'Tạo liên kết thanh toán thất bại';
        // expose error message to modal
        setPaymentErrorMsg(errMsg);
        // show error page inside popup so user sees reason
        try {
          if (!popup.closed) {
            popup.document.body.innerHTML = `<div style="font-family:Arial,sans-serif;padding:24px;text-align:center;"><h3 style=\"color:#c53030;\">Lỗi tạo liên kết thanh toán</h3><p>${errMsg}</p></div>`;
          }
        } catch (e) {
          // ignore cross-origin write errors
        }
        throw new Error(errMsg);
      }

      // Try to extract checkoutUrl from various possible shapes
      const checkoutUrl = paymentData?.data?.checkoutUrl ?? paymentData?.checkoutUrl ?? paymentData?.data?.data?.checkoutUrl ?? null;
      if (!checkoutUrl) {
        const errMsg = 'Không tìm thấy checkoutUrl từ máy chủ.';
        setPaymentErrorMsg(errMsg);
        try {
          if (!popup.closed) {
            popup.document.body.innerHTML = `<div style="font-family:Arial,sans-serif;padding:24px;text-align:center;"><h3 style=\"color:#c53030;\">Lỗi phản hồi từ máy chủ</h3><p>${errMsg}</p><pre style=\"text-align:left;white-space:pre-wrap;max-height:200px;overflow:auto;border:1px solid #eee;padding:8px;margin-top:8px;\">${JSON.stringify(paymentData, null, 2)}</pre></div>`;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      // Navigate popup to hosted checkout
      try {
        popup.location.href = checkoutUrl;
        try { popup.focus(); } catch (e) {}
      } catch (e) {
        // some browsers may deny if cross-origin write, fallback to assign
        try { popup.location = checkoutUrl; } catch (err) {
          try { if (!popup.closed) popup.close(); } catch (ee) {}
          throw new Error('Không thể điều hướng tới cổng thanh toán.');
        }
      }

      // Polling: check user's subscription until it reflects the new plan
  const pollInterval = 2000; // ms
  const maxAttempts = 60; // ~2 minutes
      let attempts = 0;
      let finished = false;

      // helper to check subscription
      const checkSubscription = async () => {
        try {
          const uRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(uid)));
          const uParsed = uRes?.data ?? uRes;
          const refreshed = uParsed?.data ?? uParsed ?? null;
          const normalizedRef = refreshed ? normalizePlan(refreshed) : null;
          if (normalizedRef && Number(normalizedRef.planId) === Number(pid)) {
            // success
            setCurrentPlan(normalizedRef);
            setPlans(prev => {
              if (Array.isArray(prev) && prev.some(p => Number(p.planId) === Number(normalizedRef.planId))) return prev;
              return [normalizedRef, ...(prev || [])];
            });
            finished = true;
            setPaymentStep('success');
            if (!popup.closed) popup.close();
          }
        } catch (e) {
          // ignore polling errors
          // eslint-disable-next-line no-console
          console.debug('Poll subscription error', e);
        }
      };

      // Start polling loop
  while (!finished && attempts < maxAttempts) {
        // Debug: log attempts and popup status
        // eslint-disable-next-line no-console
        console.debug('Payment polling attempt', { attempts, popupClosed: popup.closed });
        // If popup closed by user before success -> treat as cancelled
        if (popup.closed) {
          // eslint-disable-next-line no-console
          console.debug('Popup closed during polling — will wait for callback/webhook instead of failing immediately');
          // don't break to allow final check below to set pending; break the loop so we stop polling attempts
          break;
        }
        await checkSubscription();
        if (finished) break;
        // wait
        // eslint-disable-next-line no-await-in-loop
        await new Promise(res => setTimeout(res, pollInterval));
        attempts += 1;
      }

      if (!finished) {
        // If popup was closed by the user during polling -> set pending (do not mark failed immediately)
        if (popup.closed) {
          // eslint-disable-next-line no-console
          console.debug('Popup closed: setting payment to pending and waiting for callback/webhook');
          setPaymentStep('pending');
          showNotify('Popup đã đóng. Hệ thống sẽ chờ callback từ cổng thanh toán hoặc webhook để xác nhận giao dịch.', 'info');
          return; // stop processing here
        }

        // Otherwise popup still open but max attempts reached -> set pending state
        // eslint-disable-next-line no-console
        console.debug('Max polling attempts reached, setting payment to pending (waiting for webhook)');
        setPaymentStep('pending');
        showNotify('Giao dịch đang chờ callback từ cổng thanh toán. Vui lòng hoàn tất thanh toán ở popup.', 'info');
        // Do not close popup automatically; allow user to click "Kiểm tra lại" or wait for webhook
      }
    } catch (err) {
      console.error('Payment error:', err);
      const msg = (err && err.message) ? err.message : 'Lỗi khi xử lý thanh toán.';
      setPaymentErrorMsg(msg);
      setPaymentStep('failed');
    } finally {
      setPaymentLoading(false);
    }
  }

  // Close modal and reset state
  function closePaymentModal() {
    setPaymentModal(false);
    setSelectedPlan(null);
    setPaymentStep('confirm');
    setPaymentLoading(false);
    
    if (paymentStep === 'failed') {
      showNotify('Thanh toán đã bị hủy', 'info');
    }
  }

  // Handle successful payment completion
  function handlePaymentSuccess() {
    showNotify('Đăng ký gói thành công!', 'success');
    closePaymentModal();
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
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded" disabled>Đã đăng ký</button>
              ) : (
                <button onClick={() => handleSubscribe(p)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Đăng ký
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Payment Modal */}
      <Dialog 
        open={paymentModal} 
        // Never allow closing by backdrop click or escape for any payment modal state.
        onClose={(e, reason) => {
          // reason can be 'backdropClick' or 'escapeKeyDown'
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          // allow close only via explicit controls
          closePaymentModal();
        }}
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={true}
      >
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
                  <span>{selectedPlan.planName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Thời hạn:</span>
                  <span>{selectedPlan.durationDays} ngày</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-blue-600">{formatPrice(selectedPlan.price, 'VND')}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Bằng cách nhấn "Thanh toán", bạn đồng ý với các điều khoản dịch vụ và chính sách thanh toán của chúng tôi.</p>
              </div>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <CircularProgress size={48} className="mb-4" />
              <p className="text-gray-600">Đang xử lý thanh toán của bạn...</p>
              <p className="text-sm text-gray-500 mt-2">Vui lòng không đóng cửa sổ này</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-600">Gói {selectedPlan?.planName} đã được kích hoạt thành công.</p>
            </div>
          )}

          {paymentStep === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Thanh toán thất bại</h3>
              <p className="text-gray-600">Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.</p>
              {paymentErrorMsg && (
                <div className="mt-3 text-sm text-left bg-gray-50 p-3 rounded border border-gray-100"><strong>Chi tiết:</strong>
                  <div className="break-words">{paymentErrorMsg}</div>
                </div>
              )}
            </div>
          )}
          {paymentStep === 'pending' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-yellow-600 mb-2">Giao dịch đang chờ</h3>
              <p className="text-gray-600">Hệ thống đang chờ callback từ cổng thanh toán. Vui lòng hoàn tất thanh toán ở popup (hoặc quay lại kiểm tra sau).</p>
            </div>
          )}
        </DialogContent>

        <DialogActions className="px-6 pb-6">
          {paymentStep === 'confirm' && (
            <>
              <Button onClick={closePaymentModal} color="inherit">
                Hủy
              </Button>
              <Button 
                onClick={handlePayment} 
                variant="contained" 
                color="primary"
                disabled={paymentLoading}
              >
                Thanh toán
              </Button>
            </>
          )}

          {paymentStep === 'success' && (
            <Button 
              onClick={handlePaymentSuccess} 
              variant="contained" 
              color="primary"
              fullWidth
            >
              Đóng
            </Button>
          )}

          {paymentStep === 'failed' && (
            <>
              <Button onClick={closePaymentModal} color="inherit">
                Đóng
              </Button>
              <Button 
                onClick={() => setPaymentStep('confirm')} 
                variant="contained" 
                color="primary"
              >
                Thử lại
              </Button>
            </>
          )}
          {paymentStep === 'pending' && (
            <>
              <Button onClick={closePaymentModal} color="inherit">
                Đóng
              </Button>
              <Button 
                onClick={async () => {
                  // resume polling: set to processing and re-run handlePayment's polling logic
                  setPaymentStep('processing');
                  setPaymentLoading(true);
                  try {
                    // quick poll once immediately, then let existing polling handle
                    const uid = Number(userId);
                    const pid = Number(selectedPlan?.planId ?? 0);
                    const uRes = await handleAsync(apiGet(ApiEndpoints.SUBSCRIPTION_PLANS_BY_ID(uid)));
                    const uParsed = uRes?.data ?? uRes;
                    const refreshed = uParsed?.data ?? uParsed ?? null;
                    const normalizedRef = refreshed ? normalizePlan(refreshed) : null;
                    if (normalizedRef && Number(normalizedRef.planId) === Number(pid)) {
                      setCurrentPlan(normalizedRef);
                      setPaymentStep('success');
                      showNotify('Thanh toán đã hoàn tất', 'success');
                      return;
                    }
                    // otherwise go back to pending -> user can wait or click again
                    setPaymentStep('pending');
                    showNotify('Chưa có cập nhật. Vui lòng hoàn tất thanh toán ở popup hoặc chờ webhook.', 'info');
                  } catch (e) {
                    console.error('Check again error', e);
                    setPaymentStep('pending');
                    showNotify('Lỗi khi kiểm tra trạng thái. Vui lòng thử lại sau.', 'error');
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                variant="contained" 
                color="primary"
              >
                Kiểm tra lại
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={notifyOpen} autoHideDuration={4000} onClose={() => setNotifyOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNotifyOpen(false)} severity={notifySeverity} sx={{ width: '100%' }}>
          {notifyMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

