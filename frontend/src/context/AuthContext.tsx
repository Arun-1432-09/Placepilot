import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'faculty';
    reg_number?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('placepilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('placepilot_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('placepilot_token');
      if (storedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          localStorage.setItem('placepilot_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login(email, password);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('placepilot_token', res.access_token);
      localStorage.setItem('placepilot_user', JSON.stringify(res.user));
      return { success: true, role: res.user.role };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      return { success: false, error: msg };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'faculty';
    reg_number?: string;
    department?: string;
  }) => {
    try {
      await authAPI.register(data);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your details.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('placepilot_token');
    localStorage.removeItem('placepilot_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('placepilot_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
