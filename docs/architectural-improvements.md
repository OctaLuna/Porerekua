# Mejoras Arquitectónicas — Sesión 2026-06-13

Mejoras aplicadas durante la remediación, más allá de la corrección directa de hallazgos.

## 1. Health checks (`GET /api/health`, `GET /api/health/ready`)

**Motivación:** no existía endpoint de salud (el prompt de auditoría asumía `/api/health`).
Render/Railway requieren un `healthCheckPath` para marcar el servicio como sano y para
reinicios automáticos.

**Antes:** solo `GET /api/dashboard/salud` (protegido con JWT) → inservible como probe público.

**Después:**
- `GET /api/health` — *liveness*: responde sin consultar dependencias (`{status, service, uptimeSeconds}`).
- `GET /api/health/ready` — *readiness*: verifica BD (`SELECT 1`) y GeoRef (`checkHealth`).
  - BD up + GeoRef up → `200 {status:'ok'}`
  - BD up + GeoRef down → `200 {status:'degraded'}` (GeoRef es opcional; degradación elegante)
  - BD down → `503 {status:'unavailable'}`
- Ambos exentos de rate limiting (`@SkipThrottle`) para soportar polling frecuente de la plataforma.

**Archivos:** `src/modules/health/health.controller.ts`, `health.module.ts`, registrado en `app.module.ts`.
**Impacto:** habilita healthchecks de PaaS; sin cambios de contrato en endpoints existentes.

## 2. Validación estricta centralizada (AUDIT-002)

Factory `buildValidationPipe()` (`src/shared/validation/validation-pipe.config.ts`) — fuente
única de configuración del `ValidationPipe`, testeable y reutilizable. Ver `audit-report.md#audit-002`.

## 3. GeoRef fuera de la transacción de BD (AUDIT-009)

Pre-resolución de coordenadas antes de abrir la transacción para no retener conexiones del
pool durante la latencia HTTP. Patrón: `ProyectosService.resolveRegionFor()` + parámetro
`preResolved` en `create()`. Ver `audit-report.md#audit-009`.

## Diferidas (ver `pending-issues.md`)

- **Filtro global de excepciones / interceptor de respuesta:** el sistema ya usa excepciones
  personalizadas consistentes y la auditoría no detectó fuga de stack traces; normalizar el
  envelope de respuesta es un cambio de contrato (coordinar con frontend) → diferido.
- **Logging estructurado (JSON):** migrado `console.log`→`Logger` (AUDIT-010); el logger JSON
  completo (pino/winston) queda como mejora futura.
- **Circuit breaker explícito para GeoRef:** el fallback por timeout ya cubre lo esencial.
