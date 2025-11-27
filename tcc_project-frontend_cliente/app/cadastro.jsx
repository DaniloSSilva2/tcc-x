import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api'; // Sua API configurada

export default function CadastroScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      // Enviando para o Backend (CadastroController)
      await api.post('/cadastros', {
        nome: nome,
        email: email.toLowerCase().trim(),
        senha: senha,
        role: 'USER' // Definimos um padrão, já que é auto-cadastro
      });

      Alert.alert('Sucesso', 'Conta criada! Faça login agora.');
      router.back(); // Volta para a tela de Login
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente outro e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Crie sua Conta</Text>
        <Text style={styles.subtitle}>Comece a gerenciar sua oficina hoje</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: João da Silva"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: joao@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCadastro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>CADASTRAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E90FF', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
  form: { width: '100%' },
  label: { fontSize: 16, color: '#333', marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#1E90FF', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});