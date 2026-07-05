# Reporte Final — Misión Auth + Endpoints Avanzados
> Generado: 2026-06-11 | Proyecto: Kaa Iya Backend (api-rest-amazonia)

---

## Schema de base de datos

### Tablas creadas
| Tabla | Columnas clave |
|-------|---------------|
| `usuarios` | `id_usuario SERIAL PK`, `email VARCHAR(255) UNIQUE`, `password_hash VARCHAR(255)`, `rol INT`, `activo BOOL`, `fecha_expiracion TIMESTAMP` |
| `solicitudes_acceso` | `id_solicitud SERIAL PK`, `email_solicitante`, `estado VARCHAR(20)`, `id_revisor FK usuarios`, `id_usuario_creado INT` |

### Índices añadidos
```sql
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_solicitudes_estado ON solicitudes_acceso(estado);
CREATE INDEX idx_solicitudes_email ON solicitudes_acceso(email_solicitante);
```

### Migración
Añadida al final de `database/schema.sql` con comentarios de sección.
**Pendiente de aplicar en BD:** ✅ (schema listo, aplicar con `psql -f database/schema.sql`)

---

## Módulo de autenticación

### Endpoints implementados

| Método | Ruta | Acceso | Rate Limit |
|--------|------|--------|------------|
| POST | `/api/auth/login` | Público | 5 req/60s por IP |
| POST | `/api/auth/logout` | Autenticado | Global (60/60s) |
| GET | `/api/auth/me` | Autenticado | Global |
| PUT | `/api/auth/me` | Autenticado | Global |
| POST | `/api/auth/change-password` | Autenticado | Global |
| POST | `/api/auth/register` | Admin+ | 10 req/60s por IP |
| GET | `/api/auth/usuarios` | Admin+ | Global |
| PATCH | `/api/auth/usuarios/:id` | Admin+ | Global |
| DELETE | `/api/auth/usuarios/:id` | Superadmin | Global |
| POST | `/api/auth/solicitar-acceso` | Público | 3 req/60s por IP |
| GET | `/api/auth/solicitudes` | Admin+ | Global |
| PATCH | `/api/auth/solicitudes/:id/aprobar` | Admin+ | Global |
| PATCH | `/api/auth/solicitudes/:id/rechazar` | Admin+ | Global |

### Controles de seguridad aplicados

| Control | Implementación |
|---------|----------------|
| Hash bcrypt cost 12 | `SALT_ROUNDS = 12` en `crypto.util.ts` |
| Tiempo constante en login | `comparePassword` siempre ejecuta, incluso cuando usuario no existe |
| Complejidad de contraseña | Regex: mayúscula + número + símbolo en register, change-password, aprobar-solicitud |
| JWT stateless | `JwtStrategy` valida firma + expiración del token |
| Expiración de investigadores | `JwtStrategy.validate()` verifica `fechaExpiracion` del payload |
| Rate limiting en login | `@Throttle({ limit: 5, ttl: 60000 })` — OWASP A07 |
| Rate limiting en register | `@Throttle({ limit: 10, ttl: 60000 })` |
| Rate limiting en solicitar-acceso | `@Throttle({ limit: 3, ttl: 60000 })` |
| Rate limiting global | `ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])` en AppModule |
| Password nunca retornado | `select: false` en columna `password_hash` de la entidad |

### Roles y permisos configurados

| Rol | Valor | Descripción |
|-----|-------|-------------|
| Superadmin | 1 | Sin restricciones. Puede eliminar usuarios, gestionar configuración |
| Admin | 2 | CRUD operativo, aprobar investigadores. No puede crear Superadmins |
| Investigador | 3 | Solo lectura, acceso temporal con `fechaExpiracion` |
| Invitado | — | Sin token: acceso público a GETs básicos |

**Jerarquía**: `usuario.rol <= rolRequerido` — Superadmin pasa en cualquier endpoint de Admin sin declararlo explícitamente.

### Matriz de permisos

| Endpoint / Recurso | Superadmin | Admin | Investigador | Invitado |
|--------------------|-----------|-------|-------------|---------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/solicitar-acceso | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ❌ |
| PUT /auth/me | ✅ | ✅ | ✅ | ❌ |
| POST /auth/change-password | ✅ | ✅ | ✅ | ❌ |
| POST /auth/register | ✅ | ✅ | ❌ | ❌ |
| GET /auth/usuarios | ✅ | ✅ | ❌ | ❌ |
| PATCH /auth/usuarios/:id | ✅ | ✅ | ❌ | ❌ |
| DELETE /auth/usuarios/:id | ✅ | ❌ | ❌ | ❌ |
| GET /auth/solicitudes | ✅ | ✅ | ❌ | ❌ |
| PATCH /solicitudes/:id/aprobar | ✅ | ✅ | ❌ | ❌ |
| GET /empresas | ✅ | ✅ | ✅ | ✅ |
| GET /empresas/:id | ✅ | ✅ | ✅ | ✅ |
| GET /organizaciones | ✅ | ✅ | ✅ | ✅ |
| GET /organizaciones/:id | ✅ | ✅ | ✅ | ✅ |
| GET /proyectos | ✅ | ✅ | ✅ | ✅ |
| GET /proyectos/:id | ✅ | ✅ | ✅ | ✅ |
| POST /formularios/empresas | ✅ | ✅ | ✅ | ✅ |
| POST /formularios/organizaciones | ✅ | ✅ | ✅ | ✅ |

---

## Endpoints de consulta avanzados

### Endpoints mejorados o creados

| Endpoint | Estado |
|----------|--------|
| GET `/api/empresas` | Mejorado — paginación + filtros + sort |
| GET `/api/empresas/:id` | Nuevo — detalle completo |
| GET `/api/organizaciones` | Mejorado — paginación + filtros |
| GET `/api/organizaciones/:id` | Nuevo — detalle completo |
| GET `/api/proyectos` | Mejorado — paginación + filtros + sort |
| GET `/api/proyectos/:id` | Nuevo — detalle con localidades, especies, prácticas |
| GET `/api/departamentos` | Mejorado — paginación + filtro `?amazonico` |
| GET `/api/municipios` | Mejorado — paginación + filtros |

### Filtros disponibles por recurso

| Recurso | Filtros | Sort |
|---------|---------|------|
| `/empresas` | `?departamento`, `?search` | `nombre:asc/desc`, `anioInicioApoyo:asc/desc` |
| `/organizaciones` | `?departamento`, `?esNacional`, `?tipo`, `?search` | — |
| `/proyectos` | `?area`, `?departamento`, `?tipo`, `?anio`, `?search` | `nombre:asc/desc`, `anioInicio:asc/desc` |
| `/departamentos` | `?amazonico` | — |
| `/municipios` | `?departamento`, `?search` | — |

### Formato de respuesta paginada
```json
{
  "data": [...],
  "page": 1,
  "limit": 10,
  "pages": 5,
  "total": 42,
  "has_next": true,
  "has_prev": false
}
```

---

## Usuarios de prueba

Ver instrucciones de creación en `testing/test-users.md`.

**Para crear el primer Superadmin:**
```bash
# En .env:
SEED_SUPERADMIN_EMAIL=superadmin@kaaiya.test
SEED_SUPERADMIN_PASSWORD=SuperPass1!
npm run seed:superadmin
```

| Rol | Email | Login verificado |
|-----|-------|-----------------|
| Superadmin | superadmin@kaaiya.test | Pendiente de verificación manual |
| Admin | admin@kaaiya.test | Pendiente |
| Investigador | investigador@kaaiya.test | Pendiente |

---

## Pruebas de permisos

Ver tabla completa en `testing/test-users.md`.
**Estado**: Escenarios definidos, ejecución pendiente (no hay tests `.spec.ts` implementados).

---

## Swagger

**Endpoints documentados en esta misión:** 19 (13 auth + 6 detalle/listado mejorados)
**Todos los endpoints tienen:** `@ApiOperation`, `@ApiOkResponse`/`@ApiCreatedResponse`, responses de error (400/401/403/404/409), `@ApiBearerAuth` en protegidos, `@ApiTags` para agrupación.
**Swagger UI carga sin errores:** ✅ (build limpio verificado)

---

## Deuda técnica identificada (no implementada)

| Item | Razón de postergación |
|------|----------------------|
| `POST /auth/refresh` (refresh tokens) | JWT stateless es suficiente para MVP con ~200 actores. Refresh tokens añaden tabla extra, lógica de rotación y complejidad de revocación. Revisitar si el tiempo de expiración necesita extenderse sin forzar relogin. |
| Tests `.spec.ts` para auth | No hay ningún archivo `.spec.ts` en el proyecto. Prioridad alta antes del despliegue (julio 2026). Ver `testing/test-users.md` para lista priorizada. |
| Blacklist de tokens JWT revocados | Logout actual es client-side. Para invalidación real en servidor, agregar tabla `tokens_revocados` con `jti` claim. Requiere migración. |
| Validación de complejidad en login | Login actual no valida complejidad (correcto — la validación es solo en creación). |
| Sort en organizaciones y municipios | Se implementó en empresas y proyectos. Organizaciones y municipios usan ordenamiento fijo por nombre. Ampliar si el frontend lo requiere. |
| Helmet (HTTP security headers) | Mencionado en `informe.md` como requisito. `npm install helmet` y configurar en `main.ts`. |
| Logs estructurados (Winston/Pino) | Mencionado en `informe.md`. Actualmente solo logger de NestJS. |
