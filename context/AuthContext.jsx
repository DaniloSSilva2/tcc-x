// context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import api from '../services/api'; // Importamos a nossa API

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Para feedback de "a carregar"

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // 1. Chamada real à API
      // Enviamos "senha" para ser compatível com o backend
      const response = await api.post('/auth/login', {
        email: email,
        senha: password 
      });

      // 2. Se o login for bem-sucedido, guardamos os dados do utilizador
      const userData = response.data;
      setUser(userData);
      
      // O redirecionamento já é feito automaticamente pelo useEffect no index.jsx

    } catch (error) {
      // 3. Se o login falhar
      console.error("Erro no login:", error);
      Alert.alert("Erro de Login", "E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}