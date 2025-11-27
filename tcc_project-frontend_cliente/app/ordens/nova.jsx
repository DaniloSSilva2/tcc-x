import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api'; // Importe sua API configurada

export default function NovaOSScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados para os campos do formulário
  const [cliente, setCliente] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSalvar = async () => {
    if (!cliente || !veiculo || !descricao) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      // Enviando para o Backend
      await api.post('/api/ordens', {
        clienteNome: cliente,
        veiculoModelo: veiculo,
        descricaoProblema: descricao
        // status e data são automáticos no Java
      });

      Alert.alert('Sucesso', 'Ordem de Serviço criada!');
      router.back(); // Volta para a Home
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a O.S.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nova Ordem de Serviço</Text>

      <Text style={styles.label}>Nome do Cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: João Silva"
        value={cliente}
        onChangeText={setCliente}
      />

      <Text style={styles.label}>Veículo (Modelo/Placa)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Gol G5 - ABC-1234"
        value={veiculo}
        onChangeText={setVeiculo}
      />

      <Text style={styles.label}>Descrição do Problema</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ex: Barulho no freio dianteiro..."
        multiline
        numberOfLines={4}
        value={descricao}
        onChangeText={setDescricao}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSalvar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Salvando...' : 'Criar Ordem de Serviço'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  label: { fontSize: 16, color: '#555', marginBottom: 5, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#28a745', // Verde para salvar
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});