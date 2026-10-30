import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: { id: string; email: string; full_name: string; role: UserRole } | null;
  isAuthenticated: boolean;
  isAnalystOrAdmin: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cs_token'));
  const [user, setUser] = useState<{ id: string; email: string; full_name: string; role: UserRole } | null>(() => {
    const saved = localStorage.getItem('cs_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password: pass });
      setToken(res.access_token);
      const userData = { id: res.user_id, email: res.email, full_name: res.full_name, role: res.role };
      setUser(userData);
      localStorage.setItem('cs_token', res.access_token);
      localStorage.setItem('cs_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role?: string) => {
    setLoading(true);
    try {
      const res = await authService.register({ email, password: pass, full_name: name, role });
      setToken(res.access_token);
      const userData = { id: res.user_id, email: res.email, full_name: res.full_name, role: res.role };
      setUser(userData);
      localStorage.setItem('cs_token', res.access_token);
      localStorage.setItem('cs_user', JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
  };

  const isAnalystOrAdmin = user?.role === 'ANALYST' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAnalystOrAdmin,
        isAdmin,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
