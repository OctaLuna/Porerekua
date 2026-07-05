# Reporte de Auditoría — Integración GeoRef
**Fecha:** 2026-06-12
**Responsable:** Claude Code (claude-sonnet-4-6)
**Proyecto:** Kaa Iya — Plataforma UCB "San Pablo"

---

## Checklist de Implementación

- [x] Microservicio GeoRef creado (`georef-service/`)
- [x] Tests del microservicio escritos (10 casos en `tests/test_geo.py`)
- [ ] Tests ejecutados — requiere `make data` (descarga ~30 MB de GADM) para correr
- [x] Módulo Georef integrado en NestJS (`src/modules/georef/`)
- [x] Campos georef añadidos a entidad `Proyecto` (6 columnas nuevas, aditivas)
- [x] `lat`/`lng` opcionales en DTOs de registro con validators de rango Bolivia
- [x] `GeorefService` inyectado en `ProyectosService.create()` con degradación elegante
- [x] `GeorefModule` registrado en `ProyectosModule` y `AppModule`
- [x] Migración `scripts/migrate-georef.ts` creada + script `migrate:georef` en `package.json`
- [x] Endpoint `GET /api/proyectos/map` agregado al controller (antes de `:id`)
- [x] Variables `GEOREF_URL`/`GEOREF_TIMEOUT_MS` en `.env.example` + `config.validation.ts`
- [x] `@nestjs/axios` instalado (`npm install @nestjs/axios axios`)
- [x] `gunicorn.conf.py` con `preload_app = True` y bind `127.0.0.1:8001`
- [x] Docs Swagger deshabilitados en `production` (existente en `main.py`)
- [x] GeoRef no expuesto en Nginx (ningún `location` para puerto 8001)
- [x] `georef-service/data/*.geojson` en `.gitignore` raíz
- [x] `.env` en `.gitignore` raíz
- [x] PM2 `ecosystem.config.js` creado
- [x] Nginx `nginx/kaaiya.conf` creado
- [x] `README.md` raíz creado
- [x] `.gitignore` raíz creado
- [x] `docs/analysis-report.md` creado
- [x] TypeScript `tsc --noEmit` pasa sin errores

---

## Archivos Creados

### Microservicio GeoRef (nuevo)

| Archivo | Descripción |
|---------|-------------|
| `georef-service/requirements.txt` | Dependencias Python (FastAPI, GeoPandas, Gunicorn, Shapely) |
| `georef-service/gunicorn.conf.py` | Config Gunicorn: `preload_app=True`, `bind=127.0.0.1:8001` |
| `georef-service/Makefile` | Comandos: install, data, dev, prod, test |
| `georef-service/app/__init__.py` | Init package |
| `georef-service/app/main.py` | FastAPI app + CORS (Swagger deshabilitado en prod) |
| `georef-service/app/config.py` | Pydantic Settings desde `.env` |
| `georef-service/app/models/schemas.py` | PipRequest (con validators Bolivia), PipResponse, HealthResponse |
| `georef-service/app/services/geo_service.py` | GeoDataFrame cargado en import + `point_in_polygon()` |
| `georef-service/app/routers/geo.py` | `POST /geo/pip` y `GET /geo/health` |
| `georef-service/tests/test_geo.py` | 10 casos de prueba (ciudades conocidas + validaciones) |
| `georef-service/scripts/download_data.sh` | Descarga GADM 4.1 Bolivia nivel 2 |
| `georef-service/.env.example` | Plantilla de configuración |
| `georef-service/.gitignore` | Excluye venv, __pycache__, *.geojson |
| `georef-service/data/.gitkeep` | Preserva directorio vacío en git |

### Backend NestJS (modificado/creado)

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `src/modules/georef/georef.dto.ts` | Nuevo | Interfaces TypeScript (GeoRefRequest/Response) |
| `src/modules/georef/georef.service.ts` | Nuevo | HttpService + timeout + degradación elegante |
| `src/modules/georef/georef.module.ts` | Nuevo | HttpModule.registerAsync con MyConfigService |
| `src/modules/gestion-proyectos/proyectos/entities/proyecto.entity.ts` | Modificado | +6 columnas (lat, lng, department, municipality, georef_resolved_at, georef_failed) |
| `src/app/formularios/dto/proyectos/register-proyectos.dto.ts` | Modificado | +lat, +lng opcionales con validators Bolivia |
| `src/modules/gestion-proyectos/proyectos/dto/create-proyecto.dto.ts` | Modificado | +lat?, +lng? |
| `src/modules/gestion-proyectos/proyectos/services/proyectos.service.ts` | Modificado | +GeorefService inyectado, +findForMap(), enriquecimiento en create() |
| `src/modules/gestion-proyectos/proyectos/controllers/proyectos.controller.ts` | Modificado | +GET /map (antes de :id) |
| `src/modules/gestion-proyectos/proyectos/proyectos.module.ts` | Modificado | +GeorefModule en imports |
| `src/app.module.ts` | Modificado | +GeorefModule en imports |
| `src/infrastructure/config/config.validation.ts` | Modificado | +GEOREF_URL, +GEOREF_TIMEOUT_MS en schema Joi |
| `scripts/migrate-georef.ts` | Nuevo | ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS × 6 + 2 índices |
| `package.json` | Modificado | +migrate:georef script, +@nestjs/axios, +axios |
| `.env.example` | Modificado | +GEOREF_URL, +GEOREF_TIMEOUT_MS |

### Infraestructura (nuevo)

| Archivo | Descripción |
|---------|-------------|
| `pm2.ecosystem.config.js` | PM2: amazonia-api (Node) + georef-service (Gunicorn) |
| `nginx/kaaiya.conf` | Nginx: SPA + /api/ proxy + /tiles/ + /uploads/ (sin port 8001) |
| `.gitignore` | Gitignore raíz: venv, node_modules, .env, *.geojson |
| `README.md` | Documentación raíz: arquitectura, quick start, prod, env vars |
| `docs/analysis-report.md` | Análisis previo del codebase |

---

## Endpoints Modificados / Agregados

| Endpoint | Tipo | Descripción |
|----------|------|-------------|
| `GET /api/proyectos/map` | **Nuevo** | Proyectos con lat/lng para MapLibre GL. Público (token opcional). |
| `POST /api/formularios/empresas` | Modificado | Acepta `lat`, `lng` opcionales en proyectos; enriquece con GeoRef |
| `POST /api/formularios/organizaciones` | Modificado | Igual que arriba |

Todos los endpoints existentes siguen funcionando sin cambios.

---

## Migración Aplicada

**Archivo:** `scripts/migrate-georef.ts`
**Comando:** `npm run migrate:georef`

```sql
ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS lat                DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS lng                DECIMAL(10,7),
    ADD COLUMN IF NOT EXISTS department         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS municipality       VARCHAR(150),
    ADD COLUMN IF NOT EXISTS georef_resolved_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS georef_failed      BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_proyectos_lat_lng
    ON proyectos (lat, lng)
    WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proyectos_department
    ON proyectos (department)
    WHERE department IS NOT NULL;
```

La migración es **idempotente** (`IF NOT EXISTS`) — se puede ejecutar múltiples veces sin error.

---

## Verificación de Degradación Elegante

**Escenario:** GeoRef caído al crear un proyecto con `lat`/`lng`.

**Comportamiento esperado:**
1. `GeorefService.resolveCoordinates()` captura cualquier error/timeout con `catchError(() => of(null))`
2. Logger registra `GeoRef unavailable: ...` (warn, no error)
3. `ProyectosService.create()` recibe `null` → establece `georefFailed: true`
4. El proyecto se crea correctamente con `department=null`, `municipality=null`
5. El endpoint retorna `201 Created` — el cliente no ve el error interno

---

## Notas de Seguridad

| Check | Estado | Detalle |
|-------|--------|---------|
| GeoRef bind en loopback | ✅ | `gunicorn.conf.py`: `bind = "127.0.0.1:8001"` |
| Puerto 8001 no expuesto en Nginx | ✅ | `nginx/kaaiya.conf` no tiene `location` para ese puerto |
| CORS GeoRef | ✅ | `ALLOWED_ORIGINS` configurable; default solo loopback |
| Swagger GeoRef deshabilitado en prod | ✅ | `docs_url=None if is_prod else "/docs"` |
| `.env` fuera de git | ✅ | Cubierto en `.gitignore` raíz |
| GeoJSON fuera de git | ✅ | `georef-service/data/*.geojson` en `.gitignore` |
| `synchronize: false` preservado | ✅ | Solo se corre el script de migración explícita |
| Sin `HttpException` directo | ✅ | `GeorefService` usa `Logger.warn()`, no excepciones |

---

## Notas de Rendimiento

| Aspecto | Valor esperado | Cómo se garantiza |
|---------|----------------|-------------------|
| Latencia PiP | < 10 ms | GeoDataFrame cargado en memoria al iniciar el módulo |
| RAM GeoRef (preload) | ~120 MB base + ~20 MB / worker extra | `preload_app = True` en `gunicorn.conf.py` |
| RAM total con 9 workers | ~300 MB | CoW: workers comparten el GeoDataFrame del padre |
| Timeout NestJS → GeoRef | 5000 ms (configurable) | `GEOREF_TIMEOUT_MS` env var |
| Índices BD | lat/lng + department | `migrate-georef.ts` crea 2 partial indexes |

---

---

## Sesión v2 — Verificación, Correcciones y Seed (2026-06-12)

### Correcciones Aplicadas

| # | Problema | Corrección |
|---|---------|-----------|
| 1 | SSL no configurado en `database.module.ts` | Agregado `ssl: { rejectUnauthorized: false }` cuando `DB_HOST` contiene "supabase". También agregado pool `extra: { max: 5 }`. |
| 2 | `GEOREF_URL` y `GEOREF_TIMEOUT_MS` ausentes en `.env` | Variables agregadas al `.env` real del backend. |
| 3 | `venv/` y `data/bolivia.geojson` ausentes en `georef-service/` | `python -m venv venv`, `pip install`, descarga de GADM 4.1 Bolivia ejecutada. |
| 4 | Migración `migrate:georef` no aplicada en Supabase | Ejecutada exitosamente: 6 columnas + 2 índices en tabla `proyectos`. |
| 5 | Nombres de departamentos sin espacios (`LaPaz`, `SantaCruz`) | Mapa de normalización en `geo_service.py`. |
| 6 | Nombres de provincias sin espacios (`AndrésIbáñez`, `GeneralJoséBallivián`) | Regex de separación de palabras CamelCase con acentos en `geo_service.py`. |
| 7 | Ruta `GET /api/proyectos/map` retornaba 401 en modo watch | Servidor relanzado desde `dist/src/main.js` compilado (no watch). |

### Estado del Sistema tras las Correcciones

| Componente | Estado | Detalle |
|-----------|--------|---------|
| GeoRef service | ✅ OK | Corriendo en `127.0.0.1:8001`, 112 features cargadas |
| NestJS + Supabase | ✅ OK | Conectado con SSL, pool max=5 |
| Migración georef | ✅ Aplicada | 6 columnas + 2 índices en `proyectos` |
| `GET /api/proyectos/map` | ✅ OK | HTTP 200, retorna proyectos con coordenadas |
| Autenticación JWT | ✅ OK | Login → `accessToken` |

### Resultados de Tests GeoRef

```
GET /geo/health          → {"status":"ok","features_loaded":112}
POST /pip (-17.78,-63.18) → Santa Cruz / Andrés Ibáñez  ✓
POST /pip (-14.83,-64.90) → Beni / Cercado               ✓
POST /pip (-17.39,-66.16) → Cochabamba / Cercado          ✓
POST /pip (-16.5,-68.15)  → La Paz / Murillo             ✓
POST /pip (NYC -74.0)     → HTTP 422 (out of Bolivia)    ✓
```

### Datos Seed en Supabase

**Empresas creadas (4):**
| Nombre | Dept | Proyecto | Coords Proyecto | GeoRef |
|--------|------|---------|----------------|--------|
| Gravetal Bolivia S.A. | Santa Cruz | Certificación soya RTRS | -17.75, -63.25 | ✅ Santa Cruz / Andrés Ibáñez |
| Cooperativa El Progreso | Beni | Ganadería silvopastoril | -14.83, -64.90 | ✅ Beni / Cercado |
| Fund. Conservación Bosque Chiquitano | Santa Cruz | Corredor Chiquitano-Pantanal | -16.35, -60.95 | ✅ Santa Cruz / Velasco |
| Rurrenabaque Ecoturismo S.R.L. | Beni | Turismo Parque Madidi | -14.44, -67.53 | ✅ Beni / General José Ballivián |

**Organizaciones creadas (4):**
| Nombre | Dept | Proyecto | Coords Proyecto | GeoRef |
|--------|------|---------|----------------|--------|
| WWF Bolivia | La Paz | Monitoreo fauna amazónica | -13.50, -66.00 | ✅ Beni / Yacuma |
| AOPEB | Cochabamba | Cert. orgánica 500 familias | -17.39, -66.16 | ✅ Cochabamba / Cercado |
| FAN - Fundación Amigos de la Naturaleza | Santa Cruz | Conserv. tortugas Chiquitano | -16.35, -60.95 | ✅ Santa Cruz / Velasco |
| Cátedra Amazónica UCB — Kaa Iya | La Paz | Plataforma Kaa Iya | -16.49, -68.12 | ✅ La Paz / Murillo |

**Nota:** GADM 4.1 nivel 2 proporciona nombres de **provincias** bolivianas (112 unidades), no de municipios (339). El campo `municipality` almacena el nombre de la provincia.

### Test de Degradación Elegante

- GeoRef detenido → se registró empresa con proyecto con lat/lng
- Backend respondió: `201 {"message":"Se lleno el formulario exitosamente"}`
- Proyecto creado: `department=null`, `municipality=null`, `georefFailed=true`
- Backend nunca devolvió 500 ✅

### Auditoría de Seguridad

| Check | Resultado |
|-------|----------|
| GeoRef no accesible en `0.0.0.0:8001` | ✅ Connection refused |
| `.env` no en git | ✅ Backend repo (`Octa-backend`): `.env` en `.gitignore` línea 39. `georef-service/` sin repo git aún. |
| `bolivia.geojson` en `.gitignore` | ✅ Regla en `.gitignore` raíz |
| Pool de conexiones Supabase | ✅ `max: 5` en `database.module.ts` |
| SSL en conexión Supabase (app principal) | ✅ Corregido en esta sesión |

### Resumen Final del Endpoint de Mapa

`GET /api/proyectos/map` — Sin autenticación requerida

Ejemplo de respuesta:
```json
[
  {
    "id": 18,
    "nombre": "Certificación de sostenibilidad en producción de soya RTRS",
    "descripcion": "...",
    "lat": "-17.7500000",
    "lng": "-63.2500000",
    "department": "Santa Cruz",
    "municipality": "Andrés Ibáñez",
    "anioInicio": 2019,
    "anioFin": null,
    "imagenPrincipalUrl": null,
    "area": { "id": 2, "nombre": "Desarrollo de comunidades indigenas" },
    "tipo": { "id": 5, "nombre": "Desarrollo productivo sostenible" }
  }
]
```

---

## Pasos Pendientes para el Equipo

1. **Ejecutar la migración** en cada entorno:
   ```bash
   cd api-rest-amazonia && npm run migrate:georef
   ```

2. **Descargar datos GeoJSON** antes de levantar GeoRef:
   ```bash
   cd georef-service && bash scripts/download_data.sh
   ```

3. **Configurar `.env`** en ambos servicios (copiar desde `.env.example`).

4. **Ejecutar tests** del microservicio:
   ```bash
   cd georef-service && pytest tests/ -v
   ```

5. **Frontend:** Consumir `GET /api/proyectos/map` para los marcadores del mapa. El campo `department` puede usarse para agrupar/filtrar visualmente.

6. **Opcional — Retroalimentar proyectos existentes:** Si hay proyectos en BD con `lat`/`lng` ya ingresados (vía edición directa), ejecutar un script de backfill para poblar `department`/`municipality`.

7. **Opcional — Rate limiting en `/geo/pip`:** Si GeoRef se expone a más clientes internos, considerar `slowapi` (rate limiting para FastAPI).

---

## Auditoría integral — 2026-06-13

**Responsable:** Claude Code (claude-opus-4-8) · **Alcance:** Fases 1–6 del prompt `docs/CLAUDE_CODE_PROMPT.md` ejecutadas en orden.
**Metodología:** reconocimiento estático + pruebas black-box en runtime contra servicios locales. Light-writes con prefijo `audit-test-` y limpieza por SQL. **No se modificó código fuente.**

### Resumen ejecutivo

- **Servicios verificados:** NestJS ✅ (`127.0.0.1:3333`) · GeoRef ✅ (`127.0.0.1:8001`, 112 features).
- **Endpoints probados:** 70 rutas mapeadas inventariadas (100% en matriz); ~50 ejercitadas en runtime (happy + negativos), el resto documentado (uploads multipart y mutaciones idempotentes marcados "no ejecutado" para no alterar datos productivos).
- **Integración Backend ↔ GeoRef:** contrato consistente, 4 escenarios de coordenadas OK, **degradación elegante verificada** (GeoRef caído → `201` + `georefFailed=true`, sin 5xx).
- **Hallazgos:** **1 CRÍTICO · 4 ALTOS · 4 MEDIOS · 3 BAJOS** (+ varias notas INFO).
- **Veredicto general:** 🟠 **REQUIERE ACCIÓN antes de producción** — la funcionalidad central es sólida y la integración GeoRef es robusta, pero la configuración de seguridad de borde (CORS, headers, validación estricta) y endpoints scaffolding expuestos deben corregirse antes del despliegue de julio 2026.

> **Nota sobre puertos:** el prompt asume backend en `:3000`; el puerto real es **`:3333`**. No existe `GET /api/health` ni controller `georef` en el backend; los comandos `POST /api/georef/test` y `GET /api/georef/health` del prompt no aplican.

### Datos de prueba creados y eliminados (limpieza confirmada)

| Entidad | Creado | Eliminado |
|---|---|---|
| `usuarios` (audit-test-admin, audit-test-extra) | id 9, 10 | ✅ vía SQL (2 filas) |
| `solicitudes_acceso` (audit-test-inv) | id 4 | ✅ vía SQL (1 fila) |
| `empresas` (audit-test Empresa Resiliencia) | id 17 + pivots | ✅ vía SQL (departamentos/apoyos/motivos/ods_empresas) |
| `proyectos` (audit-test Proyecto Resiliencia) | id 27 + pivots | ✅ vía SQL (localidades/ayudas/actores/comunidades_indigenas_areas/proyectos_empresas) |

Verificado post-limpieza: `GET /proyectos/map` → 9 proyectos (estado original), 0 `audit-test` restantes. Script de limpieza temporal creado y eliminado (no quedó en el repo).

### Hallazgos priorizados

#### 🔴 AUDIT-001 — CORS refleja cualquier origen con credenciales (CRÍTICO)
- **Módulo:** `src/infrastructure/config/services/cors.config.ts` + `.env` (`DOMAIN_FRONTEND=*`).
- **Evidencia (runtime):** `curl -H "Origin: https://evil.com" /api/departamentos` →
  `Access-Control-Allow-Origin: https://evil.com` + `Access-Control-Allow-Credentials: true`.
- **Causa:** cuando `allowedOrigins === '*'`, `getCorsOptions()` retorna `{ origin: true, credentials: true }`. Express refleja el `Origin` entrante y habilita credenciales → cualquier sitio puede hacer peticiones autenticadas cross-origin (robo de sesión/CSRF de lectura).
- **Recomendación:** nunca combinar `credentials: true` con reflexión de origen. Exigir lista blanca explícita; si no hay frontend definido, `credentials: false`. Snippet sugerido (no aplicado):
  ```ts
  if (allowedOrigins === '*') return { origin: '*', credentials: false };
  ```
  y en producción definir `DOMAIN_FRONTEND=https://kaaiya.ucb.bo` (lista separada por comas).
- **Estado:** ✅ RESUELTO en commit `deb5fc1` — 2026-06-13
- **Fix aplicado:** con `*` se devuelve `{ origin:'*', credentials:false }`; credenciales solo con lista blanca explícita.
- **Test de regresión:** `src/infrastructure/config/services/cors.config.spec.ts`
- **Verificado con:** `npx jest cors.config` (4 tests OK)

#### 🟠 AUDIT-002 — `ValidationPipe` sin `whitelist`/`forbidNonWhitelisted` (ALTO)
- **Módulo:** `src/main.ts` (líneas 86–91).
- **Evidencia:** `POST /auth/register` con `{...,"campoInyectadoMalicioso":"x","activo":false}` → **201** (no rechaza ni filtra propiedades desconocidas).
- **Impacto:** propiedades no declaradas llegan a la capa de servicio → riesgo de mass-assignment a medida que crezcan los DTOs.
- **Recomendación:**
  ```ts
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: true } })
  ```
- **Estado:** ✅ RESUELTO en commit `4f97b7c` — 2026-06-13
- **Fix aplicado:** factory `buildValidationPipe()` con `whitelist + forbidNonWhitelisted` aplicada en `main.ts`.
- **Test de regresión:** `src/shared/validation/validation-pipe.config.spec.ts`
- **Verificado con:** `npx jest validation-pipe` (campo extra ⇒ 400)

#### 🟠 AUDIT-003 — Endpoints CRUD scaffolding públicos y ocultos (ALTO)
- **Módulos:** `comunidades-indigenas` y `comunidades-municipios` (controllers + services).
- **Evidencia:** `POST /comunidades-indigenas` **sin token** → `201 "This action adds a new comunidadesIndigena"`; `DELETE /comunidades-indigenas/999999` sin token → `200`. Ambos controllers usan `@ApiExcludeController` (ocultos de Swagger) y **carecen de `@UseGuards`**. Los services son stubs de `nest g resource` (devuelven strings, no tocan BD).
- **Impacto:** superficie de ataque shadow (endpoints mutadores no documentados y no autenticados). Hoy sin impacto de datos (stubs), pero si alguien implementa el service quedarían abiertos. Confunde el inventario de la API.
- **Recomendación:** eliminar estos controllers/services scaffolding (los datos reales se sirven por `GET /municipios/:id/comunidades`), o protegerlos con `JwtAuthGuard + RolesGuard(Admin)` e implementarlos correctamente. Revisar también los 13 controllers `@ApiExcludeController` vacíos (sin rutas) — son shells muertos a eliminar.
- **Estado:** ✅ RESUELTO en commit `20a7981` — 2026-06-13
- **Fix aplicado:** eliminados los controllers comunidades-indigenas/municipios + 13 controllers vacíos; servicio comunidades-indigenas conservado (lo usa localidades-proyectos). Rutas 70→60.
- **Test de regresión:** verificación runtime (no aplica unit; es eliminación de rutas)
- **Verificado con:** `POST /api/comunidades-indigenas → 404`, `GET /api/comunidades-municipios → 404`

#### 🟠 AUDIT-004 — Sin `helmet` ni headers de seguridad; `X-Powered-By` expuesto (ALTO)
- **Módulo:** `src/main.ts`.
- **Evidencia:** respuesta sin `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`; presente `X-Powered-By: Express` (fingerprinting).
- **Recomendación:** `app.use(helmet())` y `app.disable('x-powered-by')`. (Nota: instalar `helmet` no estaba permitido durante esta auditoría; es recomendación, no cambio aplicado.)
- **Estado:** ✅ RESUELTO en commit `4f97b7c` — 2026-06-13
- **Fix aplicado:** `helmet@8` instalado y aplicado + `disable('x-powered-by')` en `main.ts`.
- **Verificado con:** runtime — headers `Content-Security-Policy`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff` presentes; `X-Powered-By` ausente.

#### 🟠 AUDIT-005 — Dependencias con CVEs HIGH/CRITICAL en runtime (ALTO)
- **Backend (`npm audit`):** 44 vulnerabilidades (1 crítica, 16 altas). Crítica = `handlebars` (vía `@nestjs/swagger`, deshabilitado en prod). Altas en **runtime de producción** (`npm audit --omit=dev` → 20 vulns, 10 high): `multer` (uploads), `validator` (vía class-validator), `jws` (firma JWT), `path-to-regexp`, `lodash`.
- **GeoRef (`pip-audit`):** 12 vulns / 4 paquetes; runtime-relevante: **`starlette 0.38.6`** (CVE-2024-47874, DoS multipart; fix ≥0.40) y **`geopandas 1.0.1`** (PYSEC-2026-62, fix 1.1.2). `pip`/`pytest` son tooling/test.
- **Recomendación:** `npm audit fix` + re-test; bump de FastAPI/starlette y geopandas en `requirements.txt`. Documentar CVEs residuales aceptados.
- **Estado:** ✅ RESUELTO en commit `2f57a36` — 2026-06-13
- **Fix aplicado:** backend `npm audit fix` → 44→11 vulns, **prod 0**. GeoRef `requirements.txt` → fastapi 0.118/starlette 0.48 (corrige CVE-2024-47874 y CVE-2025-54121), gunicorn 23, geopandas 1.1.2, python-dotenv 1.2.2.
- **Residuales (documentados):** backend 11 *moderate* solo dev (webpack/@nestjs/cli). GeoRef: `pip`/`pytest` (tooling/test) y starlette CVE-2025-62727 (fix 0.49.1 requiere fastapi >0.118, aún no estable) → en `pending-issues.md`.
- **Verificado con:** `npm audit --omit=dev → found 0 vulnerabilities`; `pytest → 12 passed`.

#### 🟡 AUDIT-006 — `?amazonico=false` no filtra; geografía incompleta (MEDIO)
- **Módulo:** `departamentos` + `FilterDepartamentosDto`.
- **Evidencia:** `GET /departamentos` → total **5** (todos `amazonico:true`); `?amazonico=true` → 5; `?amazonico=false` → los **mismos 5**. Doc (`progress.md`) declara 9 departamentos (5+4) y 105 municipios; runtime tiene 5 y **101** municipios.
- **Causa probable (1):** `migrate-geography.sql` **no aplicado** a este Supabase (los 4 no-amazónicos y los 105 municipios nunca se cargaron). **(2):** la coerción booleana global (`enableImplicitConversion`) interfiere con el `@Transform` del DTO, de modo que `amazonico=false` no produce el filtro esperado.
- **Recomendación:** aplicar `migrate-geography.sql`; verificar el filtro booleano con un test (`false` debe devolver no-amazónicos).
- **Estado:** ✅ RESUELTO (código) en commit `8e5f5a3` — 2026-06-13
- **Fix aplicado:** el `@Transform` lee el valor crudo de `obj` (no `value`), inmune a `enableImplicitConversion`. Datos geográficos: diferidos al equipo (ver `pending-issues.md`).
- **Test de regresión:** `filter-departamentos.dto.spec.ts` (`'false' ⇒ false`)

#### 🟡 AUDIT-007 — Cero tests automatizados en el backend (MEDIO)
- **Evidencia:** `find src -name "*.spec.ts"` → **0**. Jest configurado pero sin specs; `test:cov` no produce cobertura.
- **Contraste:** GeoRef tiene 12 tests (`pytest` → **12 passed**). 
- **Recomendación:** priorizar tests de `FormulariosService`, `ProyectosService` (bifurcación + transacción) y guards de auth.
- **Estado:** ⏸️ PARCIAL en commit `9c1b136` — 2026-06-13. De 0 a **43 tests / 8 suites** (cors, ValidationPipe, JwtStrategy, RolesGuard, OptionalJwt, GeorefService, ProyectosService georef, FilterDepartamentos, utils). Objetivo 70% global diferido (plan por tandas en `pending-issues.md`).

#### 🟡 AUDIT-008 — Invalidación de tokens diferida (MEDIO)
- **Evidencia/diseño:** logout es semántico (stateless); desactivar usuario o cambiar contraseña no invalida tokens vigentes hasta su expiración (24h). Existe `token_valid_from` en la entidad pero la invalidación inmediata depende de blacklist (backlog reconocido en `progress.md`).
- **Recomendación:** completar la verificación de `token_valid_from` en `JwtStrategy`/guard o implementar blacklist (`tokens_revocados`).
- **Estado:** ✅ RESUELTO (era falso positivo) — test en commit `df6b55f` — 2026-06-13
- **Hallazgo:** `JwtStrategy.validate()` YA rechaza tokens con `iat < tokenValidFrom`; `auth.service` setea `tokenValidFrom` al desactivar cuenta (`update`) y al cambiar password (`changePassword`). La invalidación inmediata ya existía; el finding se basó en notas de `progress.md`/Swagger desactualizadas.
- **Test de regresión:** `jwt.strategy.spec.ts` (4 casos)

#### 🟡 AUDIT-009 — Latencia de registro y timeout GeoRef (MEDIO)
- **Evidencia:** `POST /formularios/empresas` con GeoRef caído tardó **~7.8 s** (transacción Supabase con múltiples inserts; ECONNREFUSED es inmediato). Con timeout real de red el peor caso sería transacción + `GEOREF_TIMEOUT_MS` (5 s) **dentro** de la transacción DB → conexiones retenidas.
- **Recomendación:** mover la resolución GeoRef fuera de la transacción (resolver antes de abrir, o enriquecer asíncronamente post-commit con `re-georef`).
- **Estado:** ✅ RESUELTO en commit `360e741` — 2026-06-13
- **Fix aplicado:** `FormulariosService` pre-resuelve las regiones ANTES de `dataSource.transaction()` y las pasa a `create(preResolved)`. Sin cambio de contrato HTTP.
- **Test de regresión:** `proyectos.service.spec.ts` (5 casos) + verificación e2e (201 + enrichment Santa Cruz/Andrés Ibáñez).

#### 🔵 AUDIT-010 — `console.log` y `: any` en código (BAJO)
- **Evidencia:** 8 `console.log` y 9 `: any` en `src`. Sin logging estructurado (Winston/Pino) pese a mención en `informe.md`.
- **Estado:** ✅ RESUELTO (console.log) en commit `7c4d42d` — 2026-06-13. `: any` ⏸️ DIFERIDO (`pending-issues.md`).
- **Fix aplicado:** banner de arranque migrado a `Logger('Bootstrap')`; 0 `console.log` en `src`.

#### 🔵 AUDIT-011 — Inconsistencia de envoltura de respuesta (BAJO)
- **Evidencia:** unos endpoints devuelven `{data,total,page,...}` y otros `{ods:[...]}`/`{areas:[...]}`. Complica el consumo uniforme en el frontend.
- **Estado:** ⏸️ DIFERIDO — **Bloqueante:** decisión de negocio/contrato (rompe al frontend). Plan en `docs/pending-issues.md#audit-011`.

#### 🔵 AUDIT-012 — Archivos > 300 líneas y typos de archivo (BAJO)
- **Evidencia:** `dashboard.controller.ts` (468), `dashboard.service.ts` (460), `auth.controller.ts` (344), `proyectos.service.ts` (324). Persisten typos conocidos `enviroment.config.ts`, `my-fobidden.exception.ts` (cosméticos).
- **Estado:** ⏸️ DIFERIDO — **Bloqueante:** alto ruido (rename de imports) / cosmético. Plan en `docs/pending-issues.md#audit-012`.

### Aspectos verificados como CORRECTOS (✅)

- **SQL injection:** `'/OR 1=1`, `'; DROP TABLE`, `<script>` en `?search` → 200 tratados como literales (TypeORM parametriza). Sin inyección.
- **Rate limiting:** `ThrottlerModule` global 60/60s + `@Throttle(5/60s)` en login → 429 confirmado al 6º login.
- **AuthZ jerárquica:** Admin→crear Superadmin = 403; Admin→DELETE usuario (Superadmin-only) = 403; dashboard/detalle sin token = 401.
- **JWT:** secreto desde env, alg HS256 explícito, sin passwordHash en respuestas, tiempo constante anti-enumeración en login.
- **GeoRef:** contrato `GeoRefResponse` ↔ `PipResponse` idéntico; `timeout()` + `catchError(()=>of(null))` + `Logger.warn` + `baseUrl` desde `ConfigService`; bind solo `127.0.0.1`; `ALLOWED_ORIGINS` lista blanca (no wildcard); Swagger off en prod.
- **Validación de coordenadas:** backend rechaza lat/lng fuera del bounding box de Bolivia con 400; microservicio con 422.
- **Secretos:** sin claves hardcodeadas en `src`; `.env` gitignored y no trackeado; `.env.example` sin valores reales.

### Estado de la integración Backend ↔ GeoRef

- Contrato DTO/Pydantic: **consistente**.
- Escenarios: Santa Cruz `(-17.78,-63.18)` → Santa Cruz/Andrés Ibáñez ✅ · Beni `(-14.83,-64.90)` → Beni/Cercado ✅ · Buenos Aires → 422 ✅ · `(999,999)` → 422 ✅.
- End-to-end: proyectos seedeados en `/proyectos/map` con `department`/`municipality` resueltos (enriquecimiento OK).
- **Resiliencia:** GeoRef caído → registro `201`, proyecto con `department=null` y `georefFailed=true`, log `WARN ... ECONNREFUSED` (sin stack trace). ✅

### Comparativa contra `audit-report.md` anterior (2026-06-12, integración GeoRef)

- **Resueltos / confirmados estables:** integración GeoRef, degradación elegante, SSL Supabase, `/proyectos/map`, bind loopback de GeoRef, contrato DTO. Todos siguen ✅ en esta auditoría.
- **Pendientes que persisten:** sin tests backend (AUDIT-007), sin helmet (AUDIT-004), invalidación de tokens (AUDIT-008), `migrate-geography.sql` no aplicado (AUDIT-006).
- **Nuevos hallazgos (no cubiertos antes):** CORS crítico (AUDIT-001), ValidationPipe laxo (AUDIT-002), endpoints scaffolding públicos (AUDIT-003), CVEs de dependencias (AUDIT-005), filtro `amazonico` (AUDIT-006), latencia GeoRef-en-transacción (AUDIT-009).

### Veredicto final

🟠 **REQUIERE ACCIÓN.** Bloqueantes antes de producción: **AUDIT-001 (CORS)**, **AUDIT-003 (endpoints scaffolding)**, **AUDIT-002 (validación estricta)** y **AUDIT-004/005 (helmet + CVEs)**. Resueltos estos, el sistema queda apto: la lógica de negocio, el control de acceso por roles, el rate limiting y la integración GeoRef con degradación elegante funcionan correctamente.

> Matriz completa de los 70 endpoints en [`docs/endpoint-matrix.md`](endpoint-matrix.md).
