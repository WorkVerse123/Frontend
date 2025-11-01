import { useEffect, useState } from 'react';

// Hook to fetch subscription plans from API or fallback to mock data.
export default function useSubscriptionPlans(apiUrl) {
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    function extractListItems(html) {
      if (!html) return [];
      try {
        // try regex first to avoid DOM dependencies
        const matches = Array.from(html.matchAll(/<li[^>]*>(.*?)<\/li>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
        if (matches.length) return matches;
        // fallback: strip tags and split
        const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!text) return [];
        if (text.includes('\n')) return text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (text.includes(',')) return text.split(',').map(s => s.trim()).filter(Boolean);
        return [text];
      } catch (e) {
        return [];
      }
    }

    function normalizePlans(rawPlans) {
      if (!rawPlans) return [];
      return rawPlans.map(p => {
        const id = p?.planId ?? p?.id ?? p?._id ?? (p?.planName ? String(p.planName).toLowerCase().replace(/\s+/g, '_') : undefined);
        const name = p?.planName ?? p?.name ?? p?.title ?? '';
        const price = p?.price ?? p?.amount ?? p?.cost ?? 0;
        const currency = p?.currency ?? '$';
        const durationDays = p?.durationDays ?? null;
        const period = durationDays === 30 ? ' / tháng' : (durationDays ? ` / ${durationDays} ngày` : (p?.period ?? ''));
        const rawFeatures = p?.features ?? p?.featureList ?? p?.description ?? '';
        const features = Array.isArray(rawFeatures) ? rawFeatures : (typeof rawFeatures === 'string' ? extractListItems(rawFeatures) : []);
        const description = p?.description ?? p?.desc ?? '';
        let type = p?.type;
        if (typeof p?.type === 'number') {
          type = p.type === 2 ? 'premium' : (p.type === 1 ? 'basic' : String(p.type));
        }
        return { id, name, price, currency, period, durationDays, features, description, type, _raw: p };
      });
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { get: apiGet } = await import('../services/ApiClient');
        const ApiEndpoints = (await import('../services/ApiEndpoints')).default;
        const path = apiUrl || ApiEndpoints.SUBSCRIPTION_PLANS || '/api/subscription-plans';
        const res = await apiGet(path, { signal: controller.signal });
        if (mounted) {
          const raw = res?.data ?? res ?? [];
          setPlans(normalizePlans(raw));
        }
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
