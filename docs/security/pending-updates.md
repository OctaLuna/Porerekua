# CVEs Pendientes de Actualización — Kaa Iya

Generado: 2026-06-30

Las siguientes vulnerabilidades no pudieron corregirse con `npm audit fix` sin introducir breaking changes.
Requieren actualización manual coordinada con ciclo de release.

---

## Backend NestJS (`api-rest-amazonia`)

### 🔴 ALTA — multer 1.0.0–2.1.1

| Campo | Valor |
|---|---|
| CVEs | GHSA-72gw-mp4g-v24j (DoS campos anidados), GHSA-3p4h-7m6x-2hcm (DoS uploads abortados) |
| Versión instalada | `multer@1.4.5-lts.1` (vía `@nestjs/platform-express`) |
| Versión de destino | `multer@2.x` |
| Bloqueo | Fix requiere `@nestjs/core@7.5.5` (downgrade masivo de NestJS 11 → 7). No aplicable. |
| Mitigación activa | Rate limiting de 60 req/min global + límite de tamaño en Multer config. El DoS es solo a nivel de parsing de campos, no RCE. El endpoint de upload usa Sharp que rechaza no-imágenes. |
| Plan | Actualizar cuando NestJS publique una versión compatible con multer 2.x. Monitorear `@nestjs/platform-express` changelog. |
| Prioridad | Media (no RCE, mitigado por rate limiting) |

### 🟡 MEDIA — file-type 13.0.0–21.3.1

| Campo | Valor |
|---|---|
| CVEs | GHSA-5v7r-6r5c-r473 (infinite loop ASF), GHSA-j47w-4g3g-c36v (ZIP DoS) |
| Afectado | `@xhmikosr/decompress` → `@swc/cli` (herramienta de build DEV) |
| Impacto en producción | **Ninguno** — `@swc/cli` es dev dependency, no está en el bundle de producción. |
| Versión de destino | `@swc/cli@0.8.1` |
| Bloqueo | `npm audit fix --force` rompe la cadena de `@xhmikosr/*` que depende de versiones específicas. |
| Plan | Actualizar en próximo upgrade de toolchain de build. |
| Prioridad | Baja (solo dev) |

---

## GeoRef Service (`georef-service`)

### ✅ CORREGIDO — FastAPI 0.118.0 → 0.138.2

Actualización aplicada el 2026-06-30. Incluye starlette 0.48.0 → 1.x (fix para múltiples CVEs).

### ✅ CORREGIDO — msgpack 1.2.0 → 1.2.1

Fix para GHSA-6v7p-g79w-8964. Aplicado el 2026-06-30.

### ✅ CORREGIDO — pytest 8.3.5 → 9.0.3

Fix para CVE-2025-71176. Solo entorno de test. Aplicado el 2026-06-30.

### 🟡 MEDIA — pip 25.0.1 (múltiples CVEs)

| CVEs | PYSEC-2026-196, CVE-2025-8869, CVE-2026-1703, CVE-2026-3219, CVE-2026-6357 |
|---|---|
| Versión de destino | `pip >= 26.1.2` |
| Impacto | pip es la herramienta de instalación, no corre en producción. Riesgo solo durante `pip install` en build/deploy. |
| Plan | Ejecutar `pip install --upgrade pip` en el entorno de build/CI antes del próximo deploy. |
| Prioridad | Baja (no en producción) |

---

## Frontend (`amazonia-viva-frontend`)

### ✅ COMPLETAMENTE CORREGIDO

`npm audit fix` resolvió las 8 vulnerabilidades (picomatch, postcss, react-router, rollup, vite, @babel/core).
Estado final: **0 vulnerabilidades**.

---

## Plan de seguimiento

| Acción | Responsable | Fecha límite |
|---|---|---|
| Actualizar multer cuando NestJS lo soporte | Dev Lead | Al lanzar NestJS 12+ |
| Actualizar @swc/cli | Dev Lead | Próximo ciclo de build tooling |
| Actualizar pip en entorno de build | DevOps | Antes del deploy UCB julio 2026 |
| Re-ejecutar `npm audit` en todos los servicios | Auditor | Antes del lanzamiento |
