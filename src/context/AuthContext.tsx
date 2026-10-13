import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, SessionConflict } from '../types';
import { api, ApiError } from '../services/api';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  showLoginModal: boolean;
  showSignupModal: boolean;
  sessionConflict: SessionConflict | null;
  pendingCredentials: { phone: string; pass: string } | null;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeModals: () => void;
  login: (phone: string, pass: string) => Promise<void>;
  register: (fullName: string, phone: string, pass: string, courseCode: string) => Promise<void>;
  takeoverSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [sessionConflict, setSessionConflict] = useState<SessionConflict | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<{ phone: string; pass: string } | null>(null);

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
    setSessionConflict(null);
    setPendingCredentials(null);
  };

  const login = async (phone: string, pass: string) => {
    try {
      const data = await api.login(phone, pass);
      setUser(data.user);
      closeModals();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.existingSession) {
        setSessionConflict(err.existingSession);
        setPendingCredentials({ phone, pass });
      } else {
        throw err;
      }
    }
  };

  const takeoverSession = async () => {
    if (!pendingCredentials) return;
    try {
      const data = await api.takeoverSession(pendingCredentials.phone, pendingCredentials.pass);
      setUser(data.user);
      closeModals();
    } catch (err) {
      throw err;
    }
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
        sessionConflict,
        pendingCredentials,
        openLoginModal,
        openSignupModal,
        closeModals,
        login,
        register,
        takeoverSession,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
