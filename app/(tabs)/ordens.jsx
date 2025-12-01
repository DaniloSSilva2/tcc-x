// app/(tabs)/ordens.jsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router'; // A IMPORTAÇÃO ESSENCIAL ESTÁ AQUI

const ordensDeExemplo = [
  { id: '1', cliente: 'João Silva', veiculo: 'Toyota Corolla - ABC1234', status: 'Aguardando Aprovação' },
  { id: '2', cliente: 'Maria Oliveira', veiculo: 'Honda Civic - DEF5678', status: 'Em Andamento' },
  { id: '3', cliente: 'Carlos Pereira', veiculo: 'Ford Ka - GHI9012', status: 'Concluído' },
  { id: '4-cliente', cliente: 'Ana Costa', veiculo: 'Chevrolet Onix - JKL3456', status: 'Aguardando Peças' },
];

// O componente StatusIndicator continua igual...
const StatusIndicator = ({ status }) => {
  const statusConfig = {
    'Aguardando Aprovação': { color: '#FFA500' },
    'Em Andamento': { color: '#1E90FF' },
    'Concluído': { color: '#32CD32' },
    'Aguardando Peças': { color: '#FF4500' },
  };

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: statusConfig[status]?.color || 'gray' }]} />
      <Text style={[styles.statusText, { color: statusConfig[status]?.color || 'gray' }]}>{status}</Text>
    </View>
  );
};

export default function OrdensScreen() {
  const renderItem = ({ item }) => (
    // CADA ITEM DA LISTA É ENVOLVIDO POR UM LINK
    <Link href={`/ordens/${item.id}`} asChild>
      <TouchableOpacity style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Ionicons name="car-sport" size={24} color="#3A3A3A" />
          <Text style={styles.itemCliente}>{item.cliente}</Text>
        </View>
        <Text style={styles.itemVeiculo}>{item.veiculo}</Text>
        <StatusIndicator status={item.status} />
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ordensDeExemplo}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

// Os estilos continuam os mesmos...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemCliente: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  itemVeiculo: { fontSize: 14, color: 'gray', marginBottom: 12 },
  statusContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
});