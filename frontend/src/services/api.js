import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT token into requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

export function getApiErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.error === 'string') return data.error;

  if (data && typeof data === 'object') {
    const firstMessage = Object.values(data).flat(Infinity).find(
      (value) => typeof value === 'string',
    );
    if (firstMessage) return firstMessage;
  }

  return error.message === 'Network Error'
    ? 'Unable to reach the server. Check that the API is running and try again.'
    : fallback;
}