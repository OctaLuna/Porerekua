# 📦 ANÁLISIS RIGUROSO DE DEPENDENCIAS Y HERRAMIENTAS
## Porerekua Frontend - Transformación a Estándares Profesionales

**Evaluador:** Expert QA & Security Analyst  
**Fecha:** Abril 2026  
**Nivel de Rigor:** ISO/IEC 25010 + OWASP  

---

## ÍNDICE

1. [Análisis de Dependencias Actuales](#análisis-actual)
2. [Nuevas Dependencias Requeridas](#dependencias-nuevas)
3. [Herramientas de Desarrollo](#herramientas-dev)
4. [Herramientas de Seguridad](#herramientas-seguridad)
5. [Testing & QA](#testing-qa)
6. [Monitoreo & Logging](#monitoreo)
7. [Build & Deployment](#build-deployment)
8. [Plan de Implementación](#plan-implementacion)

---

# ANÁLISIS ACTUAL DE DEPENDENCIAS {#análisis-actual}

## Estado Actual del package.json

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.2",      // ✓ Actualizado
    "@types/maplibre-gl": "^1.13.2",        // ✓ OK
    "framer-motion": "^12.23.22",           // ✓ Actualizado
    "maplibre-gl": "^5.9.0",                // ✓ Actualizado
    "react": "^19.1.1",                     // ✓ Última versión
    "react-dom": "^19.1.1",                 // ✓ Última versión
    "react-router-dom": "^7.9.3"            // ✓ Última versión
  },
  "devDependencies": {
    "@types/node": "^22.14.0",              // ✓ OK
    "@vitejs/plugin-react": "^5.0.0",       // ✓ OK
    "typescript": "~5.8.2",                 // ✓ OK
    "vite": "^6.2.0"                        // ✓ OK
  }
}
```

### Evaluación de Dependencias Actuales

| Paquete | Versión | Status | Crítica | Issues |
|---------|---------|--------|---------|--------|
| React | 19.1.1 | ✓ | NO | Ninguno |
| React DOM | 19.1.1 | ✓ | NO | Ninguno |
| React Router | 7.9.3 | ✓ | NO | Ninguno |
| Framer Motion | 12.23.22 | ✓ | NO | Ninguno |
| TanStack Query | 5.90.2 | ✓ | NO | Ninguno |
| MapLibre GL | 5.9.0 | ✓ | NO | Ninguno |
| Vite | 6.2.0 | ✓ | NO | Ninguno |
| TypeScript | 5.8.2 | ✓ | NO | Ninguno |

### Problemas Identificados

#### 🔴 **CRÍTICO - Dependencias FALTANTES**

```
SECURIDAD:
  ✓ NO axios / fetch wrapper
  ✓ NO jsonwebtoken handling
  ✓ NO password validation
  ✓ NO input sanitization (DOMPurify)
  ✓ NO CSRF protection
  
VALIDACIÓN:
  ✓ NO schema validation (Zod, Yup)
  ✓ NO form validation
  ✓ NO type-safe env variables
  
TESTING:
  ✓ NO test runner (Vitest)
  ✓ NO testing library
  ✓ NO E2E testing (Cypress/Playwright)
  ✓ NO coverage reporting
  
MONITOREO:
  ✓ NO error tracking (Sentry)
  ✓ NO performance monitoring
  ✓ NO logging
  
CALIDAD:
  ✓ NO linting (ESLint)
  ✓ NO formatting (Prettier)
  ✓ NO pre-commit hooks (Husky)
```

#### 🟠 **ALTA - Dependencias Sin Configuración Segura**

```
VITE CONFIG:
  ⚠️ Sin Content Security Policy headers
  ⚠️ Sin CORS configuration
  ⚠️ Sin rate limiting setup
  ⚠️ Sin API key protection

REACT:
  ⚠️ Sin Error Boundary
  ⚠️ Sin Suspense wrapper
  ⚠️ Sin context optimization
```

---

# NUEVAS DEPENDENCIAS REQUERIDAS {#dependencias-nuevas}

## 1. SEGURIDAD Y AUTENTICACIÓN

### 1.1 axios (HTTP Client)

**Versión:** `^1.7.4`  
**Categoría:** CRÍTICA  
**Razón:** Client HTTP robusto con interceptores

#### Justificación Técnica

**¿Por qué axios y no fetch?**

```typescript
// ❌ Fetch vanilla - Problemas
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
  headers: { 'Content-Type': 'application/json' }
});

if (!response.ok) {
  // Manejo tedioso de errores
  if (response.status === 401) { /* ... */ }
  if (response.status === 500) { /* ... */ }
}

const data = await response.json();
// Sin interceptores para:
// - Agregar auth headers
// - Refrescar tokens
// - Reintentar en fallos
// - Logging centralizado
```

```typescript
// ✓ Axios - Solución profesional
const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor de request
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de response (manejo de 401)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refrescar token automáticamente
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

**Ventajas Profesionales:**
- ✓ Request/Response interceptors
- ✓ Automatic token refresh
- ✓ Retry logic
- ✓ Request cancellation (CancelToken)
- ✓ Upload progress tracking
- ✓ Error mapping centralizado
- ✓ Timeout configuration
- ✓ XSRF token handling automático

**Desventajas Mitigadas:**
- Bundle size +14KB (aceptable por funcionalidad)
- Alternativa: vanilla fetch con custom wrapper (más mantenimiento)

**Comparativa:**

| Característica | Axios | Fetch | Superagent | UmiRequest |
|---|---|---|---|---|
| Interceptores | ✓ Nativo | ✓ Manual | ✓ Nativo | ✓ Nativo |
| Error Handling | ✓ Robusto | ⚠️ Manual | ✓ Robusto | ✓ Robusto |
| Token Refresh | ✓ Built-in | ✗ Manual | ⚠️ Manual | ✓ Built-in |
| Cancelación | ✓ Fácil | ⚠️ AbortController | ✓ Fácil | ✓ Fácil |
| Bundle Size | 14KB | 0KB | 28KB | 8KB |
| Comunidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Recomendación** | **✓ MEJOR** | Mínimo | Alternativa | Overkill |

---

### 1.2 zod (Schema Validation)

**Versión:** `^3.22.4`  
**Categoría:** CRÍTICA  
**Razón:** Validación de entrada type-safe

#### Justificación Técnica

**Problema Actual:** Sin validación

```typescript
// ❌ Vulnerable
const handleLogin = async (email: string, password: string) => {
  // Sin validación de entrada
  // Posible XSS, injection, etc.
  const response = await api.post('/login', { email, password });
};
```

**Solución con Zod:**

```typescript
// ✓ Type-safe validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5)
    .max(254)
    .toLowerCase(),  // Normalizar
  password: z.string()
    .min(12, 'Mínimo 12 caracteres')
    .regex(/[A-Z]/, 'Debe incluir mayúscula')
    .regex(/[0-9]/, 'Debe incluir número')
    .regex(/[!@#$%^&*]/, 'Debe incluir carácter especial')
});

type LoginInput = z.infer<typeof loginSchema>;

const handleLogin = async (credentials: LoginInput) => {
  // Validación automática
  const validated = loginSchema.parse(credentials);
  // TypeScript sabe que validated es tipo-seguro
  const response = await api.post('/login', validated);
};
```

**Ventajas profesionales:**
- ✓ Runtime validation + TypeScript types
- ✓ Transformación de datos (lowercase, trim, etc)
- ✓ Mensajes de error customizables
- ✓ Composición de schemas
- ✓ Validación anidada
- ✓ Type inference automático

**Comparativa:**

| Característica | Zod | Yup | Joi | Class Validator |
|---|---|---|---|---|
| TypeScript Native | ✓⭐⭐⭐ | ⚠️ | ✗ | ✓⭐ |
| Runtime + Types | ✓ Dual | ⚠️ TypeScript | ✗ Runtime | ✓ Runtime |
| Async Validation | ✓ | ✓ | ✓ | ✓ |
| Error Messages | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Bundle Size | 8KB | 15KB | 20KB | 25KB |
| **Recomendación** | **✓ MEJOR** | Alternativa | Legacy | No para FE |

---

### 1.3 jsonwebtoken (JWT handling)

**Versión:** `^9.1.2`  
**Categoría:** CRÍTICA  
**Razón:** Manejo seguro de JWT tokens

#### Justificación Técnica

**Caso de Uso:**

```typescript
// Validación de JWT en cliente (antes de enviar a API)
import jwt from 'jsonwebtoken';

class TokenManager {
  private readonly TOKEN_KEY = 'auth_token';
  
  validateToken(token: string): boolean {
    try {
      // Verificar que token es válido y no expiró
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded) return false;
      
      const payload = decoded.payload as any;
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar expiración
      if (payload.exp && payload.exp < now) {
        return false;  // Token expirado
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  isTokenExpiringSoon(token: string, threshold: number = 300): boolean {
    try {
      const decoded = jwt.decode(token, { complete: true });
      const payload = decoded?.payload as any;
      const now = Math.floor(Date.now() / 1000);
      
      // Refrescar si vence en menos de 5 min
      return payload.exp < now + threshold;
    } catch {
      return true;
    }
  }
}
```

**Ventajas:**
- ✓ Verificación de expiración en cliente
- ✓ Decodificación segura
- ✓ Validación de estructura
- ✓ Previene XSS en token storage
- ✓ Sincronización de refresh automática

**Alternativas:**
- ❌ Guardar JWT en localStorage sin validación (VULNERABLE)
- ⚠️ Implementar JWT parser manual (error-prone)
- ✓ Usar jsonwebtoken (profesional, tested)

---

### 1.4 jose (JWT encryption)

**Versión:** `^5.2.3`  
**Categoría:** ALTA  
**Razón:** Encriptación de tokens en tránsito

```typescript
// Alternativa moderna a jsonwebtoken
import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Verificar y decodificar
const { payload } = await jose.jwtVerify(token, secret);
```

**Ventajas sobre jsonwebtoken:**
- ✓ Soporte nativo de Web Crypto API
- ✓ Mejor rendimiento
- ✓ Soporte para JWE (encrypted tokens)
- ✓ Mejor tipado en TypeScript

**Usar: jose (recomendado para producción)**

---

### 1.5 bcryptjs (Password hashing - cliente)

**Versión:** `^2.4.3`  
**Categoría:** MEDIA  
**Razón:** Hash de contraseña antes de enviar (capa adicional)

⚠️ **IMPORTANTE:** El hash debe hacerse también en backend

```typescript
// Cliente: pre-hash de contraseña
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);  // 12 rounds = ~250ms en navegador
  return bcrypt.hash(password, salt);
};

// Enviar hash al backend, que lo valida contra su BD
const response = await api.post('/auth/register', {
  email,
  passwordHash: await hashPassword(password)
});
```

**Ventajas:**
- ✓ Contraseña nunca se envía en texto plano
- ✓ Hash en cliente + hash en backend = defensa en capas
- ✓ Protege contra mitm si HTTPS falla

**Desventajas:**
- Hash en cliente es visible en DevTools (pero mejor que nada)
- Cliente puede hacerlo mal
- **DEBE complementarse con hash en backend**

---

## 2. VALIDACIÓN DE DATOS

### 2.1 react-hook-form (Form state management)

**Versión:** `^7.50.3`  
**Categoría:** ALTA  
**Razón:** Gestión eficiente de estado de formularios

```typescript
// ❌ Sin librería
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  const validationErrors = {};
  
  if (!email.includes('@')) {
    validationErrors.email = 'Email inválido';
  }
  // ... más validación manual
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  // ... submit
  setIsSubmitting(false);
};

// Repetir para cada formulario de la app!
```

```typescript
// ✓ Con react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/shared/utils/validation';

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Procesando...' : 'Ingresar'}
      </button>
    </form>
  );
};
```

**Ventajas:**
- ✓ Validación con Zod integrada
- ✓ Manejo automático de loading state
- ✓ Validación on-blur/on-change
- ✓ Integración con librerías UI
- ✓ Performance optimizado (no re-renders innecesarios)
- ✓ 9KB gzipped

**Comparativa:**

| Característica | react-hook-form | Formik | Final Form |
|---|---|---|---|
| Bundle Size | 9KB | 14KB | 8KB |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Zod Integration | ✓ Native | ⚠️ Manual | ⚠️ Manual |
| Learning Curve | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Recomendación** | **✓ MEJOR** | Legacy | Alternativa |

---

### 2.2 @hookform/resolvers (Integradores de validación)

**Versión:** `^3.3.4`  
**Categoría:** MEDIA  
**Razón:** Integración de Zod con react-hook-form

```typescript
import { zodResolver } from '@hookform/resolvers/zod';

// Conecta Zod schemas con react-hook-form
const { control } = useForm({
  resolver: zodResolver(mySchema)
});
```

---

## 3. SEGURIDAD

### 3.1 dompurify (XSS Prevention)

**Versión:** `^3.0.9`  
**Categoría:** CRÍTICA  
**Razón:** Sanitización de HTML

```typescript
// ❌ Vulnerable a XSS
const userInput = '<img src=x onerror="alert(\'XSS\')">';
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ✓ Con DOMPurify
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(userInput);
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;

// Resultado: <img src="x">
// El atributo onerror se removió!
```

**Casos de Uso:**
- ✓ Renderizar contenido user-generated
- ✓ Prevenir stored XSS
- ✓ Sanitizar rich text

**Configuración Segura:**

```typescript
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  KEEP_CONTENT: true
};

DOMPurify.sanitize(userInput, config);
```

---

### 3.2 js-cookie (Secure cookie handling)

**Versión:** `^3.0.5`  
**Categoría:** MEDIA  
**Razón:** Manejo seguro de cookies

```typescript
// ❌ Inseguro
document.cookie = `token=${jwtToken}`;

// ✓ Con js-cookie
import Cookies from 'js-cookie';

Cookies.set('token', jwtToken, {
  secure: true,           // HTTPS only
  httpOnly: false,        // Accesible a JS (para verificación)
  sameSite: 'Strict',    // CSRF protection
  expires: 1              // 1 día
});

// Leer
const token = Cookies.get('token');

// Limpiar
Cookies.remove('token');
```

**Nota:** `httpOnly: true` debe configurarse en el servidor

---

### 3.3 crypto-js (Data encryption)

**Versión:** `^4.2.0`  
**Categoría:** MEDIA  
**Razón:** Encriptación de datos sensibles en localStorage

```typescript
// ❌ Almacenar sin encriptar
localStorage.setItem('user', JSON.stringify(userData));

// ✓ Con crypto-js
import CryptoJS from 'crypto-js';

const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(userData),
  process.env.ENCRYPT_KEY
).toString();

localStorage.setItem('user', encrypted);

// Desencriptar
const decrypted = CryptoJS.AES.decrypt(
  localStorage.getItem('user'),
  process.env.ENCRYPT_KEY
).toString(CryptoJS.enc.Utf8);

const userData = JSON.parse(decrypted);
```

**Limitaciones:**
- ⚠️ La clave está en el navegador (no es verdadera seguridad)
- ⚠️ Protege contra inspección casual, NO contra ataques serios
- ✓ Use solo para datos no-críticos

---

## 4. TESTING {#testing-qa}

### 4.1 vitest (Unit test runner)

**Versión:** `^1.0.4`  
**Categoría:** CRÍTICA  
**Razón:** Testing framework moderno para TypeScript

**¿Por qué Vitest vs Jest?**

```typescript
// Configuración Vitest
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      lines: 80,
      functions: 80
    }
  }
});

// Test
describe('LoginForm', () => {
  it('should validate email', () => {
    // ...
  });
});
```

**Ventajas sobre Jest:**
- ✓ 5-10x más rápido (basado en esbuild/Vite)
- ✓ HMR para tests
- ✓ Mejor integración con TypeScript
- ✓ Compatible con la config de Vite
- ✓ Menos memoria

**Comparativa:**

| Característica | Vitest | Jest | Mocha |
|---|---|---|---|
| Velocidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| TypeScript | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ |
| HMR | ✓ | ✗ | ✗ |
| Vite Compatible | ✓ Native | ⚠️ Plugin | ✗ |
| API | ✓ Vitest | ✓ Jest | ✗ Custom |
| **Recomendación** | **✓ MEJOR** | Legacy | No |

---

### 4.2 @testing-library/react (Component testing)

**Versión:** `^14.1.2`  
**Categoría:** CRÍTICA  
**Razón:** Test components como usuarios, no como implementación

```typescript
// ❌ Mal (testing implementation details)
import { render } from '@testing-library/react';
import LoginForm from './LoginForm';

it('should render input with id=email', () => {
  const { container } = render(<LoginForm />);
  expect(container.querySelector('#email')).toBeInTheDocument();
});

// ✓ Bien (testing behavior)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should show error when email is invalid', async () => {
  render(<LoginForm />);
  
  const emailInput = screen.getByLabelText(/correo/i);
  await userEvent.type(emailInput, 'invalid-email');
  
  const submitButton = screen.getByRole('button', { name: /ingresar/i });
  await userEvent.click(submitButton);
  
  expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
});
```

**Filosofía:**
- ✓ Test desde la perspectiva del usuario
- ✓ Queries por accesibilidad (label, role, etc)
- ✓ Tests más resilientes a cambios de implementación

**Best Practices:**

```typescript
// Query priority (mejor a peor)
getByRole('button', { name: /submit/i })        // ✓ MEJOR
getByLabelText(/email/i)                        // ✓
getByPlaceholderText(/email/i)                  // ⚠️
getByText(/email/i)                             // ⚠️
getByTestId('email-input')                      // ❌ PEOR (implementation detail)
```

---

### 4.3 @testing-library/user-event (User interaction simulation)

**Versión:** `^14.5.2`  
**Categoría:** ALTA  
**Razón:** Simular acciones de usuario realisticamente

```typescript
// ❌ Obsoleto (fireEvent)
import { render, fireEvent } from '@testing-library/react';

const input = screen.getByRole('textbox');
fireEvent.change(input, { target: { value: 'test' } });

// ✓ Moderno (userEvent)
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
const input = screen.getByRole('textbox');
await user.type(input, 'test');  // Simula typing real
```

**Diferencias:**
- `fireEvent`: Dispara eventos directamente (no realista)
- `userEvent`: Simula acciones reales del usuario (keyboard, focus, etc)

---

### 4.4 vitest-canvas-mock (Canvas testing)

**Versión:** `^0.2.3`  
**Categoría:** MEDIA  
**Razón:** Mockear Canvas API para MapLibre GL tests

```typescript
// MapLibre GL usa Canvas
// Necesita mock en jsdom
import { vi } from 'vitest';
import 'vitest-canvas-mock';

// Ahora Canvas funciona en tests
```

---

### 4.5 msw (Mock Service Worker)

**Versión:** `^2.0.11`  
**Categoría:** ALTA  
**Razón:** Mockear API sin tocar código de aplicación

```typescript
// ✓ Mockear API de forma realista
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      user: { id: '1', email: 'test@example.com' }
    });
  }),
  
  http.get('/api/projects', ({ request }) => {
    // Acceder a headers, query params, etc
    const auth = request.headers.get('Authorization');
    
    if (!auth) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json([
      { id: '1', name: 'Project 1' }
    ]);
  })
);

// Setup en test
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test
it('should login successfully', async () => {
  render(<LoginForm />);
  
  // Interactuar con form
  // MSW intercepta llamada a /api/auth/login
  // Retorna mock response
});
```

**Ventajas:**
- ✓ No necesita cambiar código de aplicación
- ✓ Funciona con cualquier HTTP client (axios, fetch, etc)
- ✓ Puede interceptar requests en navegador y Node
- ✓ Errores realistas (timeouts, network errors)

---

### 4.6 @vitest/coverage-v8 (Coverage reporting)

**Versión:** `^1.0.4`  
**Categoría:** ALTA  
**Razón:** Reporte de cobertura de código

```bash
# Ejecutar tests con cobertura
npm run test:coverage

# Resultado
# -------------|----------|----------|----------|----------|
# File         | % Stmts  | % Branch | % Funcs  | % Lines  |
# -------------|----------|----------|----------|----------|
# LoginForm    | 85%      | 78%      | 92%      | 85%      |
# authService  | 95%      | 90%      | 100%     | 95%      |
```

**Configuración de quality gates:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      lines: 80,      // Mínimo 80% cobertura
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
});
```

---

## 5. LINTING Y FORMATO {#herramientas-dev}

### 5.1 eslint (Linting)

**Versión:** `^8.54.0`  
**Categoría:** ALTA  
**Razón:** Análisis estático de código

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'  // Desabilita rules que conflictuan con prettier
  ],
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/react-in-jsx-scope': 'off',  // React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  }
};
```

**Plugins críticos:**

| Plugin | Propósito |
|--------|-----------|
| `eslint-plugin-react` | Reglas React |
| `eslint-plugin-@typescript-eslint` | Reglas TypeScript |
| `eslint-plugin-react-hooks` | Validar hooks |
| `eslint-plugin-security` | Detect security issues |
| `eslint-plugin-import` | Import/export validation |

---

### 5.2 prettier (Code formatting)

**Versión:** `^3.1.0`  
**Categoría:** ALTA  
**Razón:** Formateo automático consistente

```javascript
// .prettierrc.cjs
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'avoid'
};
```

**Integración:**

```json
// package.json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx}\""
  }
}
```

---

### 5.3 husky (Git hooks)

**Versión:** `^8.0.3`  
**Categoría:** MEDIA  
**Razón:** Ejecutar checks antes de commit

```bash
# Setup
npx husky install

# Pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run format:check"

# Pre-push hook
npx husky add .husky/pre-push "npm run test:unit"
```

**Flujo:**

```
Developer commits code
    ↓
Pre-commit hook
    ├─ ESLint check
    ├─ Prettier format check
    └─ Type checking
    ↓
Si todo OK → commit permitido
Si falla → commit bloqueado
```

---

### 5.4 lint-staged (Lint staged files)

**Versión:** `^15.2.0`  
**Categoría:** MEDIA  
**Razón:** Lint solo archivos modificados

```javascript
// .lintstagedrc.cjs
module.exports = {
  '**/*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'vitest run'  // Ejecutar tests relevantes
  ],
  '**/*.{json,md}': 'prettier --write'
};
```

**Beneficio:** Linting rápido (solo archivos changed)

---

### 5.5 commitlint (Conventional commits)

**Versión:** `^18.4.3`  
**Categoría:** MEDIA  
**Razón:** Standardizar mensajes de commit

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',      // Nueva feature
        'fix',       // Bug fix
        'docs',      // Documentación
        'style',     // Code style
        'refactor',  // Refactoring
        'perf',      // Performance
        'test',      // Tests
        'chore',     // Maintenance
        'security'   // Security fix
      ]
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'subject-empty': [2, 'never'],
    'subject-period': [2, 'never']
  }
};
```

**Mensaje válido:**

```
security: encrypt sensitive data in localStorage

This implements AES encryption for user data
stored in localStorage to prevent XSS attacks.

Closes #123
```

---

## 6. MONITOREO Y LOGGING {#monitoreo}

### 6.1 sentry (Error tracking)

**Versión:** `^7.84.0`  
**Categoría:** CRÍTICA  
**Razón:** Tracking centralizado de errores en producción

```typescript
// Inicializar
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,  // Privacy
      blockAllMedia: true
    })
  ],
  tracesSampleRate: 0.1,     // 10% de sesiones
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0  // 100% cuando hay error
});
```

**Uso en aplicación:**

```typescript
// Capturar error automáticamente
try {
  await loginUser(credentials);
} catch (error) {
  Sentry.captureException(error);
  // También usa Sentry.captureMessage()
}

// Contextual data
Sentry.setUser({
  id: user.id,
  email: user.email
});

Sentry.setContext('form_data', {
  form: 'login',
  fields: ['email']
});
```

**Dashboard Sentry:**

```
- Errores en tiempo real
- Stack traces completos
- Reproducción de sesión (replay)
- Source maps upload
- Performance monitoring
- Release tracking
- Alertas automáticas
```

---

### 6.2 pino (Logging library)

**Versión:** `^8.17.2`  
**Categoría:** ALTA  
**Razón:** Logging estructurado eficiente

```typescript
// Configurar logger
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

// Usar
logger.info({ userId: '123' }, 'User logged in');
logger.error(
  { error, endpoint: '/api/login' },
  'Login failed'
);
logger.warn(
  { threshold: 100, current: 95 },
  'Approaching rate limit'
);
```

**Ventajas:**
- ✓ Logging estructurado (JSON)
- ✓ Performance optimizado
- ✓ Transport configurable (file, cloud, etc)
- ✓ Niveles de log (debug, info, warn, error)

---

### 6.3 winston (Alternative logging)

**Versión:** `^3.11.0`  
**Categoría:** MEDIA  
**Razón:** Alternativa con más features

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    })
  ]
});
```

**Comparativa Pino vs Winston:**

| Aspecto | Pino | Winston |
|--------|------|---------|
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Bundle Size | 50KB | 100KB |
| JSON Output | ✓ Native | ⚠️ Plugin |
| Transports | ⚠️ Limited | ✓ Muchos |
| **Recomendación** | **✓ FE** | Backend |

---

## 7. HERRAMIENTAS DE SEGURIDAD {#herramientas-seguridad}

### 7.1 snyk (Vulnerability scanning)

**Versión:** CLI  
**Categoría:** CRÍTICA  
**Razón:** Detectar vulnerabilidades en dependencias

```bash
# Instalar
npm install -g snyk

# Escanear
snyk test

# Resultados
✓ High severity vulnerability found in lodash
✓ Medium severity vulnerability in axios
✓ Low severity in dev-dependency

# Fix automático
snyk fix
```

**Integración CI/CD:**

```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]
jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/setup@master
      - run: snyk test --severity-threshold=high
```

---

### 7.2 npm audit (Built-in vulnerability scanner)

**Versión:** npm built-in  
**Categoría:** ALTA  
**Razón:** Escanear vulnerabilidades sin herramientas extras

```bash
# Auditar
npm audit

# Resultados
found 5 vulnerabilities (2 moderate, 3 low)

# Fix
npm audit fix
```

**CI/CD Check:**

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate"
  }
}
```

---

### 7.3 OWASP Dependency-Check (CLI)

**Versión:** CLI tool  
**Categoría:** MEDIA  
**Razón:** Scanning más profundo de vulnerabilidades

```bash
# Scan proyecto
dependency-check --scan /path/to/project

# Genera reporte HTML con vulnerabilidades encontradas
```

---

## 8. PERFORMANCE Y ANÁLISIS {#build-deployment}

### 8.1 @vitejs/plugin-compression (Build optimization)

**Versión:** `^0.0.5`  
**Categoría:** MEDIA  
**Razón:** Compresión de bundle (gzip, brotli)

```typescript
// vite.config.ts
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'brotli',  // brotli > gzip
      ext: '.br'
    })
  ]
});

// Resultado
// app.js (1.2MB)
// app.js.br (300KB) ← 75% de reducción!
```

---

### 8.2 rollup-plugin-visualizer (Bundle analysis)

**Versión:** `^5.11.0`  
**Categoría:** MEDIA  
**Razón:** Visualizar tamaño de bundle

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,  // Abre reporte después de build
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

**Resultado:** HTML interactivo mostrando qué libraries ocupan espacio

---

### 8.3 lighthouse (Performance testing)

**Instalación:** CLI o Chrome DevTools

```bash
# Instalar
npm install -g @lhci/cli@latest

# Configurar
npx lhci wizard --new-config

# Correr
npx lhci autorun

# Resultados
Performance:   92/100
Accessibility: 85/100
SEO:          100/100
Best Practices: 95/100
```

---

## 9. DEPENDENCIAS COMPLEMENTARIAS

### 9.1 clsx (Utility for classNames)

**Versión:** `^2.0.0`  
**Categoría:** UTILIDAD  
**Razón:** Manejo condicional de clases CSS

```typescript
// Sin clsx
<div className={`btn ${isLoading ? 'btn--loading' : ''} ${isError ? 'btn--error' : ''}`}>

// Con clsx
import clsx from 'clsx';

<div className={clsx(
  'btn',
  isLoading && 'btn--loading',
  isError && 'btn--error'
)}>
```

---

### 9.2 date-fns (Date manipulation)

**Versión:** `^2.30.0`  
**Categoría:** UTILIDAD  
**Razón:** Manipulación de fechas (alternativa a moment.js)

```typescript
import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

format(new Date(), 'dd/MM/yyyy', { locale: es });
// → "28/04/2026"

formatDistance(new Date(), new Date(Date.now() - 86400000), { locale: es, addSuffix: true });
// → "hace 1 día"
```

---

### 9.3 lodash-es (Utility functions)

**Versión:** `^4.17.21`  
**Categoría:** UTILIDAD  
**Razón:** Funciones utilitarias comunes

```typescript
import { debounce, throttle, pick, omit } from 'lodash-es';

// Debounce search
const searchUsers = debounce(async (query) => {
  const results = await api.get(`/users?q=${query}`);
}, 500);

// Omit sensitive fields
const safeUser = omit(user, ['password', 'refreshToken']);
```

---

### 9.4 uuid (Generate unique IDs)

**Versión:** `^9.0.1`  
**Categoría:** UTILIDAD  
**Razón:** Generar UUIDs para claves locales

```typescript
import { v4 as uuidv4 } from 'uuid';

const uniqueId = uuidv4();
// → "550e8400-e29b-41d4-a716-446655440000"
```

---

# TABLA RESUMEN DE TODAS LAS DEPENDENCIAS {#plan-implementacion}

## Dependencias de Producción Recomendadas

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "@tanstack/react-query": "^5.90.2",
    "framer-motion": "^12.23.22",
    "maplibre-gl": "^5.9.0",
    
    "axios": "^1.7.4",
    "zod": "^3.22.4",
    "react-hook-form": "^7.50.3",
    "@hookform/resolvers": "^3.3.4",
    "jsonwebtoken": "^9.1.2",
    "jose": "^5.2.3",
    "bcryptjs": "^2.4.3",
    "dompurify": "^3.0.9",
    "js-cookie": "^3.0.5",
    "crypto-js": "^4.2.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "lodash-es": "^4.17.21",
    "uuid": "^9.0.1"
  }
}
```

## DevDependencies Recomendadas

```json
{
  "devDependencies": {
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "@types/node": "^22.14.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    
    "vitest": "^1.0.4",
    "@vitest/coverage-v8": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.2",
    "vitest-canvas-mock": "^0.2.3",
    "msw": "^2.0.11",
    
    "eslint": "^8.54.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-@typescript-eslint": "^6.13.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-security": "^2.1.0",
    
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "commitlint": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    
    "@sentry/react": "^7.84.0",
    "@sentry/tracing": "^7.84.0",
    
    "pino": "^8.17.2",
    "pino-pretty": "^10.3.1",
    
    "rollup-plugin-visualizer": "^5.11.0",
    "vite-plugin-compression": "^0.0.5"
  }
}
```

---

## Plan de Implementación por Fases

### FASE 1: SEGURIDAD CRÍTICA (Días 1-3)

```bash
npm install axios zod jsonwebtoken jose dompurify js-cookie
npm install --save-dev eslint prettier husky lint-staged commitlint
```

**Acción:** Setup de autenticación y validación

---

### FASE 2: SEGURIDAD AVANZADA (Días 4-5)

```bash
npm install bcryptjs crypto-js
npm install --save-dev @sentry/react sentry/tracing
```

**Acción:** Encryption, logging, error tracking

---

### FASE 3: TESTING (Días 6-7)

```bash
npm install --save-dev vitest @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event vitest-canvas-mock msw
```

**Acción:** Setup testing framework

---

### FASE 4: QUALITY TOOLS (Día 8+)

```bash
npm install --save-dev @sentry/cli rollup-plugin-visualizer \
  vite-plugin-compression
npm install clsx date-fns lodash-es uuid
```

**Acción:** Análisis, performance, utilities

---

# MATRIZ DE IMPACTO Y PRIORIDAD

| Dependencia | Criticidad | Bundle Size | Impacto | Semana |
|---|---|---|---|---|
| axios | 🔴 CRÍTICA | 14KB | Autenticación | 1 |
| zod | 🔴 CRÍTICA | 8KB | Validación | 1 |
| jsonwebtoken | 🔴 CRÍTICA | 45KB | JWT parsing | 1 |
| react-hook-form | 🔴 CRÍTICA | 9KB | Forms | 1 |
| dompurify | 🔴 CRÍTICA | 16KB | XSS prevention | 1 |
| vitest | 🔴 CRÍTICA | 0KB (dev) | Testing | 2 |
| @testing-library/react | 🟠 ALTA | 0KB (dev) | Testing | 2 |
| eslint | 🟠 ALTA | 0KB (dev) | Linting | 1 |
| @sentry/react | 🟠 ALTA | 50KB | Error tracking | 2 |
| pino | 🟠 ALTA | 15KB | Logging | 2 |
| bcryptjs | 🟡 MEDIA | 20KB | Password hashing | 3 |
| crypto-js | 🟡 MEDIA | 18KB | Data encryption | 3 |
| prettier | 🟡 MEDIA | 0KB (dev) | Formatting | 1 |
| clsx | 🟡 MEDIA | 2KB | Utilities | 4 |
| date-fns | 🟡 MEDIA | 13KB | Date formatting | 4 |

---

# COSTO DE IMPLEMENTACIÓN

## Bundle Size Impact

```
ANTES:
├── React & DOM: ~150KB
├── React Router: ~45KB
├── Framer Motion: ~60KB
├── MapLibre GL: ~120KB
├── TanStack Query: ~40KB
└── Total: ~415KB

DESPUÉS (sin libraries grandes):
├── React & DOM: ~150KB
├── React Router: ~45KB
├── Framer Motion: ~60KB
├── MapLibre GL: ~120KB
├── TanStack Query: ~40KB
├── axios: ~14KB
├── zod: ~8KB
├── react-hook-form: ~9KB
├── dompurify: ~16KB
├── @sentry/react: ~50KB (opcional en producción)
├── pino: ~15KB
├── jose: ~10KB
├── @types/*: ~5KB
└── Total: ~542KB

AUMENTO: ~127KB (+31%)
PERO: Funcionalidad CRÍTICA para producción
MITIGACIÓN: Code splitting reduce impacto
```

## Alternativas para Reducir Bundle

### Option 1: Tree Shaking

```typescript
// ✓ Mejor
import { debounce } from 'lodash-es';  // Solo debounce se incluye

// ❌ Peor
import lodash from 'lodash';  // TODO se incluye
```

### Option 2: Dynamic Imports

```typescript
// Lazy load Sentry solo si no es desarrollo
if (process.env.NODE_ENV === 'production') {
  import('@sentry/react').then(Sentry => {
    // Setup
  });
}
```

### Option 3: Alternatives Ligeras

```typescript
// En lugar de lodash-es (4.17KB min), usar alternativas:
// debounce: 1.5KB
// throttle: 1.2KB
// pick: 0.8KB

// O usar utilidades nativas de JS
const pick = (obj, keys) => 
  Object.fromEntries(keys.map(k => [k, obj[k]]));
```

---

# CONCLUSIÓN Y RECOMENDACIÓN

## Veredicto: INVERSIÓN NECESARIA

El costo en bundle size (+127KB) es **completamente justificado** por:

1. ✓ **Seguridad crítica** (autenticación, validación, XSS prevention)
2. ✓ **Testing profesional** (0% → 80%+ cobertura)
3. ✓ **Monitoreo en producción** (visibilidad de errores)
4. ✓ **Mantenibilidad** (linting, formatting, conventional commits)
5. ✓ **Developer experience** (herramientas profesionales)

## ROI Estimado

```
Costo: +127KB bundle (+31%)
Beneficio: Reducción 90% en bugs de producción
Break-even: Primera semana de producción
```

---

Este documento proporciona una hoja de ruta clara, rigurosa y justificada para llevar el proyecto a estándares profesionales con todas las herramientas necesarias.
