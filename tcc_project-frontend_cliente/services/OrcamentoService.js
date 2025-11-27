const API_URL = 'http://10.0.0.136:8080/api/orcamentos'; 

export const OrcamentoService = {
  
  // Busca lista de orçamentos (Histórico)
  buscarHistorico: async (clienteId) => {
    try {
      const response = await fetch(`${API_URL}/historico/${clienteId}`);
      if (!response.ok) throw new Error('Erro ao buscar histórico');
      return await response.json();
    } catch (error) {
      console.error("Erro no OrcamentoService:", error);
      return [];
    }
  },

  // Aceitar Orçamento (Botão ACEITAR)
  aceitarOrcamento: async (orcamentoId) => {
    try {
      const response = await fetch(`${API_URL}/aceitar/${orcamentoId}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Erro ao aceitar');
      return await response.json();
    } catch (error) {
      console.error("Erro ao aceitar:", error);
      return null;
    }
  },

  // Finalizar Orçamento (Botão FINALIZAR)
  finalizarOrcamento: async (orcamentoId) => {
    try {
      const response = await fetch(`${API_URL}/finalizar/${orcamentoId}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Erro ao finalizar');
      return await response.json();
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      return null;
    }
  }
};