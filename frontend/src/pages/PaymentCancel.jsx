import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get('reason') || 'cancelled';

    try {
      if (window.opener && !window.opener.closed) {
        const target = window.opener.origin || '*';
        window.opener.postMessage({ type: 'payment:cancel', reason }, target);
      }
    } catch (e) {}

    const t = setTimeout(() => {
      try { window.close(); } catch (e) { /* ignore */ }
      navigate('/subscription');
    }, 1200);

    return () => clearTimeout(t);
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600">Thanh toán bị hủy</h2>
        <p className="mt-2 text-gray-600">Bạn đã hủy quá trình thanh toán. Vui lòng thử lại nếu cần.</p>
      </div>
    </div>
  );
}
