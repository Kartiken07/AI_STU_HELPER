import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthState {
  userId: number | null;
  email: string | null;
  token: string | null;
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (userId: number, email: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadAuth(): AuthState {
  try {
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    if (userId && token) {
      return { userId: Number(userId), email, token, isLoggedIn: true };
    }
  } catch {}
  return { userId: null, email: null, token: null, isLoggedIn: false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadAuth);

  useEffect(() => {
    if (auth.isLoggedIn) {
      localStorage.setItem('userId', String(auth.userId));
      localStorage.setItem('email', auth.email || '');
      localStorage.setItem('token', auth.token || '');
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserId');
    }
  }, [auth]);

  const login = (userId: number, email: string, token: string) => {
    setAuth({ userId, email, token, isLoggedIn: true });
  };

  const logout = () => {
    setAuth({ userId: null, email: null, token: null, isLoggedIn: false });
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
