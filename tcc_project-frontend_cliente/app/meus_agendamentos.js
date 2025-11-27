import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors'; // Verifique se o nome do arquivo é colors ou agenda_colors
import { AgendaService } from '../services/AgendaService';

export default function MeusAgendamentosScreen() {
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const USUARIO_ID = 1;

  useFocusEffect(
    useCallback(() => {
      carregarAgendamentos();
    }, [])
  );

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const dados = await AgendaService.listarAgendamentosUsuario(USUARIO_ID);
      console.log("DADOS:", JSON.stringify(dados)); // Debug
      
      if (dados && dados.length > 0) {
        // Ordena para mostrar o mais futuro primeiro
        const ordenado = dados.sort((a, b) => new Date(b.dataAgendamento) - new Date(a.dataAgendamento));
        setLista(ordenado);
      } else {
        setLista([]);
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÃO NOVA: Transforma 2025-10-17 em 17/10/2025 ---
  const formatarDataBr = (dataString) => {
    if (!dataString) return "--/--/----";
    // Se vier como array [2025, 10, 17]
    if (Array.isArray(dataString)) {
        return `${dataString[2]}/${dataString[1]}/${dataString[0]}`;
    }
    // Se vier como string "2025-10-17"
    try {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        return dataString;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#999';
    // Ajuste conforme os status que você usa no Java
    if (status === 'DISPONIVEL' || status === 'CONCLUIDO') return COLORS.status.disponivel; // Verde
    if (status === 'AGENDADO' || status === 'EM_PROCESSO') return COLORS.status.emProcesso; // Amarelo
    if (status === 'INDISPONIVEL' || status === 'CANCELADO') return COLORS.status.indisponivel; // Vermelho
    return COLORS.status.emProcesso;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Barra colorida lateral */}
      <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
      
      <View style={styles.cardContent}>
        <View style={styles.row}>
            <Ionicons name="calendar-outline" size={24} color="#333" style={{ marginRight: 8 }} />
            {/* AQUI ESTÁ A DATA FORMATADA */}
            <Text style={styles.dataText}>
                {formatarDataBr(item.dataAgendamento)}
            </Text>
        </View>
        
        <Text style={styles.oficinaText}>Oficina #{item.oficinaId}</Text>
        
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status || 'PENDENTE'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Meus Agendamentos</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.button.background} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="calendar-clear-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    height: 90,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 100,
  },
  statusBar: { width: 8, height: '100%' },
  cardContent: { flex: 1, padding: 15, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dataText: { fontSize: 22, fontWeight: 'bold', color: '#333' }, // Aumentei a fonte aqui
  oficinaText: { fontSize: 14, color: '#666', marginBottom: 8, marginLeft: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginLeft: 2 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 10, fontSize: 16, color: '#999' }
});