// app/_layout.jsx (Este é o novo ficheiro que estamos a criar)

import React from 'react';
import { Stack } from 'expo-router';
// O caminho a partir daqui está correto (sobe um nível, entra em 'context')
import { AuthProvider } from '../context/AuthContext'; 

export default function RootLayout() {
  return (
    // O AuthProvider "abraça" toda a aplicação aqui
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Isto diz ao layout para gerir as nossas telas */}
        <Stack.Screen name="index" /> 
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ordens/[id]" />
      </Stack>
    </AuthProvider>
  );
}