import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('tensibot-auth');
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: { token?: string } };
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch {
        // ignore parse errors
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('tensibot-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
