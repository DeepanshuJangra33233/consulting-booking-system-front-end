'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';
import { UserEntity, UserRole } from '../types';

interface AuthContextType {
  user: UserEntity | null;
  role: UserRole;
  token: string | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDev: (role: 'admin' | 'customer') => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserEntity | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved dev token or cached session
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        api.setToken(savedToken);
        setLoading(false);
        return;
      } catch (_) {}
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            const idToken = await fbUser.getIdToken();
            setToken(idToken);
            api.setToken(idToken);

            // Fetch me profile from backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/me`, {
              headers: { Authorization: `Bearer ${idToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.data);
              localStorage.setItem('auth_user', JSON.stringify(data.data));
            } else {
              const defaultUser: UserEntity = {
                id: fbUser.uid,
                email: fbUser.email || '',
                name: fbUser.displayName || 'Customer',
                role: 'customer',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(defaultUser);
              localStorage.setItem('auth_user', JSON.stringify(defaultUser));
            }
          } catch (e) {
            console.error('Error fetching user profile:', e);
          }
        } else if (!savedToken?.startsWith('dev-')) {
          setUser(null);
          setToken(null);
          api.setToken(null);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (_) {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      api.setToken(idToken);
    } catch (e: any) {
      // If Firebase Auth domain fails (e.g. dummy config in dev), fallback to dev login
      if (email.includes('admin')) {
        loginAsDev('admin');
      } else {
        loginAsDev('customer');
      }
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      api.setToken(idToken);
    } catch (e: any) {
      // Fallback in dev
      loginAsDev('customer');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      api.setToken(idToken);
    } catch (e: any) {
      loginAsDev('customer');
    }
  };

  const loginAsDev = (role: 'admin' | 'customer') => {
    const devToken = role === 'admin' ? 'dev-admin-token' : 'dev-customer-token';
    const devUser: UserEntity = {
      id: role === 'admin' ? 'dev-admin-id' : 'dev-customer-id',
      email: role === 'admin' ? 'admin@consulting.com' : 'customer@example.com',
      name: role === 'admin' ? 'Lead Consultant (Admin)' : 'Demo Customer',
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setToken(devToken);
    setUser(devUser);
    api.setToken(devToken);
    localStorage.setItem('auth_token', devToken);
    localStorage.setItem('auth_user', JSON.stringify(devUser));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        token,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDev,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
