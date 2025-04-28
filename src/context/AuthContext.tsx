import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

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
      
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Kayıt Hatası', error.message);
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

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
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
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 