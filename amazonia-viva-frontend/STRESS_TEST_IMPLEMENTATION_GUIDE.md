# 🚀 GUÍA DE IMPLEMENTACIÓN - PRUEBAS DE ESTRÉS POREREKUA

Esta guía te llevará paso a paso a través de la implementación del plan de pruebas de estrés para tu aplicación Porerekua con Supabase.

---

## 📋 **PRERREQUISITOS**

### Software Requerido
```bash
✅ Node.js 18+ (ya instalado)
✅ npm o pnpm
✅ k6 (herramienta de pruebas de carga)
✅ Git
✅ Supabase CLI (opcional, para gestión de base de datos)
```

### Cuentas Necesarias
- ✅ Cuenta de Supabase activa
- ✅ Acceso al proyecto Porerekua en Supabase

---

## 🔧 **PASO 1: INSTALACIÓN DE HERRAMIENTAS**

### 1.1 Instalar k6

**Windows:**
```bash
# Usando Scoop (recomendado)
scoop install k6

# O descargar desde https://k6.io/docs/getting-started/installation/
```

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
# Debian/Ubuntu
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1291
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-update
sudo apt install k6

# O descargar binario desde GitHub Releases
```

**Verificar instalación:**
```bash
k6 version
```

### 1.2 Instalar Dependencias del Proyecto

```bash
# Navegar al directorio del proyecto
cd amazonia-viva-frontend

# Instalar dependencias
npm install

# O si usas pnpm
pnpm install
```

---

## 🗄️ **PASO 2: CONFIGURACIÓN DE SUPABASE**

### 2.1 Ejecutar Script SQL

1. **Abrir Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto Porerekua

2. **Abrir SQL Editor**
   - En el menú lateral, ve a "SQL Editor"
   - Haz clic en "New Query"

3. **Copiar y Ejecutar Script**
   - Copia el contenido de `monitoring/supabase-setup.sql`
   - Pégalo en el editor SQL
   - Haz clic en "Run" o presiona Ctrl+Enter

4. **Verificar Tablas Creadas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver las tablas:
     - `performance_metrics`
     - `web_vitals`
     - `slow_queries`

### 2.2 Configurar Variables de Entorno

1. **Copiar archivo de ejemplo**
```bash
cp .env.stress-test.example .env.stress-test
```

2. **Editar `.env.stress-test`**
```bash
# URLs del proyecto
VITE_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Configuración de k6
K6_BASE_URL=http://localhost:3000
K6_SUPABASE_URL=https://tu-proyecto.supabase.co
K6_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Para obtener tus credenciales de Supabase:**
- Ve a Project Settings → API
- Copia "Project URL" → `VITE_SUPABASE_URL`
- Copia "anon public" key → `VITE_SUPABASE_ANON_KEY`

---

## 🧪 **PASO 3: EJECUTAR PRUEBAS DE ESTRÉS**

### 3.1 Prueba de Carga Base (10 usuarios)

```bash
# Asegúrate de estar en la raíz del proyecto
cd amazonia-viva-frontend

# Ejecutar prueba base
k6 run stress-tests/base-load-test.js

# O con variables de entorno específicas
BASE_URL=http://localhost:3000 \
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_ANON_KEY=tu-key \
k6 run stress-tests/base-load-test.js
```

**Duración esperada:** 15 minutos

**Qué observar:**
- ✅ Response time < 1 segundo (p95)
- ✅ Error rate < 5%
- ✅ Throughput: 10-15 requests/segundo

### 3.2 Prueba de Estrés (50 usuarios)

```bash
# Ejecutar prueba de estrés
k6 run stress-tests/stress-test.js

# O con configuración personalizada
k6 run --vus 50 --duration 20m stress-tests/stress-test.js
```

**Duración esperada:** 22 minutos

**Qué observar:**
- ⚠️ Response time 1-3 segundos (p95)
- ⚠️ Error rate 5-15%
- 📈 Posible necesidad de upgrade a Plan Pro

### 3.3 Prueba de Resistencia (1 hora)

```bash
# Ejecutar prueba de resistencia
k6 run stress-tests/endurance-test.js
```

**Duración esperada:** 1 hora

**Qué observar:**
- 📊 Memory usage (debe ser estable)
- 📊 Consultas lentas (< 50 en total)
- 📊 Timeouts (< 10 en total)

---

## 📊 **PASO 4: MONITOREO EN TIEMPO REAL**

### 4.1 Ver Métricas en Supabase

**Consulta Web Vitals de las últimas 24 horas:**
```sql
SELECT * FROM web_vitals_daily_summary 
WHERE day > NOW() - INTERVAL '1 day'
ORDER BY day DESC, metric_name;
```

**Ver componentes más lentos:**
```sql
SELECT * FROM slow_components;
```

**Verificar alertas:**
```sql
SELECT * FROM check_performance_alerts();
```

### 4.2 Dashboard de Métricas

Puedes crear un dashboard en Supabase o usar herramientas como:
- Grafana (conectado a Supabase)
- Metabase
- Redash

**Consultas útiles para dashboard:**

```sql
-- Resumen de Web Vitals por hora
SELECT * FROM web_vitals_hourly 
WHERE hour > NOW() - INTERVAL '6 hours'
ORDER BY hour DESC;

-- Tasa de error por hora
SELECT 
  DATE_TRUNC('hour', created_at) AS hour,
  COUNT(*) FILTER (WHERE rating = 'poor') AS poor_count,
  COUNT(*) AS total_count,
  ROUND(
    COUNT(*) FILTER (WHERE rating = 'poor') * 100.0 / COUNT(*), 
    2
  ) AS poor_percentage
FROM web_vitals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;
```

---

## 🔍 **PASO 5: ANÁLISIS DE RESULTADOS**

### 5.1 Métricas Clave a Revisar

#### **Frontend (k6)**
```
✅ http_req_duration: Tiempo de respuesta HTTP
✅ http_req_failed: Tasa de errores
✅ data_sent: Datos enviados
✅ data_received: Datos recibidos
```

#### **Backend (Supabase)**
```
✅ Consultas por segundo
✅ Tiempo promedio de consulta
✅ Conexiones activas
✅ Uso de CPU y memoria
```

#### **Web Vitals**
```
✅ CLS (Cumulative Layout Shift): < 0.1
✅ FCP (First Contentful Paint): < 1.8s
✅ LCP (Largest Contentful Paint): < 2.5s
✅ FID (First Input Delay): < 100ms
✅ TTFB (Time to First Byte): < 800ms
```

### 5.2 Identificar Bottlenecks

**Si el response time es alto:**
1. Revisa consultas lentas en Supabase
2. Verifica si hay componentes React lentos
3. Analiza el tamaño del bundle

**Si el error rate es alto:**
1. Revisa logs de errores en Supabase
2. Verifica límites del plan Free (500MB DB, 2GB bandwidth)
3. Chequea timeouts de conexión

**Si hay memory leaks:**
1. Usa Chrome DevTools Memory tab
2. Revisa el hook `useMemoryMonitor`
3. Verifica listeners y suscripciones no limpiadas

---

## 🚀 **PASO 6: OPTIMIZACIONES RECOMENDADAS**

### 6.1 Optimizaciones Inmediatas

```bash
# 1. Habilitar compresión en Vite
# En vite.config.ts:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});

# 2. Optimizar imágenes
npm install -D vite-plugin-imagemin

# 3. Habilitar lazy loading
npm install react-lazy-load-image-component
```

### 6.2 Optimizaciones de Supabase

```sql
-- 1. Agregar índices faltantes
CREATE INDEX CONCURRENTLY idx_projects_tags_gin ON projects USING GIN(tags);

-- 2. Habilitar connection pooling
-- En Supabase Dashboard → Settings → Connection Pooling

-- 3. Configurar caching con Redis (Plan Pro)
```

### 6.3 Optimizaciones de React

```tsx
// 1. Usar React.memo en componentes pesados
const ExpensiveComponent = React.memo(({ data }) => {
  // ...
});

// 2. Usar useMemo para cálculos costosos
const filteredData = useMemo(() => {
  return data.filter(/* ... */);
}, [data, filters]);

// 3. Usar useCallback para funciones
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## 📈 **PASO 7: PLAN DE ESCALADO**

### 7.1 Cuándo Hacer Upgrade a Plan Pro

**Señales de que necesitas upgrade:**
- ⚠️ Error rate > 10% consistentemente
- ⚠️ Response time > 3 segundos
- ⚠️ Usuarios reportan lentitud
- ⚠️ Database usage > 80% del límite (500MB)
- ⚠️ Bandwidth usage > 80% del límite (2GB)

**Costo del upgrade:**
- Plan Free: $0/mes
- Plan Pro: $25/mes + add-ons

### 7.2 Proyección de Costos

**Escenario 500 usuarios:**
```
Supabase Pro: $25/mes
Add-ons estimados: $2-5/mes
Total: ~$30/mes
```

**Escenario 1,000 usuarios:**
```
Supabase Pro: $25/mes
Database adicional: $2/mes
Storage adicional: $2/mes
Bandwidth adicional: $5/mes
Total: ~$34/mes
```

---

## 🔧 **SOLUCIÓN DE PROBLEMAS**

### Problema: k6 no se instala

**Solución:**
```bash
# Windows: verificar que Scoop esté instalado
scoop --version

# Si no, instalar Scoop primero
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Luego instalar k6
scoop install k6
```

### Problema: Errores de conexión a Supabase

**Solución:**
1. Verifica que las URLs estén correctas
2. Confirma que el anon key sea válido
3. Revisa que las tablas existan
4. Verifica que RLS esté configurado correctamente

### Problema: Pruebas fallan inmediatamente

**Solución:**
```bash
# 1. Verificar que el frontend esté corriendo
npm run dev

# 2. Verificar conectividad
curl http://localhost:3000

# 3. Verificar Supabase
curl https://tu-proyecto.supabase.co/rest/v1/projects
```

### Problema: Memory leak detectado

**Solución:**
1. Revisa el hook `useMemoryMonitor`
2. Usa Chrome DevTools → Memory tab
3. Busca listeners no removidos
4. Verifica useEffects sin cleanup

---

## 📞 **SOPORTE Y RECURSOS**

### Documentación Oficial
- [k6 Documentation](https://k6.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit)

### Herramientas de Monitoreo
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
- [WebPageTest](https://www.webpagetest.org/)

### Comunidad
- [k6 Community Slack](https://k6.io/community/)
- [Supabase Discord](https://discord.supabase.com/)
- [Reactiflux Discord](https://www.reactiflux.com/)

---

## ✅ **CHECKLIST FINAL**

### Pre-Implementación
- [ ] k6 instalado y funcionando
- [ ] Dependencias del proyecto instaladas
- [ ] Variables de entorno configuradas
- [ ] Script SQL ejecutado en Supabase
- [ ] Tablas de monitoreo creadas

### Durante Pruebas
- [ ] Prueba base completada (15 min)
- [ ] Prueba de estrés completada (22 min)
- [ ] Prueba de resistencia completada (1 hora)
- [ ] Métricas revisadas en Supabase
- [ ] Bottlenecks identificados

### Post-Pruebas
- [ ] Optimizaciones aplicadas
- [ ] Re-pruebas completadas
- [ ] Documentación actualizada
- [ ] Plan de escalado definido
- [ ] Monitoreo continuo configurado

---

## 🎯 **PRÓXIMOS PASOS**

1. **Esta semana:**
   - Ejecutar prueba base
   - Configurar monitoreo en Supabase
   - Revisar métricas iniciales

2. **Próxima semana:**
   - Ejecutar prueba de estrés
   - Identificar y corregir bottlenecks
   - Aplicar optimizaciones

3. **Próximo mes:**
   - Ejecutar prueba de resistencia
   - Evaluar necesidad de upgrade
   - Configurar monitoreo continuo

---

**📊 ¡Éxito en tus pruebas de estrés! Recuerda que el objetivo es mejorar la experiencia del usuario final, no solo pasar métricas.**