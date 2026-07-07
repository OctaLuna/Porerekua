# Estimado de Consumo Frontend — Módulo de Proyecciones

> Scope: flujo frontend del módulo de proyecciones y consumo de hardware del cliente web completo.  
> Fecha: 2026-05-11

---

## 1. Contexto del módulo

El módulo de proyecciones es el **paso 4 (Step 5)** del formulario de registro, compartido entre empresas (`RegistrationModal`) y organizaciones (`OrganizationModal`). Permite registrar hasta **10 proyectos por formulario**, cada uno con múltiples ubicaciones (departamento + municipios + comunidades indígenas), tipos de ayuda, actores, áreas de conservación o desarrollo, y organizaciones relacionadas.

---

## 2. Peticiones GET al servidor (carga de catálogos)

Al montar el modal de registro se ejecuta un único `Promise.all` con **13 peticiones paralelas** en `useEmpresaFormOptions`. Adicionalmente, `useRegisteredOrganizations` lanza **1 petición más** (con fallback a un segundo endpoint si recibe 404).

### 2.1 Endpoints de catálogo usados por proyecciones

| # | Endpoint | Propósito |
|---|----------|-----------|
| 1 | `GET /api/tipos-proyectos/forms` | Tipos de proyecto |
| 2 | `GET /api/areas` | Áreas (conservación / desarrollo) |
| 3 | `GET /api/ayudas/forms` | Tipos de ayuda |
| 4 | `GET /api/actores-municipales/forms` | Actores municipales |
| 5 | `GET /api/especies-animales/forms` | Especies animales |
| 6 | `GET /api/practicas-agricolas/forms` | Prácticas agrícolas |
| 7 | `GET /api/areas-desarrollo` | Áreas de desarrollo |
| 8 | `GET /api/organizaciones` *(fallback: `/api/formularios/organizaciones`)* | Catálogo de organizaciones registradas |

> Los 5 endpoints restantes del `Promise.all` corresponden a otros pasos del formulario (empresa, motivaciones, etc.) y están fuera del scope de este documento.

### 2.2 Patrón y frecuencia

- **Cuándo ocurre:** Una vez por apertura del modal (montaje del componente).  
- **Sin caché de servidor:** No se envían cabeceras `Cache-Control`, `ETag` ni `If-None-Match`. Cada apertura del modal genera peticiones frescas.  
- **Caché de sesión (cliente):** `useSessionFormDraft` persiste el estado en `sessionStorage`, pero sólo guarda el estado del formulario, no las respuestas de los catálogos.  
- **Paralelismo:** Las 13 peticiones se lanzan simultáneamente; el servidor debe soportar al menos **13 conexiones concurrentes por usuario activo**.

### 2.3 Carga estimada al servidor por apertura de modal

| Métrica | Estimado |
|---------|----------|
| Peticiones simultáneas por usuario | 13–14 GET |
| Tamaño de respuesta por endpoint (estimado) | 5–50 KB (depende del volumen de catálogo) |
| Total datos descargados por apertura | ~100–400 KB |
| Tiempo de respuesta esperado (red normal) | 2–10 s (el UI advierte hasta 10 min) |
| Conexiones DB abiertas por apertura | 8–14 (una por endpoint con acceso a BD) |

---

## 3. Petición POST al servidor (envío del formulario)

### 3.1 Endpoint

| Modal | Endpoint | Método |
|-------|----------|--------|
| Empresas | `/api/formularios/empresas` | POST |
| Organizaciones | `/api/formularios/organizaciones` | POST |

### 3.2 Estructura del payload de proyecciones

El mapper `mapProyecto()` en `empresaFormMapper.ts` **expande** cada proyecto del formulario: si un proyecto tiene N ubicaciones (departamentos), genera **N objetos `RegisterProyectosDto`** independientes en el array `proyectos[]`.

**Ejemplo de un proyecto con 3 departamentos:**

```
Input:  1 ProjectFormData  (3 ubicaciones)
Output: 3 RegisterProyectosDto  (una por departamento)
```

**Tamaño estimado del payload completo (POST):**

| Escenario | Proyectos | Ubicaciones totales | Tamaño aprox. del payload |
|-----------|-----------|---------------------|--------------------------|
| Mínimo (1 proyecto, 1 ubicación, 1 municipio) | 1 | 1 | ~1–3 KB |
| Promedio (3 proyectos, 2 ubicaciones c/u) | 3 | 6 | ~8–15 KB |
| Máximo (10 proyectos, varios departamentos, campos "otros" llenos) | 10 | 20–40 | ~30–80 KB |

### 3.3 Campos que incrementan el payload

- Arrays `ayudas.otros[]`, `actores.otros[]`, `desarrollo.otros[]`: texto libre, sin límite definido en el frontend.
- `descripcion`: campo de texto libre, sin límite definido.
- `municipiosTrabajo[]`: sin límite de municipios por ubicación.
- `organizacionesRelacionadas[]`: IDs de organizaciones vinculadas.

---

## 4. Petición GET adicional — recarga de organizaciones

`useRegisteredOrganizations` expone una función `reload()` que se invoca después de cerrar un sub-modal de organización. Esto genera **1 petición GET extra** a `/api/organizaciones` fuera del ciclo de carga inicial, potencialmente múltiples veces por sesión.

| Evento | Peticiones generadas |
|--------|----------------------|
| Apertura del modal (inicial) | 1 GET `/api/organizaciones` |
| Cada cierre de sub-modal de organización | +1 GET `/api/organizaciones` |

---

## 5. Consumo estimado en la base de datos

### 5.1 Lecturas (catálogos — GET)

Cada apertura del modal genera consultas de lectura a las siguientes tablas:

| Tabla / Colección | Operación | Frecuencia |
|-------------------|-----------|------------|
| `tipos_proyectos` | SELECT todos | 1× por apertura |
| `areas` | SELECT todos | 1× por apertura |
| `ayudas` | SELECT todos | 1× por apertura |
| `actores_municipales` | SELECT todos | 1× por apertura |
| `especies_animales` | SELECT todos | 1× por apertura |
| `practicas_agricolas` | SELECT todos | 1× por apertura |
| `areas_desarrollo` | SELECT todos | 1× por apertura |
| `organizaciones` | SELECT todos | 1× por apertura + 1× por recarga |

> **Total lecturas de catálogo por apertura de modal:** ~8 queries SELECT completos.

### 5.2 Escrituras (registro — POST)

Un formulario completo genera escrituras en cascada. Las tablas directamente relacionadas con proyecciones son:

| Tabla / Colección | Operación | Registros por envío máximo |
|-------------------|-----------|---------------------------|
| `proyectos` | INSERT | Hasta 40 (10 proyectos × 4 ubicaciones) |
| `municipios_trabajo` | INSERT | Variable; sin límite definido |
| `comunidades_indigenas_proyecto` | INSERT | Variable; sin límite definido |
| `proyecto_ayudas` | INSERT (relación N:M) | Hasta N ayudas × proyectos |
| `proyecto_actores` | INSERT (relación N:M) | Hasta N actores × proyectos |
| `proyecto_organizaciones` | INSERT (relación N:M) | Hasta N orgs × proyectos |
| `conservacion` / `desarrollo` | INSERT condicional | 1 por proyecto con área coincidente |

> **Total INSERT por envío máximo estimado:** 40–200 registros distribuidos en 6–8 tablas.

### 5.3 Transaccionalidad

El frontend no controla transacciones; esto depende del backend. Sin embargo, dado el volumen de INSERTs anidados, **se recomienda verificar que el backend use transacciones atómicas** para evitar registros parciales en caso de error.

---

## 6. Resumen de impacto por usuario activo

| Acción del usuario | Peticiones al servidor | Queries a BD | Datos transferidos |
|--------------------|----------------------|-------------|-------------------|
| Abrir modal por primera vez | 13–14 GET | ~8 SELECT | ~100–400 KB ↓ |
| Recargar catálogo de organizaciones (por sub-modal) | 1 GET | 1 SELECT | ~5–50 KB ↓ |
| Enviar formulario completo (máximo) | 1 POST | 40–200 INSERT | ~30–80 KB ↑ |

---

## 7. Puntos de atención y riesgos

### 7.1 Sin caché de catálogos
Cada apertura del modal recarga todos los catálogos desde la BD. Con múltiples usuarios concurrentes, esto puede saturar el servidor de BD con lecturas repetidas de tablas que raramente cambian. **Recomendación:** implementar caché HTTP (`Cache-Control: max-age`) o caché en memoria en el backend para los endpoints de catálogo.

### 7.2 Expansión silenciosa del payload
El mapper `mapProyecto()` puede multiplicar la cantidad de objetos en el POST de forma no obvia para el usuario (1 proyecto con 4 departamentos → 4 DTOs). Esto puede generar payloads más grandes de lo esperado y más INSERTs en BD.

### 7.3 Sin límites en campos de texto libre
Los campos `descripcion`, `ayudas.otros`, `actores.otros`, `desarrollo.otros` no tienen validación de longitud máxima en el frontend. Un usuario malintencionado o descuidado puede enviar payloads significativamente más grandes que el estimado.

### 7.4 Sin paginación en catálogos
Los 8 endpoints de catálogo devuelven **todos los registros** en una sola respuesta. A medida que la BD crezca, el tamaño de estas respuestas crecerá linealmente, aumentando tanto el tiempo de carga como el consumo de memoria del servidor.

### 7.5 Reconexión sin debounce en recarga de organizaciones
La función `reload()` de `useRegisteredOrganizations` no tiene debounce ni throttle. Si el usuario abre y cierra el sub-modal de organización repetidamente, genera una petición GET al servidor en cada cierre.

---

---

## 8. Consumo de hardware — Cliente web (Frontend completo)

Esta sección cubre lo que **la aplicación web consume en el dispositivo del usuario final**. El mapa (`maplibre-gl`) está documentado por separado y se excluye de todos los cálculos aquí.

Los tres escenarios de carga se definen según el volumen de uso real de la plataforma:

| Escenario | Usuarios simultáneos | Sesiones / día |
|-----------|---------------------|----------------|
| **LEVE** — uso inicial / equipo interno | < 12 | < 50 |
| **MODERADO** — plataforma activa / producción | 40–66 | 50–300 |
| **ALTO** — alta demanda / campaña masiva | 120–436 | 300–1.000+ |

---

### 8.1 Bundle JS — peso transferido

El proyecto usa **Vite + React 19** sin code-splitting explícito. Sin lazy loading, todo se descarga en la primera visita:

| Dependencia | Función | Peso (minificado + gzip) |
|-------------|---------|--------------------------|
| `react` + `react-dom` v19 | UI base | ~45 KB |
| `framer-motion` v12 | Animaciones | ~50–80 KB |
| `@tsparticles/*` (engine + basic + react) | Partículas animadas | ~80–120 KB |
| `react-hook-form` v7 | Formularios | ~25 KB |
| `react-router-dom` v7 | Routing | ~25 KB |
| `howler` v2 | Audio | ~20 KB |
| `lucide-react` | Iconos (tree-shakeable) | ~5–20 KB |
| Código fuente propio | Componentes, lógica | ~60–100 KB |
| **Total bundle JS** | | **~310–430 KB** |

---

### 8.2 Assets estáticos (imágenes y audio)

Archivos medidos en `/public/assets/` que se sirven al navegador:

| Asset | Tamaño real | Cuándo se carga |
|-------|-------------|-----------------|
| `organization.jpg` | **10.8 MB** | Modal selección tipo |
| `bg21.jpg` | 7.6 MB | Fondo principal |
| `enterprise.jpg` | 4.8 MB | Modal selección tipo |
| `bg4.png`, `bg1.png`, `bg3*.png` (fondos) | ~0.8–2.6 MB c/u | Según sección activa |
| `bird1–3.svg` (animados) | ~1.3 MB c/u | Home animado |
| `amazon_day_ambient.mp3` | 16.5 MB | Solo si usuario activa audio |
| `amazon_night_ambient.mp3` | 15.4 MB | Solo si usuario activa audio |
| Efectos de sonido (4 archivos) | ~0.1–0.5 MB c/u | Solo si usuario activa audio |

**Peso total por sesión según interacción:**

| Tipo de sesión | Assets descargados | Total aprox. |
|----------------|--------------------|-------------|
| Sin abrir modales, sin audio | Bundle + 1 fondo | ~10–15 MB |
| Uso completo del formulario, sin audio | + UI imgs + todos los fondos | ~30–40 MB |
| Con audio ambiental activado | + 2 MP3 grandes | **~62–72 MB** |

> Las imágenes no están en formato moderno (`webp`/`avif`). `organization.jpg` sola es el principal cuello de botella.

---

### 8.3 RAM por cliente — desglose por escenario

**Consumo por pestaña activa (1 usuario):**

| Componente | RAM estimada |
|------------|-------------|
| React + DOM + router | ~20–40 MB |
| `@tsparticles` (canvas animado en loop) | ~20–50 MB |
| `framer-motion` (animaciones activas) | ~10–30 MB |
| Imágenes de fondo decodificadas (bitmaps en RAM) | ~40–100 MB |
| Estado del formulario (React Hook Form + sessionStorage) | ~1–5 MB |
| Audio buffers `howler` (si se activa audio) | ~20–60 MB |
| **Total RAM por usuario (sin audio)** | **~91–225 MB** |
| **Total RAM por usuario (con audio activo)** | **~111–285 MB** |

**Proyección por escenario (RAM acumulada en el servidor de hosting si es SSR, o en los clientes):**

| Escenario | Usuarios simultáneos | RAM total cliente agregada |
|-----------|---------------------|---------------------------|
| LEVE | < 12 | ~1.1–2.7 GB distribuidos |
| MODERADO | 40–66 | ~3.6–14.9 GB distribuidos |
| ALTO | 120–436 | ~10.9–98.5 GB distribuidos |

> Esta RAM es **en los dispositivos del usuario**, no en el servidor. Para hosting estático (Vercel/Netlify), el servidor no carga RAM por usuario.

---

### 8.4 CPU por cliente — desglose por escenario

**Carga de CPU por pestaña activa (1 usuario):**

| Tarea | Impacto en CPU |
|-------|----------------|
| Renderizado inicial con `framer-motion` | Pico ~30–60% en 1 core (dura ~1–2 s) |
| `@tsparticles` en canvas (60 fps continuo) | ~5–15% continuo en 1 core |
| Apertura del modal (13 fetch + re-renders) | Pico ~20–40% por ~2–5 s |
| Interacción con el formulario de proyecciones | ~10–25% durante edición activa |
| Audio `howler` en reproducción | ~2–5% continuo |
| **Idle con UI visible** | **~8–18% continuo** |
| **Pico durante interacción** | **~40–65% en 1–2 cores** |

**Por escenario (impacto en servidor solo si hay SSR o proxying):**

| Escenario | Sesiones/día | CPU total estimada (cliente × sesiones) |
|-----------|-------------|----------------------------------------|
| LEVE | < 50 | Marginal; ~400–900 core-segundos/día |
| MODERADO | 50–300 | ~4.000–13.500 core-segundos/día |
| ALTO | 300–1.000+ | ~12.000–65.000+ core-segundos/día |

> Para frontend estático (SPA), la CPU del servidor solo procesa las peticiones HTTP de assets, no la lógica de la app.

---

### 8.5 GPU por cliente

| Componente | Uso de GPU |
|------------|-----------|
| `@tsparticles` (canvas 2D) | Compositor activo; ~5–15% GPU ligera |
| `framer-motion` (transform/opacity) | Delegado al compositor del navegador (bajo) |
| Imágenes de fondo grandes decodificadas | ~20–60 MB de VRAM según fondos activos |
| **Requisito mínimo** | GPU integrada con soporte canvas 2D acelerado (Intel HD 3000+, Mali-G31+) |

---

### 8.6 Ancho de banda — por escenario

**Por sesión individual:**

| Tipo de conexión | Primera visita | Visita con caché caliente | Con audio activado |
|-----------------|---------------|--------------------------|-------------------|
| Fibra / 100 Mbps | ~30–40 MB / 3–6 s | ~1–3 MB | +32 MB |
| 4G / ~20 Mbps | ~30–40 MB / 15–25 s | ~1–3 MB | +32 MB |
| 4G móvil / ~10 Mbps | ~30–40 MB / 30–50 s | ~1–3 MB | No recomendado |
| 3G / ~2 Mbps | ~30–40 MB / 120–240 s | ~1–3 MB | No viable |

**Tráfico total estimado al servidor de hosting por escenario (transferencia saliente):**

| Escenario | Sesiones/día | Sin audio (primera visita) | Con 30% usuarios con audio |
|-----------|-------------|---------------------------|---------------------------|
| LEVE | < 50 | ~1.5–2 GB/día | ~2.5–3.5 GB/día |
| MODERADO | 50–300 | ~1.5–12 GB/día | ~2.5–20 GB/día |
| ALTO | 300–1.000+ | ~9–40 GB/día | ~15–70 GB/día |

> La caché del navegador reduce drásticamente la transferencia en visitas recurrentes (descarga solo los assets modificados). El cuello de botella es siempre la **primera visita** con las imágenes sin optimizar.

---

### 8.7 Almacenamiento — servidor de hosting

El servidor de hosting (Vercel, Netlify, S3, etc.) solo almacena los archivos estáticos del build:

| Contenido | Tamaño estimado |
|-----------|-----------------|
| Bundle JS + CSS compilado | ~310–430 KB |
| Assets de imagen (sin `.psd` ni archivos de trabajo) | ~45–55 MB |
| Assets de audio (6 archivos MP3) | ~33 MB |
| HTML index + favicons | < 50 KB |
| **Total build de producción** | **~78–88 MB** |

**Almacenamiento en el cliente (por usuario):**

| Mecanismo | Contenido | Tamaño |
|-----------|-----------|--------|
| `sessionStorage` (draft empresa) | Estado del formulario | ~10–50 KB |
| `sessionStorage` (draft organización) | Estado del formulario | ~10–50 KB |
| Caché del navegador | Assets descargados | ~30–85 MB |

> Los drafts se borran al cerrar la pestaña. La caché del navegador persiste entre sesiones.

---

### 8.8 Resumen por escenario

| Recurso | LEVE (< 12 usuarios) | MODERADO (40–66 usuarios) | ALTO (120–436 usuarios) |
|---------|----------------------|--------------------------|------------------------|
| **RAM cliente por sesión** | ~91–225 MB/usuario | ~91–225 MB/usuario | ~91–225 MB/usuario |
| **CPU cliente en pico** | ~40–65% en 1–2 cores | ~40–65% en 1–2 cores | ~40–65% en 1–2 cores |
| **Ancho de banda saliente/día** | ~1.5–3.5 GB | ~2.5–20 GB | ~15–70 GB |
| **Almacenamiento hosting** | **~78–88 MB** (fijo) | **~78–88 MB** (fijo) | **~78–88 MB** (fijo) |
| **Req. HTTP al servidor/día** | ~650–700 | ~2.600–4.200 | ~3.900–14.000+ |
| **Conexión mínima recomendada** | 4G / 10 Mbps | 4G / 15 Mbps | Fibra / 25 Mbps |

### 8.9 Requisitos mínimos del dispositivo cliente

| Recurso | Mínimo | Óptimo |
|---------|--------|--------|
| **RAM del dispositivo** | 4 GB | 8 GB+ |
| **CPU** | Dual-core 1.8 GHz | Quad-core 2.5 GHz+ |
| **GPU** | Integrada con canvas 2D acelerado | Integrada moderna (Intel Iris / Apple GPU) |
| **Almacenamiento libre** | 100 MB (caché) | 200 MB |
| **Conexión** | 10 Mbps | 25 Mbps+ |
| **Navegador** | Chrome 90+, Firefox 90+, Safari 15+ | Chrome / Edge versión actual |

---

## 9. Archivos de referencia

| Archivo | Rol |
|---------|-----|
| [components/registration/steps/Step5_ProjectRegistration.tsx](../components/registration/steps/Step5_ProjectRegistration.tsx) | Componente principal de proyecciones |
| [hooks/useEmpresaFormOptions.ts](../hooks/useEmpresaFormOptions.ts) | Carga de 13 catálogos en paralelo |
| [hooks/useRegisteredOrganizations.ts](../hooks/useRegisteredOrganizations.ts) | Carga y recarga de organizaciones |
| [utils/empresaFormMapper.ts](../utils/empresaFormMapper.ts) | Mapeo y expansión del payload |
| [utils/apiClient.ts](../utils/apiClient.ts) | Cliente HTTP base |
| [types/api.ts](../types/api.ts) | DTOs enviados al servidor |
| [types.ts](../types.ts) | Tipos del estado del formulario |
