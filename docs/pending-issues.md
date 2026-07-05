# Pending Issues — Kaa Iya

Issues diferidos durante la sesión de remediación (2026-06-13). Cada uno indica
razón del diferimiento y plan propuesto.

---

## AUDIT-011 — Inconsistencia de envoltura de respuesta (BAJO)
- **Razón:** normalizar las respuestas (`{data,total,...}` vs `{ods:[...]}` / `{areas:[...]}`)
  **rompe el contrato** que ya consume/consumirá el frontend. Requiere coordinación
  con el equipo de frontend y versionado de API.
- **Plan propuesto:** definir un envelope estándar (`{ data, meta }`), aplicarlo con un
  interceptor global, y publicar la versión `v2` del prefijo o coordinar el cambio
  con el frontend antes de aplicarlo. Actualizar `openapi.json`.

## AUDIT-012 — Typos en nombres de archivo + archivos >300 líneas (BAJO)
- **Typos:** `enviroment.config.ts` → `environment.config.ts`,
  `my-fobidden.exception.ts` → `my-forbidden.exception.ts`.
  - **Razón:** el rename toca muchos imports (`environmentConfig`, `MyForbiddenException`
    se referencian en múltiples módulos); es puramente cosmético y de alto ruido en el diff.
  - **Plan:** rename con actualización de todos los imports en un PR dedicado + `npm run build`.
- **Archivos grandes:** `dashboard.controller.ts` (468), `dashboard.service.ts` (460),
  `auth.controller.ts` (344), `proyectos.service.ts` (~340).
  - **Plan:** extraer helpers/sub-servicios (p.ej. separar queries del dashboard en un
    `DashboardQueryService`); refactor incremental sin cambio de contrato.

## AUDIT-010 (parcial) — Uso de `: any` (BAJO)
- **Razón:** 9 usos de `: any` en `src`; varios son límites de integración (raw queries,
  payloads dinámicos) que requieren tipado cuidadoso.
- **Plan:** tipar progresivamente; activar `@typescript-eslint/no-explicit-any` como warning.

## AUDIT-005 (residual) — CVEs de dependencias remanentes
- **Backend:** 11 vulnerabilidades *moderate* solo en tooling de desarrollo
  (`webpack`, `@nestjs/cli`); no afectan runtime de producción (`npm audit --omit=dev` = 0).
- **GeoRef:** `pip`/`pytest` (tooling/test) y `starlette` CVE-2025-62727 (fix 0.49.1 requiere
  `fastapi` > 0.118 aún no estable). Revisar cuando FastAPI publique compatibilidad.
- **Plan:** re-evaluar en cada ciclo de mantenimiento; `npm audit` / `pip-audit` en CI.

## Geografía — datos incompletos en BD (relacionado con AUDIT-006)
- **Estado:** la BD tiene 5 departamentos / 101 municipios; el dataset completo
  (9 dept / 105 mun + comunidades) lo cargará el equipo. El SQL queda organizado en
  `api-rest-amazonia/database/seeds/`.
- **Plan:** el equipo aplica `seeds/03_reference-data` (geografía) con backup previo.

## AUDIT-007 — Cobertura de tests del backend (objetivo 70%)
- **Estado:** ⏸️ PARCIAL. Se pasó de 0 specs a una suite core de 43 tests / 8 suites
  cubriendo la lógica crítica: `cors.config`, `ValidationPipe`, `JwtStrategy`,
  `RolesGuard`/`OptionalJwtAuthGuard`, `GeorefService`, `ProyectosService` (georef),
  `FilterDepartamentosDto`, utils (crypto/pagination/transformers/validate-data).
- **Razón del diferimiento del 70% global:** requiere testear los ~35 módulos
  (controllers + services con TypeORM mockeado); excede una sesión y se priorizaron
  los entregables de documentación/despliegue (decisión del usuario).
- **Plan propuesto (por tandas):**
  1. Servicios de catálogos (patrón `esPropio`/`findAllByIds`/`createMany`/`findOneOrCreate`).
  2. `AuthService` (login/register/update/changePassword) y `SolicitudesService`.
  3. `DashboardService` (caché + queries) y `Empresas/OrganizacionesService`.
  4. e2e con Supertest (auth flow, guards, validación) usando `test/jest-e2e.json`.
- La cobertura se mide con `collectCoverageFrom` acotado a archivos de lógica
  (se excluyen entities/modules/dtos/enums/templates).

## Swagger — evitar secuencias `$` especiales en descripciones/ejemplos
- **Contexto:** `@nestjs/swagger` 11.x genera `swagger-ui-init.js` embebiendo el doc con
  `String.replace(placeholder, json)`. En el *replacement string* de `String.prototype.replace`,
  `` $` ``, `$&`, `$'`, `$$` y `$1`–`$9` son patrones especiales → si una descripción/ejemplo
  contiene esas secuencias, **corrompen el `swagger-ui-init.js`** (no el `/api/documentation-json`),
  produciendo `Uncaught SyntaxError: Invalid or unexpected token` en el navegador.
- **Caso real corregido (2026-06-14):** `auth.controller.ts` change-password tenía
  `` (ej: `!`, `@`, `#`, `$`) `` → la subsecuencia `` $` `` rompía la UI. Se cambió a
  `(por ejemplo: ! @ # $)`.
- **Regla para el equipo:** en `@ApiOperation/@ApiProperty` (description/example) **no** usar
  `$` inmediatamente seguido de `` ` ``, `&`, `'`, `$` o un dígito. `$` aislado o seguido de
  otros caracteres (p.ej. `$)`) es seguro.
- **Mejora futura opcional:** sanear el documento antes de `SwaggerModule.setup` (reemplazar en
  strings `$` problemáticos) o actualizar `@nestjs/swagger` si publican el fix.

## Mejora futura — Circuit breaker explícito para GeoRef
- **Estado:** el fallback por timeout + `catchError` ya cubre la degradación elegante.
- **Plan:** si crece el tráfico, evaluar `opossum` para abrir el circuito tras N fallos
  y evitar latencia acumulada.
