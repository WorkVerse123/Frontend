export const handleAsync = (promise) =>
  promise
    .then((res) => {
      // Nếu res có dạng {success, message, data: {companies: [...]}}
      if (res && typeof res === 'object' && 'success' in res && 'data' in res) {
        // Nếu res.data.companies là mảng, trả về đúng format
        if (res.data && Array.isArray(res.data.companies)) {
          return {
            data: res.data.companies,
            success: res.success,
            message: res.message
          };
        }
        // Nếu res.data là mảng hoặc object khác
        return {
          data: res.data,
          success: res.success,
          message: res.message
        };
      }
      // Nếu res là mảng hoặc object thông thường
      return { data: res, success: true, message: '' };
    })
    .catch((error) => ({
      data: null,
      success: false,
      message: error?.response?.data?.message || error.message || 'Có lỗi xảy ra'
    }));