import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studypilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studypilot_token');
      localStorage.removeItem('studypilot_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  regenerateToken: () => api.post('/auth/regenerate-token')
};

// Subjects API
export const subjectsAPI = {
  list: (include) => api.get(`/subjects${include ? `?include=${include}` : ''}`),
  get: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.patch(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// Topics API
export const topicsAPI = {
  list: (params) => api.get('/topics', { params }),
  get: (id) => api.get(`/topics/${id}`),
  create: (data) => api.post('/topics', data),
  update: (id, data) => api.patch(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`)
};

// Exams API
export const examsAPI = {
  list: (params) => api.get('/exams', { params }),
  get: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.patch(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`)
};

// Assignments API
export const assignmentsAPI = {
  list: (params) => api.get('/assignments', { params }),
  get: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.patch(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`)
};

// Availability API
export const availabilityAPI = {
  get: () => api.get('/availability'),
  set: (data) => api.put('/availability', data),
  addOverride: (data) => api.post('/availability/overrides', data),
  deleteOverride: (id) => api.delete(`/availability/overrides/${id}`)
};

// Schedule API
export const scheduleAPI = {
  getSessions: (params) => api.get('/schedule/sessions', { params }),
  generate: (useAI = false) => api.post('/schedule/generate', { useAI }),
  replan: () => api.post('/schedule/replan'),
  updateSession: (id, data) => api.patch(`/schedule/sessions/${id}`, data),
  checkMissed: () => api.post('/schedule/check-missed')
};

// Resources API
export const resourcesAPI = {
  list: (params) => api.get('/resources', { params }),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.patch(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`)
};

// Summary API
export const summaryAPI = {
  daily: () => api.get('/summary/daily'),
  weekly: () => api.get('/summary/weekly')
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard')
};
