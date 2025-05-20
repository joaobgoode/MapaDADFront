import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  withCredentials: true, // Mantenha isso apenas se precisar enviar cookies para outras operações
});

// Interceptor de requisição simplificado - apenas adiciona o token JWT
api.interceptors.request.use(
  (config) => {
    // Adiciona o token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aqui você pode adicionar lógica para lidar com erros comuns
    // Por exemplo, redirecionar para página de login se receber 401
    if (error.response && error.response.status === 401) {
      // Lógica para lidar com token expirado ou inválido
      // Por exemplo: localStorage.removeItem('token');
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
