// app/Login.jsx



import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert, // 1. IMPORTAR O ALERT
} from 'react-native';
import { router, Link } from 'expo-router'; // 1. IMPORTAR O ROUTER
import { useAuth } from '../context/AuthContext'; // 1. IMPORTAR O NOSSO HOOK useAuth



export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // 2. ACEDER AOS DADOS E FUNÇÕES DO CONTEXTO
  const { login, user } = useAuth();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Erro de Login", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    login(email.toLowerCase().trim(), password.trim());
  };

  // 4. LÓGICA DE REDIRECIONAMENTO
  // Este useEffect "observa" a variável 'user' do nosso contexto.
  // Se o 'user' mudar (deixar de ser nulo), significa que o login foi feito,
  // e então navegamos para a tela 'home'.
  useEffect(() => {
    if (user) {
      router.replace('/homeo');
    }
  }, [user]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ImageBackground
        source={require('../assets/background.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>OFICINA MANAGER</Text>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Digite seu e-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Digite sua senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
            {/* 3. LIGAR A FUNÇÃO AO BOTÃO */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>ENTRAR</Text>
            </TouchableOpacity>
            <Link href="/cadastro" asChild>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>CADASTRAR</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// ... (os seus estilos 'styles' continuam os mesmos)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 58, 58, 0.85)',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    color: '#D3D3D3',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FFA500',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: '#3A3A3A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  linkText: {
    color: '#1E90FF', // Azul
    fontWeight: 'bold',
    fontSize: 16,
  },
});