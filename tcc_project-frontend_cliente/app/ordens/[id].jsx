import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function DetalheOrdemScreen() {
  const { id } = useLocalSearchParams(); // Pega o ID da URL (ex: 1)
  const router = useRouter();
  
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Busca os dados dessa O.S. específica
  useEffect(() => {
    fetchOrdem();
  }, [id]);

  const fetchOrdem = async () => {
    try {
      const response = await api.get(`/api/ordens/${id}`); // Você precisa ter esse GET no Java
      setOrdem(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a ordem.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Função genérica para mudar status
  const alterarStatus = async (novoStatus) => {
    try {
      await api.patch(`/api/ordens/${id}/status`, {
        status: novoStatus
      });
      Alert.alert('Atualizado', `Status alterado para: ${novoStatus}`);
      fetchOrdem(); // Recarrega a tela
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar status.');
    }
  };

  const confirmarAcao = (titulo, msg, status) => {
    Alert.alert(titulo, msg, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => alterarStatus(status) }
    ]);
  }
    const handleDeletar = async () => {
    Alert.alert('Excluir', 'Tem certeza que deseja apagar esta ordem? Não tem volta!', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sim, Apagar', 
        style: 'destructive', // Deixa o botão vermelho no iOS
        onPress: async () => {
          try {
            await api.delete(`/api/ordens/${id}`);
            Alert.alert('Sucesso', 'Ordem excluída!');
            router.replace('/home'); // Volta para a Home e força atualização
          } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível excluir.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1E90FF" /></View>;
  }

  if (!ordem) {
    return <View style={styles.center}><Text>Ordem não encontrada.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.title}>Ordem #{ordem.id}</Text>
            <Text style={[styles.statusBadge, { color: ordem.status === 'ABERTA' ? '#f39c12' : '#27ae60' }]}>
            {ordem.status}
            </Text>
        </View>
        
        {/* Botão de Lixeira (Só aparece se a ordem não estiver concluída, ou sempre, você decide) */}
        <TouchableOpacity onPress={handleDeletar} style={{ padding: 10 }}>
            <Ionicons name="trash-outline" size={28} color="red" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Cliente:</Text>
        <Text style={styles.value}>{ordem.clienteNome}</Text>

        <Text style={styles.label}>Veículo:</Text>
        <Text style={styles.value}>{ordem.veiculoModelo}</Text>

        <Text style={styles.label}>Data de Abertura:</Text>
        <Text style={styles.value}>{ordem.dataAbertura}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Descrição do Problema:</Text>
        <Text style={styles.description}>{ordem.descricaoProblema}</Text>
      </View>

      {/* Botões de Ação - Só aparecem se não estiver concluída */}
      {ordem.status !== 'CONCLUÍDA' && (
        <View style={{ gap: 10, marginTop: 10 }}>
          
          {/* Botão Aguardando Peça (Amarelo) */}
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#f39c12' }]} 
            onPress={() => confirmarAcao('Aguardar Peça', 'Faltam peças para este serviço?', 'AGUARDANDO PEÇA')}
          >
            <Ionicons name="time-outline" size={24} color="white" />
            <Text style={styles.btnText}>Aguardando Peça</Text>
          </TouchableOpacity>

          {/* Botão Finalizar (Verde) */}
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#27ae60' }]} 
            onPress={() => confirmarAcao('Finalizar', 'O serviço foi concluído?', 'CONCLUÍDA')}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text style={styles.btnText}>Finalizar Serviço</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  statusBadge: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 2, marginBottom: 20 },
  label: { color: '#777', fontSize: 14, marginTop: 10 },
  value: { color: '#333', fontSize: 18, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  description: { color: '#444', fontSize: 16, lineHeight: 24, fontStyle: 'italic' },
  btnConcluir: { backgroundColor: '#27ae60', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8 },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  btnAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8 }
});