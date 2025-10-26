import axios from 'axios'
import Cookies from 'js-cookie'
import { store } from '../store/store'
import { setRateLimited, clearRateLimited } from '../store/slices/rateLimiterSlice'

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_SERVER_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

let csrfToken = null;
let csrfTokenFetchedAt = null;
let csrfTokenFetching = null;
const CSRF_TOKEN_TTL = 14 * 60 * 1000;
let rateLimitTimer;

const isCsrfTokenExpired = () => {
    if (!csrfTokenFetchedAt) return true;
    return Date.now() - csrfTokenFetchedAt > CSRF_TOKEN_TTL;
}

const getCsrfToken = async () => {
    if (csrfTokenFetching) {
        return csrfTokenFetching;
    }

    if (csrfToken && !isCsrfTokenExpired()) {
        return csrfToken;
    }

    csrfTokenFetching = (async () => {
        try {
            const response = await api.get(import.meta.env.VITE_APP_GET_CSRF_TOKEN, { 
                withCredentials: true,
                headers: { 'X-Skip-CSRF-Check': 'true' } 
            });
            
            const token = response.data?.csrfToken;
            
            csrfToken = token;
            csrfTokenFetchedAt = Date.now();
            return csrfToken;
        } catch {
            csrfToken = null;
            csrfTokenFetchedAt = null;
            return null;
        } finally {
            csrfTokenFetching = null;
        }
    })();

    return csrfTokenFetching;
};

export const refreshCsrfToken = async () => {
    csrfToken = null;
    csrfTokenFetchedAt = null;
    csrfTokenFetching = null;
    return getCsrfToken();
};

const awaitCsrfToken = async () => {
    if (!csrfToken || isCsrfTokenExpired()) {
        csrfToken = await getCsrfToken();
    }
    return csrfToken;
}

export const initializeCsrfToken = () => {
    return getCsrfToken();
};

api.interceptors.request.use(async (config) => {
    const skipCsrfUrls = [
        '/login', '/sign-up', '/forget-password', '/change-pass',
        '/confirmed-change-pass', '/verify-email', '/csrf-token',
        '/register-rfid', '/check-status', '/time-in', '/request-logout'
    ]

    const isPublicEndpoint = skipCsrfUrls.some(url => config.url?.includes(url));
    
    if (isPublicEndpoint) {
        return config;
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
        const token = await awaitCsrfToken();
        if (token) {
            config.headers['X-CSRF-Token'] = token;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const refreshEndpoint = import.meta.env.VITE_APP_REFRESH_TOKEN;
        const isRefreshRequest = error.config?.url?.includes(refreshEndpoint);
        const isOnLoginPage = window.location.pathname === '/login';

        if (isRefreshRequest || isOnLoginPage) {
            return Promise.reject(error);
        }

        if (error.response?.status === 429) {
            const retryAfterHeader = error.response.headers?.["retry-after"];
            const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 30;
            const resetAt = Date.now() + retryAfter * 1000;

            store.dispatch(setRateLimited(resetAt));

            if (rateLimitTimer) clearTimeout(rateLimitTimer);

            rateLimitTimer = setTimeout(() => {
                store.dispatch(clearRateLimited());
                rateLimitTimer = null;
            }, retryAfter * 1000);

            return Promise.reject(error);
        }

        if (error.response?.status === 403 && !error.config.__isRetryRequest) {
            try {
                await getCsrfToken();
                if (csrfToken) {
                    error.config.headers['X-CSRF-Token'] = csrfToken;
                    error.config.__isRetryRequest = true;
                    return api(error.config);
                }
            } catch (retryError) {
                window.location.reload();
                return Promise.reject(retryError);
            }
        }

        if (error.response?.status === 401 && !error.config.__isRetryRequest) {
            try {
                await api.post(refreshEndpoint, {}, { 
                    withCredentials: true,
                    headers: { 'X-Skip-CSRF-Check': 'true' }                
                });
                error.config.__isRetryRequest = true;
                return api(error.config);
            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;