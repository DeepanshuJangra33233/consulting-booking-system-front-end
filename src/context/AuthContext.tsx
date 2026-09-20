'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  loginWithEmail: (email: string, pass: string) => Promise<UserEntity | null>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<UserEntity | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const checkIsAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return clean === 'admin@gmaiil.com' || clean === 'admin@gmail.com';
};

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
        const parsed = JSON.parse(savedUser);
        // Correct any stale admin role in localStorage for non-admin accounts
        if (parsed.role === 'admin' && !checkIsAdminEmail(parsed.email)) {
          parsed.role = 'user';
          localStorage.setItem('auth_user', JSON.stringify(parsed));
        }
        setUser(parsed);
        api.setToken(savedToken);
      } catch (_) {}
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          try {
            const idToken = await fbUser.getIdToken();
            setToken(idToken);
            api.setToken(idToken);
            localStorage.setItem('auth_token', idToken);

            // Sync user profile to Firestore backend
            const profile = await api.syncProfile({
              name: fbUser.displayName || undefined,
              photoUrl: fbUser.photoURL || undefined,
            });
            if (!checkIsAdminEmail(fbUser.email)) {
              profile.role = 'user';
            }
            setUser(profile);
            localStorage.setItem('auth_user', JSON.stringify(profile));
          } catch (e) {
            console.error('Error syncing user profile:', e);
            const isAdmin = checkIsAdminEmail(fbUser.email);
            const fallbackUser: UserEntity = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              role: isAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUser(fallbackUser);
            localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
          }
        } else {
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

  const loginWithEmail = async (email: string, pass: string): Promise<UserEntity | null> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await cred.user.getIdToken();
    setToken(idToken);
    api.setToken(idToken);
    localStorage.setItem('auth_token', idToken);

    try {
      const profile = await api.syncProfile({
        name: cred.user.displayName || undefined,
      });
      if (!checkIsAdminEmail(cred.user.email || email)) {
        profile.role = 'user';
      }
      setUser(profile);
      localStorage.setItem('auth_user', JSON.stringify(profile));
      return profile;
    } catch (err) {
      const isAdmin = checkIsAdminEmail(cred.user.email || email);
      const fallbackUser: UserEntity = {
        id: cred.user.uid,
        email: cred.user.email || email,
        name: cred.user.displayName || email.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string): Promise<UserEntity | null> => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const idToken = await cred.user.getIdToken();
    setToken(idToken);
    api.setToken(idToken);
    localStorage.setItem('auth_token', idToken);

    try {
      const profile = await api.syncProfile({
        name: name.trim(),
      });
      // CRITICAL: Any new registration ALWAYS receives role 'user'. Never admin!
      const userProfile: UserEntity = {
        ...profile,
        role: 'user',
      };
      setUser(userProfile);
      localStorage.setItem('auth_user', JSON.stringify(userProfile));
      return userProfile;
    } catch (err) {
      const fallbackUser: UserEntity = {
        id: cred.user.uid,
        email: cred.user.email || email,
        name: name.trim() || email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
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
        role: user?.role || 'user',
        token,
        loading,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
