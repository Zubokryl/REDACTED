'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  setAuth: () => {},
  logout: () => {},
});

const STORAGE_KEY = 'authData';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuthState] = useState<AuthData>({ user: null, profile: null });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthState(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const setAuth = (data: AuthData) => {
    setAuthState(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const logout = () => {
    setAuthState({ user: null, profile: null });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: null, profile: auth.profile }));
  };

  return (
    <AuthContext.Provider value={{ ...auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);