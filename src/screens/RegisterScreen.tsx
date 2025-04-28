import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/LoadingOverlay';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { register, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const styles = theme === 'dark' ? darkStyles : lightStyles;
  
  // Tüm input alanları için tutarlı placeholder rengi
  const placeholderColor = theme === 'dark' ? '#888' : '#999';

  const handleRegister = async () => {
    // Form doğrulama
    if (!displayName || !email || !password || !confirmPassword || !phoneNumber) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    try {
      setIsRegistering(true);
      await register(email, password, displayName, phoneNumber);
      
      // Kayıt başarılı olduğunda direkt olarak login ekranına yönlendir
      navigation.navigate('Login' as never);
      setIsRegistering(false);
    } catch (error) {
      setIsRegistering(false);
      // Hata AuthContext'te zaten işleniyor
      console.log('Kayıt işlemi başarısız:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LoadingOverlay visible={isRegistering} message="Kayıt oluşturuluyor" />
      
      <Text style={styles.title}>Hesap Oluştur</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adınız Soyadınız</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınızı giriniz"
          placeholderTextColor={placeholderColor}
          value={displayName}
          onChangeText={setDisplayName}
          keyboardType="default"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="E-posta adresinizi giriniz"
          placeholderTextColor={placeholderColor}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          placeholder="Telefon numaranızı giriniz"
          placeholderTextColor={placeholderColor}
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi giriniz"
          placeholderTextColor={placeholderColor}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="oneTimeCode"
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          placeholder="Şifrenizi tekrar giriniz"
          placeholderTextColor={placeholderColor}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textContentType="oneTimeCode"
          keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
        />
      </View>

      <TouchableOpacity 
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={loading || isRegistering}
      >
        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login' as never)}
      >
        <Text style={styles.loginLinkText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
  },
  registerButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginLinkText: {
    color: '#2c3e50',
    fontSize: 16,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    height: 50,
  },
  registerButton: {
    backgroundColor: '#1e88e5',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginLinkText: {
    color: '#fff',
    fontSize: 16,
  },
}); 