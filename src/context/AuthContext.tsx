import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOnline: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Initial server connection test
    testConnection().then((connected) => setIsOnline(connected));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const clearAuthError = () => setAuthError(null);

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        console.warn('Authentication validation notice:', err.code);
        setAuthError(
          'INVALID_CREDENTIAL: Invalid email or password, or account does not exist yet. Please verify your credentials, switch to "Register Account" to create it, or sign in with Google.'
        );
      } else if (err.code === 'auth/operation-not-allowed') {
        console.warn('Authentication method not enabled:', err.code);
        setAuthError(
          'OPERATION_NOT_ALLOWED: Email/Password authentication is disabled in your Firebase Console project. Use 1-click Google Sign-In below, or enable Email/Password in the Firebase Console.'
        );
      } else {
        console.warn('Sign-in error:', err.message || err.code);
        setAuthError(err.message || 'Failed to sign in. Please try again.');
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.warn('Registration notice: Email already in use');
        setAuthError('An account with this email already exists. Please switch to Staff Sign In.');
      } else if (err.code === 'auth/weak-password') {
        console.warn('Registration notice: Weak password');
        setAuthError('Password must be at least 6 characters long.');
      } else if (err.code === 'auth/operation-not-allowed') {
        console.warn('Registration notice: Email/Password provider not enabled in Firebase');
        setAuthError(
          'OPERATION_NOT_ALLOWED: Email/Password authentication is disabled in your Firebase Console project. Use 1-click Google Sign-In below, or enable Email/Password in the Firebase Console.'
        );
      } else {
        console.warn('Registration error:', err.message || err.code);
        setAuthError(err.message || 'Registration failed.');
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.warn('Google sign in notice:', err.message || err.code);
        setAuthError(err.message || 'Google sign-in failed.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOnline,
        authError,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
