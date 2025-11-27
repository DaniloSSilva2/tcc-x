import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // O componente de Mapa
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/agenda_colors'; // Use seu arquivo de cores
import { MapaService } from '../services/MapaService';

export default function MapaScreen() {
  const router = useRouter();
  
  // Estados
  const [endereco, setEndereco] = useState('');
  const [oficinas, setOficinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOficina, setSelectedOficina] = useState(null);

 // Região inicial do mapa: Salvador - BA (Centro Histórico)
  const [region, setRegion] = useState({
    latitude: -12.977749,  // Latitude de Salvador
    longitude: -38.501630, // Longitude de Salvador
    latitudeDelta: 0.05,   // Nível de zoom (quanto menor, mais perto)
    longitudeDelta: 0.05,
  });

  const handleBuscar = async () => {
    if (!endereco.trim()) {
      Alert.alert("Atenção", "Digite um endereço para buscar.");
      return;
    }

    Keyboard.dismiss(); // Esconde o teclado
    setLoading(true);
    
    // Chama o Spring Boot
    const resultados = await MapaService.buscarOficinasProximas(endereco);
    
    console.log("Oficinas encontradas:", resultados);

    if (resultados.length > 0) {
      setOficinas(resultados);
      
      // Centraliza o mapa na primeira oficina encontrada
      const primeira = resultados[0];
      // Certifique-se que seu OficinaModel retorna 'latitude' e 'longitude'
      if (primeira.latitude && primeira.longitude) {
          setRegion({
            latitude: primeira.latitude,
            longitude: primeira.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
      }
    } else {
      Alert.alert("Ops", "Nenhuma oficina encontrada nesta região.");
      setOficinas([]);
    }
    
    setLoading(false);
  };

  const handleConfirmar = () => {
    if (!selectedOficina) {
      Alert.alert("Selecione", "Toque em um pino no mapa para selecionar uma oficina.");
      return;
    }
    // Lógica futura: Salvar oficina selecionada no contexto e ir agendar
    Alert.alert("Oficina Selecionada", `Você escolheu: ${selectedOficina.nome}`);
    // Exemplo: router.push(`/agendar?oficinaId=${selectedOficina.id}`);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER IGUAL ÀS OUTRAS TELAS */}
      <View style={styles.headerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} 
          style={styles.headerImage}
          blurRadius={4}
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.headerTitle}>MAPA</Text>
            <View style={styles.headerLine} />
          </View>
        </ImageBackground>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>
        
        {/* Input de Busca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <TextInput 
            style={styles.input}
            placeholder="Digite o endereço"
            placeholderTextColor="#888"
            value={endereco}
            onChangeText={setEndereco}
            onSubmitEditing={handleBuscar} // Busca ao dar Enter no teclado
          />
        </View>

        <Text style={styles.label}>Oficinas Proximas:</Text>

        {/* ÁREA DO MAPA */}
        <View style={styles.mapContainer}>
          <MapView 
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {/* Renderiza os pinos (markers) vindos do Java */}
            {oficinas.map((oficina, index) => (
              <Marker
                key={index} // ou oficina.id
                coordinate={{
                  latitude: oficina.latitude,
                  longitude: oficina.longitude
                }}
                title={oficina.nome}
                description={oficina.endereco || "Toque para selecionar"}
                onPress={() => setSelectedOficina(oficina)}
                pinColor={selectedOficina === oficina ? COLORS.button.background : 'red'} // Muda cor se selecionado
              />
            ))}
          </MapView>
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.button.background} />
            </View>
          )}
        </View>

        {/* Botão Confirmar */}
        <TouchableOpacity style={styles.buttonConfirmar} onPress={handleConfirmar}>
          <Text style={styles.buttonText}>CONFIRMAR</Text>
        </TouchableOpacity>

      </View>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="settings-sharp" size={32} color="black" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background }, // Cinza texturizado
  
  // Header
  headerContainer: { height: 150, width: '100%' },
  headerImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerOverlay: { backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', alignItems: 'center', paddingVertical: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5 },
  headerLine: { height: 2, backgroundColor: '#FFF', width: '60%', marginTop: 5 },

  // Content
  content: { flex: 1, padding: 20, alignItems: 'center' },
  
  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: '100%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 16, color: '#333', height: '100%' },

  label: {
    alignSelf: 'flex-start',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2
  },

  // Map
  mapContainer: {
    width: '100%',
    height: 300, // Altura do retângulo do mapa na imagem
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFF',
    marginBottom: 30,
    position: 'relative'
  },
  map: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Button
  buttonConfirmar: {
    backgroundColor: COLORS.button.background,
    width: '70%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#b0700b',
    elevation: 5,
  },
  buttonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 2 },

  // Bottom Bar
  bottomBar: {
    height: 70,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});