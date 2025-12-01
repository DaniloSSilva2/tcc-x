import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext'; // Certifique-se que o caminho está certo

export default function PerfilScreen() {
  const { user, logout } = useAuth(); 
  const router = useRouter();

  const handleLogout = () => {
    // 1. Limpa o usuário do contexto
    if (logout) logout();
    
    // 2. Redireciona para a tela de Login (que é a raiz '/')
    router.replace('/'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color="#fff" />
        </View>
        {/* Mostra o nome real vindo do banco de dados */}
        <Text style={styles.name}>{user?.nome || 'Usuário'}</Text>
        <Text style={styles.role}>{user?.role || 'Funcionário'}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color="#666" />
            <View style={styles.infoText}>
                <Text style={styles.label}>E-mail</Text>
                <Text style={styles.value}>{user?.email}</Text>
            </View>
        </View>

        <View style={styles.infoRow}>
            <Ionicons name="id-card-outline" size={24} color="#666" />
            <View style={styles.infoText}>
                <Text style={styles.label}>ID do Sistema</Text>
                <Text style={styles.value}>#{user?.id}</Text>
            </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1E90FF', alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  role: { fontSize: 16, color: '#e0e0e0', marginTop: 5 },
  infoContainer: { padding: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  infoText: { marginLeft: 15 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 16, color: '#333', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#e74c3c', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 'auto' },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});