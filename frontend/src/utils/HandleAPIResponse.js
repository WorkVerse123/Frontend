export const handleAsync = (promise) =>
  promise
    .then((res) => {
      // Nếu res có dạng {statusCode, message, data, errors}
      if (res && typeof res === 'object' && 'data' in res && 'statusCode' in res) {
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