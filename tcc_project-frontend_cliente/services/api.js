import axios from 'axios';

const api = axios.create({
  // CERTIFIQUE-SE QUE NÃO TEM BARRA NO FINAL
  baseURL: 'http://10.0.0.136:8080', 
  timeout: 10000,
});

// --- O ESPIÃO (Interceptor) ---
// Isso vai mostrar no terminal do VS Code a URL exata antes de enviar
api.interceptors.request.use(request => {
  console.log('>>> ENVIANDO REQUISIÇÃO PARA:', request.url);
  console.log('>>> URL COMPLETA:', request.baseURL + request.url);
  return request;
});

export default api;