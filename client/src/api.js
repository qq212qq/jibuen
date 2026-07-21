/**
 * API 请求封装
 */
const BASE_URL = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('jibuen_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${url}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};

// ==================== 认证相关 ====================
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  getMe: () => api.get('/auth/me'),
};

// ==================== 文章相关 ====================
export const postAPI = {
  getList: (page = 1) => api.get(`/posts?page=${page}`),
};

// ==================== 留言相关 ====================
export const messageAPI = {
  getList: () => api.get('/messages'),
  create: (name, email, content) => api.post('/messages', { name, email, content }),
};
