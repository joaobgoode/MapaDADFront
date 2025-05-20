import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Criando uma instância separada para buscar o token CSRF
const csrfAxios = axios.create({
  baseURL,
  withCredentials: true,
});

// Instância principal da API
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Função para obter o token CSRF (com cache)
let csrfPromise = null;
const getCsrfToken = async () => {
  // Se já existir um token no localStorage, use-o
  const cachedToken = localStorage.getItem('csrfToken');
  if (cachedToken) {
    return cachedToken;
  }

  // Se já houver uma requisição em andamento, aguarde-a
  if (csrfPromise) {
    return csrfPromise;
  }

  // Inicia uma nova requisição e guarda a promise
  csrfPromise = csrfAxios.get('/api/csrf-token')
    .then(response => {
      const token = response.data.csrfToken;
      localStorage.setItem('csrfToken', token);
      csrfPromise = null; // Limpa a promise após conclusão
      return token;
    })
    .catch(error => {
      console.error('Erro ao obter token CSRF:', error);
      csrfPromise = null; // Limpa a promise em caso de erro
      throw error;
    });

  return csrfPromise;
};

// Interceptor de requisição
api.interceptors.request.use(
  async (config) => {
    // Adiciona o token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adiciona o token CSRF para métodos que modificam dados
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        const csrfToken = await getCsrfToken();
        // Certifique-se de que os headers existam
        config.headers = config.headers || {};
        config.headers['X-CSRF-Token'] = csrfToken;

        // Para debug: verifique se o token está sendo anexado
        console.log('Header X-CSRF-Token enviado:', config.headers['X-CSRF-Token']);
      } catch (error) {
        console.error('Falha ao anexar token CSRF:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se houver erro de CSRF, limpe o token para forçar uma nova requisição
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 401) &&
      (error.response.data.message?.includes('CSRF') ||
        error.response.data.error?.includes('CSRF') ||
        error.response.data?.includes('CSRF'))
    ) {
      console.log('Erro de CSRF detectado, removendo token do cache');
      localStorage.removeItem('csrfToken');
      // Você poderia tentar reenviar a requisição automaticamente aqui
    }

    return Promise.reject(error);
  }
);

export default api;
