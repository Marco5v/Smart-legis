import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { useNavigate } from 'react-router-dom';
// Integre o Firebase Auth aqui
// import { auth } from '../services/firebase'; 
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { getUserProfile } from '../services/sessionService';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A função setRegisterPresenceFn não é mais necessária com o backend em tempo real.

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Começa como true para verificar o estado de auth
  const navigate = useNavigate();

  // Efeito para observar o estado de autenticação do Firebase
  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    //   if (firebaseUser) {
    //     const profile = await getUserProfile(firebaseUser.uid);
    //     setUser(profile);
    //   } else {
    //     setUser(null);
    //   }
    //   setLoading(false);
    // });
    // return () => unsubscribe();
    // Simulação sem Firebase por enquanto:
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Lógica com Firebase:
      // const userCredential = await signInWithEmailAndPassword(auth, email, 'senha-padrao-para-teste');
      // const firebaseUser = userCredential.user;
      // const profile = await getUserProfile(firebaseUser.uid);
      // setUser(profile);

      // Lógica Mockada (mantida para demonstração sem backend real)
      const { MOCK_USERS } = await import('./services/mockData');
      const foundUser = MOCK_USERS.find(u => u.email === email);
      if(!foundUser) throw new Error("User not found");
      setUser(foundUser);
      // Fim da Lógica Mockada
      
      const userToNavigate = foundUser; // No caso real, seria 'profile'
      if (userToNavigate) {
          switch (userToNavigate.role) {
            case UserRole.CONTROLADOR: navigate('/dashboard/controlador'); break;
            case UserRole.PRESIDENTE:
            case UserRole.MESA_DIRETORA: navigate('/dashboard/presidente'); break;
            case UserRole.VEREADOR: navigate('/dashboard/vereador'); break;
            case UserRole.SECRETARIA: navigate('/dashboard/secretaria'); break;
            case UserRole.ASSESSORIA: navigate('/dashboard/comissoes'); break;
            case UserRole.PUBLICO: navigate('/portal'); break;
            default: navigate('/');
          }
      }
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    // await signOut(auth);
    setUser(null); // Lógica mockada
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading ? children : null /* Pode adicionar um SplashScreen aqui */}
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
