import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? '';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
});

// ─── Token management ─────────────────────────────────────────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

// ─── Request interceptor: attach Bearer token ─────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── Response interceptor: auto-refresh on 401 ───────────────────────────────
let _refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('dst_refresh_token');
      if (!refreshToken) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }

      try {
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post<{ data: { accessToken: string; refreshToken: string } }>(
              `${BASE_URL}/api/v1/auth/refresh`,
              { refreshToken },
            )
            .then((res) => {
              const { accessToken, refreshToken: newRefresh } = res.data.data;
              setAccessToken(accessToken);
              localStorage.setItem('dst_refresh_token', newRefresh);
              return accessToken;
            })
            .finally(() => {
              _refreshPromise = null;
            });
        }

        const newToken = await _refreshPromise;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        localStorage.removeItem('dst_refresh_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
