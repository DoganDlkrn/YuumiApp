import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';

// App logo
const appLogo = require('../assets/Y.png');
// Google icon
const googleIcon = require('../assets/google.png');

type LoginScreenNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavProp>();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = () => {
    // Implement Google login functionality
    // For now, navigate to home screen
    navigation.navigate('Home');
  };

  const handleEmailLogin = () => {
    // Validate email and password
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
      return;
    }
    
    // Implement email login functionality
    // For now, navigate to home screen
    navigation.navigate('Home');
  };

  const handleSignUp = () => {
    // Validate input fields
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    // Implement signup functionality
    // For now, navigate to home screen
    navigation.navigate('Home');
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Reset fields when toggling views
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image source={appLogo} style={styles.logo} />
            <Text style={styles.appName}>Yuumi</Text>
            <Text style={styles.tagline}>
              {isLoginView ? 'Hesabına hoş geldin' : 'Yeni hesap oluştur'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {!isLoginView && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Adınız Soyadınız</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınızı giriniz"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi giriniz"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi giriniz"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            {!isLoginView && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi tekrar giriniz"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}
            
            {isLoginView && (
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Şifremi unuttum</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={isLoginView ? handleEmailLogin : handleSignUp}
            >
              <Text style={styles.primaryButtonText}>
                {isLoginView ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Image source={googleIcon} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Google ile devam et</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLoginView ? 'Hesabın yok mu?' : 'Zaten hesabın var mı?'}
            </Text>
            <TouchableOpacity onPress={toggleView}>
              <Text style={styles.toggleLink}>
                {isLoginView ? 'Kayıt Ol' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Devam ederek, Yuumi'nin Kullanım Şartlarını ve Gizlilik Politikasını kabul etmiş olursunuz.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 30,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginTop: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#444',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 30,
    paddingHorizontal: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#00B2FF',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#00B2FF',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00B2FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#888',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 54,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  toggleText: {
    fontSize: 16,
    color: '#555',
  },
  toggleLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B2FF',
    marginLeft: 5,
  },
  termsContainer: {
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
});

export default LoginScreen; 