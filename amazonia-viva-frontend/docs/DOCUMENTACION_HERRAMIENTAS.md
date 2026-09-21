# 📚 Documentación Completa de Herramientas - Porerekua

## Descripción del Proyecto
**Porerekua — ser solidario, compartir lo que se tiene** es una plataforma web dedicada a la conservación, conocimiento y colaboración en torno a los bosques y su gente. La aplicación está construida con tecnología moderna de React.

---

## 🔧 Stack Tecnológico

### 1. **Lenguajes de Programación**

#### TypeScript 5.8.2
- **Versión:** ~5.8.2
- **Categoría:** Lenguaje de Tipado Estático
- **Propósito:** Proporciona tipado estático sobre JavaScript para mejorar la confiabilidad del código
- **Configuración:** 
  - Target: ES2022
  - Module: ESNext
  - JSX: react-jsx
  - Module Resolution: bundler
- **Beneficios:**
  - Detección de errores en tiempo de compilación
  - Better IDE autocompletion
  - Mejor documentación del código
  - Refactoring más seguro

#### JavaScript/ECMAScript
- **Versión:** ES2022 (Target)
- **Propósito:** Lenguaje base para toda la lógica de aplicación

---

## 🎨 Framework Principal

### React 19.1.1
- **Versión:** ^19.1.1
- **Categoría:** Framework de UI
- **Propósito:** Librería para crear interfaces de usuario interactivas y responsivas
- **Características Principales:**
  - Componentes reutilizables
  - Virtual DOM para rendering eficiente
  - React Hooks para estado y efectos
  - JSX para sintaxis declarativa
- **Ubicación en proyecto:** Componentes en `/components` y `/pages`
- **Estructura de componentes:**
  - Componentes funcionales con hooks
  - Context API para manejo de estado global (ThemeContext, UIContext)
  - Servicios y utilidades compartidas

### React DOM 19.1.1
- **Versión:** ^19.1.1
- **Propósito:** Rendering de componentes React al DOM
- **Responsabilidad:** Conectar la aplicación React con el navegador

---

## 🛣️ Enrutamiento

### React Router DOM 7.9.3
- **Versión:** ^7.9.3
- **Categoría:** Router/Navegación
- **Propósito:** Manejo de rutas y navegación entre páginas
- **Páginas definidas en `/pages`:**
  - HomePage
  - DashboardPage
  - DataPage
  - GeoreferencingPage
  - ContactoPage
  - NosotrosPage
  - RegistrationPage
  - TestimoniosPage
  - InvestigacionesPage
- **Características:**
  - Single Page Application (SPA)
  - Navegación sin refresco de página
  - Manejo de parámetros de ruta
  - Links dinámicos entre páginas

---

## 🎬 Animaciones y Efectos

### Framer Motion 12.23.22
- **Versión:** ^12.23.22
- **Categoría:** Librería de Animaciones
- **Propósito:** Crear animaciones fluidas y transiciones elegantes
- **Casos de Uso:**
  - Animaciones de entrada/salida
  - Transiciones de componentes
  - Animaciones basadas en scroll
  - Movimientos declarativos
- **Ventajas:**
  - Declarativa y fácil de usar
  - Excelente rendimiento
  - Integración natural con React
  - Soporte para gestos y drag-and-drop

---

## 🗺️ Mapas Interactivos

### MapLibre GL 5.9.0
- **Versión:** ^5.9.0
- **Categoría:** Librería de Mapas
- **Propósito:** Renderizar mapas interactivos georreferenciados
- **Características:**
  - Mapas 2D interactivos
  - Soporte para capas vectoriales
  - Georreferenciación
  - Compatible con estilos de Mapbox
- **Ubicación:** Utilizado en `GeoreferencingPage.tsx`
- **Tipos:** @types/maplibre-gl (^1.13.2)

---

## 📊 Manejo de Estado Global

### TanStack React Query 5.90.2
- **Versión:** ^5.90.2
- **Categoría:** State Management & Data Fetching
- **Propósito:** Gestionar el estado de datos asincronos y caché de servidor
- **Características Principales:**
  - Fetching, caching y sincronización de datos
  - Manejo automático de loading y error states
  - Sincronización de datos en tiempo real
  - Paginación y infinite queries
  - Refetching inteligente
- **Ubicación en proyecto:**
  - Custom hooks: `hooks/useProjects.ts`
  - Servicios: `api/services/projects.service.ts`
  - Hook personalizado: `features/ProjectList/useGetProjects.ts`
- **Beneficios:**
  - Reduce código boilerplate
  - Excelente gestión de caché
  - Mejora la UX con datos frescos

### React Context API
- **Categoría:** State Management (Built-in)
- **Propósito:** Compartir estado global sin prop drilling
- **Contextos definidos en `/contexts`:**
  - **ThemeContext.tsx:** Manejo de tema (dark/light)
  - **UIContext.tsx:** Estado general de UI
- **Providores en `/providers`:**
  - AppProviders.tsx
  - ThemeProvider.tsx

---

## 🛠️ Herramientas de Desarrollo

### Vite 6.2.0
- **Versión:** ^6.2.0
- **Categoría:** Build Tool & Dev Server
- **Propósito:** Empaquetador rápido y servidor de desarrollo con HMR
- **Características:**
  - Hot Module Replacement (HMR)
  - Build ultra rápida
  - ESM nativo
  - Optimización automática
- **Scripts disponibles:**
  ```bash
  npm run dev      # Inicia servidor de desarrollo (puerto 3000)
  npm run build    # Crea build optimizado para producción
  npm run preview  # Previsualiza build de producción localmente
  ```
- **Configuración:**
  - Port: 3000
  - Host: 0.0.0.0 (accesible desde cualquier interfaz)

### @vitejs/plugin-react 5.0.0
- **Versión:** ^5.0.0
- **Propósito:** Plugin oficial de Vite para React
- **Características:**
  - Soporte para JSX
  - Automatic JSX runtime
  - React Fast Refresh

---

## 📦 TypeScript DevDependencies

### @types/node 22.14.0
- **Versión:** ^22.14.0
- **Propósito:** Type definitions para Node.js APIs
- **Uso:** Configuración de build y desarrollo

### @types/maplibre-gl 1.13.2
- **Versión:** ^1.13.2
- **Propósito:** Type definitions para MapLibre GL
- **Beneficio:** Autocompletion y type safety en mapas

---

## 🏗️ Estructura de Carpetas Relevante

```
amazonia-viva-frontend/
├── components/          # Componentes reutilizables
│   ├── common/         # Footer, Header compartidos
│   ├── features/       # Componentes específicos (Auth, Details, Home)
│   ├── layout/         # Componentes de layout
│   └── ui/             # Componentes UI base (Button, Card, Skeleton)
├── contexts/           # Contextos React (Theme, UI)
├── features/           # Características (ProjectList)
├── hooks/              # Custom hooks (useProjects, useTheme, useUI)
├── pages/              # Páginas de la aplicación (7 páginas)
├── providers/          # Providers de aplicación
├── services/           # API y servicios
│   └── api.ts         # Configuración base de API
├── api/                # Servicios especializados
│   └── services/       # projects.service.ts
├── types/              # Tipos TypeScript compartidos
│   ├── api.ts         # Tipos de API
│   └── index.ts       # Exports de tipos
├── public/             # Archivos estáticos
│   └── images/        # Imágenes (animation, background)
├── vite.config.ts      # Configuración de Vite
├── tsconfig.json       # Configuración de TypeScript
├── package.json        # Dependencias y scripts
└── index.tsx          # Punto de entrada de la aplicación
```

---

## 📋 Configuración de Entorno

### Variables de Entorno
- **GEMINI_API_KEY:** Clave API para integración con Google Gemini
- **Archivo:** `.env.local`
- **Uso:** Definida en `vite.config.ts` para acceso en la aplicación

---

## 🚀 Scripts de Desarrollo

| Comando | Propósito |
|---------|-----------|
| `npm install` | Instalar todas las dependencias |
| `npm run dev` | Iniciar servidor de desarrollo en puerto 3000 |
| `npm run build` | Compilar para producción |
| `npm run preview` | Ver build de producción localmente |

---

## 📊 Resumen de Dependencias

### Dependencias de Producción (Runtime)
| Librería | Versión | Categoría | Propósito |
|----------|---------|-----------|----------|
| React | 19.1.1 | Framework | Interfaz de usuario |
| React DOM | 19.1.1 | Framework | Rendering en navegador |
| React Router DOM | 7.9.3 | Routing | Navegación entre páginas |
| TanStack React Query | 5.90.2 | State Management | Gestión de datos async |
| Framer Motion | 12.23.22 | Animaciones | Efectos visuales |
| MapLibre GL | 5.9.0 | Mapas | Mapas interactivos |
| @types/maplibre-gl | 1.13.2 | TypeScript | Types para MapLibre |

### Dependencias de Desarrollo
| Librería | Versión | Categoría | Propósito |
|----------|---------|-----------|----------|
| TypeScript | 5.8.2 | Lenguaje | Tipado estático |
| Vite | 6.2.0 | Build Tool | Empaquetador y dev server |
| @vitejs/plugin-react | 5.0.0 | Plugin | Soporte React en Vite |
| @types/node | 22.14.0 | TypeScript | Types para Node.js |

---

## 🔄 Flujo de Datos

```
Usuario Interactúa
      ↓
React Componentes
      ↓
React Router (Navegación)
      ↓
TanStack Query (Datos)
      ↓
API Services (api/services/)
      ↓
Backend API (GEMINI_API_KEY)
      ↓
Estado Local (Contexts/Hooks)
      ↓
Framer Motion (Animaciones)
      ↓
Render en Navegador
```

---

## 🎯 Patrones y Prácticas

### Custom Hooks
- `useProjects()` - Gestiona lista de proyectos
- `useTheme()` - Acceso al contexto de tema
- `useUI()` - Acceso al estado de UI
- `useGetProjects()` - Query específica de proyectos

### Context API
- Evita prop drilling
- Comparte estado global (Theme, UI)

### Component Structure
- Componentes funcionales con hooks
- Separación de concerns (UI, Features, Layout)
- Reutilización máxima de componentes

---

## 📝 Notas Importantes

1. **Versiones:** Todos los packages utilizan versiones recientes y estables
2. **Tipado:** 100% del proyecto usa TypeScript para type safety
3. **Performance:** Vite proporciona development experience ultra rápida
4. **Escalabilidad:** Estructura modular lista para crecimiento
5. **Accesibilidad:** Se utiliza React y componentes semánticos

---

## 🔗 Referencias Útiles

- **React:** https://react.dev
- **React Router:** https://reactrouter.com
- **Vite:** https://vitejs.dev
- **TypeScript:** https://www.typescriptlang.org
- **TanStack Query:** https://tanstack.com/query
- **Framer Motion:** https://www.framer.com/motion
- **MapLibre GL:** https://maplibre.org/maplibre-gl-js

---

**Última actualización:** Abril 2026
**Proyecto:** Porerekua — ser solidario, compartir lo que se tiene
**Versión de documentación:** 1.0
