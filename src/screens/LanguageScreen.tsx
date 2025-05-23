import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const handleLanguageChange = async (languageCode) => {
    if (currentLanguage !== languageCode) {
      setIsChanging(true);
      try {
        await setLanguage(languageCode);
        
        // Dil değişikliği bildirimini göster
        Alert.alert(
          languageCode === 'tr' ? 'Dil Değiştirildi' : 'Language Changed',
          languageCode === 'tr' 
            ? 'Dil başarıyla Türkçe olarak ayarlandı.'
            : 'Language successfully set to English.',
          [{ text: 'OK' }]
        );
        
        // Değişiklik tamamlandıktan sonra geri git
        navigation.goBack();
      } catch (error) {
        console.error('Dil değiştirme hatası:', error);
      } finally {
        setIsChanging(false);
      }
    } else {
      // Zaten seçili dil ise sadece geri git
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />
      
      {/* Blue Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={isChanging}
          >
            <Text style={styles.backButtonText}>{"←"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.language')}</Text>
          <View style={styles.placeholder} />
        </View>
      </View>
      
      {/* White Content Section */}
      <View style={styles.whiteContainer}>
        {isChanging && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#00B2FF" />
            <Text style={styles.loadingText}>
              {currentLanguage === 'tr' ? 'Dil değiştiriliyor...' : 'Changing language...'}
            </Text>
          </View>
        )}
        
        {/* Language List */}
        <FlatList
          data={LANGUAGES}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.languageItem}
              onPress={() => handleLanguageChange(item.code)}
              disabled={isChanging}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{item.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text style={styles.languageName}>{item.nativeName}</Text>
                  <Text style={styles.languageNameEnglish}>{item.name}</Text>
                </View>
              </View>
              
              {currentLanguage === item.code && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00B2FF',
  },
  headerSection: {
    backgroundColor: '#00B2FF',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  placeholder: {
    width: 30,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 15,
    paddingTop: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedLanguageItem: {
    backgroundColor: '#f0f9ff',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 30,
    marginRight: 15,
  },
  languageTextContainer: {
    justifyContent: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  languageNameEnglish: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e88e5',
  },
  headerSection: {
    backgroundColor: '#1e88e5',
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  placeholder: {
    width: 30,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  listContent: {
    padding: 15,
    paddingTop: 10,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedLanguageItem: {
    backgroundColor: '#1a2733',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 30,
    marginRight: 15,
  },
  languageTextContainer: {
    justifyContent: 'center',
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  languageNameEnglish: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
}); 