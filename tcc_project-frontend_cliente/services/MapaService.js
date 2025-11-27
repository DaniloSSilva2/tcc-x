// Ajuste o IP conforme seu ambiente (10.0.2.2 para emulador, IP local para celular físico)
const API_URL = 'http://10.0.0.136:8080/api/mapa'; 

export const MapaService = {
  buscarOficinasProximas: async (endereco) => {
    try {
      // Codifica o endereço para URL (troca espaços por %20, etc)
      const enderecoEncoded = encodeURIComponent(endereco);
      
      // Chama: /proximas?endereco=Rua+X&raio=10
      const response = await fetch(`${API_URL}/proximas?endereco=${enderecoEncoded}&raio=10`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar oficinas');
      }
      
      return await response.json(); // Retorna List<OficinaModel>
    } catch (error) {
      console.error("Erro no MapaService:", error);
      return [];
    }
  }
};