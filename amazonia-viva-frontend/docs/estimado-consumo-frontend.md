# Estimado de Consumo de Hardware — Frontend Amazonia Viva (Porerekua)

> **Alcance:** Recursos de hardware necesarios para alojar y servir el frontend (SPA React/Vite).
> No incluye backend, base de datos ni servicios externos.
> **Fecha:** Mayo 2026

---

## 1. ¿Qué es el frontend en términos de infraestructura?

El frontend de Amazonia Viva es una **Single Page Application (SPA)** compilada con Vite. Una vez construida (`npm run build`), produce un conjunto de archivos estáticos:

```
dist/
├── index.html              ~2 KB
├── assets/
│   ├── index.[hash].js     ~1.2 – 1.8 MB  (sin comprimir)
│   └── index.[hash].css    ~50 – 80 KB    (sin comprimir)
public/
└── images/
    ├── background/         ~10 imágenes   ~30 – 60 MB total
    └── [frames 1–10]       ~10 imágenes   ~5 – 15 MB total
```

El servidor solo necesita **entregar estos archivos estáticos** al navegador del usuario. No ejecuta lógica de aplicación — toda la lógica React corre en el navegador del cliente.

---

## 2. Composición del Bundle

| Librería | Peso gzip estimado |
|---|---|
| React 19 + ReactDOM | ~42 KB |
| React Router DOM 7 | ~18 KB |
| TanStack React Query 5 | ~25 KB |
| Framer Motion 12 | ~38 KB |
| MapLibre GL 5 | ~60 KB |
| Tailwind CSS (purgado) | ~16 KB |
| Código de la aplicación | ~150 – 200 KB |
| **Total bundle (gzip)** | **~349 – 399 KB** |

> Sin compresión gzip el bundle pesa ~1.2 – 1.8 MB. El servidor debe tener gzip/brotli habilitado.

---

## 3. Activos estáticos a servir

| Activo | Cantidad | Peso unitario estimado | Total estimado |
|---|---|---|---|
| Bundle JS (gzip) | 1 | ~380 KB | ~380 KB |
| CSS (gzip) | 1 | ~16 KB | ~16 KB |
| HTML | 1 | ~2 KB | ~2 KB |
| Imágenes de fondo (bg*.jpg/png) | ~10 | 200 KB – 800 KB | ~3 – 8 MB |
| Frames de animación (1–10.jpg) | 10 | 100 – 400 KB c/u | ~1 – 4 MB |
| **Total en disco** | — | — | **~4 – 13 MB** |

> Las imágenes de proyectos y fundaciones son dinámicas (vienen de la API, no del servidor de frontend).

---

## 4. Requerimientos de Hardware por Escenario

### 4.1 MVP / Desarrollo (< 50 usuarios simultáneos)

Apto para un VPS básico o un servidor en la nube de entrada.

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **CPU** | 1 vCPU | 1 vCPU |
| **RAM** | 512 MB | 1 GB |
| **Almacenamiento** | 5 GB SSD | 10 GB SSD |
| **Ancho de banda** | 100 Mbps | 200 Mbps |
| **Transferencia mensual** | ~50 GB | ~100 GB |

**Justificación:**
- El servidor solo sirve archivos estáticos (Nginx/Caddy). Consume muy poca CPU y RAM.
- Con 50 usuarios/día y ~5 MB promedio por sesión → ~7.5 GB/mes de transferencia.
- El margen de 50–100 GB cubre picos y visitas recurrentes.

---

### 4.2 Lanzamiento (50–300 usuarios simultáneos)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 1 GB | 2 GB |
| **Almacenamiento** | 10 GB SSD | 20 GB SSD |
| **Ancho de banda** | 500 Mbps | 1 Gbps |
| **Transferencia mensual** | ~300 GB | ~600 GB |

**Justificación:**
- Nginx puede manejar cientos de conexiones simultáneas con 1 vCPU y 512 MB de RAM para archivos estáticos.
- El cuello de botella real es el **ancho de banda**, no el CPU ni la RAM.
- 300 usuarios/día × 5 MB/sesión × 30 días = ~45 GB/mes; el margen cubre picos de tráfico.

---

### 4.3 Crecimiento (300–1,000 usuarios simultáneos)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Almacenamiento** | 20 GB SSD | 40 GB SSD |
| **Ancho de banda** | 1 Gbps | 1 Gbps + CDN |
| **Transferencia mensual** | ~1.5 TB | CDN absorbe el 80% |

**Justificación:**
- A este nivel, **un CDN es obligatorio**. El servidor solo entrega la primera solicitud; el CDN sirve el 80–95% del tráfico desde sus nodos distribuidos.
- El servidor se convierte en **origin server** del CDN — baja carga directa.
- La RAM adicional se usa para caché de archivos en disco del sistema operativo (page cache de Linux).

---

### 4.4 Escala (> 1,000 usuarios simultáneos)

| Recurso | Configuración |
|---|---|
| **Servidor origin** | 2–4 vCPU, 4–8 GB RAM |
| **CDN** | Cloudflare / Cloudfront / Fastly (obligatorio) |
| **Almacenamiento** | 40–100 GB SSD |
| **Ancho de banda al CDN** | 1 Gbps |
| **Transferencia mensual (origin)** | < 500 GB (CDN absorbe el resto) |

---

## 5. Consumo de Recursos por Página (en el Navegador del Usuario)

Este es el consumo que ocurre **en el dispositivo del usuario**, no en el servidor. Es relevante para entender qué tan exigente es la app para el cliente final.

### 5.1 Memoria RAM (navegador)

| Página | RAM estimada en cliente | Motivo |
|---|---|---|
| `/` Home | ~50 – 80 MB | Framer Motion, scroll-snap, 3 cards |
| `/georeferencia` | ~150 – 250 MB | MapLibre GL carga tiles en memoria |
| `/datos` | ~80 – 120 MB | Carrusel 3D con Framer Motion, múltiples cards |
| `/dashboard` | ~60 – 90 MB | Estadísticas, sin gráficas pesadas aún |
| `/investigaciones` | ~60 – 90 MB | Carrusel con drag, modales |
| `/nosotros` | ~40 – 60 MB | Página estática con animaciones simples |
| `/registro` | ~30 – 50 MB | Formulario simple |

> MapLibre GL es por lejos el componente más costoso en RAM del cliente: carga tiles, geometrías y shaders en memoria GPU/RAM.

### 5.2 CPU (navegador del usuario)

| Situación | Carga de CPU estimada |
|---|---|
| Carga inicial de la app | 20–40% por ~1–3 seg (hidratación React) |
| Animaciones Framer Motion activas | 10–25% continuo |
| Mapa MapLibre (interacción activa) | 30–60% (heavy rendering GPU) |
| Página en reposo (sin animaciones) | < 5% |

> En dispositivos móviles de gama media-baja, las animaciones de Framer Motion y el mapa pueden causar caídas de framerate.

### 5.3 Almacenamiento local (navegador)

| Mecanismo | Uso | Contenido |
|---|---|---|
| `localStorage` | ~1 KB | Preferencia de tema (light/dark) |
| React Query cache (memoria) | ~50 – 200 KB | JSON de proyectos, fundaciones, investigaciones |
| Service Worker cache | No implementado actualmente | — |
| Total en cliente | **< 1 MB** | — |

---

## 6. Ancho de Banda — Costo por Sesión de Usuario

Desglose de lo que descarga un usuario en una sesión típica visitando 3–4 páginas:

| Recurso | ¿Se descarga? | Peso (primera visita) | Peso (revisita con caché) |
|---|---|---|---|
| Bundle JS + CSS | Siempre (primera vez) | ~400 KB | ~0 KB (caché browser) |
| HTML | Siempre | ~2 KB | ~2 KB |
| Imágenes de fondo (lazy) | Al llegar a cada sección | ~800 KB – 3 MB | ~0 KB (caché browser) |
| Frames de animación | Solo si los ve | ~500 KB – 2 MB | ~0 KB |
| Thumbnails de proyectos | Al hacer scroll | ~300 – 800 KB | Varía |
| Tiles de mapa (solo /georeferencia) | Por interacción | ~1 – 15 MB | Caché parcial MapLibre |
| **Total primera visita (sin mapa)** | | **~2 – 6 MB** | |
| **Total primera visita (con mapa)** | | **~3 – 21 MB** | |
| **Revisita (caché activa)** | | **< 500 KB** | |

---

## 7. Impacto del Caché del Navegador

Con headers de caché correctos en el servidor (`Cache-Control: max-age=31536000, immutable` en JS/CSS, y `ETag` en imágenes), las revisitas son casi gratuitas en ancho de banda:

| Recurso | TTL recomendado |
|---|---|
| `index.js` / `index.css` (con hash en nombre) | 1 año (inmutable) |
| `index.html` | Sin caché o `max-age=0` |
| Imágenes de fondo | 30 días |
| Frames de animación | 30 días |

Esto significa que un usuario que regresa al sitio **consume < 10 KB** de transferencia del servidor (solo el HTML).

---

## 8. Estimado de Transferencia Mensual del Servidor

Fórmulas base:
- **Visitas nuevas** = usuarios que no tienen caché (primeras visitas o caché expirada).
- **Revisitas** = usuarios con caché activa.

Asumiendo 70% revisitas / 30% primeras visitas:

| Usuarios únicos/mes | Sesiones/mes | Transferencia estimada/mes |
|---|---|---|
| 500 | 1,500 | ~3 – 9 GB |
| 2,000 | 6,000 | ~12 – 36 GB |
| 10,000 | 30,000 | ~60 – 180 GB |
| 50,000 | 150,000 | ~300 GB – 1 TB |

> Con CDN, el servidor origin solo atiende el ~5–20% de estas solicitudes. El resto es absorbido por el CDN.

---

## 9. Configuración de Servidor Recomendada (Solo Frontend)

El servidor de frontend solo necesita un **servidor web estático** (no Node.js, no PHP, no runtime).

### Software recomendado

| Opción | Descripción |
|---|---|
| **Nginx** | Más común, altamente eficiente para archivos estáticos, fácil configuración de gzip y caché |
| **Caddy** | Alternativa moderna, HTTPS automático, configuración mínima |
| **Vercel / Netlify** | Plataformas SaaS especializadas en SPA (include CDN, zero config) |
| **Cloudflare Pages** | CDN global gratis para SPAs estáticas |

### Configuración mínima Nginx para esta app

```nginx
server {
    listen 80;
    root /var/www/amazonia-viva/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    # Cache agresivo para assets con hash
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Con esta configuración, Nginx puede manejar **10,000+ solicitudes/segundo** de archivos estáticos con 1 vCPU y 512 MB de RAM.

---

## 10. Resumen de Hardware Recomendado

| Escenario | vCPU | RAM | SSD | Ancho de banda | CDN |
|---|---|---|---|---|---|
| MVP (< 50 usuarios) | 1 | 1 GB | 10 GB | 200 Mbps | No necesario |
| Lanzamiento (50–300) | 2 | 2 GB | 20 GB | 500 Mbps | Opcional |
| Crecimiento (300–1,000) | 2–4 | 4 GB | 40 GB | 1 Gbps | Necesario |
| Escala (> 1,000) | 4 | 8 GB | 80 GB | 1 Gbps | Obligatorio |

> **El frontend estático es extremadamente ligero en servidor.** El hardware recomendado tiene amplio margen. El verdadero cuello de botella siempre será el **ancho de banda y la latencia de red**, no el CPU ni la RAM.

---

## 11. Componentes con Mayor Impacto en Recursos

| Componente | Impacto en servidor | Impacto en cliente |
|---|---|---|
| **Imágenes de fondo** | Alto (ancho de banda) | Medio (descarga progresiva) |
| **MapLibre GL** | Bajo (tiles van a MapTiler) | Muy alto (RAM + GPU) |
| **Framer Motion (animaciones)** | Ninguno | Medio-alto (CPU del cliente) |
| **Bundle JS** | Bajo (solo primera visita) | Medio (1–3s parse inicial) |
| **React Query cache** | Ninguno (vive en cliente) | Bajo (~50–200 KB RAM) |
| **Frames de animación (1–10.jpg)** | Medio (ancho de banda) | Bajo (solo lectura de imagen) |
