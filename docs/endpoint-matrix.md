# Matriz de Endpoints — Backend Kaa Iya (`api-rest-amazonia`)

> Generada durante la auditoría integral del **2026-06-13**. Backend en `http://127.0.0.1:3333/api` (puerto real **3333**).
> Rutas mapeadas en runtime: **70**. Documentadas en Swagger: **60** (10 ocultas con `@ApiExcludeController`).
> Leyenda estado: ✅ correcto · ⚠️ observación · ❌ hallazgo.

## Auth (`/api/auth`)

| Método | Ruta | Auth / Rol | Happy path | Validación / negativos | Estado |
|--------|------|-----------|-----------|------------------------|--------|
| POST | `/auth/login` | Público (throttle 5/60s) | ✅ 201 + JWT | ✅ 401 pass mala / user inexistente · ✅ 400 payload inválido · ✅ 429 al 6º intento | ✅ |
| POST | `/auth/logout` | JWT | ✅ 200 | ✅ 401 sin token | ✅ |
| GET | `/auth/me` | JWT | ✅ 200 (sin passwordHash) | ✅ 401 sin/c-token inválido | ✅ |
| PUT | `/auth/me` | JWT | ✅ (solo `nombre`) | — | ✅ |
| POST | `/auth/change-password` | JWT | no probado (evita romper SA) | — | ⚠️ no ejecutado |
| POST | `/auth/register` | JWT + Admin+ | ✅ 201 (rol 2) | ✅ 403 Admin→Superadmin · ❌ acepta campos extra (no `forbidNonWhitelisted`) | ❌ AUDIT-002 |
| GET | `/auth/usuarios` | JWT + Admin+ | ✅ 200 paginado | ✅ 401 sin token | ✅ |
| GET | `/auth/usuarios/:id` | JWT + Admin+ | ✅ | ✅ 404 inexistente | ✅ |
| PATCH | `/auth/usuarios/:id` | JWT + Admin+ | no mutado | — | ⚠️ no ejecutado |
| DELETE | `/auth/usuarios/:id` | JWT + **Superadmin** | ✅ (usado en limpieza) | ✅ 403 para Admin | ✅ |
| POST | `/auth/solicitar-acceso` | Público | ✅ 201 | — | ✅ |
| GET | `/auth/solicitudes` | JWT + Admin+ | ✅ 200 | — | ✅ |
| PATCH | `/auth/solicitudes/:id/aprobar` | JWT + Admin+ | no ejecutado | — | ⚠️ no ejecutado |
| PATCH | `/auth/solicitudes/:id/rechazar` | JWT + Admin+ | no ejecutado | — | ⚠️ no ejecutado |

## Catálogos (todos GET públicos)

| Ruta | Auth | Happy | Estado |
|------|------|-------|--------|
| `GET /areas` | Público | ✅ 200 (2 áreas) | ✅ |
| `GET /apoyos/forms` | Público | ✅ 200 | ✅ |
| `GET /ayudas/forms` | Público | ✅ 200 | ✅ |
| `GET /motivos/forms` | Público | ✅ 200 | ✅ |
| `GET /formas-juridicas/forms` | Público | ✅ 200 | ✅ |
| `GET /tipos-proyectos/forms` | Público | ✅ 200 | ✅ |
| `GET /tipos-organizaciones/forms` | Público | ✅ 200 | ✅ |
| `GET /especies-animales/forms` | Público | ✅ 200 | ✅ |
| `GET /practicas-agricolas/forms` | Público | ✅ 200 | ✅ |
| `GET /actores-municipales/forms` | Público | ✅ 200 | ✅ |
| `GET /areas-desarrollo` | Público | ✅ 200 (4) | ✅ |
| `GET /ods` | Público | ✅ 200 (17) | ✅ |

> ⚠️ Inconsistencia de envoltura de respuesta: unos endpoints devuelven `{data,total,page,...}` (paginados) y otros `{ods:[...]}`, `{areas:[...]}`, `{apoyos:[...]}` (clave nombrada, sin paginación).

## Ubicaciones geográficas

| Método | Ruta | Auth | Happy | Negativos | Estado |
|--------|------|------|-------|-----------|--------|
| GET | `/departamentos` | Público | ✅ 200 | ❌ devuelve solo 5 (no 9); `?amazonico=false` devuelve los mismos 5 | ❌ AUDIT-005 |
| GET | `/municipios` | Público | ✅ 200 (total 101) | — | ⚠️ doc dice 105 |
| GET | `/municipios/:id/comunidades` | Público | ✅ 200 | ✅ 404 inexistente · ✅ 400 no-entero | ✅ |
| GET | `/comunidades-indigenas` | **Público (oculto)** | ⚠️ 200 devuelve string stub | scaffolding sin implementar | ❌ AUDIT-003 |
| POST | `/comunidades-indigenas` | **Público (oculto)** | ⚠️ 201 stub (no persiste) | DTO vacío, sin guard | ❌ AUDIT-003 |
| GET/PATCH/DELETE | `/comunidades-indigenas/:id` | **Público (oculto)** | ⚠️ 200 stub | sin guard | ❌ AUDIT-003 |
| POST/GET/PATCH/DELETE | `/comunidades-municipios[...]` | **Público (oculto)** | ⚠️ stub | sin guard | ❌ AUDIT-003 |

## Gestión — listados públicos / detalle privado (`OptionalJwtAuthGuard`)

| Método | Ruta | Auth | Sin token | Con token | Estado |
|--------|------|------|-----------|-----------|--------|
| GET | `/proyectos` | Opcional | ✅ 200 (cards) | ✅ 200 | ✅ |
| GET | `/proyectos/map` | Opcional | ✅ 200 (9) | ✅ 200 | ✅ |
| GET | `/proyectos/filtros-disponibles` | Público | ✅ 200 | — | ✅ |
| GET | `/proyectos/:id` | JWT | ✅ 401 | ✅ 200 | ✅ |
| POST/DELETE | `/proyectos/:id/imagen-principal` | JWT | — | no ejecutado (upload) | ⚠️ no ejecutado |
| POST/DELETE | `/proyectos/:id/galeria[...]` | JWT | — | no ejecutado (upload) | ⚠️ no ejecutado |
| PUT | `/proyectos/:id/galeria/orden` | JWT | — | no ejecutado | ⚠️ no ejecutado |
| GET | `/empresas` | Opcional | ✅ 200 | ✅ 200 | ✅ |
| GET | `/empresas/filtros-disponibles` | Público | ✅ 200 | — | ✅ |
| GET | `/empresas/:id` | JWT | ✅ 401 | ✅ | ✅ |
| POST/DELETE | `/empresas/:id/logo` | JWT | — | no ejecutado (upload) | ⚠️ no ejecutado |
| GET | `/organizaciones` | Opcional | ✅ 200 | ✅ | ✅ |
| GET | `/organizaciones/filtros-disponibles` | Público | ✅ 200 | — | ✅ |
| GET | `/organizaciones/:id` | JWT | ✅ 401 | ✅ | ✅ |
| POST/DELETE | `/organizaciones/:id/logo` | JWT | — | no ejecutado (upload) | ⚠️ no ejecutado |

## Formularios (registro público transaccional)

| Método | Ruta | Auth | Happy | Negativos | Estado |
|--------|------|------|-------|-----------|--------|
| POST | `/formularios/empresas` | Público | ✅ 201 (light-write + GeoRef) | ✅ 400 lat fuera de rango · ✅ 400 body inválido | ✅ |
| POST | `/formularios/organizaciones` | Público | no ejecutado (análogo) | — | ⚠️ no ejecutado |

## Dashboard (`/api/dashboard`, todos JWT)

| Ruta | Sin token | Con token | Estado |
|------|-----------|-----------|--------|
| `GET /dashboard/resumen` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/filtros-disponibles` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/por-region` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/por-tipo` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/timeline` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/salud` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/proyectos` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/proyectos/:id` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/empresas` | ✅ 401 | ✅ 200 | ✅ |
| `GET /dashboard/empresas/:id` | ✅ 401 | ✅ 200 | ✅ |

## GeoRef — microservicio (`http://127.0.0.1:8001`)

| Método | Ruta | Happy | Negativos | Estado |
|--------|------|-------|-----------|--------|
| GET | `/geo/health` | ✅ 200 `features_loaded:112` | — | ✅ |
| POST | `/geo/pip` | ✅ 200 Santa Cruz/Beni | ✅ 422 fuera de bbox · ✅ 422 (999,999) | ✅ |

> Nota: el backend **no** expone controller GeoRef (`POST /api/georef/test` / `GET /api/georef/health` del prompt **no existen**). La integración es service-to-service vía `GeorefService`.

---

## Actualización 2026-06-13 — post-remediación (rama `audit/remediation-20260613`)

Cambios al inventario tras la sesión de remediación:

| Cambio | Detalle | Estado |
|--------|---------|--------|
| ❌→🗑️ `comunidades-indigenas` CRUD (5) | Eliminados (AUDIT-003). `POST/GET/PATCH/DELETE` → **404** | Removido |
| ❌→🗑️ `comunidades-municipios` CRUD (5) | Eliminados (AUDIT-003). → **404** | Removido |
| ✅ `GET /api/health` | **Nuevo** — liveness (público, sin throttle) | OK |
| ✅ `GET /api/health/ready` | **Nuevo** — readiness: BD + GeoRef (503 si BD down) | OK |
| ✅ Catálogos `apoyos/areas/motivos/ods` | Ahora con `@ApiTags('Catálogos')` (antes "Untagged") | OK |
| ✅ Validación global | `whitelist + forbidNonWhitelisted` → campos extra ⇒ 400 | OK |
| ✅ CORS | wildcard ya no habilita credenciales | OK |
| ✅ Headers | helmet aplicado; `X-Powered-By` removido | OK |
| ✅ `?amazonico=false` | Ahora filtra correctamente (bug de coerción booleana corregido) | OK |

**Rutas mapeadas:** 70 → **60**. Spec OpenAPI exportable: `npm run openapi:export` → `api-rest-amazonia/openapi.json` (56 rutas documentadas, 0 sin tag).
