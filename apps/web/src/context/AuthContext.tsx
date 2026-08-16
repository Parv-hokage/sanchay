'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api-client';
import { LoginModal } from '../components/auth/LoginModal';
import {
  IdentityProviderType,
  UserStatus,
  CitizenProfile,
  AuthSessionData,
  LoginResponseData,
} from '@sanchay/types';

interface AuthContextType {
  user: { id: string; sanchayUid: string; status: UserStatus } | null;
  profile: CitizenProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (provider: IdentityProviderType, identifier: string) => Promise<LoginResponseData>;
  verifyOtp: (challengeId: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; sanchayUid: string; status: UserStatus } | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    // Check saved session on mount
    const savedToken = localStorage.getItem('sanchay_token');
    if (savedToken) {
      setToken(savedToken);
      fetchSessionAndProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchSessionAndProfile = async () => {
    try {
      const sessionRes = await apiRequest<{ authenticated: boolean; user: { id: string; sanchayUid: string; status: UserStatus } }>('/auth/session');
      if (sessionRes.data.authenticated) {
        setUser(sessionRes.data.user);
        const profRes = await apiRequest<CitizenProfile>('/me/profile');
        setProfile(profRes.data);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('sanchay_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const login = async (provider: IdentityProviderType, identifier: string): Promise<LoginResponseData> => {
    const res = await apiRequest<LoginResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, identifier }),
    });
    return res.data;
  };

  const verifyOtp = async (challengeId: string, otp: string): Promise<void> => {
    const res = await apiRequest<AuthSessionData>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ sessionChallengeId: challengeId, otp }),
    });

    const { token: sessionToken, user: authUser, profile: authProfile } = res.data;
    localStorage.setItem('sanchay_token', sessionToken);
    setToken(sessionToken);
    setUser(authUser);
    setProfile(authProfile);
    closeLogin();
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with local logout regardless of network status
    } finally {
      clearAuth();
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profRes = await apiRequest<CitizenProfile>('/me/profile');
      setProfile(profRes.data);
    } catch {
      // Ignore background refresh errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        isLoginOpen,
        openLogin,
        closeLogin,
        login,
        verifyOtp,
        logout,
        refreshProfile,
      }}
    >
      {children}
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
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
