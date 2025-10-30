import axios from 'axios'
import { store } from '../store/store'
import { setRateLimited, clearRateLimited } from '../store/slices/rateLimiterSlice'

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_SERVER_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

let rateLimitTimer;

api.interceptors.request.use(async (config) => {
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const refreshEndpoint = import.meta.env.VITE_APP_REFRESH_TOKEN;
        const isRefreshRequest = error.config?.url?.includes(refreshEndpoint);
        const isOnLoginPage = window.location.pathname === '/home';

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
                error.config.__isRetryRequest = true;
                return api(error.config);
            } catch (retryError) {
                window.location.reload();
                return Promise.reject(retryError);
            }
        }

        if (error.response?.status === 401 && !error.config.__isRetryRequest) {
            try {
                await api.post(refreshEndpoint, {}, { 
                    withCredentials: true             
                });
                error.config.__isRetryRequest = true;
                return api(error.config);
            } catch (refreshError) {
                window.location.href = '/home';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;