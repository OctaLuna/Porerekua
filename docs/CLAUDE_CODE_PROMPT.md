# PROMPT PARA CLAUDE CODE — Plataforma Kaa Iya
## Integración Microservicio GeoRef + Backend NestJS

---

## ROL Y CONTEXTO

Actúa como un **Arquitecto de Software Full-Stack y Especialista en DevOps de nivel Senior**. Vas a trabajar en la plataforma **Kaa Iya** ("Espíritu del Bosque"), un sistema de información geoespacial sobre iniciativas sostenibles en la Amazonía boliviana, desarrollado para la Universidad Católica Boliviana "San Pablo".

Estás en la **carpeta raíz del monorepo**. La estructura es:

```
./                          ← estás aquí (raíz del monorepo)
├── api-rest-amazonia/      ← Backend NestJS (YA EXISTE, en producción parcial)
├── georef-service/         ← Microservicio Python/FastAPI (CREAR desde cero)
└── docs/
    └── kaaiya-georef-integration-guide.md  ← guía de arquitectura (leer obligatorio)
```

---

## FASE 0 — LECTURA Y ANÁLISIS OBLIGATORIO (antes de escribir cualquier código)

Lee **en este orden exacto** todos los documentos. No escribas código hasta terminar la Fase 0.

### 0.1 Documentos del Backend (ya existente)

```
api-rest-amazonia/CLAUDE.md          ← instrucciones y convenciones del proyecto
api-rest-amazonia/SPEC.md            ← especificaciones funcionales completas
api-rest-amazonia/docs/progress.md   ← estado actual del desarrollo
api-rest-amazonia/informe.md         ← términos de referencia institucionales (UCB)
docs/kaaiya-georef-integration-guide.md  ← guía de arquitectura que debes seguir
```

### 0.2 Análisis del código existente

Después de leer la documentación, analiza el proyecto:

1. **Examina la estructura completa** del backend:
   ```
   api-rest-amazonia/src/
   api-rest-amazonia/package.json
   api-rest-amazonia/tsconfig.json
   ```

2. **Revisa TODOS los módulos y entidades existentes**, prestando especial atención a:
   - La entidad o módulo de **Proyectos** (o `initiatives`, `projects`, lo que exista)
   - La entidad o módulo de **Actores** (empresas, organizaciones, fundaciones)
   - Cómo se manejan actualmente las **coordenadas** (campos `lat`, `lng`, `location`, o similares)
   - El esquema actual de la base de datos (TypeORM entities)

3. **Lee el Swagger generado** revisando los controladores:
   - Identifica TODOS los endpoints que actualmente aceptan o devuelven datos de ubicación
   - Documenta qué campos de coordenadas existen (nombres exactos de campos, tipos, validaciones actuales)
   - Identifica si hay DTOs con campos de localización

4. **Identifica el patrón arquitectónico** del backend:
   - ¿Usa guards de autenticación en todos los endpoints?
   - ¿Cómo está estructurada la validación (class-validator, pipes)?
   - ¿Qué convenciones de naming usan (camelCase, snake_case)?
   - ¿Cómo manejan errores (exception filters)?

5. **Genera un reporte de análisis** antes de continuar. Escríbelo en:
   ```
   docs/analysis-report.md
   ```
   
   El reporte debe incluir:
   - Lista completa de módulos existentes
   - Lista de endpoints relacionados con ubicación/georreferenciación
   - Campos actuales de coordenadas en cada entidad relevante
   - Gaps o inconsistencias encontradas
   - Plan de cambios propuesto (qué modificar, qué crear)
   - Riesgos identificados (migraciones de BD, breaking changes en API)

> **STOP:** No avances a la Fase 1 sin haber escrito el `analysis-report.md`.

---

## FASE 1 — INSTALAR SKILLS DE CLAUDE CODE

Antes de comenzar la implementación, instala los MCP Servers y Skills más relevantes para este trabajo. Esto potencia tu capacidad de análisis y generación de código.

### 1.1 Instalar los MCP Servers más útiles para este proyecto

Ejecuta en la terminal:

```bash
# MCP para análisis profundo de código y documentación
claude mcp add sequential-thinking -- npx -y @modelcontextprotocol/server-sequential-thinking

# MCP para operaciones de sistema de archivos avanzadas
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem $(pwd)

# MCP para análisis de memoria y contexto entre sesiones
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# MCP para búsqueda de documentación técnica
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

### 1.2 Verificar que los Skills están instalados

```bash
claude mcp list
```

Usa `sequential-thinking` para el análisis arquitectónico complejo (Fase 0) y `context7` para consultar documentación de FastAPI, NestJS y GeoPandas durante la implementación.

---

## FASE 2 — CREAR EL MICROSERVICIO GEOREF

Basándote en el análisis de la Fase 0 y siguiendo **estrictamente** la guía `kaaiya-georef-integration-guide.md`, crea el microservicio en `georef-service/`.

### 2.1 Estructura de carpetas a crear

```
georef-service/
├── app/
│   ├── __init__.py
│   ├── main.py                  ← FastAPI app + middleware
│   ├── config.py                ← Pydantic Settings (NO hardcodear valores)
│   ├── routers/
│   │   ├── __init__.py
│   │   └── geo.py               ← endpoints /geo/pip y /geo/health
│   ├── services/
│   │   ├── __init__.py
│   │   └── geo_service.py       ← lógica PiP, carga GeoDataFrame
│   └── models/
│       ├── __init__.py
│       └── schemas.py           ← Pydantic models con validadores de rango Bolivia
├── data/
│   └── .gitkeep
├── scripts/
│   └── download_data.sh         ← descarga bolivia.geojson de GADM oficial
├── tests/
│   ├── __init__.py
│   └── test_geo.py
├── .env.example                 ← plantilla (SÍ versionar)
├── .gitignore
├── gunicorn.conf.py             ← config versionable con --preload
├── Makefile                     ← comandos: install, dev, prod, test, data
└── requirements.txt
```

### 2.2 Requisitos críticos de implementación

**Seguridad:**
- El servicio escucha SOLO en `127.0.0.1` (loopback), nunca en `0.0.0.0` en producción
- CORS configurado vía variable de entorno `ALLOWED_ORIGINS`, nunca `"*"` en producción
- Docs de Swagger deshabilitados en `environment=production`

**Rendimiento (crítico según el informe):**
- El `GeoDataFrame` se carga UNA SOLA VEZ al importar `geo_service.py`
- `gunicorn.conf.py` debe tener `preload_app = True` (mandatorio)
- Workers: `(2 × cpu_count) + 1` pero máximo 4 para el servidor UCB

**Robustez:**
- Validadores de rango geográfico de Bolivia en los schemas Pydantic:
  - Latitud: `-23.0` a `-9.0`
  - Longitud: `-70.0` a `-57.0`
- Corrección automática de geometrías inválidas al cargar el GeoDataFrame
- Manejo de errores con mensajes descriptivos (qué salió mal y cómo resolverlo)

**Datos:**
- Source oficial: GADM 4.1 nivel 2 (departamentos y municipios de Bolivia)
- URL: `https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_BOL_2.json`
- Los campos esperados son `NAME_1` (departamento) y `NAME_2` (municipio)

### 2.3 Contrato de API que debe cumplir

```
POST /geo/pip
Body: { "lat": float, "lng": float }
Response 200: { "found": bool, "lat": float, "lng": float,
                "department": str|null, "municipality": str|null, "country": "Bolivia" }
Response 422: errores de validación Pydantic (rango Bolivia)
Response 500: error interno con detalle

GET /geo/health
Response 200: { "status": "ok", "environment": str,
                "features_loaded": int, "geojson_path": str }
```

---

## FASE 3 — MODIFICAR EL BACKEND NESTJS

Esta es la fase más crítica. Debes integrar GeoRef en el backend existente **sin romper nada**.

### 3.1 Análisis previo obligatorio

Antes de modificar cualquier archivo del backend:

1. Identifica exactamente **cómo se capturan las coordenadas hoy** en el proyecto (campos en DTOs, entidades, etc.)
2. Determina si hay datos existentes en la BD que podrían verse afectados por migraciones
3. Evalúa si los cambios son **aditivos** (agregar campos) o **destructivos** (cambiar tipos/nombres)
4. Si hay breaking changes, documéntalos claramente en el reporte

### 3.2 Crear el módulo Georef en NestJS

Crea en `api-rest-amazonia/src/georef/`:

```
georef/
├── georef.module.ts     ← HttpModule.registerAsync con ConfigService
├── georef.service.ts    ← resolveCoordinates() con timeout + fallback elegante
├── georef.dto.ts        ← interfaces TypeScript espejo de los schemas Python
└── georef.controller.ts ← SOLO un endpoint GET /georef/health (interno, no público)
```

**Requisitos del servicio NestJS:**

```typescript
// georef.service.ts debe implementar:

// 1. resolveCoordinates(lat, lng): GeoRefResponse | null
//    - Timeout de 5 segundos (configurable via GEOREF_TIMEOUT_MS)
//    - Si GeoRef falla/timeout: retorna null (degradación elegante, NO lanza excepción)
//    - Loguea el error con Logger pero no propaga

// 2. checkHealth(): GeoRefHealthResponse | null
//    - Para incluir en el health check general del backend
```

### 3.3 Modificar la entidad/módulo de Proyectos (o su equivalente)

> **IMPORTANTE:** Usa el nombre exacto del módulo que encontraste en la Fase 0.

**Cambios en la entidad (TypeORM):**

Agrega a la entidad de Proyectos los campos de georreferenciación enriquecida. Si ya existen campos de coordenadas, NO los elimines, solo agrega los nuevos campos derivados del microservicio:

```typescript
// Campos a AGREGAR (si no existen ya):
@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
lat: number | null;

@Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
lng: number | null;

// Campos NUEVOS derivados del microservicio GeoRef:
@Column({ nullable: true })
department: string | null;        // departamento boliviano (ej: "Santa Cruz")

@Column({ nullable: true })
municipality: string | null;      // municipio boliviano (ej: "San Ignacio de Velasco")

@Column({ nullable: true })
georefResolvedAt: Date | null;    // cuándo se resolvió la georreferenciación

@Column({ default: false })
georefFailed: boolean;            // true si GeoRef no pudo resolver (fuera de Bolivia o error)
```

**Cambios en los DTOs:**

En el DTO de creación/actualización de proyectos, reemplaza el esquema actual de coordenadas (si existe) con:

```typescript
// En CreateProjectDto / UpdateProjectDto:
@IsOptional()
@IsNumber()
@Min(-23.0) @Max(-9.0)
@ApiProperty({ description: 'Latitud WGS84 (rango Bolivia: -23 a -9)', example: -17.7833 })
lat?: number;

@IsOptional()
@IsNumber()
@Min(-70.0) @Max(-57.0)
@ApiProperty({ description: 'Longitud WGS84 (rango Bolivia: -70 a -57)', example: -63.1821 })
lng?: number;
```

**Cambios en el Service de Proyectos:**

```typescript
// En projects.service.ts (o su equivalente), al crear/actualizar un proyecto:

async create(dto: CreateProjectDto, user: ...) {
  // 1. Resolver georreferenciación si vienen coordenadas
  let georefData = { department: null, municipality: null, georefFailed: false, georefResolvedAt: null };
  
  if (dto.lat && dto.lng) {
    const region = await this.georefService.resolveCoordinates({ lat: dto.lat, lng: dto.lng });
    if (region) {
      georefData = {
        department: region.department,
        municipality: region.municipality,
        georefFailed: !region.found,
        georefResolvedAt: new Date(),
      };
    } else {
      // GeoRef no disponible, marcar para reintentar después
      georefData.georefFailed = true;
    }
  }

  // 2. Guardar proyecto con datos enriquecidos
  return this.repository.save({ ...dto, ...georefData });
}
```

### 3.4 Crear migración de base de datos

Después de modificar la entidad, genera la migración con TypeORM. **NO uses `synchronize: true`** en producción:

```bash
cd api-rest-amazonia
npm run migration:generate -- src/migrations/AddGeorefFieldsToProjects
npm run migration:run
```

Si el proyecto no tiene scripts de migración configurados, agrégalos al `package.json`:
```json
"migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts",
"migration:run": "typeorm-ts-node-commonjs migration:run -d src/data-source.ts",
"migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/data-source.ts"
```

### 3.5 Nuevo endpoint: proyectos con datos geoespaciales

Agrega (o modifica el existente) un endpoint que devuelva proyectos con sus datos de georreferenciación, optimizado para el mapa:

```
GET /projects/map
Response: [{
  id, name, description,
  lat, lng, department, municipality,
  actorName, actorType,
  category, status
}]
```

Este endpoint será el que el frontend use para renderizar los marcadores en MapLibre GL.

### 3.6 Variables de entorno a agregar en el backend

```ini
# Agregar a api-rest-amazonia/.env y .env.example:
GEOREF_URL=http://127.0.0.1:8001
GEOREF_TIMEOUT_MS=5000
```

---

## FASE 4 — CONFIGURACIÓN DE INFRAESTRUCTURA

### 4.1 PM2 Ecosystem

Crea en la raíz del monorepo:

```javascript
// pm2.ecosystem.config.js
// (siguiendo la guía kaaiya-georef-integration-guide.md, Sección 7)
```

### 4.2 Nginx

Crea en:
```
nginx/
└── kaaiya.conf    ← configuración completa (Sección 6 de la guía)
```

### 4.3 .gitignore raíz

Crea un `.gitignore` en la raíz que cubra ambos proyectos:
```gitignore
# Python
georef-service/venv/
georef-service/__pycache__/
georef-service/*.pyc
georef-service/data/*.geojson
georef-service/data/*.pmtiles

# Node
api-rest-amazonia/node_modules/
api-rest-amazonia/dist/

# Entornos (NUNCA versionar)
.env
*.env.local

# Logs
*.log
/var/log/
```

### 4.4 README raíz del monorepo

Crea `README.md` en la raíz con:
- Descripción del proyecto
- Diagrama de arquitectura (texto)
- Quick start para desarrollo local
- Comandos para levantar cada servicio

---

## FASE 5 — LEVANTAR Y AUDITORÍA COMPLETA

Esta es la fase final. Levanta todo y verifica que funciona.

### 5.1 Preparar y levantar el microservicio GeoRef

```bash
cd georef-service
make install
make data          # descarga bolivia.geojson (~30 MB)
make dev           # levanta en modo desarrollo: uvicorn con --reload
```

Verifica:
```bash
# Health check
curl http://127.0.0.1:8001/geo/health
# Respuesta esperada: {"status":"ok","features_loaded":339,...}

# Test PiP con Santa Cruz de la Sierra
curl -X POST http://127.0.0.1:8001/geo/pip \
     -H "Content-Type: application/json" \
     -d '{"lat": -17.7833, "lng": -63.1821}'
# Respuesta esperada: {"found":true,"department":"Santa Cruz",...}

# Test fuera de Bolivia (debe dar 422)
curl -X POST http://127.0.0.1:8001/geo/pip \
     -H "Content-Type: application/json" \
     -d '{"lat": 40.7128, "lng": -74.0060}'
# Respuesta esperada: 422 Unprocessable Entity

# Ejecutar tests
make test
```

### 5.2 Preparar y levantar el backend NestJS

```bash
cd api-rest-amazonia
# Asegúrate de que .env tiene GEOREF_URL=http://127.0.0.1:8001

# Ejecutar migraciones
npm run migration:run

# Levantar en desarrollo
npm run start:dev
```

Verifica:
```bash
# Health del backend
curl http://localhost:3000/api/health

# Test de creación de proyecto con coordenadas
# (usa el endpoint exacto que encontraste en el análisis)
curl -X POST http://localhost:3000/api/projects \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
       "name": "Proyecto Test GeoRef",
       "lat": -17.7833,
       "lng": -63.1821,
       ...otros campos requeridos según el DTO existente
     }'
# Respuesta esperada: proyecto creado con department="Santa Cruz" y municipality poblados

# Endpoint de mapa
curl http://localhost:3000/api/projects/map
# Respuesta esperada: lista de proyectos con lat, lng, department, municipality
```

### 5.3 Test de degradación elegante

Apaga el microservicio GeoRef y verifica que el backend sigue funcionando:

```bash
# 1. Detener GeoRef
pkill -f gunicorn  # o Ctrl+C en su terminal

# 2. Intentar crear un proyecto con coordenadas
curl -X POST http://localhost:3000/api/projects \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{"name": "Test sin GeoRef", "lat": -17.7833, "lng": -63.1821, ...}'

# Resultado esperado:
# ✓ El proyecto SE CREA correctamente
# ✓ department y municipality quedan null
# ✓ georefFailed queda true
# ✓ El backend NO devuelve error 500
# ✓ Los logs muestran "GeoRef timeout" o "GeoRef error" pero NO una excepción no manejada
```

### 5.4 Auditoría de seguridad

Verifica estos puntos de seguridad:

```bash
# ① GeoRef NO es accesible desde afuera (solo loopback)
curl http://0.0.0.0:8001/geo/health
# Resultado esperado: connection refused

# ② CORS de GeoRef rechaza orígenes no permitidos
curl -H "Origin: http://malicious.com" \
     -X POST http://127.0.0.1:8001/geo/pip \
     -H "Content-Type: application/json" \
     -d '{"lat": -17.7, "lng": -63.1}'
# Resultado esperado: sin header Access-Control-Allow-Origin

# ③ El endpoint /geo/pip NO está expuesto por Nginx públicamente
# (verificar la config de Nginx que no tiene location para puerto 8001)

# ④ Variables de entorno: verificar que .env NO está en git
git status
# Resultado esperado: .env no aparece en git status
```

### 5.5 Auditoría de rendimiento

```bash
# Test de latencia del PiP
for i in {1..10}; do
  time curl -s -X POST http://127.0.0.1:8001/geo/pip \
       -H "Content-Type: application/json" \
       -d '{"lat": -17.7833, "lng": -63.1821}' > /dev/null
done
# Resultado esperado: < 10ms por request en promedio

# Verificar consumo de RAM del proceso GeoRef
ps aux | grep gunicorn
# El proceso padre + workers debería usar ~1.2 GB total
# Si cada worker usa 120 MB individualmente → --preload NO está funcionando
```

### 5.6 Generar reporte final de auditoría

Al terminar toda la implementación, escribe en:
```
docs/audit-report.md
```

El reporte debe incluir:

```markdown
# Reporte de Auditoría — Integración GeoRef
**Fecha:** [fecha]
**Responsable:** Claude Code

## Checklist de Implementación
- [ ] Microservicio GeoRef creado y funcionando
- [ ] Tests del microservicio pasando (N/N)
- [ ] Migración de BD ejecutada sin errores
- [ ] Módulo Georef integrado en NestJS
- [ ] Endpoint /projects/map funcionando
- [ ] Degradación elegante verificada (GeoRef offline → backend OK)
- [ ] Seguridad: GeoRef no expuesto públicamente
- [ ] Variables de entorno: .env no en git
- [ ] PM2 ecosystem.config.js creado
- [ ] Nginx config creada
- [ ] README raíz creado
- [ ] .gitignore raíz creado

## Resultados de Tests
[incluir output de make test]

## Endpoints modificados/agregados
[lista con descripción de cada cambio]

## Migraciones aplicadas
[nombre y descripción de cada migración]

## Problemas encontrados y soluciones aplicadas
[cualquier issue que surgió durante la implementación]

## Métricas de rendimiento
[latencia PiP, consumo RAM GeoRef]

## Recomendaciones pendientes
[cosas que quedan para el equipo de frontend o próximas iteraciones]
```

---

## RESTRICCIONES Y PRINCIPIOS QUE NO SE PUEDEN VIOLAR

1. **No romper el backend existente.** Todos los endpoints actuales deben seguir funcionando exactamente igual. Cualquier cambio es aditivo.

2. **No versionar datos geoespaciales.** Los archivos `.geojson` y `.pmtiles` van al `.gitignore`. Se obtienen con el script de descarga.

3. **No hardcodear secretos ni URLs.** Todo configurable via `.env`.

4. **No usar `synchronize: true`** en TypeORM en ningún entorno. Solo migraciones explícitas.

5. **No exponer GeoRef públicamente.** Solo escucha en `127.0.0.1`. Nginx no lo proxea.

6. **El backend NO puede fallar si GeoRef está caído.** La degradación elegante es mandatoria.

7. **Sigue las convenciones del proyecto existente.** Naming, estructura de módulos, estilo de código — usa el mismo patrón que ya existe en el backend.

8. **Documenta cada cambio** en `docs/audit-report.md` a medida que avanzas.

---

## REFERENCIA RÁPIDA DE ARCHIVOS

| Archivo | Acción |
|---|---|
| `api-rest-amazonia/CLAUDE.md` | Leer primero |
| `api-rest-amazonia/SPEC.md` | Leer segundo |
| `api-rest-amazonia/docs/progress.md` | Leer tercero |
| `api-rest-amazonia/informe.md` | Leer cuarto |
| `docs/kaaiya-georef-integration-guide.md` | Guía técnica de implementación |
| `docs/analysis-report.md` | **Tú lo creas** en Fase 0 |
| `docs/audit-report.md` | **Tú lo creas** en Fase 5 |
| `georef-service/` | **Tú lo creas** en Fase 2 |
| `api-rest-amazonia/src/georef/` | **Tú lo creas** en Fase 3 |
| `pm2.ecosystem.config.js` | **Tú lo creas** en Fase 4 |
| `nginx/kaaiya.conf` | **Tú lo creas** en Fase 4 |
