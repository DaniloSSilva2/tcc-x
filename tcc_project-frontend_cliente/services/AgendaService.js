// ATENÇÃO: Se estiver no Emulador Android use 10.0.2.2. Se for celular físico, use seu IP (ex: 192.168.x.x)
const API_URL = 'http://10.0.0.136:8080/api/agenda'; 

export const AgendaService = {
  obterStatusMes: async (mes, ano, oficinaId) => {
    try {
      const response = await fetch(`${API_URL}/status?mes=${mes}&ano=${ano}&oficinaId=${oficinaId}`);
      if (!response.ok) throw new Error('Erro ao buscar status');
      return await response.json();
    } catch (error) {
      console.error("Erro no serviço obterStatusMes:", error);
      return {};
    }
  },

  confirmarAgendamento: async (agendamentoData) => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agendamentoData),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao confirmar agendamento:", error);
      return null;
    }
  },

  listarAgendamentosUsuario: async (usuarioId) => {
    try {
      const response = await fetch(`${API_URL}/usuario/${usuarioId}`);
      if (!response.ok) throw new Error('Erro ao listar agendamentos');
      return await response.json();
    } catch (error) {
      console.error("Erro ao listar:", error);
      return [];
    }
  }
};