import axios from "axios";


const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
       
    },
});

api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem("user");
        const token = user ? JSON.parse(user).token : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Xử lý lỗi token hết hạn hoặc không hợp lệ
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("userData");
            // Có thể thêm chuyển hướng về trang login nếu cần
        }
        return Promise.reject(error);
    }
);

export default api;