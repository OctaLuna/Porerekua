# 📊 PLAN PROFESIONAL DE PRUEBAS DE ESTRÉS - POREREKUA + SUPABASE

## 🎯 **RESUMEN EJECUTIVO**

**Aplicación**: Porerekua - Plataforma de conservación amazónica  
**Backend**: Supabase (PostgreSQL, Auth, Storage)  
**Frontend**: React 19 + Vite + TypeScript  
**Plan Supabase**: Free tier (hasta 100 usuarios activos)  
**Objetivo**: Evaluar rendimiento, escalabilidad y costos bajo diferentes escenarios de carga

---

## 📋 **ANÁLISIS DE ARQUITECTURA ACTUAL**

### **1. Estructura de la Aplicación**

#### **Páginas y Funcionalidades**:
- **HomePage**: Landing page con hero y navegación
- **DataPage**: Listado de proyectos y fundaciones con búsqueda
- **GeoreferencingPage**: Mapa interactivo con marcadores de proyectos
- **DashboardPage**: Panel de administración
- **InvestigacionesPage**: Listado de investigaciones
- **NosotrosPage**: Página institucional
- **RegistrationPage**: Formulario de registro de organizaciones

#### **Componentes Críticos**:
- **TiltCard**: Tarjetas 3D interactivas (DataPage)
- **MapLibre GL**: Mapa con marcadores (GeoreferencingPage)
- **HorizontalScroller**: Scroll horizontal con navegación
- **Framer Motion**: Animaciones complejas
- **React Query**: Gestión de estado y caching

### **2. Integración con Supabase**

#### **Tablas Estimadas**:
```sql
-- Estructura propuesta para Supabase
CREATE TABLE foundations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location GEOGRAPHY(POINT),
  tags TEXT[],
  foundation_id UUID REFERENCES foundations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT[],
  summary TEXT,
  image_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  personal_name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  type TEXT CHECK (type IN ('organizacion', 'empresa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_projects_foundation_id ON projects(foundation_id);
CREATE INDEX idx_projects_location ON projects USING GIST(location);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX idx_foundations_name ON foundations(name);
```

---

## 🔬 **ANÁLISIS DE OPERACIONES Y CARGA**

### **3. Estimación de Operaciones por Tipo de Usuario**

#### **Usuario Anónimo (No Autenticado)**:
```
Operaciones por sesión (10 minutos):
- GET /projects: 1-2 veces (página datos/georeferencia)
- GET /foundations: 1-2 veces
- GET /investigations: 0-1 veces
- Búsquedas con filtros: 3-5 consultas
- Scroll horizontal: 10-20 peticiones de imágenes
- Interacción con mapa: 5-10 movimientos/zoom

Total consultas DB por sesión: 20-40
Total requests HTTP: 50-100
```

#### **Usuario Registrado (Organización)**:
```
Operaciones adicionales:
- POST /auth/signup: 1 vez (registro)
- POST /auth/signin: 1-2 veces por sesión
- POST /registrations: 1 vez (formulario)
- GET /user/profile: 2-3 veces
- Actualización de perfil: 0-1 veces

Total consultas DB adicionales: 10-15
Total requests HTTP adicionales: 15-25
```

### **4. Proyección de Tráfico - Escenario Base (100 usuarios)**

#### **Supuestos**:
- 100 usuarios activos mensuales (límite plan Free)
- 30% usuarios activos diariamente (30 usuarios/día)
- 10% usuarios activos simultáneamente en hora pico (10 usuarios concurrentes)
- Sesión promedio: 10 minutos
- 8 horas de actividad diaria

#### **Cálculos Diarios**:
```
Usuarios activos diarios: 30
Sesiones por usuario: 1.5
Sesiones totales diarias: 45

Consultas DB por sesión: 30 (promedio)
Consultas DB diarias: 45 × 30 = 1,350
Consultas DB mensuales: 1,350 × 30 = 40,500

Requests HTTP por sesión: 75 (promedio)
Requests HTTP diarios: 45 × 75 = 3,375
Requests HTTP mensuales: 3,375 × 30 = 101,250
```

#### **Hora Pico (10 usuarios concurrentes)**:
```
Duración hora pico: 1 hora
Sesiones simultáneas: 10
Consultas DB por minuto: (10 × 30) / 60 = 5 consultas/min
Requests HTTP por minuto: (10 × 75) / 60 = 12.5 requests/min

Picos máximos:
- Consultas DB/segundo: 2-3
- Requests HTTP/segundo: 5-8
```

---

## 📈 **PROYECCIONES DE ESCALADO**

### **5. Escenario 1: Crecimiento Moderado (500 usuarios)**

#### **Configuración Requerida**:
- **Plan Supabase**: Pro ($25/mes)
- **Database**: 8GB almacenamiento
- **Auth**: 500 MAU (Monthly Active Users)
- **Bandwidth**: 50GB/mes

#### **Métricas Proyectadas**:
```
Usuarios activos diarios: 150 (30% de 500)
Usuarios concurrentes pico: 50

Consultas DB diarias: 150 × 1.5 × 30 = 6,750
Consultas DB mensuales: 202,500

Requests HTTP diarios: 150 × 1.5 × 75 = 16,875
Requests HTTP mensuales: 506,250

Picos hora pico:
- Consultas DB/segundo: 10-15
- Requests HTTP/segundo: 25-35
```

#### **Recursos Servidor Estimados**:
```
CPU: 2-4 cores
RAM: 4-8GB
Almacenamiento: 10-20GB SSD
Ancho de banda: 100Mbps
```

### **6. Escenario 2: Crecimiento Acelerado (1,000 usuarios)**

#### **Configuración Requerida**:
- **Plan Supabase**: Pro ($25/mes) + Add-ons
- **Database**: 16GB almacenamiento
- **Auth**: 1,000 MAU
- **Bandwidth**: 100GB/mes
- **CDN**: CloudFront o similar

#### **Métricas Proyectadas**:
```
Usuarios activos diarios: 300 (30% de 1,000)
Usuarios concurrentes pico: 100

Consultas DB diarias: 300 × 1.5 × 30 = 13,500
Consultas DB mensuales: 405,000

Requests HTTP diarios: 300 × 1.5 × 75 = 33,750
Requests HTTP mensuales: 1,012,500

Picos hora pico:
- Consultas DB/segundo: 20-30
- Requests HTTP/segundo: 50-70
```

#### **Recursos Servidor Estimados**:
```
CPU: 4-8 cores
RAM: 8-16GB
Almacenamiento: 20-40GB SSD
Ancho de banda: 200Mbps
Load Balancer: Requerido
```

### **7. Escenario 3: Crecimiento Explosivo (5,000 usuarios)**

#### **Configuración Requerida**:
- **Plan Supabase**: Team ($59/mes) o Enterprise
- **Database**: 50GB+ almacenamiento
- **Auth**: 5,000 MAU
- **Bandwidth**: 500GB/mes
- **CDN**: Obligatorio
- **Caching**: Redis cluster

#### **Métricas Proyectadas**:
```
Usuarios activos diarios: 1,500 (30% de 5,000)
Usuarios concurrentes pico: 500

Consultas DB diarias: 1,500 × 1.5 × 30 = 67,500
Consultas DB mensuales: 2,025,000

Requests HTTP diarios: 1,500 × 1.5 × 75 = 168,750
Requests HTTP mensuales: 5,062,500

Picos hora pico:
- Consultas DB/segundo: 100-150
- Requests HTTP/segundo: 250-350
```

#### **Recursos Servidor Estimados**:
```
CPU: 8-16 cores
RAM: 16-32GB
Almacenamiento: 50-100GB SSD
Ancho de banda: 500Mbps - 1Gbps
Load Balancer: Múltiples instancias
Caching: Redis 2-4GB
Database: Read replicas
```

---

## 🧪 **PLAN DE PRUEBAS DE ESTRÉS**

### **8. Herramientas de Testing**

#### **8.1 Stack de Pruebas**:
```json
{
  "load-testing": {
    "k6": "Principal para pruebas de carga",
    "artillery": "Alternativa para pruebas complejas",
    "jmeter": "Para pruebas tradicionales"
  },
  "monitoring": {
    "lighthouse-ci": "Métricas de performance",
    "web-vitals": "Core Web Vitals",
    "sentry": "Monitoreo de errores",
    "supabase-monitoring": "Métricas de Supabase"
  },
  "performance": {
    "webpack-bundle-analyzer": "Análisis de bundles",
    "react-devtools": "Profiler de React",
    "chrome-devtools": "Performance profiling"
  }
}
```

#### **8.2 Instalación de Herramientas**:
```bash
# Instalar k6
brew install k6  # macOS
# o descargar de https://k6.io/docs/getting-started/installation/

# Instalar dependencias de monitoreo
npm install -D @lhci/cli web-vitals @sentry/react

# Configurar Lighthouse CI
npx lhci init
```

### **9. Escenarios de Prueba Detallados**

#### **Escenario A: Prueba de Carga Base (10 usuarios concurrentes)**

**Objetivo**: Validar funcionamiento con plan Free de Supabase

**Configuración k6**:
```javascript
// stress-tests/base-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 5 },    // Ramp up a 5 usuarios
    { duration: '5m', target: 5 },    // Mantener 5 usuarios
    { duration: '2m', target: 10 },   // Ramp up a 10 usuarios
    { duration: '5m', target: 10 },   // Mantener 10 usuarios
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% < 1 segundo
    http_req_failed: ['rate<0.05'],    // Error rate < 5%
    errors: ['rate<0.1'],              // Errores < 10%
  },
};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

export default function() {
  // 1. Cargar página principal
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'home loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(2);

  // 2. Cargar página de datos
  res = http.get(`${BASE_URL}/datos`);
  check(res, { 'data page loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(2);

  // 3. Consulta a Supabase - Proyectos
  res = http.get(`${SUPABASE_URL}/rest/v1/projects`, { headers });
  check(res, { 'projects fetched': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(1);

  // 4. Consulta a Supabase - Fundaciones
  res = http.get(`${SUPABASE_URL}/rest/v1/foundations`, { headers });
  check(res, { 'foundations fetched': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(1);

  // 5. Búsqueda con filtro
  const searchTerm = 'reforestación';
  res = http.get(`${SUPABASE_URL}/rest/v1/projects?name=ilike.*${searchTerm}*`, { headers });
  check(res, { 'search works': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(1);

  // 6. Cargar página de georeferencia
  res = http.get(`${BASE_URL}/georeferencia`);
  check(res, { 'geo page loaded': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(2);

  // 7. Registro de nueva organización
  const registrationData = {
    organization_name: `Org Test ${__VU}`,
    personal_name: `User ${__VU}`,
    email: `user${__VU}@test.com`,
    description: 'Test organization for stress testing',
    reason: 'Participar en conservación',
    type: 'organizacion'
  };
  
  res = http.post(
    `${SUPABASE_URL}/rest/v1/registrations`,
    JSON.stringify(registrationData),
    { headers }
  );
  check(res, { 'registration created': (r) => r.status === 201 });
  errorRate.add(res.status !== 201);
  sleep(1);
}
```

**Métricas Esperadas**:
```
✅ Response Time: < 1 segundo (p95)
✅ Error Rate: < 5%
✅ Throughput: 10-15 requests/segundo
✅ CPU Supabase: < 50%
✅ Memoria Frontend: < 150MB
✅ FPS en animaciones: > 45fps
```

#### **Escenario B: Prueba de Estrés (50 usuarios concurrentes)**

**Objetivo**: Evaluar límites del plan Free y necesidad de upgrade

**Configuración k6**:
```javascript
// stress-tests/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const dbQueryTime = new Trend('db_query_time');

export const options = {
  stages: [
    { duration: '3m', target: 20 },   // Ramp up a 20 usuarios
    { duration: '5m', target: 20 },   // Mantener 20 usuarios
    { duration: '2m', target: 50 },   // Ramp up a 50 usuarios
    { duration: '10m', target: 50 },  // Estrés por 10 minutos
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% < 2 segundos
    http_req_failed: ['rate<0.1'],     // Error rate < 10%
    errors: ['rate<0.15'],             // Errores < 15%
    db_query_time: ['p(95)<1500'],     // Consultas DB < 1.5s
  },
};

// Función para simular comportamiento realista
function simulateUserBehavior() {
  const actions = [];
  
  // 40% probabilidad: Ver proyectos
  if (Math.random() < 0.4) {
    actions.push('view_projects');
    if (Math.random() < 0.3) actions.push('search_projects');
  }
  
  // 25% probabilidad: Ver mapa
  if (Math.random() < 0.25) {
    actions.push('view_map');
    if (Math.random() < 0.5) actions.push('interact_map');
  }
  
  // 20% probabilidad: Ver fundaciones
  if (Math.random() < 0.2) {
    actions.push('view_foundations');
  }
  
  // 10% probabilidad: Registrarse
  if (Math.random() < 0.1) {
    actions.push('register');
  }
  
  // 5% probabilidad: Ver investigaciones
  if (Math.random() < 0.05) {
    actions.push('view_investigations');
  }
  
  return actions;
}

export default function() {
  const behavior = simulateUserBehavior();
  
  for (const action of behavior) {
    switch(action) {
      case 'view_projects':
        const projectsRes = http.get(`${SUPABASE_URL}/rest/v1/projects?select=*`);
        dbQueryTime.add(projectsRes.timings.duration);
        check(projectsRes, { 'projects loaded': (r) => r.status === 200 });
        errorRate.add(projectsRes.status !== 200);
        sleep(3);
        break;
        
      case 'search_projects':
        const terms = ['reforestación', 'comunidad', 'conservación'];
        const term = terms[Math.floor(Math.random() * terms.length)];
        const searchRes = http.get(
          `${SUPABASE_URL}/rest/v1/projects?name=ilike.*${term}*&limit=10`
        );
        dbQueryTime.add(searchRes.timings.duration);
        check(searchRes, { 'search success': (r) => r.status === 200 });
        errorRate.add(searchRes.status !== 200);
        sleep(2);
        break;
        
      case 'view_map':
        const mapRes = http.get(`${BASE_URL}/georeferencia`);
        check(mapRes, { 'map loaded': (r) => r.status === 200 });
        errorRate.add(mapRes.status !== 200);
        sleep(5);
        break;
        
      case 'interact_map':
        // Simular interacción con marcadores
        const markersRes = http.get(
          `${SUPABASE_URL}/rest/v1/projects?select=id,name,location&limit=50`
        );
        dbQueryTime.add(markersRes.timings.duration);
        check(markersRes, { 'markers loaded': (r) => r.status === 200 });
        errorRate.add(markersRes.status !== 200);
        sleep(2);
        break;
        
      case 'view_foundations':
        const foundationsRes = http.get(`${SUPABASE_URL}/rest/v1/foundations`);
        dbQueryTime.add(foundationsRes.timings.duration);
        check(foundationsRes, { 'foundations loaded': (r) => r.status === 200 });
        errorRate.add(foundationsRes.status !== 200);
        sleep(3);
        break;
        
      case 'register':
        const regData = {
          organization_name: `Org ${__VU}-${Date.now()}`,
          personal_name: `User ${__VU}`,
          email: `user${__VU}${Date.now()}@test.com`,
          description: 'Organización de prueba para estrés',
          reason: 'Conservación amazónica',
          type: Math.random() < 0.5 ? 'organizacion' : 'empresa'
        };
        
        const regRes = http.post(
          `${SUPABASE_URL}/rest/v1/registrations`,
          JSON.stringify(regData)
        );
        dbQueryTime.add(regRes.timings.duration);
        check(regRes, { 'registration success': (r) => r.status === 201 });
        errorRate.add(regRes.status !== 201);
        sleep(2);
        break;
        
      case 'view_investigations':
        const invRes = http.get(`${SUPABASE_URL}/rest/v1/investigations`);
        dbQueryTime.add(invRes.timings.duration);
        check(invRes, { 'investigations loaded': (r) => r.status === 200 });
        errorRate.add(invRes.status !== 200);
        sleep(3);
        break;
    }
  }
  
  sleep(5); // Pausa entre ciclos de actividad
}
```

**Métricas Esperadas**:
```
⚠️ Response Time: 1-3 segundos (p95)
⚠️ Error Rate: 5-15%
⚠️ Throughput: 30-50 requests/segundo
⚠️ CPU Supabase: 70-90%
⚠️ Conexiones DB: 80-90% del límite
📈 Posible necesidad de upgrade a Plan Pro
```

#### **Escenario C: Prueba de Resistencia (1 hora continua)**

**Objetivo**: Detectar memory leaks y degradación por uso prolongado

**Configuración k6**:
```javascript
// stress-tests/endurance-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1h',
      exec: 'constantLoad',
    },
    spike_load: {
      executor: 'ramping-arrival-rate',
      preAllocatedVUs: 100,
      timeUnit: '1s',
      stages: [
        { duration: '10m', target: 50 },  // 50 req/s
        { duration: '10m', target: 100 }, // 100 req/s
        { duration: '10m', target: 50 },  // Volver a 50 req/s
        { duration: '30m', target: 50 },  // Mantener 50 req/s
      ],
      exec: 'spikeLoad',
    },
  },
};

export function constantLoad() {
  // Comportamiento constante de usuarios
  http.get(`${BASE_URL}/datos`);
  sleep(10);
}

export function spikeLoad() {
  // Comportamiento con picos de carga
  const res = http.get(`${SUPABASE_URL}/rest/v1/projects`);
  check(res, { 'status ok': (r) => r.status === 200 });
  sleep(1);
}
```

**Métricas a Monitorear**:
```
📊 Memory Usage (Frontend):
   - Inicio: ~100MB
   - 30 min: ~120MB
   - 1 hora: ~150MB
   - ⚠️ Si > 200MB: Memory leak detectado

📊 CPU Usage (Supabase):
   - Promedio: 40-60%
   - Picos: 80-90%
   - ⚠️ Si > 90% constante: Necesita upgrade

📊 Database Connections:
   - Plan Free: 60 conexiones máx
   - Uso promedio: 20-40
   - ⚠️ Si > 50: Riesgo de timeout

📊 Response Times:
   - Inicio: < 500ms
   - 1 hora: < 1000ms
   - ⚠️ Si > 2000ms: Degradación severa
```

---

## 🔧 **IMPLEMENTACIÓN DE MONITOREO**

### **10. Hooks de Performance en la Aplicación**

#### **10.1 Custom Performance Hook**:
```typescript
// hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;

      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        timestamp: Date.now(),
      };

      // Obtener uso de memoria si está disponible
      if (performance.memory) {
        metrics.memoryUsage = performance.memory.usedJSHeapSize;
      }

      metricsRef.current.push(metrics);

      // Enviar métricas a servidor de monitoreo
      if (process.env.NODE_ENV === 'production') {
        sendMetricsToServer(metrics);
      }

      // Log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render time: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  return metricsRef.current;
};

const sendMetricsToServer = async (metrics: PerformanceMetrics) => {
  try {
    await fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
  } catch (error) {
    console.error('Failed to send performance metrics:', error);
  }
};
```

#### **10.2 Web Vitals Monitoring**:
```typescript
// services/webVitalsService.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

export const initWebVitalsMonitoring = () => {
  const reportMetric = (metric: WebVitalMetric) => {
    const body = {
      ...metric,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      connection: navigator.connection?.effectiveType,
    };

    // Enviar a Supabase o servicio de monitoreo
    sendToMonitoringService(body);
  };

  onCLS(reportMetric);
  onFID(reportMetric);
  onFCP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
  onINP(reportMetric);
};

const sendToMonitoringService = async (metric: WebVitalMetric & any) => {
  // Opción 1: Enviar a Supabase
  const { data, error } = await supabase
    .from('performance_metrics')
    .insert([metric]);

  // Opción 2: Enviar a servicio externo (Sentry, New Relic, etc.)
  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'web-vital',
      message: metric.name,
      data: metric,
      level: metric.rating === 'poor' ? 'warning' : 'info',
    });
  }
};
```

#### **10.3 React Query Performance Monitoring**:
```typescript
// hooks/useQueryPerformance.ts
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

export const useQueryPerformance = (queryKey: string[], queryFn: () => Promise<any>) => {
  const startTimeRef = useRef<number>(0);

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      startTimeRef.current = performance.now();
      const data = await queryFn();
      
      const duration = performance.now() - startTimeRef.current;
      
      // Log métricas de performance
      console.log(`[React Query] ${queryKey.join('-')} fetched in ${duration.toFixed(2)}ms`);
      
      // Enviar a servicio de monitoreo
      if (duration > 1000) { // Si tarda más de 1 segundo
        sendSlowQueryAlert(queryKey, duration);
      }
      
      return data;
    },
  });

  return result;
};

const sendSlowQueryAlert = async (queryKey: string[], duration: number) => {
  // Enviar alerta a Supabase
  await supabase
    .from('slow_queries')
    .insert([{
      query_key: queryKey.join('-'),
      duration,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    }]);
};
```

### **11. Configuración de Monitoreo de Supabase**

#### **11.1 Dashboard de Métricas en Supabase**:
```sql
-- Crear tabla para métricas de performance
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  user_agent TEXT,
  url TEXT,
  connection_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para consultas lentas
CREATE TABLE slow_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_key TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas eficientes
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX idx_slow_queries_created_at ON slow_queries(created_at);
CREATE INDEX idx_slow_queries_duration ON slow_queries(duration);

-- Vista para métricas recientes
CREATE VIEW recent_performance AS
SELECT 
  metric_name,
  AVG(metric_value) as avg_value,
  COUNT(*) as count,
  MAX(created_at) as last_updated
FROM performance_metrics
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY metric_name;
```

#### **11.2 Alertas Automáticas**:
```sql
-- Función para verificar métricas críticas
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS void AS $$
BEGIN
  -- Alerta por consultas lentas
  IF EXISTS (
    SELECT 1 FROM slow_queries 
    WHERE created_at > NOW() - INTERVAL '5 minutes'
    AND duration > 5000 -- 5 segundos
  ) THEN
    RAISE NOTICE 'ALERT: Slow queries detected in the last 5 minutes';
  END IF;

  -- Alerta por alto uso de conexiones
  IF (SELECT count(*) FROM pg_stat_activity) > 50 THEN
    RAISE NOTICE 'ALERT: High number of database connections';
  END IF;

  -- Alerta por LCP pobre
  IF EXISTS (
    SELECT 1 FROM performance_metrics
    WHERE metric_name = 'LCP'
    AND metric_value > 4000 -- 4 segundos
    AND created_at > NOW() - INTERVAL '10 minutes'
  ) THEN
    RAISE NOTICE 'ALERT: Poor LCP detected';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar cada minuto
SELECT cron.schedule(
  'check-performance-alerts',
  '* * * * *',
  'SELECT check_performance_alerts()'
);
```

---

## 📊 **RESULTADOS ESPERADOS Y ANÁLISIS**

### **12. KPIs de Rendimiento**

#### **12.1 Métricas de Frontend**:
```
✅ First Contentful Paint (FCP): < 1.5s
✅ Largest Contentful Paint (LCP): < 2.5s
✅ Time to Interactive (TTI): < 3.5s
✅ Cumulative Layout Shift (CLS): < 0.1
✅ First Input Delay (FID): < 100ms
✅ Frames Per Second (FPS): > 45fps en animaciones
✅ Memory Usage: < 200MB después de 1 hora
✅ CPU Usage: < 80% en cliente
```

#### **12.2 Métricas de Backend (Supabase)**:
```
✅ Response Time API: < 500ms (p95)
✅ Database Query Time: < 200ms (p95)
✅ Error Rate: < 1%
✅ Availability: > 99.9%
✅ Concurrent Connections: < 80% del límite
✅ CPU Usage: < 70%
✅ Memory Usage: < 80%
✅ Storage Growth: < 10% mensual
```

### **13. Umbrales de Alerta**

#### **13.1 Alertas Críticas**:
```
🔴 CRÍTICO:
   - Error rate > 5%
   - Response time > 5 segundos
   - CPU > 90% por más de 5 minutos
   - Memory leak detectado (> 300MB)
   - Database connections > 90% del límite

🟡 ADVERTENCIA:
   - Error rate 2-5%
   - Response time 2-5 segundos
   - CPU 70-90%
   - LCP > 4 segundos
   - Consultas lentas > 3 segundos

🟢 NORMAL:
   - Error rate < 2%
   - Response time < 2 segundos
   - CPU < 70%
   - Todos los Web Vitals en "good"
```

---

## 💰 **ANÁLISIS DE COSTOS Y ESCALADO**

### **14. Costos Estimados por Escenario**

#### **14.1 Escenario Base (100 usuarios - Plan Free)**:
```
Supabase Free Tier:
✅ Database: 500MB (gratis)
✅ Auth: 50,000 MAU (gratis)
✅ Storage: 1GB (gratis)
✅ Bandwidth: 2GB/mes (gratis)
✅ API Requests: Ilimitados

Costo Total: $0/mes
```

#### **14.2 Escenario Moderado (500 usuarios - Plan Pro)**:
```
Supabase Pro ($25/mes):
✅ Database: 8GB incluido
✅ Auth: 100,000 MAU incluido
✅ Storage: 100GB incluido
✅ Bandwidth: 50GB/mes incluido

Add-ons estimados:
- Database adicional: 8GB × $0.125 = $1/mes
- Storage adicional: 50GB × $0.021 = $1.05/mes

Costo Total: ~$27/mes
```

#### **14.3 Escenario Crecido (1,000 usuarios - Plan Pro + Add-ons)**:
```
Supabase Pro ($25/mes):
✅ Database: 8GB incluido
✅ Auth: 100,000 MAU incluido
✅ Storage: 100GB incluido
✅ Bandwidth: 50GB/mes incluido

Add-ons estimados:
- Database adicional: 16GB × $0.125 = $2/mes
- Storage adicional: 100GB × $0.021 = $2.10/mes
- Bandwidth adicional: 50GB × $0.09 = $4.50/mes

Costo Total: ~$34/mes
```

#### **14.4 Escenario Grande (5,000 usuarios - Plan Team)**:
```
Supabase Team ($59/mes):
✅ Database: 20GB incluido
✅ Auth: 500,000 MAU incluido
✅ Storage: 500GB incluido
✅ Bandwidth: 250GB/mes incluido

Add-ons estimados:
- Database adicional: 30GB × $0.125 = $3.75/mes
- Storage adicional: 100GB × $0.021 = $2.10/mes
- Bandwidth adicional: 250GB × $0.09 = $22.50/mes

Costo Total: ~$87/mes
```

### **15. Recomendaciones de Optimización de Costos**

#### **15.1 Optimizaciones Inmediatas**:
```
1. CDN para imágenes (CloudFront/Cloudflare)
   - Reduce bandwidth de Supabase en 60-80%
   - Ahorro estimado: $10-20/mes

2. Caching agresivo con React Query
   - Reduce consultas a Supabase en 40-60%
   - Mejora performance y reduce costos

3. Compresión de imágenes (WebP, AVIF)
   - Reduce tamaño en 50-80%
   - Ahorro en storage y bandwidth

4. Lazy loading de componentes
   - Reduce bundle size inicial
   - Mejora FCP y LCP
```

#### **15.2 Optimizaciones Avanzadas**:
```
1. Read Replicas para consultas pesadas
   - Descarga la base de datos principal
   - Mejora performance en lecturas

2. Connection Pooling (PgBouncer)
   - Reduce overhead de conexiones
   - Permite más usuarios concurrentes

3. Query Optimization
   - Índices apropiados
   - Evitar N+1 queries
   - Usar selectivos en lugar de SELECT *

4. Edge Functions para procesamiento
   - Mover lógica al edge
   - Reducir viajes al servidor
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **16. Cronograma Detallado**

#### **Semana 1: Preparación y Configuración**
```
Día 1-2: Configuración de herramientas
   - Instalar k6, Lighthouse CI, Web Vitals
   - Configurar entorno de pruebas
   - Crear scripts base de pruebas

Día 3-4: Implementar monitoreo en la app
   - Agregar hooks de performance
   - Configurar Web Vitals
   - Integrar con Supabase para métricas

Día 5: Configurar Supabase monitoring
   - Crear tablas de métricas
   - Configurar alertas
   - Dashboard de monitoreo
```

#### **Semana 2: Ejecución de Pruebas**
```
Día 1-2: Pruebas de carga base (10 usuarios)
   - Ejecutar Scenario A
   - Analizar resultados
   - Ajustar configuración

Día 3-4: Pruebas de estrés (50 usuarios)
   - Ejecutar Scenario B
   - Identificar bottlenecks
   - Documentar limitaciones

Día 5: Pruebas de resistencia (1 hora)
   - Ejecutar Scenario C
   - Detectar memory leaks
   - Validar estabilidad
```

#### **Semana 3: Optimización y Reportes**
```
Día 1-2: Aplicar optimizaciones
   - Implementar mejoras identificadas
   - Optimizar consultas
   - Mejorar caching

Día 3-4: Re-ejecutar pruebas
   - Validar mejoras
   - Comparar métricas
   - Ajustar configuración final

Día 5: Documentación final
   - Reporte ejecutivo
   - Recomendaciones de escalado
   - Plan de monitoreo continuo
```

### **17. Checklist de Implementación**

#### **17.1 Pre-Pruebas**:
```
[ ] Configurar entorno de pruebas
[ ] Instalar k6 y herramientas
[ ] Crear scripts de prueba
[ ] Configurar Supabase monitoring
[ ] Implementar hooks de performance
[ ] Configurar Web Vitals
[ ] Establecer línea base de métricas
```

#### **17.2 Durante Pruebas**:
```
[ ] Ejecutar Scenario A (carga base)
[ ] Monitorear métricas en tiempo real
[ ] Documentar resultados
[ ] Ejecutar Scenario B (estrés)
[ ] Identificar bottlenecks
[ ] Ejecutar Scenario C (resistencia)
[ ] Detectar memory leaks
```

#### **17.3 Post-Pruebas**:
```
[ ] Analizar resultados
[ ] Identificar áreas de mejora
[ ] Implementar optimizaciones
[ ] Re-ejecutar pruebas críticas
[ ] Validar mejoras
[ ] Documentar hallazgos
[ ] Crear plan de escalado
```

---

## 📋 **CHECKLIST DE PRODUCCIÓN**

### **18. Pre-Despliegue a Producción**

#### **18.1 Performance**:
```
[ ] Lighthouse score > 90
[ ] Core Web Vitals en "good"
[ ] Error rate < 1%
[ ] Response time < 500ms (p95)
[ ] Memory usage < 150MB
[ ] No memory leaks detectados
```

#### **18.2 Seguridad**:
```
[ ] HTTPS habilitado
[ ] CORS configurado correctamente
[ ] Rate limiting implementado
[ ] SQL injection protegido
[ ] XSS protegido
[ ] CSRF protegido
```

#### **18.3 Monitoreo**:
```
[ ] Alertas configuradas
[ ] Dashboards creados
[ ] Logs centralizados
[ ] Métricas de negocio trackeadas
[ ] Error tracking activo
[ ] Performance monitoring activo
```

#### **18.4 Backup y Recuperación**:
```
[ ] Backups automáticos configurados
[ ] Point-in-time recovery habilitado
[ ] Plan de recuperación de desastres
[ ] Testing de recuperación realizado
```

---

## 🎯 **CONCLUSIONES Y RECOMENDACIONES FINALES**

### **19. Hallazgos Clave**

1. **Plan Free de Supabase es suficiente para 100 usuarios** con las optimizaciones adecuadas
2. **Las imágenes son el mayor costo de bandwidth** - usar CDN es crítico
3. **React Query caching reduce significativamente la carga** en Supabase
4. **Las animaciones con Framer Motion consumen recursos** - optimizar en dispositivos móviles
5. **MapLibre GL con muchos marcadores** puede ser pesado - considerar clustering

### **20. Recomendaciones de Escalado**

#### **Corto Plazo (0-6 meses)**:
```
✅ Mantener Plan Free de Supabase
✅ Implementar CDN para imágenes
✅ Optimizar caching con React Query
✅ Monitorear métricas de performance
✅ Preparar upgrade a Plan Pro cuando se acerque a 80 usuarios
```

#### **Mediano Plazo (6-12 meses)**:
```
📈 Upgrade a Plan Pro ($25/mes)
📈 Implementar Read Replicas si es necesario
📈 Optimizar consultas de base de datos
📈 Considerar Edge Functions para procesamiento
📈 Monitorear costos mensualmente
```

#### **Largo Plazo (12+ meses)**:
```
🚀 Evaluar Plan Team si se superan 1,000 usuarios
🚀 Considerar arquitectura multi-región
🚀 Implementar microservicios si la complejidad aumenta
🚀 Evaluar soluciones enterprise si se superan 5,000 usuarios
```

---

## 📞 **SOPORTE Y CONTACTO**

Para consultas sobre este plan de pruebas de estrés:
- **Documentación de Supabase**: https://supabase.com/docs
- **Documentación de k6**: https://k6.io/docs
- **Web Vitals**: https://web.dev/vitals/

---

**📊 Este plan proporciona una guía completa para evaluar y escalar Porerekua de manera profesional, con métricas claras, costos proyectados y recomendaciones específicas para cada etapa de crecimiento.**