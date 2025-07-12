import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '../services/authService';
import { UserResponse } from '../types/auth';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: UserResponse) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (AuthService.isAuthenticated()) {
        const savedUser = AuthService.getCurrentUser();
        setUser(savedUser);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    const response = await AuthService.login({ usernameOrEmail, password });
    setUser(response.user);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: UserResponse) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}