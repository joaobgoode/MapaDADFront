import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        let csrfToken = localStorage.getItem('csrfToken');

        if (!csrfToken) {
          const response = await axios.get(`${baseURL}/api/csrf-token`, {
            withCredentials: true,
          });
          csrfToken = response.data.csrfToken;
          localStorage.setItem('csrfToken', csrfToken);
        }

        config.headers['X-CSRF-Token'] = csrfToken;
      } catch (error) {
        console.error('Erro ao obter token CSRF:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data.message?.includes('CSRF')
    ) {
      localStorage.removeItem('csrfToken');
    }
    return Promise.reject(error);
  }
);

export default api;
