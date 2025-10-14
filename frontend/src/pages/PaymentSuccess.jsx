import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode') || params.get('order_code');
    const status = params.get('status') || 'success';

    // send message to opener window if exists
    try {
      if (window.opener && !window.opener.closed) {
        const target = window.opener.origin || '*';
        window.opener.postMessage({ type: 'payment:completed', status, orderCode }, target);
      }
    } catch (e) {
      // ignore
    }

    // show page briefly then navigate home
    const t = setTimeout(() => {
      try { window.close(); } catch (e) { /* ignore */ }
      navigate('/subscription');
    }, 1500);

    return () => clearTimeout(t);
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-green-600">Thanh toán thành công</h2>
        <p className="mt-2 text-gray-600">Cảm ơn bạn. Bạn sẽ được chuyển trở lại trang ứng dụng.</p>
      </div>
    </div>
  );
}
