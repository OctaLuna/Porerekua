# 🏗️ GUÍA DE MEJORA DE ARQUITECTURA Y PATRONES
## Porerekua Frontend - Roadmap de Implementación

---

## 1. ESTRUCTURA DE CARPETAS RECOMENDADA

### Estructura Actual (Deficiente)
```
src/
├── components/       # Demasiado genérico
├── api/             # Vacío/Incompleto
├── services/        # Vacío
├── contexts/        # OK
├── hooks/           # Sparse
├── pages/           # OK
├── types/           # Minimal
```

### Estructura Mejorada (Profesional)
```
src/
├── features/                       # Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── LoginPanel.tsx
│   │   │   └── RegistrationPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── utils/
│   │   │   └── authValidation.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── tests/
│   │       ├── LoginForm.test.tsx
│   │       └── useLogin.test.ts
│   │
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── tests/
│   │
│   └── [otras features]
│
├── shared/                         # Código compartido
│   ├── components/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── ErrorBoundary/
│   │   └── LoadingSpinner/
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useAsync.ts
│   │   └── useEscapeClose.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── sanitization.ts
│   │   ├── formatting.ts
│   │   └── errorHandling.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── colors.ts
│   │   ├── errors.ts
│   │   └── api.ts
│   ├── types/
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── error.types.ts
│   └── services/
│       ├── apiClient.ts
│       ├── logger.ts
│       └── errorReporter.ts
│
├── layouts/
│   ├── MainLayout.tsx
│   ├── AuthLayout.tsx
│   └── AdminLayout.tsx
│
├── pages/
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   └── ErrorPage.tsx
│
├── config/
│   ├── environment.ts
│   ├── routes.ts
│   ├── queryClient.ts
│   └── logger.ts
│
├── providers/
│   └── RootProviders.tsx
│
└── App.tsx
```

---

## 2. SISTEMA DE AUTENTICACIÓN ROBUSTO

### 2.1 Estructura de Carpeta Auth

```typescript
// features/auth/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  institution?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'researcher' | 'user';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  institution: string;
  researchArea: string;
  proofFile?: File;
}
```

### 2.2 Auth Service

```typescript
// features/auth/services/authService.ts
import { apiClient } from '@/shared/services/apiClient';
import { AuthError, LoginCredentials, RegisterData, User } from '../types/auth.types';

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_KEY = 'refresh_token';

  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    try {
      const response = await apiClient.post<{
        token: string;
        refreshToken: string;
        user: User;
      }>('/auth/login', credentials);

      this.setTokens(response.data.token, response.data.refreshToken);
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async register(data: RegisterData): Promise<{ user: User }> {
    try {
      // Validar antes de enviar
      this.validateRegistration(data);

      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      formData.append('institution', data.institution);
      formData.append('researchArea', data.researchArea);
      if (data.proofFile) {
        formData.append('proofFile', data.proofFile);
      }

      const response = await apiClient.post<{ user: User }>(
        '/auth/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<{ token: string }>(
        '/auth/refresh',
        { refreshToken }
      );

      this.setToken(response.data.token);
      return response.data.token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private validateRegistration(data: RegisterData): void {
    if (data.password !== data.passwordConfirm) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (data.password.length < 12) {
      throw new Error('Contraseña debe tener al menos 12 caracteres');
    }

    // Validar formato de email
    if (!this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  private mapError(error: any): AuthError {
    if (error.response?.status === 401) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'Email o contraseña incorrectos'
      };
    }

    if (error.response?.status === 409) {
      return {
        code: 'EMAIL_EXISTS',
        message: 'Este email ya está registrado'
      };
    }

    if (error.response?.data?.message) {
      return {
        code: error.response.data.code || 'UNKNOWN_ERROR',
        message: error.response.data.message
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conexión. Intenta de nuevo.'
    };
  }
}

export const authService = new AuthService();
```

### 2.3 Auth Context

```typescript
// features/auth/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, User, LoginCredentials, RegisterData, UserRole } from '../types/auth.types';
import { authService } from '../services/authService';

export const AuthContext = createContext<(AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}) | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
    hasPermission: () => false
  });

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Validar token con backend
          // const user = await authService.validateToken(token);
          // setState(prev => ({
          //   ...prev,
          //   token,
          //   user,
          //   isAuthenticated: true
          // }));
        }
      } catch (error) {
        authService.logout();
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { token, user } = await authService.login(credentials);
      setState(prev => ({
        ...prev,
        token,
        user,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as any,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { user } = await authService.register(data);
      setState(prev => ({
        ...prev,
        user,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as any,
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      hasPermission: () => false
    });
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    // Implementar lógica de permisos basada en roles
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['*'],
      researcher: ['read:data', 'write:research'],
      user: ['read:public']
    };
    
    const userPermissions = state.user.roles
      .flatMap(role => rolePermissions[role]);
    
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [state.user]);

  const value = {
    ...state,
    hasPermission,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2.4 Hook useAuth

```typescript
// features/auth/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

## 3. PROTECTED ROUTES

```typescript
// shared/components/ProtectedRoute/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/types/auth.types';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRoles = [],
  requiredPermissions = []
}) => {
  const { isAuthenticated, user, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => 
      requiredRoles.includes(role)
    );
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Verificar permisos
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return element;
};
```

---

## 4. API CLIENT ROBUSTO

```typescript
// shared/services/apiClient.ts
import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosResponse 
} from 'axios';
import { authService } from '@/features/auth/services/authService';
import { logger } from './logger';

interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleError.bind(this)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      this.handleResponseError.bind(this)
    );
  }

  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }

  private async handleResponseError(error: AxiosError<ApiErrorResponse>) {
    const originalRequest = error.config as any;

    // Si es error 401 y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return this.client(originalRequest);
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        const newToken = await authService.refreshToken();
        this.isRefreshing = false;

        this.failedQueue.forEach(({ resolve }) => resolve(newToken));
        this.failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return this.client(originalRequest);
      } catch (refreshError) {
        this.failedQueue = [];
        // Redirigir a login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }

  private handleError(error: any): Promise<never> {
    logger.error('API Request failed', { error });
    return Promise.reject(error);
  }

  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: any): ApiErrorResponse {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'Tiempo de espera agotado. Intenta de nuevo.'
      };
    }

    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conexión. Verifica tu internet.'
    };
  }
}

export const apiClient = new ApiClient();
```

---

## 5. VALIDACIÓN CON ZOD

```typescript
// shared/utils/validation.ts
import { z } from 'zod';

export const emailSchema = z.string()
  .email('Email inválido')
  .min(5)
  .max(254);

export const passwordSchema = z.string()
  .min(12, 'Mínimo 12 caracteres')
  .regex(/[A-Z]/, 'Debe incluir mayúscula')
  .regex(/[0-9]/, 'Debe incluir número')
  .regex(/[!@#$%^&*]/, 'Debe incluir carácter especial');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña requerida')
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  passwordConfirm: z.string(),
  name: z.string().min(2).max(100),
  institution: z.string().min(3),
  researchArea: z.string().min(10)
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

---

## 6. ERROR BOUNDARY

```typescript
// shared/components/ErrorBoundary/ErrorBoundary.tsx
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '@/shared/services/logger';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('React Error Boundary caught an error', {
      error,
      errorInfo: errorInfo.componentStack
    });
  }

  retry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-4">
              {this.state.error.message}
            </p>
            <button
              onClick={this.retry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. TESTING SETUP

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

```typescript
// features/auth/hooks/useAuth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';

describe('useAuth', () => {
  it('debería lanzar error si no está dentro de AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth debe ser usado dentro de AuthProvider');
  });

  it('debería retornar user null cuando no está autenticado', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debería permitir login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'ValidPassword123!'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
  });
});
```

---

## 8. LOGGING CENTRALIZADO

```typescript
// shared/services/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: window.location.href
    };

    // Console en desarrollo
    if (this.isDevelopment) {
      console[level](message, data);
    }

    // Enviar a servicio en producción
    if (level === 'error' && !this.isDevelopment) {
      this.sendToSentry(logEntry);
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  private sendToSentry(logEntry: any): void {
    // Implementar con Sentry
    // Sentry.captureException(error);
  }
}

export const logger = new Logger();
```

---

## 9. CONSTANTS CENTRALIZADAS

```typescript
// shared/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  DASHBOARD: '/dashboard',
  DATA: '/datos',
  GEOREFERENCING: '/georeferencia',
  INVESTIGATIONS: '/investigaciones',
  ABOUT: '/nosotros',
  CONTACT: '/contacto',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
} as const;

// shared/constants/errors.ts
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  UNAUTHORIZED: 'No tienes permiso para acceder',
  SERVER_ERROR: 'Error del servidor. Intenta de nuevo.',
  VALIDATION_ERROR: 'Por favor revisa los errores en el formulario'
} as const;

// shared/constants/security.ts
export const SECURITY = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'video/mp4'],
  PASSWORD_MIN_LENGTH: 12,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 min
  API_TIMEOUT: 30000 // 30s
} as const;
```

---

## 10. CI/CD CONFIGURATION

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Unit tests
        run: npm run test:unit
      
      - name: E2E tests
        run: npm run test:e2e
      
      - name: Security audit
        run: npm audit --audit-level=moderate
      
      - name: Build
        run: npm run build
      
      - name: Bundle analysis
        run: npm run analyze:bundle
```

---

## CHECKLIST DE IMPLEMENTACIÓN PRIORIZADA

### Semana 1 (Bloqueantes)
- [ ] Implementar AuthContext completo
- [ ] Crear authService.ts
- [ ] Implementar Protected Routes
- [ ] Proteger API key (move to backend)
- [ ] Setup Zod validation
- [ ] Implementar ErrorBoundary

### Semana 2 (Seguridad)
- [ ] Implementar CSRF protection
- [ ] Input sanitization (DOMPurify)
- [ ] File upload validation
- [ ] Rate limiting
- [ ] Setup logger con Sentry

### Semana 3 (Testing)
- [ ] Setup Vitest
- [ ] Unit tests (80%+ coverage)
- [ ] Component tests
- [ ] Integration tests

### Semana 4 (Quality)
- [ ] Setup ESLint + Prettier
- [ ] Code splitting & lazy loading
- [ ] Bundle analysis
- [ ] Performance optimization

---

Esta guía proporciona una hoja de ruta clara y específica para llevar el proyecto a estándares profesionales de producción.
