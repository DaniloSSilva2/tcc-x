import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Se você ainda não criou o arquivo constants/colors.js, vou usar as cores direto aqui para não dar erro
const COLORS = {
  background: '#8c8c91', // Cinza texturizado
  navBar: '#d68910',     // Laranja/Dourado
};

export default function HomeScreen() {
  const router = useRouter();

  // Configuração dos botões do menu
  const menuItems = [
    { 
      id: 1, 
      title: 'Agendar', 
      icon: 'calendar-month', 
      library: MaterialCommunityIcons, 
      route: '/agendar' // <--- ISSO VAI ABRIR SUA TELA DE AGENDA
    },
    { id: 2, title: 'Mapa', icon: 'map-marker-alt', library: FontAwesome5, route: '/mapa' },
    { id: 3, title: 'Serviços', icon: 'tools', library: FontAwesome5, route: '/servicos' },
    { id: 4, title: 'Orçamento', icon: 'calculator', library: FontAwesome5, route: '/orcamento' },
    { id: 5, title: 'Chat', icon: 'chat', library: MaterialCommunityIcons, route: '/chat' },
    { id: 6, title: 'Diagnóstico', icon: 'laptop', library: FontAwesome5, route: '/diagnostico' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HEADER COM IMAGEM */}
        <View style={styles.headerContainer}>
          <ImageBackground 
            source={{ uri: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
            style={styles.headerImage}
          >
            <View style={styles.headerOverlay}>
              <View style={styles.titleContainer}>
                <View style={styles.line} />
                <Text style={styles.headerTitle}>HOME PAGE</Text>
                <View style={styles.line} />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* GRID DE MENU (BOTÕES) */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                } else {
                  console.log("Rota ainda não criada");
                }
              }}
            >
              <item.library name={item.icon} size={40} color="black" style={styles.iconShadow} />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUGESTÕES (CARROSSEL) */}
        <View style={styles.suggestionsContainer}>
          <View style={styles.suggestionHeaderBox}>
            <Text style={styles.suggestionTitle}>SUGESTÕES</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.card}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} style={styles.cardImage} />
            </View>
            <View style={styles.card}>
               <Image source={{ uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} style={styles.cardImage} />
            </View>
             <View style={styles.card}>
               <Image source={{ uri: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }} style={styles.cardImage} />
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* BARRA INFERIOR AMARELA */}
      <View style={styles.bottomBar}>
         <TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  headerContainer: {
    height: 200,
    width: '100%',
  },
  headerImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  line: {
    height: 2,
    width: 60,
    backgroundColor: '#FFF',
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 10,
  },
  menuItem: {
    width: '30%', 
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconShadow: {
    marginBottom: 5,
  },
  menuText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  suggestionsContainer: {
    marginTop: 10,
  },
  suggestionHeaderBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFF',
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 15,
  },
  suggestionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  card: {
    width: 200,
    height: 120,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: COLORS.navBar,
    flexDirection: 'row',
    justifyContent: 'space-around', // Espalha os ícones igualmente
    alignItems: 'center',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
});