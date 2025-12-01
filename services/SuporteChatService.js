// services/SuporteChatService.js

import api from './api'; // Importa a instância do Axios configurada

const CHAT_BASE_PATH = '/api/chat/suporte';

/**
 * 1. Ação "NOVO CHAT" ou continuar o chat existente.
 * GET /api/chat/suporte/iniciar/{clienteId}
 */
export const iniciarOuContinuarChat = async (clienteId) => {
    try {
        // A URL completa será: http://10.0.0.136:8080/api/chat/suporte/iniciar/{clienteId}
        const response = await api.get(`${CHAT_BASE_PATH}/iniciar/${clienteId}`);
        return response.data; // Retorna o objeto SuporteChatModel
    } catch (error) {
        console.error("Erro ao iniciar/continuar chat:", error);
        throw error;
    }
};

/**
 * 2. Envia uma nova mensagem (do cliente).
 * POST /api/chat/suporte/enviar/{chatId}?conteudo={conteudo}
 */
export const enviarMensagem = async (chatId, conteudo) => {
    try {
        // POST para /api/chat/suporte/enviar/{chatId} com o conteúdo como query parameter
        const response = await api.post(`${CHAT_BASE_PATH}/enviar/${chatId}`, null, {
            params: { conteudo }
        });
        return response.data; // Retorna o objeto MensagemSuporteModel
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        throw error;
    }
};

/**
 * 3. Finaliza o chat (Ação "FINALIZAR").
 * PUT /api/chat/suporte/finalizar/{chatId}
 */
export const finalizarChat = async (chatId) => {
    try {
        // PUT para /api/chat/suporte/finalizar/{chatId}
        const response = await api.put(`${CHAT_BASE_PATH}/finalizar/${chatId}`);
        return response.data; // Retorna o objeto SuporteChatModel finalizado
    } catch (error) {
        console.error("Erro ao finalizar chat:", error);
        throw error;
    }
};

/**
 * 4. Busca o histórico de mensagens da sessão.
 * GET /api/chat/suporte/mensagens/{chatId}
 */
export const buscarMensagens = async (chatId) => {
    try {
        // GET para /api/chat/suporte/mensagens/{chatId}
        const response = await api.get(`${CHAT_BASE_PATH}/mensagens/${chatId}`);
        return response.data; // Retorna List<MensagemSuporteModel>
    } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        throw error;
    }
};