import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';

export default function LanguageScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  
  const styles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme === 'dark' ? "#1e88e5" : "#00B2FF"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{"←"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.language')}</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Language List */}
      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.languageItem,
              currentLanguage === item.code && styles.selectedLanguageItem
            ]}
            onPress={async () => {
              await setLanguage(item.code);
              navigation.goBack();
            }}
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
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#00B2FF',
  },
  headerTitle: {
    fontSize: 18,
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
  listContent: {
    padding: 15,
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
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1e88e5',
  },
  headerTitle: {
    fontSize: 18,
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
  listContent: {
    padding: 15,
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
}); 