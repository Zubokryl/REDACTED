'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AuthData, AuthContextType } from '../types';
import { api } from '../lib/api';


// Stubs if useAuth is called outside provider
const throwError = () => {
  throw new Error('useAuth must be used within an AuthProvider');
};

// Create context with default stub values
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  models: [],
  setAuth: throwError,
  logout: throwError,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuthState] = useState<AuthData>({
    user: null,
    profile: null,
    models: [],
  });
  const [loading, setLoading] = useState(true);

  // Session initialization
  useEffect(() => {
    const initSession = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      if (!token) {
        setAuthState({ user: null, profile: null, models: [] });
        setLoading(false);
        return;
      }
      try {
        const user = await api.getCurrentUser();
        if (!user) {
          setAuthState({ user: null, profile: null, models: [] });
          setLoading(false);
          return;
        }
        let profile = await api.getProfile(); // removed 'creator'

        if (!profile) {
          profile = null;
        }

        setAuthState({
          user,
          profile,
        
        });
      } catch (error) {
        console.error('Session initialization failed:', error);
        setAuthState({ user: null, profile: null, models: [] });
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const setAuth = (
    data: AuthData | ((prev: AuthData) => AuthData)
  ) => {
    setAuthState((prev) =>
      typeof data === 'function' ? data(prev) : data
    );
  };

  const logout = async () => {
    try {
      await api.logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({ user: null, profile: null, models: [] });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setAuth,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);