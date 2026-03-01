import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'user';

export interface AuthSession {
  userId: string;
  role: UserRole;
  name: string;
  mobileNumber?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string, mobileNumber: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (mobileNumber: string) => Promise<{ success: boolean; otp?: string; error?: string }>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Simulated user database stored in localStorage
const DEFAULT_USERS = [
  { userId: 'admin', password: 'admin123', role: 'admin' as UserRole, name: 'Admin Officer', mobileNumber: '9999999999' },
  { userId: 'user1', password: 'user123', role: 'user' as UserRole, name: 'Applicant User', mobileNumber: '8888888888' },
];

const USERS_KEY = 'pssb_users';
const SESSION_KEY = 'pssb_session';
const OTP_KEY = 'pssb_otp';

function getUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_USERS;
}

function saveUsers(users: typeof DEFAULT_USERS) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const login = async (userId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const user = users.find((u: any) => u.userId === userId && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid ID or password / अमान्य आईडी या पासवर्ड' };
    }
    const newSession: AuthSession = {
      userId: user.userId,
      role: user.role,
      name: user.name,
      mobileNumber: user.mobileNumber,
    };
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return { success: true };
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const sendOtp = async (mobileNumber: string): Promise<{ success: boolean; otp?: string; error?: string }> => {
    const users = getUsers();
    const user = users.find((u: any) => u.mobileNumber === mobileNumber && u.role === 'admin');
    if (!user) {
      return { success: false, error: 'Mobile number not found / मोबाइल नंबर नहीं मिला' };
    }
    // Simulate OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(OTP_KEY, JSON.stringify({ otp, mobileNumber, expiresAt: Date.now() + 5 * 60 * 1000 }));
    return { success: true, otp }; // In real app, OTP would be sent via SMS
  };

  const verifyOtp = async (mobileNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const stored = localStorage.getItem(OTP_KEY);
      if (!stored) return { success: false, error: 'OTP not found / OTP नहीं मिला' };
      const otpData = JSON.parse(stored);
      if (otpData.mobileNumber !== mobileNumber) return { success: false, error: 'Mobile number mismatch / मोबाइल नंबर मेल नहीं खाता' };
      if (Date.now() > otpData.expiresAt) return { success: false, error: 'OTP expired / OTP समाप्त हो गया' };
      if (otpData.otp !== otp) return { success: false, error: 'Invalid OTP / अमान्य OTP' };
      return { success: true };
    } catch {
      return { success: false, error: 'Verification failed / सत्यापन विफल' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, mobileNumber: string): Promise<{ success: boolean; error?: string }> => {
    const users = getUsers();
    const userIndex = users.findIndex((u: any) => u.userId === session?.userId && u.password === currentPassword);
    if (userIndex === -1) {
      return { success: false, error: 'Current password is incorrect / वर्तमान पासवर्ड गलत है' };
    }
    if (users[userIndex].mobileNumber !== mobileNumber) {
      return { success: false, error: 'Mobile number does not match / मोबाइल नंबर मेल नहीं खाता' };
    }
    users[userIndex].password = newPassword;
    saveUsers(users);
    return { success: true };
  };

  return React.createElement(AuthContext.Provider, {
    value: {
      session,
      login,
      logout,
      changePassword,
      sendOtp,
      verifyOtp,
      isAuthenticated: !!session,
      isAdmin: session?.role === 'admin',
    }
  }, children);
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
