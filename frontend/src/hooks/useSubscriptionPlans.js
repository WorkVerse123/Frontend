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
        const { get: apiGet } = await import('../services/ApiClient');
        const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
        const path = apiUrl || ApiEndpoints.SUBSCRIPTION_PLANS || '/api/subscription-plans';
        const res = await apiGet(path, { signal: controller.signal });
        if (mounted) setPlans(res?.data || res || []);
      } catch (err) {
        // Treat cancellation as non-fatal (Abort/Canceled). Only surface other errors.
        const name = err && err.name;
        const msg = err && err.message ? String(err.message).toLowerCase() : '';
        const isCanceled = name === 'AbortError' || name === 'CanceledError' || msg.includes('cancel');
        if (mounted && !isCanceled) setError(err.message || 'Lỗi khi tải dữ liệu');
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
