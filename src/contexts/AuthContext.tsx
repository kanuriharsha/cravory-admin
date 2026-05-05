import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'Saikumar@2465',
  password: 'Saikumar@2465'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('cravory_admin_auth');
    if (storedAuth) {
      const { email, timestamp } = JSON.parse(storedAuth);
      // Session expires after 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        setAdminEmail(email);
      } else {
        localStorage.removeItem('cravory_admin_auth');
      }
    }
  }, []);

  const login = (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: 'Please enter both email and password' };
    }

    if (email !== ADMIN_CREDENTIALS.email) {
      return { success: false, error: 'Invalid email address' };
    }

    if (password !== ADMIN_CREDENTIALS.password) {
      return { success: false, error: 'Invalid password' };
    }

    setIsAuthenticated(true);
    setAdminEmail(email);
    localStorage.setItem('cravory_admin_auth', JSON.stringify({
      email,
      timestamp: Date.now()
    }));

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminEmail(null);
    localStorage.removeItem('cravory_admin_auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
