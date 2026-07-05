# Backlog de Seguridad — Kaa Iya

Generado: 2026-06-30 | Severidades: Crítica / Alta / Media / Baja / Informativa

---

## BL-001 — multer DoS (Media)
- **CVEs:** GHSA-72gw-mp4g-v24j, GHSA-3p4h-7m6x-2hcm
- **Versión vulnerable:** multer 1.4.5-lts.1 (vía @nestjs/platform-express)
- **Impacto:** DoS mediante campos anidados o uploads abortados
- **Fix disponible:** No sin downgrade masivo de NestJS (ver pending-updates.md)
- **Mitigación activa:** Rate limiting global 60req/min + Sharp rechaza no-imágenes
- **Plan:** Actualizar cuando @nestjs/platform-express soporte multer 2.x

## BL-002 — Token JWT válido tras logout (Baja)
- **Descripción:** Logout limpia la cookie httpOnly del navegador pero el JWT permanece válido hasta su expiración natural (24h).
- **Impacto:** Si alguien captura el Bearer token antes del logout, sigue siendo válido. Con cookies httpOnly, esto requiere XSS previo — reducido significativamente.
- **Fix posible:** Implementar Redis blacklist o actualizar tokenValidFrom en logout
- **Aceptado:** El riesgo residual es bajo dado que las cookies httpOnly previenen acceso por JS.

## BL-003 — Validación MIME en uploads (Baja)
- **Descripción:** `UploadService.saveImage()` valida tipo de imagen vía `sharp` (magic bytes implícitos) pero no verifica explícitamente el tipo MIME del Content-Type ni la extensión.
- **Impacto bajo:** Sharp lanza excepción para archivos no-imagen, previniendo upload de scripts. Sin embargo, una validación explícita sería más robusta.
- **Recomendación:** Agregar `import { fileTypeFromBuffer } from 'file-type'` y verificar que el tipo MIME sea `image/*` antes de pasar a sharp.

## BL-004 — DOMAIN_FRONTEND=* en desarrollo (Baja — Pre-deploy)
- **Descripción:** El `.env` de desarrollo tiene `DOMAIN_FRONTEND=*` que habilita CORS wildcard. En producción DEBE ser la URL exacta del frontend.
- **Acción:** Antes del deploy UCB, configurar `DOMAIN_FRONTEND=https://kaaiya.ucb.edu.bo` (o el dominio real) en el servidor.
- **Estado:** Pendiente de configuración de dominio definitivo.

## BL-005 — Non-Storable Content en ZAP frontend (Informativa — Falso Positivo)
- **Descripción:** ZAP reporta "Non-Storable Content" [10049] para respuestas 403 del servidor Vite.
- **Causa:** Vite bloquea acceso desde `host.docker.internal` por seguridad del dev server (comportamiento correcto).
- **En producción:** La app se sirve desde Nginx con headers correctos. No aplica.

## BL-006 — Private IP Disclosure en ZAP (Informativa — Falso Positivo)
- **Descripción:** ZAP reporta "Private IP Disclosure" [2] porque el spec de OpenAPI contiene `host.docker.internal` en la URL del scan.
- **Causa:** Artefacto del entorno de prueba. En producción, el server URL en OpenAPI sería el dominio público.
- **En producción:** No aplica.
