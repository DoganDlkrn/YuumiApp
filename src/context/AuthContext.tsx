import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Alert, Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  type User as GoogleUser,
} from '@react-native-google-signin/google-signin';

interface UserProfile {
  displayName: string;
  email: string;
  phoneNumber: string;
  // Diğer profil bilgilerini buraya ekleyebilirsiniz
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, displayName: string, phoneNumber: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In konfigürasyonu
  useEffect(() => {
    // Google Sign-In'i yapılandır
    GoogleSignin.configure({
      webClientId: '156043387950-2obvo4oltmuigmr7mupach0u3r2d7ie6.apps.googleusercontent.com', // Firebase konsolundan alındı (Web için)
      iosClientId: '156043387950-nogamdcbcn8bdn3snn8m1gu9a4btc31f.apps.googleusercontent.com', // iOS için güncellenmiş ID
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Kullanıcı oturum açmışsa, profilini Firestore'dan al
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          console.error('Profil bilgileri alınamadı:', error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, displayName: string, phoneNumber: string): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Firestore'da kullanıcı profilini oluştur
      const userProfile: UserProfile = {
        displayName,
        email,
        phoneNumber
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      
      // Profil bilgisini hemen güncelle
      setProfile(userProfile);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      
      // Firebase hata mesajlarını daha kullanıcı dostu hale getir
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda. Lütfen başka bir e-posta adresi deneyin veya giriş yapın.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi. Lütfen geçerli bir e-posta adresi girin.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Zayıf şifre. Şifreniz en az 6 karakter olmalıdır.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'E-posta ve şifre girişi bu hesap için etkinleştirilmemiş.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Ağ hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      }
      
      Alert.alert('Kayıt Hatası', errorMessage);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Giriş Hatası', error.message);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // Web için popup kullan
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Firestore'da kullanıcı profili mevcut değilse oluştur
        await ensureUserProfile(user);
      } else {
        // Mobil - Google ile Firebase
        try {
          // Google Sign-In akışını başlat
          await GoogleSignin.hasPlayServices();
          
          // userInfo'yu al ve içindeki tokenları doğru şekilde eriş
          const userInfo = await GoogleSignin.signIn();
          
          // Firebase kimliği için Google kimlik bilgilerini kullan
          // @ts-ignore
          if (userInfo && userInfo.idToken) {
            // @ts-ignore
            const credential = GoogleAuthProvider.credential(userInfo.idToken);
            const userCredential = await signInWithCredential(auth, credential);
            
            // Kullanıcı profili oluştur veya kontrol et
            await ensureUserProfile(userCredential.user);
          } else {
            throw new Error('Google Sign-In failed: No ID token received');
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // Kullanıcı girişi iptal etti
            console.log('İptal edildi');
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // İşlem devam ediyor
            console.log('İşlem devam ediyor');
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // Play servisleri kullanılamıyor
            Alert.alert('Hata', 'Google Play Servisleri kullanılamıyor.');
          } else {
            // Diğer hatalar
            console.error('Google giriş hatası:', error);
            Alert.alert('Google Giriş Hatası', error.message);
          }
          throw error;
        }
      }
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error('Google giriş hatası:', error);
      Alert.alert('Google Giriş Hatası', error.message);
      throw error;
    }
  };

  // Yardımcı fonksiyon: Kullanıcı profili yoksa oluştur
  const ensureUserProfile = async (user: User) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        // Kullanıcı profili henüz oluşturulmamış, Google bilgilerinden yeni profil oluştur
        const userProfile: UserProfile = {
          displayName: user.displayName || 'İsimsiz Kullanıcı',
          email: user.email || '',
          phoneNumber: user.phoneNumber || ''
        };
        
        await setDoc(userRef, userProfile);
        setProfile(userProfile);
      } else {
        // Profil zaten var, state'i güncelle
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Profil oluşturma hatası:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      // Önce Google Sign-In'den çıkış yap (eğer Google ile giriş yapıldıysa)
      try {
        // @ts-ignore
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.log('Google sign out error:', error);
      }
      // Sonra Firebase'den çıkış yap
      await firebaseSignOut(auth);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Çıkış Hatası', error.message);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('Kullanıcı oturum açmamış.');
    
    try {
      setLoading(true);
      // Veritabanında profili güncelle
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      
      // Yerel state'i güncelle
      setProfile(prevProfile => prevProfile ? { ...prevProfile, ...data } : null);
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Profil Güncelleme Hatası', error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 