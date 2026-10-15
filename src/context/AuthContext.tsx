import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  showLoginModal: boolean;
  showSignupModal: boolean;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeModals: () => void;
  login: (phone: string, pass: string) => Promise<void>;
  register: (fullName: string, phone: string, pass: string, courseCode: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  const login = async (phone: string, pass: string) => {
    const data = await api.login(phone, pass);
    setUser(data.user);
    closeModals();
  };

  const register = async (fullName: string, phone: string, pass: string, courseCode: string) => {
    const data = await api.register(fullName, phone, pass, courseCode);
    setUser(data.user);
    closeModals();
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showLoginModal,
        showSignupModal,
        openLoginModal,
        openSignupModal,
        closeModals,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
