// Ajuste o IP conforme sua rede (igual aos outros services)
const API_URL = 'http://10.0.0.136:8080/api/servicos'; 

export const ServicoService = {
  
  // Busca genérica por nome (Barra de pesquisa)
  buscarServicos: async (termo) => {
    try {
      const url = termo 
        ? `${API_URL}/buscar?termo=${encodeURIComponent(termo)}`
        : `${API_URL}/destaques`; // Se não digitar nada, traz destaques ou vazio

      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar serviços');
      return await response.json();
    } catch (error) {
      console.error("Erro buscarServicos:", error);
      return [];
    }
  },

  // Busca os destaques (Promoções)
  buscarDestaques: async () => {
    try {
      const response = await fetch(`${API_URL}/destaques`);
      if (!response.ok) throw new Error('Erro ao buscar destaques');
      return await response.json();
    } catch (error) {
      console.error("Erro buscarDestaques:", error);
      return [];
    }
  }
};