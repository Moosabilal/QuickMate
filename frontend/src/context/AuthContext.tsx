import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
  login: (user: { id: string; name: string; email: string; role: string }, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{
        id: string;
        name: string;
        email: string;
        role: string
    } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: { id: string; name: string; email: string; role: string }, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};