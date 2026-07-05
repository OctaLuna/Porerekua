import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as loginRequest, getMe, logout as logoutRequest } from '../services/auth.service';
import type { Usuario } from '../types/api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: Usuario | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Restaura la sesión al montar: el navegador envía la cookie httpOnly automáticamente.
  // Si hay cookie válida, getMe() devuelve el perfil; si no, 401 → unauthenticated.
  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setStatus('authenticated');
      })
      .catch(() => {
        setStatus('unauthenticated');
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest({ email, password });
    // El servidor setea la cookie httpOnly; el navegador la gestiona automáticamente.
    const u = await getMe();
    setUser(u);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
      // El servidor limpia la cookie httpOnly en la respuesta.
    } catch {
      // El logout es best-effort: limpiamos la sesión local aunque el server falle.
    }
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthenticated: status === 'authenticated', login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
