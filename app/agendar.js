import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ImageBackground, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 

// IMPORTANTE: Se der erro de "module not found", verifique se sua pasta é 'service' (singular) ou 'services' (plural)
// Aqui estou assumindo 'service' conforme criamos no início.
import { COLORS } from '../constants/agenda_colors';
import { AgendaService } from '../services/AgendaService'; 

export default function AgendaScreen() {
  const router = useRouter(); // Navegação inicializada corretamente

  // Estados
  const [statusMap, setStatusMap] = useState({}); 
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Parâmetros fixos
  const MES_ATUAL = 10;
  const ANO_ATUAL = 2025;
  const OFICINA_ID = 1;
  const USUARIO_ID = 1;

  const daysArray = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    carregarStatus();
  }, []);

  const carregarStatus = async () => {
    setLoading(true);
    const dados = await AgendaService.obterStatusMes(MES_ATUAL, ANO_ATUAL, OFICINA_ID);
    setStatusMap(dados || {});
    setLoading(false);
  };

  const handleSelectDay = (dia, status) => {
    if (status === 'INDISPONIVEL') {
      Alert.alert("Indisponível", "Este dia já está lotado.");
      return;
    }
    setSelectedDay(dia);
  };

  const handleConfirmar = async () => {
    if (!selectedDay) {
      Alert.alert("Atenção", "Selecione uma data disponível primeiro.");
      return;
    }

    setSending(true);

    const diaString = String(selectedDay).padStart(2, '0');
    const mesString = String(MES_ATUAL).padStart(2, '0');
    const dataFormatada = `${ANO_ATUAL}-${mesString}-${diaString}`;

    const payload = {
      dataAgendamento: dataFormatada,
      usuarioId: USUARIO_ID,
      oficinaId: OFICINA_ID,
      status: "AGENDADO"
    };

    const resultado = await AgendaService.confirmarAgendamento(payload);
    
    setSending(false);

    if (resultado) {
      Alert.alert("Sucesso", "Agendamento confirmado!");
      carregarStatus(); 
      setSelectedDay(null);
    } else {
      Alert.alert("Erro", "Falha ao agendar.");
    }
  };

  const getStatusColor = (dia) => {
    const status = statusMap[dia];
    switch (status) {
      case 'DISPONIVEL': return COLORS.status.disponivel;
      case 'EM_PROCESSO': return COLORS.status.emProcesso;
      case 'INDISPONIVEL': return COLORS.status.indisponivel;
      default: return COLORS.status.disponivel; 
    }
  };

  const renderDayItem = ({ item: dia }) => {
    const bgColor = getStatusColor(dia);
    const status = statusMap[dia] || 'DISPONIVEL';
    const isSelected = selectedDay === dia;

    return (
      <TouchableOpacity 
        style={[
          styles.gridItem, 
          { backgroundColor: bgColor },
          isSelected && styles.selectedItemBorder 
        ]}
        onPress={() => handleSelectDay(dia, status)}
      >
        <Text style={styles.gridText}>{dia < 10 ? `0${dia}` : dia}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} 
          style={styles.headerImage}
          blurRadius={3}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>AGENDAR</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Selecione a data disponível</Text>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.status.disponivel }]} />
            <Text style={styles.legendText}>Disponível</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.status.emProcesso }]} />
            <Text style={styles.legendText}>Em processo</Text>
          </View>
        </View>
        <View style={[styles.legendContainer, { marginTop: 5 }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: COLORS.status.indisponivel }]} />
            <Text style={styles.legendText}>Indisponível</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.button.background} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.gridContainer}>
            <FlatList
              data={daysArray}
              keyExtractor={(item) => item.toString()}
              renderItem={renderDayItem}
              numColumns={3}
              contentContainerStyle={styles.gridList}
            />
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity 
             style={styles.buttonPrimary} 
             onPress={handleConfirmar}
             disabled={sending}
          >
            {sending ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>CONFIRMAR</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => router.push('/meus_agendamentos')}
          >
            <Text style={styles.buttonText}>AGENDAMENTOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.back()}>
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
  headerContainer: { height: 150, width: '100%' },
  headerImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { backgroundColor: 'rgba(0,0,0,0.2)', width: '100%', alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.primaryText, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10, letterSpacing: 2 },
  headerLine: { height: 2, backgroundColor: COLORS.primaryText, width: '60%', marginTop: 5 },
  content: { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 20 },
  subtitle: { fontSize: 18, color: COLORS.primaryText, fontWeight: '600', marginBottom: 15 },
  legendContainer: { flexDirection: 'row', width: '100%', justifyContent: 'center', gap: 15 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 15, height: 15, marginRight: 5, borderRadius: 2 },
  legendText: { color: COLORS.primaryText, fontSize: 16 },
  gridContainer: { marginTop: 20, height: 220 },
  gridList: { alignItems: 'center' },
  gridItem: { width: 90, height: 50, justifyContent: 'center', alignItems: 'center', margin: 0, borderWidth: 0.5, borderColor: '#333' },
  selectedItemBorder: { borderWidth: 3, borderColor: '#FFF', zIndex: 1 },
  gridText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  actionContainer: { marginTop: 40, width: '100%', alignItems: 'center', gap: 15 },
  buttonPrimary: { backgroundColor: COLORS.button.background, width: 220, paddingVertical: 12, borderRadius: 5, alignItems: 'center', borderWidth: 2, borderColor: '#b0700b', elevation: 5 },
  buttonSecondary: { backgroundColor: COLORS.button.background, width: 220, paddingVertical: 12, borderRadius: 5, alignItems: 'center', borderWidth: 2, borderColor: '#b0700b', elevation: 5 },
  buttonText: { color: COLORS.button.text, fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  bottomBar: { height: 70, backgroundColor: COLORS.navBar, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});