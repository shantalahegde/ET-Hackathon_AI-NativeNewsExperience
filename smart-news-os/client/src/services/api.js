// API Service - centralized API communication layer
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartnews_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('smartnews_token');
      localStorage.removeItem('smartnews_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
};

// News API
export const newsAPI = {
  fetch: (params) => api.get('/news/fetch', { params }),
  personalized: () => api.get('/news/personalized'),
  getBriefing: (data) => api.post('/news/briefing', data),
  save: (data) => api.post('/news/save', data),
  getSaved: () => api.get('/news/saved'),
  removeSaved: (articleId) => api.delete(`/news/saved/${articleId}`),
  getStoryArcs: () => api.get('/news/story-arcs'),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/query', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
};

// Video API
export const videoAPI = {
  generate: (data) => api.post('/video/generate', data),
};

// Translation API
export const translateAPI = {
  translate: (data) => api.post('/translate', data),
};

export default api;
