export const handleAsync = (promise) =>
  promise
    .then((res) => {
      // Normalize common shapes so callers receive a compact payload.
      // Common incoming shapes:
      // 1) axios response wrapped by our resolver: res = { data: { data: { ...inner... }, status, headers, ... }, success, message }
      // 2) already-normalized: res = { data: {...}, success, message }
      // 3) plain object/array

      // Prefer axios-style res.data when present
      let payload = res && typeof res === 'object' && 'data' in res ? res.data : res;

      // If payload looks like an axios inner response (has a data property that itself contains the real payload)
      // e.g., payload = { data: { statusCode, message, data: { stats: ... } }, status: 200, ... }
      if (payload && typeof payload === 'object') {
        if (payload.data && typeof payload.data === 'object' && Object.keys(payload.data).length > 0) {
          // If payload.data contains fields like statusCode or stats, it's the useful inner object
          // Detect double-wrapped -> use payload.data when it looks like the real payload
          // (this collapses res.data.data into the returned payload)
          const inner = payload.data;
          // If inner contains statusCode or stats or message, assume inner is the desired payload
          if ('statusCode' in inner || 'stats' in inner || 'message' in inner) {
            payload = inner;
          } else {
            // Otherwise keep payload as-is (payload.data might be just the resource array/object)
            payload = payload.data;
          }
        }
      }

      // Return normalized shape: { data, success, message }
      return {
        data: payload,
        success: (res && typeof res === 'object' && 'success' in res) ? !!res.success : true,
        message: (payload && payload.message) ? payload.message : ((res && res.message) ? res.message : '')
      };
    })
    .catch((error) => ({
      data: null,
      success: false,
      message: error?.response?.data?.message || error.message || 'Có lỗi xảy ra'
    }));