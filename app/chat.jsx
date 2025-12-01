import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';

import { GiftedChat } from 'react-native-gifted-chat';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import {
    iniciarOuContinuarChat,
    enviarMensagem,
    finalizarChat,
    buscarMensagens
} from '../services/SuporteChatService';

import { useLocalSearchParams, useRouter } from "expo-router";

// IDs do sistema
const SUPPORT_USER_ID = 2;
const CLIENT_USER_ID = 1;

// ====================
// MAPEAMENTO DE MENSAGENS
// ====================
const mapBackendMessageToGiftedChat = (msg) => ({
    _id: msg.id,
    text: msg.conteudo,
    createdAt: new Date(msg.dataEnvio),
    user: {
        _id: msg.enviadaPeloCliente ? CLIENT_USER_ID : SUPPORT_USER_ID,
        name: msg.enviadaPeloCliente ? 'Você' : 'Suporte'
    }
});

// ====================
// CONFIGURAÇÃO DO MENU (NÍVEIS)
// (Mantido inalterado)
// ====================
const MENU_CONFIG = {
    erro_app: {
        title: "Entendi — escolha abaixo o tipo de erro que você está enfrentando:",
        options: [
            { key: "app_fecha", label: "O app fecha sozinho", level2: [
                "Fecha ao abrir o app",
                "Fecha ao abrir determinada tela (ex: perfil, agendamento)",
                "Fecha após interação (ex: ao enviar formulário)",
                "Fecha com mensagem de erro / crash log",
                "Outro"
            ]},
            { key: "app_lento", label: "O app está lento", level2: [
                "Lentidão geral (tudo demora)",
                "Lentidão só em telas específicas",
                "Travamentos intermitentes",
                "Consumo excessivo de bateria",
                "Outro"
            ]},
            { key: "login", label: "Não consigo fazer login", level2: [
                "Esqueci a senha",
                "Código de verificação (SMS/Email) não chega",
                "Usuário/senha inválido mesmo corretos",
                "App trava na tela de login",
                "Outro problema de login"
            ]},
            { key: "notificacoes", label: "Não recebo notificações", level2: [
                "Não recebo push (aplicativo)",
                "Recebo, mas atrasadas",
                "Recebo notificações diferentes do esperado",
                "Configurações de notificação não salvam",
                "Outro"
            ]},
            { key: "carregamento", label: "Tela/recursos não carregam", level2: [
                "Imagens não carregam",
                "Listas/feeds vazios",
                "Formulários não carregam campos",
                "Erro 500/timeout em requisições",
                "Outro"
            ]},
            { key: "outro_erro_app", label: "Outro erro", level2: [
                "Falha em sincronização de dados",
                "Problema com localidade/idioma",
                "Outro (campo livre)"
            ]}
        ]
    },
    oficina: {
        title: "Sobre o problema com a oficina, escolha a opção que melhor descreve:",
        options: [
            { key: "sem_resposta", label: "A oficina não respondeu", level2: [
                "Sem resposta por >1 hora",
                "Sem resposta por >24 horas",
                "Oficina abriu a conversa mas não respondeu",
                "Oficina leu mas não respondeu",
                "Outro"
            ]},
            { key: "orcamento", label: "Problema no orçamento", level2: [
                "Orçamento demora (não chega)",
                "Orçamento divergente do combinado",
                "Valores faltando/desconhecidos",
                "Não há detalhamento dos serviços",
                "Outro"
            ]},
            { key: "atendimento_presencial", label: "Atendimento presencial ruim", level2: [
                "Má educação/atitude da equipe",
                "Atraso no atendimento sem aviso",
                "Falta de peças/recursos no local",
                "Local não corresponde ao anunciado",
                "Outro"
            ]},
            { key: "servico_nao_realizado", label: "Serviço não realizado", level2: [
                "Serviço incompleto",
                "Serviço feito de forma incorreta",
                "Peças trocadas erradas ou sem autorização",
                "Prazo não cumprido",
                "Outro"
            ]},
            { key: "cancelamento", label: "Oficina cancelou sem aviso", level2: [
                "Cancelamento com pouca antecedência",
                "Cancelamento sem justificativa",
                "Cancelamento com prejuízo financeiro (ex.: já havia pago)",
                "Outro"
            ]},
            { key: "outro_oficina", label: "Outros problemas com oficina", level2: [
                "Reclamação sobre garantia",
                "Problema de segurança no local",
                "Outro (campo livre)"
            ]}
        ]
    },
    pagamento: {
        title: "Sobre o pagamento, escolha a opção que melhor se aplica:",
        options: [
            { key: "falha_pagamento", label: "Não consegui efetuar o pagamento", level2: [
                "Cartão recusado (sem motivo)",
                "Erro no redirecionamento do gateway",
                "PIX/transferência não reconhecida",
                "Boleto com erro no código de barras",
                "Outro"
            ]},
            { key: "cobranca_duplicada", label: "Cobrança duplicada", level2: [
                "Cartão cobrado 2x",
                "PIX pago 2x",
                "Boleto pago 2x",
                "App mostra duas cobranças mas banco não",
                "Outro"
            ]},
            { key: "reembolso", label: "Quero reembolso", level2: [
                "Solicitei reembolso e não recebi",
                "Reembolso parcial incorreto",
                "Prazo do reembolso muito longo",
                "Reembolso negado (quero contestar)",
                "Outro"
            ]},
            { key: "metodo_invalido", label: "Método de pagamento não funciona", level2: [
                "Cartão não aparece como opção",
                "Erro ao adicionar cartão",
                "Pagamento por carteira digital falha",
                "Outro"
            ]},
            { key: "status_incorreto", label: "Status do pagamento não atualiza", level2: [
                "Pagamento consta pendente mas foi pago",
                "Pagamento confirmado mas serviço não liberado",
                "Confirmação recebida, mas sistema não atualiza",
                "Outro"
            ]},
            { key: "outro_pag", label: "Outro problema financeiro", level2: [
                "Dúvida sobre fatura/nota fiscal",
                "Cobrança de taxa indevida",
                "Outro (campo livre)"
            ]}
        ]
    },
    outros: {
        title: "Escolha a categoria que mais se aproxima do seu problema:",
        options: [
            { key: "duvida_geral", label: "Dúvida geral sobre o app", level2: [
                "Como usar tal funcionalidade?",
                "Qual política de reembolso?",
                "Como contato comercial?",
                "Outro"
            ]},
            { key: "solicitacao_func", label: "Solicitação de funcionalidade", level2: [
                "Nova tela / função X (ex: agendar)",
                "Integração com serviço Y",
                "Melhorias de UX/UI",
                "Outro"
            ]},
            { key: "cadastro", label: "Problema com cadastro", level2: [
                "Não recebo e-mail de confirmação",
                "CPF/CNPJ não aceita",
                "Atualizar dados cadastrais",
                "Outro"
            ]},
            { key: "sugestao", label: "Sugestão de melhoria", level2: [
                "Sugestão de design",
                "Sugestão de fluxo",
                "Sugestão de nova feature",
                "Outro"
            ]},
            { key: "notificacao_geral", label: "Problemas com notificações (genérico)", level2: [
                "Não recebo emails",
                "Notificações in-app inconsistentes",
                "Outro"
            ]},
            { key: "outro_geral", label: "Outro tipo de problema", level2: [
                "Assuntos legais / privacidade",
                "Parcerias / comerciais",
                "Outro (campo livre)"
            ]}
        ]
    }
};

// Mensagem inicial (caso não exista histórico)
const mensagensIniciais = [
    {
        _id: 'msg_intro_001',
        text:
            "Olá! Como posso ajudar hoje?\n\n" +
            "Escolha uma opção:\n" +
            "1️⃣ Erro no aplicativo\n" +
            "2️⃣ Problema com oficina\n" +
            "3️⃣ Pagamento\n" +
            "4️⃣ Outros\n\n" +
            "Digite o número da opção:",
        createdAt: new Date(),
        user: { _id: SUPPORT_USER_ID, name: 'Suporte' }
    }
];


export default function ChatScreen() {

    const router = useRouter();
    const { nome } = useLocalSearchParams();
    const nomeUsuario = nome || "Usuário";

    const [messages, setMessages] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [chatStatus, setChatStatus] = useState("CARREGANDO");

    // 🔵 fluxo do bot
    // menuNivel: 0 = menu inicial, 1 = submenu (categoria escolhida), 2 = nível 2 (especificação),
    // 3 = descrição livre (usuário envia texto - primeira descrição), 4 = descrição/confirmação (usuário envia texto / 1=finalizar, 2=continuar)
    const [menuNivel, setMenuNivel] = useState(0);

    // rastreio de chaves escolhidas
    const [primaryKey, setPrimaryKey] = useState(null); // ex: 'erro_app'
    const [subKey, setSubKey] = useState(null); // índice da opção de nível 1 (ex: 'app_fecha' é subKey=0 para erro_app)
    const [detailIndex, setDetailIndex] = useState(null); // índice do level2 escolhido

    useEffect(() => {
        iniciarChat();
    }, []);

    // ====================
    // INICIAR CHAT
    // ====================
    // INICIAR CHAT
    // ====================
    const iniciarChat = async () => {
    setIsLoading(true);
    setMenuNivel(0);
    setPrimaryKey(null); 
    setSubKey(null);
    setDetailIndex(null);

    try {
        const chat = await iniciarOuContinuarChat(1);
        setCurrentChatId(chat.id);
        setChatStatus(chat.status);

        const msgs = await buscarMensagens(chat.id);
        
        // 1. Mapeia mensagens do backend, se houver
        let loadedMessages = msgs.length > 0
            ? msgs.map(mapBackendMessageToGiftedChat).reverse()
            : [];
        
        // 2. Garante que a mensagem inicial do menu esteja visível no Nível 0
        // Condição: Se estamos no Nível 0 (menu principal) OU a última mensagem do histórico não for uma mensagem do suporte,
        // garantimos que a mensagem de menu seja a última na tela.

        const lastMessage = loadedMessages.length > 0 ? loadedMessages[0] : null;

        if (menuNivel === 0 || !lastMessage || lastMessage.user._id !== SUPPORT_USER_ID) {
            // Adiciona a mensagem do menu (ou a substitui se for a única)
            
            // Filtra o histórico para garantir que a mensagem do menu não seja duplicada
            const filteredLoadedMessages = loadedMessages.filter(
                (msg) => msg._id !== mensagensIniciais[0]._id
            );
            
            setMessages(GiftedChat.append(filteredLoadedMessages, mensagensIniciais));
            
        } else {
            // Se já tem um fluxo ativo no backend, apenas carrega as mensagens
            setMessages(loadedMessages);
        }

    } catch (error) {
        Alert.alert("Erro", "Não foi possível iniciar o chat.");
        // Em caso de erro, ao menos exibe a mensagem inicial para não ficar em branco
        setMessages(mensagensIniciais); 
    } finally {
        setIsLoading(false);
    }
};


    // ====================
    // BOT RESPONDER (append mensagem do sistema)
    // ====================
    function responderBot(texto) {
        const resposta = {
            _id: Math.random().toString(),
            text: texto,
            createdAt: new Date(),
            user: { _id: SUPPORT_USER_ID, name: "Suporte" }
        };
        setMessages(prev => GiftedChat.append(prev, [resposta]));
    }

    // ====================
    // UTIL: Monta texto do submenu (Nível 1.1)
    // ====================
    const buildSubmenuText = (menuKey) => {
        const cfg = MENU_CONFIG[menuKey];
        if (!cfg) return "Erro interno: submenu não encontrado.";
        let txt = cfg.title + "\n\n";
        cfg.options.forEach((opt, idx) => {
            txt += `${idx + 1}️⃣ ${opt.label}\n`;
        });
        txt += `\nDigite o número da opção (ou 0 para voltar).`;
        return txt;
    };

    // ====================
    // UTIL: Monta texto do nível 2 (especificações)
    // ====================
    const buildLevel2Text = (menuKey, optionIndex) => {
        const cfg = MENU_CONFIG[menuKey];
        if (!cfg || !cfg.options[optionIndex]) return "Erro interno: opção não encontrada.";
        const opt = cfg.options[optionIndex];
        let txt = `Perfeito. Agora selecione uma opção mais específica sobre "${opt.label}":\n\n`;
        opt.level2.forEach((label, idx) => {
            txt += `${idx + 1}️⃣ ${label}\n`;
        });
        txt += `\nDigite o número da opção (ou 0 para voltar).`;
        return txt;
    };

    // ====================
    // ENVIO DE MENSAGEM (fluxo principal)
    // ====================
    const onSend = useCallback(async (newMessages = []) => {

        const { text } = newMessages[0];
        const clean = text.trim();

        if (!clean) return;

        // sempre mostrar a mensagem do usuário localmente
        setMessages(prev => GiftedChat.append(prev, newMessages));

        // Opção universal: '0' = voltar um nível (se aplicável)
        if (clean === "0") {
            if (menuNivel === 0) {
                responderBot("Você já está no menu principal. Digite 1-4 para escolher uma categoria.");
            } else if (menuNivel === 1) {
                // do submenu volta ao menu inicial
                setMenuNivel(0);
                setPrimaryKey(null);
                responderBot(mensagensIniciais[0].text);
            } else if (menuNivel === 2) {
                // volta para submenu (nivel 1)
                setMenuNivel(1);
                setDetailIndex(null);
                responderBot(buildSubmenuText(primaryKey));
            } else if (menuNivel === 3 || menuNivel === 4) { // Se está na descrição ou confirmação, volta para Nível 2
                // volta para nível 2 (especificação)
                setMenuNivel(2);
                responderBot(buildLevel2Text(primaryKey, subKey));
            } else {
                responderBot("Opção 0 não aplicável aqui.");
            }
            return;
        }

        // =================================================
        //          FLUXO DO BOT (níveis)
        // =================================================

        // NIVEL 0 → MENU INICIAL (escolha de 1 a 4)
        if (menuNivel === 0) {
            if (["1", "2", "3", "4"].includes(clean)) {
                const primaryIndex = parseInt(clean, 10) - 1;
                // mapeia índice 0..3 para as chaves no MENU_CONFIG
                const primaryKeys = Object.keys(MENU_CONFIG);
                const selectedPrimaryKey = primaryKeys[primaryIndex];

                setPrimaryKey(selectedPrimaryKey);
                setMenuNivel(1);

                // responder com o submenu correspondente
                responderBot(buildSubmenuText(selectedPrimaryKey));
                return;
            }

            responderBot("Selecione uma opção válida (1 a 4).");
            return;
        }

        // NIVEL 1 → SUBMENU ESCOLHIDO (escolha para nível 2)
        if (menuNivel === 1) {
            const cfg = MENU_CONFIG[primaryKey];
            if (!cfg) {
                responderBot("Erro interno: categoria não encontrada. Voltando ao menu inicial.");
                setMenuNivel(0);
                setPrimaryKey(null);
                responderBot(mensagensIniciais[0].text);
                return;
            }

            const max = cfg.options.length;
            const n = parseInt(clean, 10);
            if (!isNaN(n) && n >= 1 && n <= max) {
                const optionIndex = n - 1;
                setSubKey(optionIndex);
                setMenuNivel(2);

                // envia info ao backend registrando a escolha (opcional, mas útil)
                try {
                    if (currentChatId) {
                        // registra a escolha do submenu como mensagem no backend
                        await enviarMensagem(currentChatId, `Escolha categoria: ${cfg.options[optionIndex].label}`);
                    }
                } catch (e) {
                    // não bloqueia o fluxo por falha na gravação
                    console.warn("Falha ao registrar escolha no backend", e);
                }

                responderBot(buildLevel2Text(primaryKey, optionIndex));
                return;
            }

            responderBot(`Escolha uma opção válida (1 a ${max}) ou 0 para voltar.`);
            return;
        }

        // NIVEL 2 → ESCOLHA ESPECÍFICA (level2). Aqui escolheremos e pediremos descrição.
        if (menuNivel === 2) {
            const cfg = MENU_CONFIG[primaryKey];
            if (!cfg) {
                responderBot("Erro interno: categoria não encontrada. Voltando ao menu inicial.");
                setMenuNivel(0);
                setPrimaryKey(null);
                responderBot(mensagensIniciais[0].text);
                return;
            }

            const opt = cfg.options[subKey];
            const max = opt.level2.length;
            const n = parseInt(clean, 10);

            if (!isNaN(n) && n >= 1 && n <= max) {
                const detailIdx = n - 1;
                setDetailIndex(detailIdx);

                // registra a escolha de detalhe no backend (opcional)
                try {
                    if (currentChatId) {
                        await enviarMensagem(currentChatId, `Detalhe: ${opt.level2[detailIdx]}`);
                    }
                } catch (e) {
                    console.warn("Falha ao registrar detalhe no backend", e);
                }

                // Transição para Nível 3 (primeira descrição livre)
                setMenuNivel(3);
                // CORREÇÃO: Mensagem de descrição, removendo a menção a 'print' e o 'Você poderá confirmar finalizar (1) ou continuar (2)' prematuro.
                responderBot(
                    "Obrigado. Por favor, **descreva com detalhes o seu problema**.\n" +
                    "Se possível, inclua: passos para reproduzir e horário aproximado em que ocorreu.\n\n" 
                );
                return;
            }

            responderBot(`Escolha uma opção válida (1 a ${max}) ou 0 para voltar.`);
            return;
        }

        // NIVEL 3 → RECEBER A DESCRIÇÃO DO PROBLEMA (primeiro texto livre)
        if (menuNivel === 3) {
            // registrar a descrição no backend
            try {
                if (currentChatId) {
                    // A mensagem do usuário já foi enviada localmente
                    // Se o seu backend espera a mensagem enviada pelo cliente (clean)
                    await enviarMensagem(currentChatId, clean);
                }
            } catch (e) {
                console.warn("Falha ao enviar descrição para o backend", e);
            }

            // Transição para Nível 4 (confirmação/continuação)
            setMenuNivel(4);

            // pedir confirmação final
            // CORREÇÃO: Mensagem de confirmação que deve aparecer DEPOIS da primeira descrição
            responderBot(
                "Recebemos sua descrição. Deseja:\n\n" +
                "1️⃣ Finalizar e voltar para a home\n" +
                "2️⃣ Não, quero continuar adicionando informações ao chamado\n\n" +
                "Digite **1** ou **2**."
            );
            return;
        }

        // NIVEL 4 → CONFIRMAÇÃO OU CONTINUAÇÃO DA DESCRIÇÃO
        if (menuNivel === 4) {
            if (clean === "1") {
                // Finalizar automaticamente e registrar no backend
                try {
                    if (currentChatId) {
                        await finalizarChat(currentChatId);
                    }
                    responderBot("Obrigado. Seu chamado foi finalizado. Você será redirecionado para a home.");
                    // redireciona
                    router.replace("/homeo");
                } catch (e) {
                    console.error("Erro ao finalizar chat:", e);
                    Alert.alert("Erro", "Não foi possível finalizar. Tente novamente.");
                }
                return;
            }

            if (clean === "2") {
                // voltar para descrição (menuNivel 4 permanece para continuar enviando texto)
                responderBot("Perfeito! Pode continuar explicando seu problema. Envie quando quiser concluir (digitando 1 ou 2).");
                return;
            }

            // Se não é '0', '1' ou '2', trata como CONTINUAÇÃO da descrição.
            try {
                if (currentChatId) {
                    await enviarMensagem(currentChatId, clean);
                }
            } catch (e) {
                console.warn("Falha ao enviar continuação da descrição para o backend", e);
            }

            // Permanece no Nível 4 e solicita a confirmação novamente.
            responderBot(
                "Informação adicionada. Você já concluiu a descrição?\n\n" +
                "1️⃣ Sim, finalizar e voltar para a home\n" +
                "2️⃣ Não, quero continuar adicionando informações\n\n" +
                "Digite **1** ou **2** (ou continue enviando seu texto)."
            );
            return;
        }

        // Se chegou aqui e não correspondia a fluxo de bot, trata como mensagem livre normal:
        if (!currentChatId) {
            Alert.alert("Aguarde", "Carregando chat...");
            return;
        }

        // Caso o chat já esteja em "mãos humanas" ou em um estado diferente do fluxo de bot (pode ser ajustado conforme a sua lógica de status)
        try {
            await enviarMensagem(currentChatId, clean);
        } catch (e) {
            Alert.alert("Erro", "Não foi possível enviar.");
        }

    }, [menuNivel, primaryKey, subKey, detailIndex, currentChatId, router]);

    // ====================
    // FINALIZAR CHAT → REDIRECIONAR
    // (botão manual — mantém confirmação extra antes de finalizar)
    // ====================
    const finalizar = async () => {
        Alert.alert(
            "Finalizar Chat",
            "Deseja realmente finalizar?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sim",
                    onPress: async () => {
                        try {
                            if (currentChatId) {
                                await finalizarChat(currentChatId);
                            }
                            router.replace("/homeo"); // << ajuste a rota da sua home
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível finalizar.");
                        }
                    }
                }
            ]
        );
    };

    // ====================
    // TELA DE CARREGAMENTO
    // ====================
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#FF8C00" />
                <Text style={{ marginTop: 10, color: "#fff" }}>Carregando chat...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >

            <View style={styles.header}>
                <Text style={styles.headerTitle}>CHAT DE SUPORTE</Text>
                <Text style={styles.welcomeText}>Olá, {nomeUsuario}!</Text>
            </View>

            <View style={styles.chatArea}>
                <GiftedChat
                    messages={messages}
                    onSend={onSend}
                    user={{ _id: CLIENT_USER_ID }}
                    // CORREÇÃO: Removido inverted={true} para que a mensagem inicial do menu apareça no topo
                    inverted={false}
                    placeholder="Digite sua mensagem..."
                />
            </View>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.buttonNovoChat} onPress={iniciarChat}>
                    <Text style={styles.buttonText}>NOVO CHAT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttonFinalizar}
                    onPress={finalizar}
                >
                    <Text style={styles.buttonText}>FINALIZAR</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <FontAwesome name="arrow-left" size={28} color="#000" />
                <FontAwesome name="user" size={28} color="#000" />
                <Ionicons name="settings-outline" size={28} color="#000" />
            </View>

        </KeyboardAvoidingView>
    );
}

// ====================
// ESTILOS (Mantido inalterado)
// ====================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#D3D3D3" },

    header: {
        height: 120,
        backgroundColor: "#526673",
        paddingTop: 40,
        paddingHorizontal: 20,
        justifyContent: "center",
    },

    headerTitle: { fontSize: 22, color: "#fff", fontWeight: "bold", textAlign: "center" },
    welcomeText: { fontSize: 18, color: "#fff", marginTop: 10 },

    chatArea: { flex: 1, backgroundColor: "#fafafa" },

    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10,
        backgroundColor: "#D3D3D3",
    },

    buttonNovoChat: {
        backgroundColor: "#FF8C00",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: "45%",
    },

    buttonFinalizar: {
        backgroundColor: "#FF8C00",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
        width: "45%",
    },

    buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

    footer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 60,
        backgroundColor: "#FF8C00",
    }
});