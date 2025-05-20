import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const csrfAxios = axios.create({
  baseURL,
  withCredentials: true,
});

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let csrfPromise = null;
const getCsrfToken = async () => {
  const cachedToken = localStorage.getItem('csrfToken');
  if (cachedToken) {
    return cachedToken;
  }

  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = csrfAxios.get('/api/csrf-token')
    .then(response => {
      const token = response.data.csrfToken;
      localStorage.setItem('csrfToken', token);
      csrfPromise = null;
      return token;
    })
    .catch(error => {
      console.error('Erro ao obter token CSRF:', error);
      csrfPromise = null;
      throw error;
    });

  return csrfPromise;
};

api.interceptors.request.use(
  async (config) => {
    // Adiciona o token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        const csrfToken = await getCsrfToken();
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = csrfToken;

        //console.log('Header X-CSRF-Token enviado:', config.headers['X-CSRF-Token']);
      } catch (error) {
        console.error('Falha ao anexar token CSRF:', error);
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
      (error.response.status === 403 || error.response.status === 401) &&
      (error.response.data.message?.includes('CSRF') ||
        error.response.data.error?.includes('CSRF') ||
        error.response.data?.includes('CSRF'))
    ) {
      //console.log('Erro de CSRF detectado, removendo token do cache');
      localStorage.removeItem('csrfToken');
    }

    return Promise.reject(error);
  }
);

export default api;
