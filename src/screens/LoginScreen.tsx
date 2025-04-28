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
  ImageSourcePropType,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAuth } from '../context/AuthContext';
import { useNavigationLoading } from '../navigation/NavigationContainer';
import YLogo from '../components/YLogo';
import { useTheme } from '../context/ThemeContext';

// Google icon
const googleIcon: ImageSourcePropType = require('../assets/images/google.png');

type LoginScreenNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation() as LoginScreenNavProp;
  const { login, register, loading } = useAuth();
  const { setLoading } = useNavigationLoading();
  const { theme } = useTheme();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Tutarlı placeholder rengi
  const placeholderColor = theme === 'dark' ? '#888' : '#999';

  const styles = theme === 'dark' ? darkStyles : lightStyles;

  const handleGoogleLogin = () => {
    // Implement Google login functionality
    // For now, navigate to home screen
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Home');
    }, 1500);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin');
      return;
    }

    try {
      await login(email, password);
      // Başarılı giriş sonrası ana sayfaya yönlendir
      navigation.navigate('Home' as never);
    } catch (error) {
      // Hata AuthContext'te zaten işleniyor
      console.log('Giriş başarısız:', error);
    }
  };

  const handleSignUp = async () => {
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
    
    setLoading(true);
    try {
      // Use a default phone number if not provided
      await register(email, password, name, phoneNumber || '+90 000 000 00 00');
      // Registration was successful, navigate to Home
      navigation.navigate('Home');
    } catch (error) {
      // Error is already handled in the AuthContext
      console.log('Kayıt işlemi başarısız:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Reset fields when toggling views
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhoneNumber('');
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
            <YLogo size={70} />
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
                  placeholderTextColor={placeholderColor}
                  value={name}
                  onChangeText={setName}
                  keyboardType="default"
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.input}
                placeholder="E-posta adresinizi giriniz"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {!isLoginView && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Telefon numaranızı giriniz"
                  placeholderTextColor={placeholderColor}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi giriniz"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="oneTimeCode"
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
            </View>
            
            {!isLoginView && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Şifrenizi tekrar giriniz"
                  placeholderTextColor={placeholderColor}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="oneTimeCode"
                  keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
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
              onPress={isLoginView ? handleLogin : handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLoginView ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              )}
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

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
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
    backgroundColor: '#f8f9fa',
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

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
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
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#64b5f6',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#1e88e5',
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
    color: '#fff',
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
    backgroundColor: '#444',
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
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
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
    color: '#fff',
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
    color: '#fff',
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