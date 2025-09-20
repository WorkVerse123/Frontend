import { useEffect, useState } from 'react';

// Hook to fetch subscription plans from API or fallback to mock data.
export default function useSubscriptionPlans(apiUrl) {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (apiUrl) {
          const res = await fetch(apiUrl, { signal: controller.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (mounted) setPlans(json.data || json.plans || json);
        } else {
          // fallback mock
          const mock = [
            {
              id: 'free',
              name: 'Miễn phí',
              price: 0,
              currency: '$',
              period: ' / tháng',
              features: [
                'Tạo hồ sơ miễn phí',
                'Ứng tuyển không giới hạn',
                'Nhận thông báo việc làm',
                'Hỗ trợ cơ bản'
              ]
            },
            {
              id: 'premium',
              name: 'Premium',
              price: 19,
              currency: '$',
              period: ' / tháng',
              features: [
                'Nổi bật hồ sơ',
                'Tăng cơ hội được phỏng vấn',
                'Hỗ trợ ưu tiên',
                'Xem báo cáo ứng tuyển'
              ]
            }
          ];
          await new Promise(r => setTimeout(r, 150));
          if (mounted) setPlans(mock);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [apiUrl]);

  return { plans, loading, error };
}
