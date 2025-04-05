import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Normalde burada API'ye istek atılacak
      // Şimdilik sahte bir istek simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basit demo amaçlı kontrol
      if (email === 'demo@example.com' && password === 'password') {
        setUser({
          id: '1',
          name: 'Demo Kullanıcı',
          email: 'demo@example.com',
          phone: '+90 555 123 45 67'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Normalde burada API'ye istek atılacak
      // Şimdilik sahte bir istek simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basit demo - gerçek kayıt simülasyonu
      setUser({
        id: Date.now().toString(),
        name,
        email,
      });
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        register, 
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 