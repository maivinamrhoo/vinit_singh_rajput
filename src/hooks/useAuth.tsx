import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { fetchAdminMe } from '../services/api';

interface AdminProfile {
  uid: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  adminProfile: AdminProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const verifyAdminSession = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setAdminProfile(null);
      setLoading(false);
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const profile = await fetchAdminMe(token);
      setAdminProfile(profile);
      setAuthError(null);
    } catch (err: any) {
      setAdminProfile(null);
      setAuthError(
        err?.message || 'This account does not have administrator access.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);
      verifyAdminSession(firebaseUser);
    });
    return () => unsub();
  }, [verifyAdminSession]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      await verifyAdminSession(result.user);
    } catch (err: any) {
      setLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in window was closed before completion.');
      } else {
        setAuthError(err?.message || 'Could not sign in with Google.');
      }
    }
  }, [verifyAdminSession]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setAdminProfile(null);
    setAuthError(null);
  }, []);

  const getToken = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    return current.getIdToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        loading,
        authError,
        signInWithGoogle,
        signOut,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
