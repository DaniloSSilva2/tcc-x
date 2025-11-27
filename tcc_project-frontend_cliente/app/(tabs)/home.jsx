import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; // Ajuste o caminho se necessário (../../services/api)

export default function HomeScreen() {
  const { user } = useAuth();
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('TODAS'); // TODAS, ABERTA, CONCLUÍDA, AGUARDANDO PEÇA

  // --- CÁLCULOS EM TEMPO REAL ---
  const totalAbertas = ordens.filter(o => o.status === 'ABERTA').length;
  const totalConcluidas = ordens.filter(o => o.status === 'CONCLUÍDA').length;
  const totalPecas = ordens.filter(o => o.status === 'AGUARDANDO PEÇA').length;

  // A Mágica: Filtra a lista baseada no botão clicado
  const ordensFiltradas = ordens.filter(o => 
    filtro === 'TODAS' ? true : o.status === filtro
  );

  // Busca dados
  const fetchOrdens = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ordens');
      setOrdens(response.data);
    } catch (error) {
      console.error("Erro ao buscar ordens:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrdens();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchOrdens} />
      }
    >
      {/* 1. Cabeçalho com Saudação e Perfil */}
      <View style={[styles.headerContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View>
            <Text style={styles.greeting}>Olá, {user?.nome || 'Mecânico'} 👋</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        
        <Link href="/perfil" asChild>
            <TouchableOpacity style={{ backgroundColor: 'white', padding: 10, borderRadius: 25 }}>
                <Ionicons name="person-circle-outline" size={40} color="#1E90FF" />
            </TouchableOpacity>
        </Link>
      </View>

      {/* 2. Cards de Resumo (Clicáveis para Filtrar) */}
      <View style={styles.summaryContainer}>
        {/* Card TOTAL */}
        <TouchableOpacity onPress={() => setFiltro('TODAS')} style={[styles.summaryCard, filtro === 'TODAS' && styles.cardSelected]}>
          <Text style={styles.summaryValue}>{ordens.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </TouchableOpacity>
        
        {/* Card ABERTAS */}
        <TouchableOpacity onPress={() => setFiltro('ABERTA')} style={[styles.summaryCard, filtro === 'ABERTA' && styles.cardSelected]}>
          <Text style={[styles.summaryValue, { color: '#e67e22' }]}>{totalAbertas}</Text>
          <Text style={styles.summaryLabel}>Abertas</Text>
        </TouchableOpacity>

        {/* Card PEÇAS */}
        <TouchableOpacity onPress={() => setFiltro('AGUARDANDO PEÇA')} style={[styles.summaryCard, filtro === 'AGUARDANDO PEÇA' && styles.cardSelected]}>
          <Text style={[styles.summaryValue, { color: '#f1c40f' }]}>{totalPecas}</Text>
          <Text style={styles.summaryLabel}>Peças</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Lista de Ordens */}
      <View style={styles.recentesContainer}>
        <Text style={styles.sectionTitle}>
            {filtro === 'TODAS' ? 'Ordens Recentes' : `Filtrando: ${filtro}`}
        </Text>

        {/* Botão Nova O.S. */}
        <Link href="/ordens/nova" asChild>
          <TouchableOpacity style={styles.btnNovaOS}>
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.btnNovaOSText}>Nova O.S.</Text>
          </TouchableOpacity>
        </Link>

        {/* Lista Dinâmica (Usando ordensFiltradas) */}
        {ordensFiltradas.length === 0 ? (
           <Text style={styles.emptyText}>Nenhuma ordem encontrada neste status.</Text>
        ) : (
           ordensFiltradas.map((item) => (
            <Link href={`/ordens/${item.id}`} asChild key={item.id}>
              <TouchableOpacity style={styles.itemContainer}>
                <View>
                  <Text style={styles.itemCliente}>{item.clienteNome}</Text>
                  <Text style={styles.itemVeiculo}>{item.veiculoModelo}</Text>
                  
                  {/* Status Colorido */}
                  <Text style={[
                      styles.itemStatus, 
                      { color: item.status === 'CONCLUÍDA' ? '#27ae60' : item.status === 'ABERTA' ? '#e67e22' : '#f1c40f' }
                  ]}>
                    {item.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="gray" />
              </TouchableOpacity>
            </Link>
          ))
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { padding: 20, paddingBottom: 10 },
  greeting: { fontSize: 16, color: '#666', marginBottom: 5 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 10, marginBottom: 20 },
  summaryCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, alignItems: 'center', width: '30%', elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderWidth: 2, borderColor: '#1E90FF', backgroundColor: '#eef6ff' }, // Estilo quando selecionado
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#1E90FF' },
  summaryLabel: { fontSize: 12, color: 'gray', marginTop: 4, textAlign: 'center' },
  recentesContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  btnNovaOS: { backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginBottom: 15 },
  btnNovaOSText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  itemContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1 },
  itemCliente: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemVeiculo: { fontSize: 14, color: 'gray', marginTop: 4 },
  itemStatus: { fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20 }
});