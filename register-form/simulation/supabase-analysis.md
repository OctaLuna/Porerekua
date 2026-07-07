# Análisis de Limitaciones de Supabase para Amazonia Form

## Resumen Ejecutivo

Este análisis evalúa las limitaciones del plan gratuito de Supabase para soportar el registro de empresas en la plataforma Amazonia Form, considerando:
- Tamaño de datos por registro
- Flujo de consultas API
- Límites de ancho de banda
- Capacidad de almacenamiento
- Límites de conexiones simultáneas

---

## 1. Tamaño de Datos por Registro

### Datos Analizados (del script de simulación)

**Registro Máximo de Empresa:**
- Tamaño JSON: **37.33 KB**
- Tamaño estimado en BD: **63.46 KB** (con overhead 1.7x)
- Desglose:
  - Datos empresa: ~1.02 KB
  - 10 proyectos: ~36.31 KB (~3.39 KB promedio por proyecto)

### Proyección de Almacenamiento

| Escenario | Registros | Tamaño Total (MB) | % Límite Supabase* |
|-----------|-----------|-------------------|-------------------|
| Bajo | 100 empresas | 6.35 MB | 1.27% |
| Medio | 500 empresas | 31.73 MB | 6.35% |
| Alto | 1,000 empresas | 63.46 MB | 12.69% |
| Máximo | 5,000 empresas | 317.29 MB | 63.46% |

*Límite Supabase Free: 500 MB

**✅ Conclusión:** El tamaño por registro es manejable. Se podrían almacenar hasta ~7,800 empresas máximas antes de alcanzar el límite de 500 MB.

---

## 2. Flujo de Consultas API por Registro

### Flujo Completo de Registro

```
1. Carga inicial de la web
   GET / (HTML/CSS/JS) → ~500 KB (primera vez)
   GET /api/formas-juridicas/forms
   GET /api/apoyos/forms
   GET /api/motivos/forms
   GET /api/ods
   GET /api/departamentos
   GET /api/tipos-proyectos/forms
   GET /api/areas
   GET /api/ayudas/forms
   GET /api/actores-municipales/forms
   GET /api/especies-animales/forms
   GET /api/practicas-agricolas/forms
   GET /api/areas-desarrollo
   GET /api/tipos-organizaciones/forms
   ────────────────────────────────────────
   Total catálogos: ~50-100 KB (estimado)

2. Navegación entre pasos (sin consultas adicionales)
   - Los datos ya están en memoria
   - Validaciones locales con React Hook Form

3. Envío final del formulario
   POST /api/formularios/empresas → Payload: ~37 KB
   ────────────────────────────────────────
   Respuesta: ~1 KB
```

### Conteo de Consultas por Usuario

| Tipo | Cantidad | Tamaño Promedio | Total |
|------|----------|-----------------|-------|
| GET catálogos | 13 | ~5 KB | ~65 KB |
| POST registro | 1 | 37 KB (request) + 1 KB (response) | ~38 KB |
| **Total por registro** | **14 consultas** | | **~103 KB** |

### Proyección Mensual (Plan Gratuito Supabase)

| Métrica | Límite Supabase | Capacidad Estimada |
|---------|-----------------|-------------------|
| Ancho de banda | 5 GB/mes | ~50,000 registros/mes |
| Consultas API | Ilimitadas* | Limitadas por ancho de banda |
| Almacenamiento | 500 MB | ~7,800 empresas máximas |

*Supabase no limita consultas directamente, pero sí el ancho de banda.

---

## 3. Análisis de Límites de Supabase Free Tier

### Base de Datos (PostgreSQL)

| Recurso | Límite | Consumo por Empresa | Capacidad |
|---------|--------|---------------------|-----------|
| Almacenamiento | 500 MB | 63.46 KB | ~7,800 empresas |
| Ancho de banda | 5 GB/mes | 103 KB/registro | ~50,000 registros/mes |
| Filas por tabla | Ilimitadas | - | - |
| Conexiones simultáneas | 60 | - | - |

### API (PostgREST)

| Recurso | Límite | Notas |
|---------|--------|-------|
| Requests/mes | Ilimitados* | Sujeto a ancho de banda |
| Tamaño payload | 6 MB | Nuestro payload: 37 KB ✅ |
| Rate limiting | 200 req/min | ~3.3 req/segundo |

### Autenticación (si se implementa)

| Recurso | Límite |
|---------|--------|
| Usuarios | Ilimitados |
| MAUs (Monthly Active Users) | Ilimitados |

---

## 4. Escenarios de Uso Realista

### Escenario 1: Bajo Tráfico (Startup)
- **Empresas/mes:** 50
- **Consultas/mes:** 700 (50 × 14)
- **Ancho de banda/mes:** ~5.15 MB
- **Almacenamiento acumulado/año:** ~38 MB
- **% Límites Supabase:** <1% en todos los aspectos

### Escenario 2: Tráfico Medio (Crecimiento)
- **Empresas/mes:** 500
- **Consultas/mes:** 7,000
- **Ancho de banda/mes:** ~51.5 MB
- **Almacenamiento acumulado/año:** ~380 MB
- **% Límites Supabase:** ~10% ancho de banda, ~76% almacenamiento anual

### Escenario 3: Alto Tráfico (Éxito)
- **Empresas/mes:** 2,000
- **Consultas/mes:** 28,000
- **Ancho de banda/mes:** ~206 MB
- **Almacenamiento acumulado/año:** ~1.52 GB ❌
- **% Límites Supabase:** ~41% ancho de banda, **304% almacenamiento** (excede)

---

## 5. Optimizaciones Recomendadas

### A. Reducir Tamaño de Payload

**Actual:** 37 KB por registro máximo

**Optimizaciones posibles:**
1. **Normalizar datos** - Separar proyectos en tabla independiente
   - Empresa: ~1 KB
   - Proyecto: ~3 KB × 10 = 30 KB
   - **Ahorro:** Mínimo (ya está separado en BD)

2. **Comprimir catálogos** - Usar IDs en lugar de nombres completos
   - Actual: Nombres completos en payload
   - Optimizado: Solo IDs numéricos
   - **Ahorro estimado:** 20-30% (~7-11 KB)

3. **Eliminar campos opcionales vacíos**
   - Actual: Incluye campos null/undefined
   - Optimizado: Solo campos con valor
   - **Ahorro estimado:** 5-10% (~2-4 KB)

**Payload optimizado estimado:** ~25 KB (33% de reducción)

### B. Caché de Catálogos

**Problema:** 13 consultas GET por usuario para cargar catálogos

**Solución:**
1. **Cache en localStorage** - Guardar catálogos por 24 horas
   - Primera visita: 13 consultas
   - Visitas siguientes: 0 consultas (usa caché)
   - **Reducción:** 90% de consultas GET

2. **Bundle en el frontend** - Incluir catálogos en el build
   - 0 consultas API para catálogos
   - **Desventaja:** Aumenta tamaño del bundle (~100 KB)

### C. Paginación de Proyectos

**Problema:** 10 proyectos × 3.39 KB = 33.9 KB solo de proyectos

**Solución:**
1. **Guardar proyectos por separado** - Endpoint separado para proyectos
   - POST /api/empresas (datos empresa: ~1 KB)
   - POST /api/empresas/{id}/proyectos (proyectos: ~34 KB)
   - **Ventaja:** Payload inicial más pequeño

2. **Lazy loading de proyectos** - Cargar proyectos bajo demanda
   - No aplica para registro inicial

---

## 6. Plan de Escalabilidad

### Fase 1: Plan Gratuito (0-6 meses)
- **Capacidad:** Hasta 500 empresas
- **Costo:** $0/mes
- **Monitoreo:** Almacenamiento y ancho de banda

### Fase 2: Plan Pro ($25/mes)
- **Disparador:** 400 MB almacenamiento o 4 GB ancho de banda
- **Capacidad:** 50 GB almacenamiento, 250 GB ancho de banda
- **Soporta:** ~78,000 empresas, ~2.4M registros/mes

### Fase 3: Plan Team ($50/mes)
- **Disparador:** 25 GB almacenamiento o 50 GB ancho de banda
- **Capacidad:** 100 GB almacenamiento, 500 GB ancho de banda
- **Soporta:** ~156,000 empresas, ~4.8M registros/mes

---

## 7. Recomendaciones Finales

### ✅ **Supabase Free es Suficiente Para:**
- MVP y fase inicial (0-500 empresas)
- Pruebas de concepto
- Tráfico bajo a medio (<200 empresas/mes)

### ⚠️ **Considerar Upgrade Cuando:**
- Almacenamiento > 400 MB
- Ancho de banda > 4 GB/mes
- Empresas registradas > 5,000

### 🚀 **Optimizaciones Inmediatas:**
1. Implementar caché de catálogos en localStorage
2. Eliminar campos nulos del payload
3. Monitorear métricas de Supabase dashboard
4. Configurar alertas de uso (80% límites)

### 📊 **Métricas a Monitorear:**
- Almacenamiento usado (límite: 500 MB)
- Ancho de banda mensual (límite: 5 GB)
- Número de empresas registradas
- Tamaño promedio por registro
- Consultas API por día

---

## 8. Cálculos Detallados

### Tamaño de Datos

```
Registro máximo:
- Empresa: 1.02 KB
- 10 proyectos: 36.31 KB
- Total JSON: 37.33 KB
- Total BD (1.7x): 63.46 KB

Capacidad Free Tier:
- Almacenamiento: 500 MB / 63.46 KB = 7,877 empresas
- Ancho de banda: 5 GB / 103 KB = 50,991 registros/mes
```

### Costos Estimados

| Plan | Costo/mes | Almacenamiento | Ancho de banda | Capacidad empresas |
|------|-----------|----------------|----------------|-------------------|
| Free | $0 | 500 MB | 5 GB | 7,800 |
| Pro | $25 | 50 GB | 250 GB | 788,000 |
| Team | $50 | 100 GB | 500 GB | 1,576,000 |

---

## Conclusión

**Supabase Free Tier es completamente viable** para la fase inicial del proyecto Amazonia Form. Con las optimizaciones recomendadas (caché de catálogos, eliminación de campos nulos), se puede extender la capacidad del plan gratuito significativamente.

El principal límite a monitorear será el **almacenamiento** (500 MB), que se alcanzará con ~7,800 empresas registradas con datos máximos. El ancho de banda (5 GB/mes) permite ~50,000 registros mensuales, lo cual es más que suficiente para la fase inicial.

**Recomendación:** Comenzar con Supabase Free, implementar optimizaciones, y planear upgrade a Pro cuando se acerque a 400 MB de almacenamiento o 4 GB de ancho de banda mensual.