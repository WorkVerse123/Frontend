import api from './ApiClient';

// Generic wrapper for mock JSON files in /public/mocks
// Returns the parsed JSON (like fetch(...).then(r => r.json()))
// This function is defensive: sometimes axios may return unexpected shapes
// when dev server serves static assets. We normalize common shapes and
// fall back to a native fetch retry when needed.
export const fetchMock = async (path, config = {}) => {
  const tryNativeFetch = async () => {
    try {
      const res = await fetch(path, config);
      return await res.json();
    } catch (e) {
      throw e;
    }
  };

  try {
    const res = await api.get(path, config);
    // axios response: { data, status, headers }
    const payload = res?.data ?? res;

    // If payload is a string (HTML error page) or not an object, fallback to native fetch once
    if (!payload || typeof payload === 'string') {
      console.warn('[MocksService] unexpected payload, falling back to native fetch for', path);
      return await tryNativeFetch();
    }

    // Common normalization: some mocks wrap arrays inside data.jobs or data.companies
    // but we should not aggressively change shape here; return the original payload
    // so callers can decide. Still, if payload.data exists and is an object with a
    // single key that holds the real array, leave as-is.
    return payload;
  } catch (err) {
    // If axios signalled cancellation, do not retry — respect the abort.
    const isAxiosCanceled = err?.code === 'ERR_CANCELED' || err?.message?.toLowerCase?.().includes('canceled') || err?.name === 'CanceledError';
    const signalAborted = config && config.signal && config.signal.aborted;
    if (isAxiosCanceled || signalAborted) {
      // rethrow so callers can handle AbortError / cancellation
      throw err;
    }

    // On other errors, try a native fetch as a fallback once (helps when dev server
    // serves static files in a way axios misinterprets).
    try {
      console.warn('[MocksService] axios.get failed, retrying with fetch for', path, err.message);
      return await tryNativeFetch();
    } catch (e) {
      // rethrow original axios error if native fetch also fails
      throw err;
    }
  }
};

export default { fetchMock };
