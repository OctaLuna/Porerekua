# 📦 PACKAGE.JSON FINAL RECOMENDADO + QUICK START
## Porerekua Frontend - Implementación Práctica

---

## PACKAGE.JSON COMPLETO Y RECOMENDADO

```json
{
  "name": "porerekua",
  "description": "Plataforma web para conservación de la Amazonía boliviana",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "license": "MIT",
  "author": "Porerekua Team",
  
  "scripts": {
    "// ============ DEVELOPMENT ============": "",
    "dev": "vite",
    "dev:host": "vite --host",
    
    "// ============ BUILD & PREVIEW ============": "",
    "build": "vite build",
    "preview": "vite preview",
    
    "// ============ LINTING & FORMATTING ============": "",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css,md,json}\"",
    "type-check": "tsc --noEmit",
    
    "// ============ TESTING ============": "",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:security": "npm audit --audit-level=moderate && snyk test",
    
    "// ============ CODE QUALITY ============": "",
    "quality": "npm run lint && npm run type-check && npm run format:check",
    "quality:fix": "npm run lint:fix && npm run format",
    
    "// ============ SECURITY & AUDITING ============": "",
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "snyk": "snyk test",
    "snyk:fix": "snyk fix",
    
    "// ============ GIT HOOKS ============": "",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    
    "// ============ UTILITY SCRIPTS ============": "",
    "clean": "rm -rf dist coverage node_modules",
    "analyze": "vite build --mode analyze"
  },
  
  "dependencies": {
    "// ======= FRAMEWORK & ROUTING ======= ": "",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    
    "// ======= STATE MANAGEMENT & DATA ======= ": "",
    "@tanstack/react-query": "^5.90.2",
    
    "// ======= UI & ANIMATIONS ======= ": "",
    "framer-motion": "^12.23.22",
    
    "// ======= MAPS ======= ": "",
    "maplibre-gl": "^5.9.0",
    "@types/maplibre-gl": "^1.13.2",
    
    "// ======= SECURITY & AUTHENTICATION ======= ": "",
    "axios": "^1.7.4",
    "jsonwebtoken": "^9.1.2",
    "jose": "^5.2.3",
    "bcryptjs": "^2.4.3",
    "dompurify": "^3.0.9",
    "@types/dompurify": "^3.0.8",
    "js-cookie": "^3.0.5",
    "@types/js-cookie": "^3.0.6",
    "crypto-js": "^4.2.0",
    
    "// ======= FORM HANDLING & VALIDATION ======= ": "",
    "zod": "^3.22.4",
    "react-hook-form": "^7.50.3",
    "@hookform/resolvers": "^3.3.4",
    
    "// ======= UTILITIES ======= ": "",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "lodash-es": "^4.17.21",
    "uuid": "^9.0.1",
    
    "// ======= LOGGING & MONITORING ======= ": "",
    "@sentry/react": "^7.84.0",
    "@sentry/tracing": "^7.84.0",
    "pino": "^8.17.2"
  },
  
  "devDependencies": {
    "// ======= VITE & BUILD ======= ": "",
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "vite-plugin-compression": "^0.0.5",
    
    "// ======= TYPESCRIPT ======= ": "",
    "typescript": "~5.8.2",
    "@types/node": "^22.14.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/react-router-dom": "^5.3.3",
    "@types/bcryptjs": "^2.4.6",
    "@types/crypto-js": "^4.2.2",
    "@types/lodash-es": "^4.17.12",
    
    "// ======= TESTING ======= ": "",
    "vitest": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "@vitest/coverage-v8": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.2",
    "vitest-canvas-mock": "^0.2.3",
    "msw": "^2.0.11",
    "@playwright/test": "^1.40.1",
    
    "// ======= LINTING & FORMATTING ======= ": "",
    "eslint": "^8.54.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-@typescript-eslint": "^6.13.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-security": "^2.1.0",
    "prettier": "^3.1.0",
    
    "// ======= GIT & COMMITS ======= ": "",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "commitlint": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    
    "// ======= ANALYSIS & MONITORING ======= ": "",
    "rollup-plugin-visualizer": "^5.11.0",
    "@sentry/cli": "^2.28.6",
    "pino-pretty": "^10.3.1"
  },
  
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=10.0.0"
  },
  
  "browserslist": [
    "last 2 versions",
    "not dead",
    "not < 1% in US"
  ]
}
```

---

## ⚡ QUICK START - INSTALACIÓN POR FASES

### PREREQUISITOS

```bash
# Verificar versiones
node --version    # >= 18.0.0
npm --version     # >= 10.0.0

# Actualizar npm si es necesario
npm install -g npm@latest
```

---

## FASE 1: SETUP INICIAL (15 minutos)

### 1. Reemplazar package.json

```bash
# Respaldar actual
cp package.json package.json.backup

# Copiar el nuevo package.json (del archivo anterior)
# Luego instalar
rm -rf node_modules package-lock.json
npm install
```

### 2. Setup ESLint y Prettier (5 min)

```bash
# Crear .eslintrc.cjs
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['react', '@typescript-eslint', 'security'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'security/detect-object-injection': 'warn'
  },
  settings: {
    react: { version: 'detect' }
  }
};
EOF
```

```bash
# Crear .prettierrc.cjs
cat > .prettierrc.cjs << 'EOF'
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'avoid'
};
EOF
```

```bash
# Crear .prettierignore
cat > .prettierignore << 'EOF'
dist
node_modules
.husky
EOF
```

### 3. Correr formateo inicial

```bash
# Formatear todo el código
npm run format

# Verificar linting
npm run lint:fix
```

---

## FASE 2: GIT HOOKS (5 minutos)

### 1. Setup Husky

```bash
# Inicializar husky
npm run prepare

# Crear pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Crear pre-push hook
npx husky add .husky/pre-push "npm run type-check && npm run test:unit"
```

### 2. Crear .lintstagedrc.cjs

```bash
cat > .lintstagedrc.cjs << 'EOF'
module.exports = {
  '**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md}': 'prettier --write'
};
EOF
```

### 3. Setup commitlint

```bash
# Crear commitlint.config.cjs
cat > commitlint.config.cjs << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'security']
    ]
  }
};
EOF

# Agregar commit-msg hook
npx husky add .husky/commit-msg 'npx commitlint --edit "$1"'
```

### 4. Hacer test del proceso

```bash
# Intentar un commit con mensaje inválido (debe fallar)
git add .
git commit -m "invalid message"  # ❌ Debe fallar

# Commit válido
git commit -m "feat: add new feature"  # ✓ Debe pasar
```

---

## FASE 3: TESTING SETUP (10 minutos)

### 1. Crear vitest.config.ts

```bash
cat > vitest.config.ts << 'EOF'
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
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
EOF
```

### 2. Crear test/setup.ts

```bash
mkdir -p src/test

cat > src/test/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
EOF
```

### 3. Crear primer test

```bash
cat > src/shared/utils/validation.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('validation', () => {
  it('should validate email', () => {
    const emailSchema = z.string().email();
    
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('invalid-email')).toThrow();
  });
});
EOF
```

### 4. Correr tests

```bash
npm run test:unit     # Run tests once
npm run test          # Run in watch mode
npm run test:coverage # Coverage report
```

---

## FASE 4: SECURITY SETUP (10 minutos)

### 1. Crear .env.example

```bash
cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001

# Authentication
VITE_JWT_SECRET=your-secret-key-here

# Google Gemini API (IMPORTANT: MOVE TO BACKEND)
# NEVER commit this in .env - use backend proxy
VITE_GEMINI_API_KEY=sk_xxx...

# Encryption Key (for localStorage)
VITE_ENCRYPT_KEY=your-encrypt-key-here

# Sentry Error Tracking
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/123456

# Environment
NODE_ENV=development
EOF
```

### 2. Crear .env.local (NO commitear)

```bash
# Copy template
cp .env.example .env.local

# Editar con valores reales
nano .env.local
```

### 3. Crear .gitignore

```bash
cat >> .gitignore << 'EOF'
# Environment
.env
.env.local
.env.*.local

# Testing
coverage
.nyc_output

# Build
dist
build

# IDE
.vscode
.idea
*.swp

# Dependencies
node_modules

# Logs
*.log
npm-debug.log*
EOF
```

### 4. Auditoría inicial de seguridad

```bash
npm audit                 # Auditoria de npm
npm run snyk             # Auditoria de snyk
npm run lint             # ESLint security check
```

---

## FASE 5: SENTRY SETUP (5 minutos)

### 1. Crear services/errorReporter.ts

```bash
cat > src/shared/services/errorReporter.ts << 'EOF'
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initErrorReporting = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true
      })
    ],
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || '0.0.0'
  });
};

export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    contexts: context ? { app: context } : undefined
  });
};
EOF
```

### 2. Inicializar en App.tsx

```typescript
import { initErrorReporting } from '@/shared/services/errorReporter';

initErrorReporting();

// ... resto del app
```

---

## FASE 6: VITE CONFIGURATION (5 minutos)

### Actualizar vite.config.ts

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: mode === 'production' ? false : true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-animation': ['framer-motion'],
            'vendor-maps': ['maplibre-gl'],
            'vendor-security': ['axios', 'jsonwebtoken', 'zod']
          }
        }
      }
    },
    
    plugins: [
      react(),
      compression({ algorithm: 'brotli' }),
      visualizer({ open: false })
    ],
    
    define: {
      'process.env.API_URL': JSON.stringify(env.VITE_API_URL),
      // IMPORTANTE: NO incluir API keys en el cliente
      // 'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  };
});
```

---

## FASE 7: GITHUB ACTIONS CI/CD (5 minutos)

### Crear .github/workflows/ci.yml

```bash
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type Check
        run: npm run type-check
      
      - name: Test
        run: npm run test:unit
      
      - name: Coverage
        run: npm run test:coverage
      
      - name: Security Audit
        run: npm audit --audit-level=moderate
      
      - name: Build
        run: npm run build
EOF
```

---

## CHECKLIST DE VERIFICACIÓN

```bash
# 1. Verificar instalación
npm list                    # Todas las dependencias instaladas

# 2. Verificar scripts
npm run lint:check         # ✓ Debe pasar
npm run type-check         # ✓ Debe pasar
npm run test:unit          # ✓ Debe pasar
npm run build              # ✓ Debe producir dist/

# 3. Verificar git hooks
# Editar un archivo e intentar commit
# Debe ejecutar: lint-staged → pre-commit checks

# 4. Verificar seguridad
npm audit                  # Debe mostrar 0 vulnerabilidades críticas

# 5. Verificar bundle
npm run build
# Verificar tamaño en terminal
```

---

## TROUBLESHOOTING

### Problema: "Port 3000 ya está en uso"

```bash
# Usar puerto diferente
npm run dev -- --port 3001
```

### Problema: "Module not found"

```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Tests no funciona"

```bash
# Verificar setup.ts existe
ls src/test/setup.ts

# Reinstalar testing libraries
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Problema: "Husky hooks no se ejecutan"

```bash
# Reinstalar husky
npm run prepare

# Dar permisos a hooks
chmod +x .husky/*
```

---

## PRÓXIMOS PASOS DESPUÉS DEL SETUP

### Día 1-2: Implementar Autenticación

```bash
# Crear estructura
mkdir -p src/features/auth/{components,hooks,services,types}

# Implementar en orden:
# 1. Auth types (auth.types.ts)
# 2. Auth service (authService.ts)
# 3. Auth context (AuthContext.tsx)
# 4. Auth hooks (useAuth.ts)
# 5. Forms con react-hook-form + zod
```

### Día 3: Setup de Testing

```bash
# Crear tests para:
# 1. Utilidades de validación
# 2. Auth service
# 3. Componentes de formulario
# 4. Protected routes
```

### Día 4-5: Implementar Protected Routes

```bash
# Crear componentes:
# 1. ProtectedRoute component
# 2. PrivateLayout
# 3. Redirect al login
# 4. Role-based access
```

### Día 6+: Migración gradual

```bash
# Para cada página:
# 1. Convertir a usar new auth system
# 2. Agregar error handling
# 3. Implementar tests
# 4. Validar en local
# 5. Commitear con conventional message
```

---

## MONITOREO POST-DEPLOYMENT

```bash
# Monitorear bundle size
npm run build
# Debe ser < 600KB gzipped

# Monitorear coverage
npm run test:coverage
# Debe ser > 80%

# Monitorear en Sentry
# https://sentry.io/projects/porerekua/

# Monitorear en GitHub
# Actions tab → Ver si todos los checks pasan
```

---

Este documento proporciona un quick start práctico y paso a paso para implementar todas las herramientas en el orden correcto.
