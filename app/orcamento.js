import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  ScrollView, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors';
import { OrcamentoService } from '../services/OrcamentoService';

export default function OrcamentoScreen() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [destaque, setDestaque] = useState(null); // O orçamento principal (Card Branco)
  const [historico, setHistorico] = useState([]); // Lista para o carrossel

  const CLIENTE_ID = 1;

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    const dados = await OrcamentoService.buscarHistorico(CLIENTE_ID);
    
    // Lógica: O primeiro 'PENDENTE' vira o destaque. O resto vira histórico.
    const pendente = dados.find(o => o.status === 'PENDENTE' || o.status === 'AGUARDANDO_APROVACAO');
    
    if (pendente) {
        setDestaque(pendente);
        // O histórico são os outros (excluindo o destaque)
        setHistorico(dados.filter(o => o.id !== pendente.id));
    } else if (dados.length > 0) {
        // Se não tiver pendente, mostra o mais recente no destaque
        setDestaque(dados[0]);
        setHistorico(dados.slice(1));
    }
    
    setLoading(false);
  };

  const handleAceitar = async () => {
    if (!destaque) return;
    
    Alert.alert("Confirmação", "Deseja aprovar este orçamento?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", onPress: async () => {
            const res = await OrcamentoService.aceitarOrcamento(destaque.id);
            if (res) {
                Alert.alert("Sucesso", "Orçamento aprovado! A oficina será notificada.");
                carregarDados(); // Recarrega para atualizar status
            }
        }}
    ]);
  };

  const handleFinalizar = async () => {
    // Exemplo: Finaliza o destaque atual se estiver "EM_ANDAMENTO" ou "APROVADO"
    if (!destaque) return;
    
    const res = await OrcamentoService.finalizarOrcamento(destaque.id);
    if (res) {
        Alert.alert("Finalizado", "Serviço marcado como concluído.");
        carregarDados();
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.headerImage}
          blurRadius={2}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>ORÇAMENTO</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>DETALHES ORÇAMENTO</Text>

        {/* CARD PRINCIPAL (BRANCO) */}
        {loading ? (
            <ActivityIndicator size="large" color={COLORS.button.background} />
        ) : destaque ? (
            <View style={styles.cardDetalhes}>
                
                {/* Linha Oficina */}
                <View style={styles.infoRow}>
                    <Ionicons name="business" size={20} color="#d68910" style={{width: 25}} />
                    <Text style={styles.infoText}>
                        <Text style={styles.bold}>{destaque.oficinaNome || "Oficina Souza"}</Text> - 3km
                    </Text>
                </View>

                {/* Linha Serviços */}
                <View style={styles.infoRow}>
                    <Ionicons name="construct" size={20} color="#555" style={{width: 25}} />
                    <Text style={styles.infoText}>
                        <Text style={styles.bold}>Serviços: </Text>
                        {destaque.descricaoServicos || "Troca de pastilhas + limpeza"}
                    </Text>
                </View>

                {/* Linha Valor */}
                <View style={styles.infoRow}>
                    <FontAwesome5 name="money-bill-wave" size={18} color="green" style={{width: 25}} />
                    <Text style={styles.infoText}>
                        <Text style={styles.bold}>Valor: </Text> 
                        R$ {destaque.valorTotal ? destaque.valorTotal.toFixed(2) : '0,00'}
                    </Text>
                </View>

                {/* Linha Disponibilidade */}
                <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color="#d35400" style={{width: 25}} />
                    <Text style={styles.infoText}>
                        <Text style={styles.bold}>Status: </Text> 
                        {destaque.status}
                    </Text>
                </View>

                {/* Linha Avaliação */}
                <View style={styles.infoRow}>
                    <Ionicons name="star" size={20} color="#f1c40f" style={{width: 25}} />
                    <Text style={styles.infoText}>
                        <Text style={styles.bold}>Avaliação: </Text> 
                        4.7 (120 reviews)
                    </Text>
                </View>
            </View>
        ) : (
            <View style={styles.cardEmpty}>
                <Text style={{color: '#666'}}>Nenhum orçamento pendente.</Text>
            </View>
        )}

        {/* BOTÃO ACEITAR (Só aparece se estiver pendente) */}
        {destaque && destaque.status === 'PENDENTE' && (
            <TouchableOpacity style={styles.btnAceitar} onPress={handleAceitar}>
                <Text style={styles.btnAceitarText}>ACEITAR</Text>
            </TouchableOpacity>
        )}

        {/* HISTÓRICO (IMAGENS LADO A LADO) */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>HISTORICO</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyContainer}>
            {/* Imagem 1 (Mock ou Real) */}
            <View style={styles.historyCard}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=60' }} style={styles.historyImage} />
            </View>
            {/* Imagem 2 */}
            <View style={styles.historyCard}>
                 <Image source={{ uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=60' }} style={styles.historyImage} />
            </View>
            {/* Imagem 3 */}
            <View style={styles.historyCard}>
                 <Image source={{ uri: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400&q=60' }} style={styles.historyImage} />
            </View>
        </ScrollView>

        {/* BOTÕES DE AÇÃO INFERIORES */}
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/chat')}>
                <Text style={styles.btnSecondaryText}>NOVO CHAT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={handleFinalizar}>
                <Text style={styles.btnSecondaryText}>FINALIZAR</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={32} color="black" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
  // Header
  headerContainer: { height: 130, width: '100%' },
  headerImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
  headerLine: { height: 2, backgroundColor: '#FFF', width: '60%', marginTop: 5 },

  content: { padding: 20, paddingBottom: 100 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3, textTransform: 'uppercase' },

  // Card Detalhes
  cardDetalhes: {
    backgroundColor: '#EAEAEA', // Fundo cinza claro igual imagem
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardEmpty: {
    backgroundColor: '#EAEAEA',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  infoText: { fontSize: 16, color: '#333', flex: 1 },
  bold: { fontWeight: 'bold', color: '#000' },

  // Botão Aceitar
  btnAceitar: {
    backgroundColor: COLORS.button.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#b0700b',
    alignSelf: 'center',
    width: '60%',
    elevation: 4
  },
  btnAceitarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 2 },

  // Histórico
  historyContainer: { flexDirection: 'row', marginBottom: 20 },
  historyCard: { width: 160, height: 100, marginRight: 15, borderRadius: 10, overflow: 'hidden', backgroundColor: '#333' },
  historyImage: { width: '100%', height: '100%' },

  // Botões Inferiores
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  btnSecondary: {
    backgroundColor: COLORS.button.background,
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b0700b',
    elevation: 3
  },
  btnSecondaryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 2 },

  // Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%',
    height: 70,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});