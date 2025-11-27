// app/_layout.jsx

import React from 'react';
import { Stack } from 'expo-router';
// O caminho a partir daqui está correto (sobe um nível, entra em 'context')
import { AuthProvider } from '../context/AuthContext'; 

export default function RootLayout() {
  return (
    // O AuthProvider "abraça" toda a aplicação aqui
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Rotas de Nível Superior e Grupos */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ordens/[id]" />
        
        {/* 👈 ADIÇÃO DA TELA DE CHAT */}
        <Stack.Screen name="chat" /> 
      </Stack>
    </AuthProvider>
  );
}
