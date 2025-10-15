import axios from 'axios';
import { handleAsync } from '../utils/HandleAPIResponse';
// Read package version for X-App-Version header
import pkg from '../../package.json';
import { getCookie, setCookie, deleteCookie } from './AuthCookie';

// Use Vite env variable VITE_API_BASE_URL. Keep a fallback for older VITE_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || '';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cache-Control': 'no-cache',
    },
});

api.interceptors.request.use(
    (config) => {
        try {
                // Prefer token stored in cookie named 'token' (migrated or set by auth)
                const tokenFromCookie = getCookie('token');

                // If localStorage still contains user/token (old behavior), migrate into cookies
                try {
                    const lsUser = localStorage.getItem('user') || localStorage.getItem('userData');
                    const lsToken = localStorage.getItem('userToken');
                    if (lsUser && !getCookie('user')) {
                        setCookie('user', lsUser, 7);
                    }
                    if (lsToken && !getCookie('token')) {
                        setCookie('token', lsToken, 7);
                    }
                } catch (e) {}

                const userRaw = getCookie('user');
                const tokenFromUser = userRaw ? JSON.parse(userRaw).token : null;
                const userToken = getCookie('token');

                const token = tokenFromCookie || tokenFromUser || userToken;
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
                    // Attach common headers for all requests
                    config.headers = config.headers || {};
                    // Identify client and version
                    config.headers['X-App-Client'] = 'workverse-web';
                    config.headers['X-App-Version'] = pkg?.version || '';
                    // Accept-Language from browser where available
                    try {
                        config.headers['Accept-Language'] = navigator?.language || navigator?.userLanguage || 'en-US';
                    } catch (e) {
                        config.headers['Accept-Language'] = 'en-US';
                    }
                    // Add user id header when available
                    try {
                        const userObjRaw = localStorage.getItem('user') || localStorage.getItem('userData');
                        const userObj = userObjRaw ? JSON.parse(userObjRaw) : null;
                        if (userObj && userObj.id) config.headers['X-User-Id'] = userObj.id;
                    } catch (e) {
                        // ignore
                    }
        } catch (e) {
            // ignore parse errors
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
                // Clear auth state (cookies/localStorage) but do NOT force a full-page redirect.
                // Redirecting here causes public pages that trigger a 401 on background requests
                // to be kicked back to the homepage unexpectedly (e.g. JobDetail). Let route
                // components or the ProtectedRoute decide how to handle unauthenticated users.
                try {
                    deleteCookie('token');
                    deleteCookie('user');
                } catch (e) {}
                try {
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userData');
                    localStorage.removeItem('user');
                } catch (e) {}
                // Optional: emit a global event so the app can react (e.g. show login modal)
                try {
                    if (typeof window !== 'undefined' && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('app:unauthorized'));
                    }
                    // Keep console trace for debugging during development
                    // eslint-disable-next-line no-console
                    console.debug('ApiClient: received 401 — cleared auth cookies/localStorage; no forced redirect');
                } catch (e) {
                    // ignore
                }
        }
        return Promise.reject(error);
    }
);

// Helper wrappers. GET uses handleAsync to normalize data shape.
const get = (url, config = {}) => handleAsync(api.get(url, config));
const post = (url, data, config = {}) => api.post(url, data, config);
const put = (url, data, config = {}) => api.put(url, data, config);
const del = (url, config = {}) => api.delete(url, config);

export { get, post, put, del };
export default api;