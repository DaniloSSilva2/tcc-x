// app/chat.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'; // Uma biblioteca comum para UI de chat
import { iniciarOuContinuarChat, enviarMensagem, finalizarChat, buscarMensagens } from '../services/SuporteChatService';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // Ícones para o anexo e outras coisas
import { useLocalSearchParams } from 'expo-router';

// Dados do usuário (mockados - você deve obter isso do seu contexto/autenticação)
const MOCK_CLIENTE_ID = 1; 
const MOCK_CLIENTE_NOME = 'Tiago'; 
const SUPPORT_USER_ID = 2; // ID para mensagens do suporte
const CLIENT_USER_ID = 1;  // ID para mensagens do cliente

// Mapeia o formato do seu backend (MensagemSuporteModel) para o GiftedChat
const mapBackendMessageToGiftedChat = (msg) => {
    return {
        _id: msg.id,
        text: msg.conteudo,
        createdAt: new Date(msg.dataEnvio), // Assumindo que dataEnvio é um formato ISO válido
        user: {
            _id: msg.enviadaPeloCliente ? CLIENT_USER_ID : SUPPORT_USER_ID,
            name: msg.enviadaPeloCliente ? MOCK_CLIENTE_NOME : 'Suporte',
        },
    };
};

export default function ChatScreen() {
    // Se você estiver usando Expo Router e navegando com parâmetros, pode usar useLocalSearchParams
    // const { clienteId } = useLocalSearchParams();
    const clienteId = MOCK_CLIENTE_ID;

    const [messages, setMessages] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isLoading, setIsLoading] = setIsLoading(true);
    const [chatStatus, setChatStatus] = useState('CARREGANDO'); // ABERTO, EM_ATENDIMENTO, FINALIZADO

    useEffect(() => {
        iniciarChat();
    }, []);

    const iniciarChat = async () => {
        setIsLoading(true);
        try {
            const chat = await iniciarOuContinuarChat(clienteId);
            setCurrentChatId(chat.id);
            setChatStatus(chat.status);
            
            // Se o chat já existia, busca as mensagens
            if (chat.id) {
                await buscarHistorico(chat.id);
            } else {
                // Caso contrário (novo chat), a mensagem inicial do backend já é suficiente
                // Mas o GiftedChat espera um array de mensagens. Vamos buscar:
                await buscarHistorico(chat.id);
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível iniciar o chat. Tente novamente.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const buscarHistorico = async (chatId) => {
        try {
            const msgs = await buscarMensagens(chatId);
            // Inverte a ordem para o GiftedChat (mais recente em cima)
            const giftedMessages = msgs.map(mapBackendMessageToGiftedChat).reverse();
            setMessages(giftedMessages);
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        }
    };

    const onSend = useCallback(async (newMessages = []) => {
        if (!currentChatId || chatStatus === 'FINALIZADO') return;

        const { text } = newMessages[0];
        
        try {
            // 1. Envia a mensagem para o backend
            const backendMessage = await enviarMensagem(currentChatId, text);

            // 2. Adiciona a mensagem localmente no GiftedChat
            // Adiciona a mensagem nova ao topo da lista, como o GiftedChat espera
            setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
            
            // 3. Opcionalmente, atualiza o status se for a primeira mensagem do cliente (feito no backend)
            if (chatStatus === 'ABERTO') {
                setChatStatus('EM_ATENDIMENTO');
            }
            
        } catch (error) {
            Alert.alert("Erro de Envio", "Não foi possível enviar a mensagem. Chat Finalizado?");
            // Remove a mensagem que falhou do estado, se necessário
            console.error("Erro ao enviar mensagem:", error);
        }
    }, [currentChatId, chatStatus]);

    const handleNovoChat = () => {
        // Simplesmente chama iniciarChat novamente. O backend lida com a lógica de buscar ou criar.
        iniciarChat(); 
        setMessages([]); // Limpa as mensagens atuais enquanto carrega
    };

    const handleFinalizarChat = async () => {
        if (!currentChatId || chatStatus === 'FINALIZADO') {
            Alert.alert("Aviso", "O chat já está finalizado ou não foi iniciado.");
            return;
        }

        Alert.alert(
            "Finalizar Chat",
            "Tem certeza que deseja finalizar este atendimento?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                { 
                    text: "Sim, Finalizar", 
                    onPress: async () => {
                        try {
                            await finalizarChat(currentChatId);
                            setChatStatus('FINALIZADO');
                            Alert.alert("Sucesso", "Chat finalizado com sucesso!");
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível finalizar o chat.");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    // Renderização customizada do Input (parte inferior) para replicar a imagem
    const renderChatInput = () => (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                placeholder="Digite aqui"
                editable={chatStatus !== 'FINALIZADO'}
                placeholderTextColor="#A9A9A9"
                onSubmitEditing={({ nativeEvent: { text } }) => onSend([{ _id: Math.random().toString(), text, createdAt: new Date(), user: { _id: CLIENT_USER_ID, name: MOCK_CLIENTE_NOME } }])}
            />
            <TouchableOpacity style={styles.attachButton} disabled={chatStatus === 'FINALIZADO'}>
                <Ionicons name="link-outline" size={24} color={chatStatus === 'FINALIZADO' ? "#777" : "#000"} />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={{ marginTop: 10, color: '#fff' }}>Carregando chat...</Text>
            </View>
        );
    }
    
    // O GiftedChat já inclui um componente de input que pode ser customizado, 
    // mas para replicar exatamente a imagem, vamos usar uma combinação de GiftedChat
    // e componentes nativos. O método mais simples, porém, é usar o GiftedChat.

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            {/* Header (CHAT, Olá Tiago!) */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>CHAT</Text>
                <Text style={styles.welcomeText}>Olá {MOCK_CLIENTE_NOME}!</Text>
            </View>

            {/* Area de mensagens com GiftedChat */}
            <View style={styles.chatArea}>
                <GiftedChat
                    messages={messages}
                    onSend={onSend}
                    user={{ _id: CLIENT_USER_ID }}
                    inverted={true} // Mensagens mais recentes em cima
                    placeholder={chatStatus === 'FINALIZADO' ? 'Chat Finalizado' : 'Digite sua mensagem...'}
                    renderInputToolbar={(props) => (
                        chatStatus === 'FINALIZADO' ? null : GiftedChat.defaultProps.renderInputToolbar(props)
                    )}
                    // Customiza a UI de bolhas para seguir o estilo (opcional, requer mais código)
                    // renderMessage={...} 
                    // renderComposer={renderChatInput} // Use customizado se quiser *exatamente* o layout da imagem
                />
            </View>

            {/* Área de Botões */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.buttonNovoChat} onPress={handleNovoChat}>
                    <Text style={styles.buttonText}>NOVO CHAT</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.buttonFinalizar, chatStatus === 'FINALIZADO' && styles.buttonDisabled]} 
                    onPress={handleFinalizarChat}
                    disabled={chatStatus === 'FINALIZADO'}
                >
                    <Text style={styles.buttonText}>FINALIZAR</Text>
                </TouchableOpacity>
            </View>

            {/* Footer de Navegação (BACK, USER, SETTINGS) */}
            <View style={styles.footer}>
                <FontAwesome name="arrow-left" size={28} color="#000" />
                <FontAwesome name="user" size={28} color="#000" />
                <Ionicons name="settings-outline" size={28} color="#000" />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D3D3D3', // Fundo cinza claro da imagem
    },
    header: {
        height: 120, // Altura ajustada
        backgroundColor: '#526673', // Cor do topo da imagem (aproximada)
        paddingTop: 40,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'left',
    },
    chatArea: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Área branca/clara do chat
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#D3D3D3',
    },
    buttonNovoChat: {
        backgroundColor: '#FF8C00', // Laranja do botão "NOVO CHAT"
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: '45%',
    },
    buttonFinalizar: {
        backgroundColor: '#FF8C00', // Laranja do botão "FINALIZAR"
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: '45%',
    },
    buttonDisabled: {
        backgroundColor: '#FFA07A', // Laranja mais claro quando desabilitado
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#FF8C00', // Cor da barra inferior
    },
    // Estilos para o input (se optar por customizar 100% o GiftedChat ou usar TextInput puro)
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        marginHorizontal: 10,
        marginBottom: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    textInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    attachButton: {
        marginLeft: 10,
        padding: 5,
    }
});