
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { UserProfile, UserRole } from './types';
import { MOCK_USERS } from './services/mockData';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A little hack to get the registerPresence function without creating a circular dependency
let registerPresenceFn: (uid: string) => void = () => {};
export const setRegisterPresenceFn = (fn: (uid: string) => void) => {
    registerPresenceFn = fn;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const login = useCallback(async (email: string): Promise<boolean> => {
    setLoading(true);
    const foundUser = MOCK_USERS.find(u => u.email === email);
    
    return new Promise(resolve => {
        setTimeout(() => {
          if (foundUser) {
            setUser(foundUser);
            
            if (foundUser.role === UserRole.VEREADOR) {
                registerPresenceFn(foundUser.uid);
            }
    
            switch (foundUser.role) {
              case UserRole.CONTROLADOR:
                navigate('/dashboard/controlador');
                break;
              case UserRole.PRESIDENTE:
                navigate('/dashboard/presidente');
                break;
              case UserRole.MESA_DIRETORA:
                navigate('/dashboard/presidente');
                break;
              case UserRole.VEREADOR:
                navigate('/dashboard/vereador');
                break;
              case UserRole.SECRETARIA:
                navigate('/dashboard/secretaria');
                break;
              case UserRole.PUBLICO:
                navigate('/portal');
                break;
              default:
                navigate('/');
            }
            resolve(true);
          } else {
            resolve(false);
          }
          setLoading(false);
        }, 500);
    });

  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
