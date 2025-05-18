import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const authApi = axios.create({
  baseURL,
  withCredentials: true,
});

authApi.interceptors.request.use(async (config) => {
  const methodsToProtect = ['post', 'put', 'delete', 'patch'];
  if (methodsToProtect.includes(config.method) && config.url !== '/api/csrf-token') {
    try {
      const csrfResponse = await authApi.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;

      config.headers['X-CSRF-Token'] = csrfToken;
      console.log('CSRF token adicionado ao header:', csrfToken); // Log para depuração
    } catch (error) {
      console.error('Erro ao obter token CSRF:', error);
      return Promise.reject(new Error('Não foi possível obter o token CSRF.'));
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

async function authLogin(username, password) {
  try {
    const response = await authApi.post('/login', { usuario: username, senha: password });

    const token = response.data.token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn('Login bem-sucedido, mas nenhum token JWT retornado.');
    }


    return response;
  } catch (error) {
    console.error('Erro durante o processo de login:', error.response?.data || error.message);
    throw error;
  }
}

export { authApi, authLogin };
