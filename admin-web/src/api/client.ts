import axios from 'axios';

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
const API_BASE_URL = `${RAW_BASE_URL}/api/v1`;

export const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

adminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventsos_admin_token') || localStorage.getItem('strayttix_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eventsos_admin_token');
      localStorage.removeItem('eventsos_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

